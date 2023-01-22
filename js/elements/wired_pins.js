import { enumInvertedDirections } from "shapez/core/vector";
import { enumWireVariant } from "shapez/game/components/wire";
import { WiredPinsComponent, enumPinSlotType } from "shapez/game/components/wired_pins";
import { NetworkElement } from "../network_element";

export class WiredPinsElement extends NetworkElement {
    constructor() {
        super(WiredPinsComponent);
    }

    canEjectSignal() {
        return true;
    }
    clearNetworks(comp) {
        for (const slot of comp.slots) {
            slot.linkedNetwork = null;
        }
    }
    findNetworks(wireSystem, entity) {
        const slots = entity.components.WiredPins.slots;
        for (const slot of slots) {
            if (slot.type === enumPinSlotType.logicalEjector && !slot.linkedNetwork) {
                wireSystem.findNetworkForEjector(entity, { slot });
            }
        }
    }

    tryToLinkNetwork(network, entity, metadata) {
        const wiredPinsComp = entity.components.WiredPins;
        const staticComp = entity.components.StaticMapEntity;
        const slot = metadata.slot;
        if (slot.linkedNetwork) {
            return null;
        }

        if (slot.type === enumPinSlotType.logicalEjector) {
            network.providers.push({ entity, slot });
        } else if (slot.type === enumPinSlotType.logicalAcceptor) {
            network.receivers.push({ entity, slot });
        }

        network.allSlots.push({ entity, slot });
        slot.linkedNetwork = network;

        return {
            tile: staticComp.localTileToWorld(slot.pos),
            directions: [staticComp.localDirectionToWorld(slot.direction)],
        };
    }

    getWireTarget(root, entity, metadata, { direction, tile }) {
        const wiredPinComp = entity.components.WiredPins;
        const staticComp = entity.components.StaticMapEntity;

        for (const slot of wiredPinComp.slots) {
            const pinPos = staticComp.localTileToWorld(slot.pos);
            if (!pinPos.equals(tile)) {
                continue;
            }

            const pinDirection = staticComp.localDirectionToWorld(slot.direction);
            if (pinDirection !== enumInvertedDirections[direction]) {
                continue;
            }

            if (!slot.linkedNetwork) {
                metadata.slot = slot;
                return { entity, metadata };
            }
        }
    }

    computeWireEdgeStatus({ wireVariant, tile, edge }, entity) {
        if (!enumWireVariant[wireVariant]) {
            return false;
        }

        const pinComp = entity.components.WiredPins;
        const staticComp = entity.components.StaticMapEntity;

        for (const pinSlot of pinComp.slots) {
            const pinLocation = staticComp.localTileToWorld(pinSlot.pos);
            const pinDirection = staticComp.localDirectionToWorld(pinSlot.direction);

            if (!pinLocation.equals(tile)) {
                continue;
            }
            if (pinDirection !== edge) {
                continue;
            }

            return true;
        }

        return false;
    }
}