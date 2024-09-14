import { Container } from 'pixi.js';
import { euclideanDistance } from '../../../helpers/EuclideanDistance';
import { Point } from '../../../helpers/Point';
import { getCorrespondingY } from '../../../helpers/Slope';
import { FurnitureData } from '../../../stores/FurnitureStore';
import { main } from '../../EditorRoot';
import { METER } from '../constants';
import { FloorSerializable } from '../persistence/FloorSerializable';
import { Furniture } from './Furniture';
import { Wall } from './Walls/Wall';
import { WallNodeSequence } from './Walls/WallNodeSequence';

export class Floor extends Container {
    public furnitureArray: Map<number, Furniture>;
    private wallNodeSequence: WallNodeSequence;
    constructor(floorData?: FloorSerializable, previousFloor?: Floor) {
        super();

        this.furnitureArray = new Map<number, Furniture>();
        this.wallNodeSequence = new WallNodeSequence();
        this.addChild(this.wallNodeSequence);
        this.wallNodeSequence.zIndex = 1002;
        this.sortableChildren = true;
        if (floorData) {
            const nodeLinks = new Map<number, number[]>(floorData.wallNodeLinks);

            this.wallNodeSequence.load(floorData.wallNodes, nodeLinks);
            for (const fur of floorData.furnitureArray) {
                const furnitureData: FurnitureData = {
                    width: fur.width,
                    height: fur.height,
                    imagePath: fur.texturePath,
                };

                if (fur.zIndex) {
                    furnitureData.zIndex = fur.zIndex;
                }
                const attachedTo = this.wallNodeSequence.getWall(fur.attachedToLeft, fur.attachedToRight);
                const object = new Furniture(
                    furnitureData,
                    fur.id,
                    attachedTo,
                    fur.attachedToLeft,
                    fur.attachedToRight,
                    fur.orientation
                );

                this.furnitureArray.set(fur.id, object);

                if (attachedTo != undefined) {
                    attachedTo.addChild(object);
                } else {
                    this.addChild(object);
                }
                object.position.set(fur.x, fur.y);
                object.rotation = fur.rotation;
            }

            return;
        }

        if (previousFloor) {
            const nodeCloneMap = new Map<number, number>();

            // first iteration, map previous node ids to new node ids as we're simply cloning them
            for (const wall of previousFloor.getExteriorWalls()) {
                [wall.leftNode, wall.rightNode].map((node) => {
                    const oldId = node.getId();

                    if (!nodeCloneMap.has(oldId)) {
                        nodeCloneMap.set(oldId, this.wallNodeSequence.getNewNodeId());
                        this.addNode(node.x, node.y, nodeCloneMap.get(oldId));
                    }
                });
            }

            // now copy walls with respect to the node mapping
            previousFloor.getExteriorWalls().map((wall) => {
                const newLeftId = nodeCloneMap.get(wall.leftNode.getId());
                const newRightId = nodeCloneMap.get(wall.rightNode.getId());

                const newWall = this.wallNodeSequence.addWall(newLeftId, newRightId);

                newWall.setIsExterior(true);
            });
        }
    }

    public setLabelVisibility(value = true) {
        for (const wall of this.wallNodeSequence.getWalls()) {
            wall.label.visible = value;
        }
    }
    public getFurniture() {
        return this.furnitureArray;
    }

    private getExteriorWalls() {
        return this.wallNodeSequence.getExteriorWalls();
    }

    public reset() {
        for (const id of this.furnitureArray.keys()) {
            this.removeFurniture(id);
        }
        this.wallNodeSequence.reset();
        this.furnitureArray = new Map<number, Furniture>();
    }
    public getWallNodeSequence() {
        return this.wallNodeSequence;
    }

    public clearScreen() {
        for (const child of this.children) {
            child.visible = false;
        }
    }

    public addFurniture(
        obj: FurnitureData,
        id: number,
        attachedTo?: Wall,
        coords?: Point,
        attachedToLeft?: number,
        attachedToRight?: number
    ) {
        const object = new Furniture(obj, id, attachedTo, attachedToLeft, attachedToRight);

        this.furnitureArray.set(id, object);

        if (attachedTo !== undefined) {
            attachedTo.addChild(object);
            object.position.set(coords.x, coords.y);
        } else {
            this.addChild(object);
            object.position.set(main.corner.x + 150, main.corner.y + 150);
        }

        return id;
    }

    private shiftCoordinatesToOrigin(lines: any) {
        if (!lines[0]) return [];

        const shiftX = lines[0].a.x;
        const shiftY = lines[0].a.y;

        // Shift all coordinates
        lines.forEach((line: any) => {
            line.a.x = line.a.x - shiftX;
            line.a.y = line.a.y - shiftY;
            line.b.x = line.b.x - shiftX;
            line.b.y = line.b.y - shiftY;
        });

        // Check for negative values and apply a positive offset if needed
        const minX = Math.min(...lines.map((line: any) => Math.min(line.a.x, line.b.x)));
        const minY = Math.min(...lines.map((line: any) => Math.min(line.a.y, line.b.y)));

        // If negative values exist, shift all coordinates again to avoid negatives
        if (minX < 0 || minY < 0) {
            const offsetX = Math.abs(minX);
            const offsetY = Math.abs(minY);

            lines.forEach((line: any) => {
                line.a.x += offsetX;
                line.a.y += offsetY;
                line.b.x += offsetX;
                line.b.y += offsetY;
            });
        }

        return lines;
    }

    public getPlan() {
        const plan = new FloorSerializable();
        const wallNodes = this.wallNodeSequence.getWalls();

        const planNodes = [];

        // @ts-expect-error TODO
        for (const node of wallNodes.values()) {
            const leftNode = node.leftNode.position;
            const rightNode = node.rightNode.position;

            planNodes.push({
                a: {
                    x: node.x1 / 100,
                    y: node.y1 / 100,
                },
                b: {
                    x: node.x2 / 100,
                    y: node.y2 / 100,
                },
            });
        }
        // wall node links
        // plan.wallNodeLinks = Array.from(this.wallNodeSequence.getWallNodeLinks().entries());
        // furniture
        // const serializedFurniture = [];

        // for (const furniture of this.furnitureArray.values()) {
        //     serializedFurniture.push(furniture.serialize());
        // }
        // plan.furnitureArray = serializedFurniture;

        return {
            // ...plan,
            wallNodes: this.shiftCoordinatesToOrigin(planNodes),
        };
    }

    public serialize(): FloorSerializable {
        const plan = new FloorSerializable();
        const wallNodes = this.wallNodeSequence.getWallNodes();

        for (const node of wallNodes.values()) {
            plan.wallNodes.push(node.serialize());
        }
        // wall node links
        plan.wallNodeLinks = Array.from(this.wallNodeSequence.getWallNodeLinks().entries());
        // furniture
        const serializedFurniture = [];

        for (const furniture of this.furnitureArray.values()) {
            serializedFurniture.push(furniture.serialize());
        }
        plan.furnitureArray = serializedFurniture;

        return plan;
    }
    public setFurniturePosition(id: number, x: number, y: number, angle?: number) {
        this.furnitureArray.get(id).position.set(x, y);
        if (angle) {
            this.furnitureArray.get(id).angle = angle;
        }
    }

    public removeFurniture(id: number) {
        if (this.furnitureArray.get(id).isAttached) {
            this.furnitureArray.get(id).parent.removeChild(this.furnitureArray.get(id));
        } else {
            this.removeChild(this.furnitureArray.get(id));
        }
        this.furnitureArray.get(id).destroy({
            children: true,
            texture: false,
            baseTexture: false,
        });
        this.furnitureArray.delete(id);
    }

    public getObject(id: number) {
        return this.furnitureArray.get(id);
    }

    public redrawWalls() {
        this.wallNodeSequence.drawWalls();
    }

    public removeWallNode(nodeId: number) {
        if (this.wallNodeSequence.contains(nodeId)) {
            this.wallNodeSequence.remove(nodeId);
        }
    }

    public removeWall(wall: Wall) {
        const leftNode = wall.leftNode.getId();
        const rightNode = wall.rightNode.getId();

        if (this.wallNodeSequence.contains(leftNode)) {
            this.wallNodeSequence.removeWall(leftNode, rightNode);
        }
    }

    public addNode(x: number, y: number, id?: number) {
        return this.wallNodeSequence.addNode(x, y, id);
    }

    public addNodeToWall(wall: Wall, coords: Point) {
        const leftNode = wall.leftNode.getId();
        const rightNode = wall.rightNode.getId();

        // ecuatia dreptei, obtine y echivalent lui x
        if (wall.angle != 90) {
            coords.y = getCorrespondingY(coords.x, wall.leftNode.position, wall.rightNode.position);
        }

        // prevent misclicks
        if (Math.abs(euclideanDistance(coords.x, wall.leftNode.x, coords.y, wall.leftNode.y)) < 0.2 * METER) {
            return;
        }
        if (Math.abs(euclideanDistance(coords.x, wall.rightNode.x, coords.y, wall.rightNode.y)) < 0.2 * METER) {
            return;
        }

        // delete wall between left and right node
        this.removeWall(wall);
        // add node and connect walls to it

        const newNode = this.wallNodeSequence.addNode(coords.x, coords.y);
        const newNodeId = newNode.getId();

        this.wallNodeSequence.addWall(leftNode, newNodeId);
        this.wallNodeSequence.addWall(newNodeId, rightNode);

        return newNode;
    }
}
