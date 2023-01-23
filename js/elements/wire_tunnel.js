import { enumDirectionToVector } from "shapez/core/vector";
import { enumWireVariant } from "shapez/game/components/wire";
import { WireTunnelComponent } from "shapez/game/components/wire_tunnel";
import { NetworkElement } from "../network_element";

export class WireTunnelElement extends NetworkElement {
    constructor() {
        super(WireTunnelComponent);
    }

    clearNetworks(comp) {
        comp.linkedNetworks = [];
    }
    getWireTarget(root, entity, metadata, {
        direction,
        network,
        contents,
        visitedTunnels
    }) {
        const tunnelComp = entity.components.WireTunnel;
        const offset = enumDirectionToVector[direction];
        
        if (visitedTunnels.has(entity.uid)) {
            return null;
        }

        const staticComp = entity.components.StaticMapEntity;

        const forwardedTile = staticComp.origin.add(offset);
        const connectedContents = root.map.getLayersContentsMultipleXY(
            forwardedTile.x,
            forwardedTile.y
        );

        for (const content of connectedContents) {
            contents.push({
                direction,
                entity: content,
                tile: forwardedTile,
            });
        }

        if (tunnelComp.linkedNetworks.indexOf(network) < 0) {
            tunnelComp.linkedNetworks.push(network);
        }
        if (network.tunnels.indexOf(entity) < 0) {
            network.tunnels.push(entity);
        }

        visitedTunnels.add(entity.uid);

        return null;
    }
    computeWireEdgeStatus({ wireVariant }) {
        if (!enumWireVariant[wireVariant]) {
            return false;
        }

        // Wires connect to all sides
        return true;
    }

    getEntityWireNetworks(entity, tile, networks) {
        const tunnelComp = entity.components.WireTunnel;

        for (const linkedNetwork of tunnelComp.linkedNetworks) {
            networks.add(linkedNetwork);
        }
        
        return true;
    }
}