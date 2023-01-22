import { gMetaBuildingRegistry } from "shapez/core/global_registries";

export class NetworkElement {
    constructor(component, metaBuilding) {
        this.component = component;
        if (metaBuilding) {
            this.building = gMetaBuildingRegistry.findByClass(metaBuilding);
        }
    }
    get metaBuilding() {
        return this.building;
    }

    canEjectSignal() {
        return false;
    }

    clearNetworks(comp) {}
    findNetworks(wireSystem, entity) {}
    tryToLinkNetwork(network, entity, metadata) {}
    getWireTarget(root, entity, metadata, {
        direction,
        tile,
        network,
        contents,
        visitedTunnels,
    }) {}
    computeWireEdgeStatus({ wireVariant, tile, edge }, entity) {}
}