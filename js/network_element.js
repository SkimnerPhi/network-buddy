import { gMetaBuildingRegistry } from "shapez/core/global_registries";
import { enumDirection, Vector } from "shapez/core/vector";
import { Component } from "shapez/game/component";
import { Entity } from "shapez/game/entity";
import { MetaBuilding } from "shapez/game/meta_building";
import { GameRoot } from "shapez/game/root";
import { WireNetwork, WireSystem } from "shapez/game/systems/wire";

export class NetworkElement {
    /** @typedef {{
     *  variantMask: String
     * }} NetworkMetadata */
    /** @typedef {{
     *   tile: Vector
     *   directions: Array<enumDirection>
     * }} LinkResults */
    /** @typedef {{
     * }} NetworkContents */
    /** @typedef {{
     *   entity: Entity
     *   metadata: NetworkMetadata
     * }} NetworkTarget */

    /**
     * @param {typeof Component} component 
     * @param {typeof MetaBuilding} metaBuilding 
     */
    constructor(component, metaBuilding) {
        this.component = component;
        if (metaBuilding) {
            this.building = gMetaBuildingRegistry.findByClass(metaBuilding);
        }
    }
    get metaBuilding() {
        return this.building;
    }

    /**
     * Returns whether a component is able to emit a signal, such as in the case of a WiredPin ejector
     * @returns {boolean}
     */
    canEjectSignal() {
        return false;
    }

    /**
     * Purges all linked networks from the component
     * @param {Component} comp 
     */
    clearNetworks(comp) {}

    /** 
     * Find new networks for signal emmiters, such as in the case of WiredPin ejectors
     * @param {WireSystem} wireSystem
     * @param {Entity} entity
     */
    findNetworks(wireSystem, entity) {}

    /**
     * Attempt to add the current entity to the network, testing for metadata if necessary. Metadata is an arbitrary object passed along as the network expands, containing properties such as wire color. Returns the next position and directions to check for connections.
     * @param {WireNetwork} network 
     * @param {Entity} entity 
     * @param {NetworkMetadata} metadata 
     * @return {LinkResults}
     */
    tryToLinkNetwork(network, entity, metadata) {
        return null;
    }

    /**
     * Get or manipulate the relevant connection to the building, such as for WireTunnel skips and WiredPin slots
     * @param {GameRoot} root 
     * @param {Entity} entity 
     * @param {NetworkMetadata} metadata 
     * @param {enumDirection} param3.direction
     * @param {Object} param3
     * @param {Vector} param3.tile
     * @param {WireNetwork} param3.network
     * @param {Array<NetworkContents>} param3.contents
     * @param {Array<Number>} param3.visitedTunnels
     * @returns {NetworkTarget}
     */
    getWireTarget(root, entity, metadata, {
        direction,
        tile,
        network,
        contents,
        visitedTunnels,
    }) {
        return null;
    }

    /**
     * Get if a wire should connect to the specified edge of the component
     * @param {Object} param0 
     * @param {enumWireType} param0.wireVariant
     * @param {Vector} param0.tile
     * @param {enumDirection} param0.edge
     * @param {Entity} entity 
     * @returns boolean
     */
    computeWireEdgeStatus({ wireVariant, tile, edge }, entity) {
        return false;
    }

    /**
     * Used for network highlighting. Add all connected networks to the supplied Set and return true, or return false if highlighting does not work with this component.
     * @param {Entity} entity 
     * @param {Vector} tile 
     * @param {Set<WireNetwork>} networks 
     * @returns boolean
     */
    getEntityWireNetworks(entity, tile, networks) {
        return false;
    }
}