import { Mod } from "shapez/mods/mod";
import { WireElement } from "./elements/wire";
import { WiredPinsElement } from "./elements/wired_pins";
import { WireTunnelElement } from "./elements/wire_tunnel";
import { NetworkElement } from "./network_element";

import { patchGameLogic } from "./patches/game_logic";
import { patchWireSystem } from "./patches/wire_system";

import { createLogger } from "shapez/core/logging";
const logger = createLogger("network-buddy");

export class WireManager {
    constructor() {
        this.elements = {};
    }
    addElement(elementClass) {
        const element = new elementClass();
        const id = element.component.getId();
        this.elements[id] = element;
        logger.log(`Registered ${id}`);
    }
    removeElement(elementClass) {
        for (const id in this.elements) {
            if (this.elements[id] instanceof elementClass) {
                delete this.elements[id];
                logger.log(`Unregistered ${id}`);
                return true;
            }
        }
        logger.log(`Tried to unregister element but could not find it`);
        return false;
    }
}
const manager = new WireManager();

class ModImpl extends Mod {
    init() {
        patchGameLogic.call(this, manager);
        patchWireSystem.call(this, manager);

        this.registerNetworkElement(WireElement);
        this.registerNetworkElement(WiredPinsElement);
        this.registerNetworkElement(WireTunnelElement);

        this.NetworkElement = NetworkElement;
        this.WireElement = WireElement;
        this.WiredPinsElement = WiredPinsElement;
        this.WireTunnelElement = WireTunnelElement;
    }
    registerNetworkElement(elementClass) {
        manager.addElement(elementClass);
    }
    removeNetworkElement(elementClass) {
        return manager.removeElement(elementClass);
    }
}

shapez.NetworkElement = NetworkElement;