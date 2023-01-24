import { createLogger } from "shapez/core/logging";
import { fastArrayDeleteValueIfContained } from "shapez/core/utils";
import { enumDirectionToVector, enumInvertedDirections, Vector } from "shapez/core/vector";
import { arrayWireRotationVariantToType } from "shapez/game/buildings/wire";
import { getCodeFromBuildingData } from "shapez/game/building_codes";
import { WireNetwork, WireSystem } from "shapez/game/systems/wire";

export function patchWireSystem(manager) {
    const logger = createLogger("wires");

    this.modInterface.extendClass(WireSystem, ({ $old }) => ({
        recomputeWiresNetwork() {
            this.needsRecompute = false;
            logger.log("Recomputing wires network");

            this.networks = [];

            const entities = {};
            for (const id in manager.elements) {
                const element = manager.elements[id];
                entities[id] = this.root.entityMgr.getAllWithComponent(element.component);
            }

            if (!this.isFirstRecompute) {
                for (const id in manager.elements) {
                    const element = manager.elements[id];
                    for (const entity of entities[id]) {
                        element.clearNetworks(entity.components[id]);
                    }
                }
            } else {
                logger.log("Recomputing wires first time");
                this.isFirstRecompute = false;
            }

            for (const id in manager.elements) {
                const element = manager.elements[id];
                if (element.canEjectSignal()) {
                    for (const entity of entities[id]) {
                        element.findNetworks(this, entity);
                    }
                }
            }
        },
        findNetworkForEjector(initialEntity, metadata = {}) {
            let currentNetwork = new WireNetwork();
            const entitiesToVisit = [
                {
                    entity: initialEntity,
                    metadata,
                },
            ];

            while (entitiesToVisit.length > 0) {
                const nextData = entitiesToVisit.pop();
                const nextEntity = nextData.entity;

                const staticComp = nextEntity.components.StaticMapEntity;

                let newSearchDirections = [];
                let newSearchTile = null;

                for (const id in manager.elements) {
                    const comp = nextEntity.components[id];
                    if (!comp) {
                        continue;
                    }

                    const metadata = Object.assign({}, nextData.metadata);

                    const element = manager.elements[id];
                    let results = element.tryToLinkNetwork(
                        currentNetwork,
                        nextEntity,
                        metadata,
                    );

                    if (!results) {
                        continue;
                    }

                    if (!(results instanceof Array) {
                        results = [results];
                    }

                    for (const result of results) {
                        const newTargets = this.findSurroundingWireTargets(
                            result.tile,
                            result.directions ?? [],
                            currentNetwork,
                            metadata
                        );

                        for (const target of newTargets) {
                            entitiesToVisit.push(target);
                        }
                    }
                }
            }

            if (
                currentNetwork.providers.length > 0 &&
                (currentNetwork.wires.length > 0 ||
                    currentNetwork.receivers.length > 0 ||
                    currentNetwork.tunnels.length > 0)
            ) {
                this.networks.push(currentNetwork);
            } else {
                for (const slot of currentNetwork.allSlots) {
                    slot.slot.linkedNetwork = null;
                }
            }
        },
        findSurroundingWireTargets(initialTile, directions, network, metadata) {
            let result = [];

            for (const initialDirection of directions) {
                const offset = enumDirectionToVector[initialDirection];
                const initialSearchTile = initialTile.add(offset);

                const visitedTunnels = new Set();

                const initialContents = this.root.map.getLayersContentsMultipleXY(
                    initialSearchTile.x,
                    initialSearchTile.y
                );

                const contents = [];
                for (const entity of initialContents) {
                    contents.push({
                        direction: initialDirection,
                        entity,
                        tile: initialSearchTile,
                    });
                }

                for (const { direction, entity, tile } of contents) {
                    for (const id in manager.elements) {
                        const comp = entity.components[id];
                        if (!comp) {
                            continue;
                        }

                        const element = manager.elements[id];
                        const target = element.getWireTarget(
                            this.root,
                            entity,
                            Object.assign({}, metadata),
                            {
                                direction,
                                tile,
                                network,
                                contents,
                                visitedTunnels,
                            }
                        );
                        if (target) {
                            if (target instanceof Array) {
                                result.push(...target);
                            } else {
                                result.push(target);
                            }
                        }
                    }
                }
            }
            return result;
        },
        isEntityRelevantForWires(entity) {
            let relevant = false;
            for (const id in manager.elements) {
                relevant ||= entity.components[id];
            }
            return relevant;
        },
        updateSurroundingWirePlacement(affectedArea) {
            for (let x = affectedArea.x; x < affectedArea.right(); ++x) {
                for (let y = affectedArea.y; y < affectedArea.bottom(); ++y) {
                    const targetEntities = this.root.map.getLayersContentsMultipleXY(x, y);

                    for (const targetEntity of targetEntities) {
                        const targetStaticComp = targetEntity.components.StaticMapEntity;
                        const variant = targetStaticComp.getVariant();

                        for (const id in manager.elements) {
                            const element = manager.elements[id];
                            const comp = targetEntity.components[id];
                            if (!comp) {
                                continue;
                            }

                            const metaBuilding = element.metaBuilding;
                            if (!metaBuilding) {
                                continue;
                            }

                            const { rotation, rotationVariant } = metaBuilding.computeOptimalDirectionAndRotationVariantAtTile({
                                root: this.root,
                                tile: new Vector(x, y),
                                rotation: targetStaticComp.originalRotation,
                                variant,
                                layer: targetEntity.layer,
                            });

                            const newType = element.rotationVariantToType[rotationVariant];

                            if (
                                targetStaticComp === rotation &&
                                newType === comp.type
                            ) {
                                continue;
                            }

                            targetStaticComp.rotation = rotation;
                            metaBuilding.updateVariants(targetEntity, rotationVariant, variant);

                            targetStaticComp.code = getCodeFromBuildingData(metaBuilding, variant, rotationVariant);

                            this.root.signals.entityChanged.dispatch(targetEntity);
                        }
                    }
                }
            }
        }
    }));
}