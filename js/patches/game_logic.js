import { enumDirectionToVector, enumInvertedDirections } from "shapez/core/vector";
import { GameLogic } from "shapez/game/logic";

export function patchGameLogic(manager) {
    this.modInterface.extendClass(GameLogic,({old}) => ({
        computeWireEdgeStatus({ wireVariant, tile, edge }) {
            const offset = enumDirectionToVector[edge];
            const targetTile = tile.add(offset);
            const adjEdge = enumInvertedDirections[edge];

            const entities = this.root.map.getLayersContentsMultipleXY(targetTile.x, targetTile.y);
            
            for (const entity of entities) {
                for (const id in manager.elements) {
                    const element = manager.elements[id];
                    if (!entity.components[id]) {
                        continue;
                    }

                    const isConnected = element.computeWireEdgeStatus({
                        wireVariant,
                        tile: targetTile,
                        edge: adjEdge,
                    }, entity);
                    if (isConnected) {
                        return true;
                    }
                }
            }

            return false;
        }
    }));
}