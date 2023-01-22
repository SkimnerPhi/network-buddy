import { arrayAllDirections } from "shapez/core/vector";
import { arrayWireRotationVariantToType, MetaWireBuilding } from "shapez/game/buildings/wire";
import { WireComponent } from "shapez/game/components/wire";
import { NetworkElement } from "../network_element";

export class WireElement extends NetworkElement {
    constructor() {
        super(WireComponent, MetaWireBuilding);
        this.rotationVariantToType = arrayWireRotationVariantToType;
    }

    clearNetworks(comp) {
        comp.linkedNetwork = null;
    }
    tryToLinkNetwork(network, entity, metadata) {
        const wireComp = entity.components.Wire;
        if (wireComp.linkedNetwork) {
            return null;
        }
        if (metadata.variantMask && wireComp.variant !== metadata.variantMask) {
            return null;
        }

        wireComp.linkedNetwork = network;
        network.wires.push(entity);

        metadata.variantMask = wireComp.variant;

        return {
            tile: entity.components.StaticMapEntity.origin,
            directions: arrayAllDirections,
        };
    }

    getWireTarget(root, entity, metadata) {
        const wireComp = entity.components.Wire;
        if (
            !wireComp.linkedNetwork &&
            (!metadata.variantMask || wireComp.variant === metadata.variantMask)
        ) {
            return { entity,  metadata };
        }
    }

    computeWireEdgeStatus({ wireVariant }, entity) {
        const wireComp = entity.components.Wire;
        
        // Wires will connect in any direction as long as they are the same color
        return wireComp.variant === wireVariant;
    }
}