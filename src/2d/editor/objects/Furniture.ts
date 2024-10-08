import { Assets, Graphics, InteractionEvent, Point, Sprite, Texture, TilingSprite } from 'pixi.js';
import { FurnitureData } from '../../../stores/FurnitureStore';
import { useStore } from '../../../stores/EditorStore';
import { DeleteFurnitureAction } from '../actions/DeleteFurnitureAction';
import { EditFurnitureAction } from '../actions/EditFurnitureAction';
import { INTERIOR_WALL_THICKNESS, METER, Tool } from '../constants';
import { IFurnitureSerializable } from '../persistence/IFurnitureSerializable';
import { TransformLayer } from './TransformControls/TransformLayer';

export enum FurnitureOrientation {
    _0,
    _90,
    _180,
    _270,
}

export class Furniture extends Sprite {
    private id: number; // fiecare mobila isi stie index-ul in plan. uuids?
    // private dragging: boolean;
    public isAttached: boolean;
    public attachedToLeft: number;
    public attachedToRight: number;
    public xLocked: boolean;
    public resourcePath: string;
    private orientation: number;
    public centerAngle: number;
    constructor(
        data: FurnitureData,
        id: number,
        attachedTo?: Graphics,
        attachedToLeft?: number,
        attachedToRight?: number,
        orientation = 0
    ) {
        super();

        this.loadTexture(data.imagePath);

        this.resourcePath = data.imagePath;
        this.id = id;
        // this.orientation = 0;
        this.cursor = 'pointer';
        this.anchor.x = 0.5;

        // if (attachedTo) {
        //     this.isAttached = true;
        //     this.parent = attachedTo;
        //     this.attachedToLeft = attachedToLeft!;
        //     this.attachedToRight = attachedToRight!;
        //     this.xLocked = true;
        // } else {
        //     this.xLocked = false;
        //     this.isAttached = false;
        // }

        // if (data.zIndex) {
        //     this.zIndex = data.zIndex;
        // }

        // this.eventMode = 'static';
        // // this.dragging = false;
        // this.width = data.width * METER;
        // this.height = data.height * METER;
        // this.setOrientation(orientation);
        // this.centerAngle = Math.atan2(-this.height, this.width);

        // this.on('pointerdown', this.onMouseDown);
        // this.on('pointermove', this.onMouseMove);
        // this.on('rightdown', this.onRightDown);
    }

    public async loadTexture(path: string) {
        const backgroundPatternTexture = await Assets.load(path);

        this.texture = backgroundPatternTexture;
    }

    public setId(id: number) {
        this.id = id;
    }

    public getId() {
        return this.id;
    }

    private switchOrientation() {
        // 0 neutral flip orizontal 2 flip vertical 3 ambele
        switch (this.orientation) {
            case 0:
                this.anchor.x = 1;
                this.scale.x = -1 * this.scale.x;
                this.anchor.y = 0;
                this.scale.y = 1 * this.scale.y;
                this.orientation += 1;
                break;
            case 1:
                this.anchor.y = 1;
                this.scale.y = -1 * this.scale.y;
                this.orientation += 1;
                if (this.resourcePath == 'door') {
                    this.position.y -= this.height - INTERIOR_WALL_THICKNESS;
                }
                break;
            case 2:
                this.anchor.x = 0;
                this.scale.x = -this.scale.x;
                this.orientation += 1;
                break;
            case 3:
                this.anchor.x = 0;
                this.scale.x = Math.abs(this.scale.x);
                this.anchor.y = 0;
                this.scale.y = Math.abs(this.scale.y);
                this.orientation = 0;
                if (this.resourcePath == 'door') {
                    this.position.y += this.height - INTERIOR_WALL_THICKNESS;
                }
                break;
        }
    }

    private onRightDown(ev: InteractionEvent) {
        ev.stopPropagation();
        // this.switchOrientation();

        return;
    }
    // public originalSetOrientation(number: number) {
    //     if (this.orientation === number) return;

    //     if (number > 0) {
    //         this.anchor.x = 1;
    //         this.scale.x = -1 * this.scale.x;
    //         this.anchor.y = 0;
    //         this.scale.y = 1 * this.scale.y;
    //     }

    //     if (number > 1) {
    //         this.anchor.y = 1;
    //         this.scale.y = -1 * this.scale.y;
    //         if (this.resourcePath == 'door') {
    //             this.position.y -= this.width - INTERIOR_WALL_THICKNESS;
    //         }
    //     }

    //     if (number > 2) {
    //         console.log(this.scale.x);

    //         this.anchor.x = 0;
    //         this.scale.x = -this.scale.x;
    //     }
    //     if (number > 3) {
    //         this.anchor.x = 0;
    //         this.scale.x = Math.abs(this.scale.x);
    //         this.anchor.y = 0;
    //         this.scale.y = Math.abs(this.scale.y);
    //         if (this.resourcePath == 'door') {
    //             this.position.y += this.width - INTERIOR_WALL_THICKNESS;
    //         }
    //     }
    //     this.orientation = number;
    // }

    public setOrientation(ori: FurnitureOrientation) {
        // if (this.orientation === ori) return;

        // console.log(wallWidth / this.width);

        const wallWidth = 40;

        if (ori === FurnitureOrientation._0) {
            this.anchor.x = 0.5;
            this.anchor.y = 0;
            this.scale.x = -1;
            this.scale.y = 1;
        }

        if (ori === FurnitureOrientation._90) {
            // this.scale.x = 1;
            // this.anchor.y = 1;
            // this.anchor.y = 1;
            // this.scale.y = -1 * this.scale.y;
            // if (this.resourcePath == 'door') {
            //     this.position.y -= this.width - INTERIOR_WALL_THICKNESS;
            // }
        }

        if (ori === FurnitureOrientation._180) {
            this.anchor.x = 0.5;
            this.anchor.y = wallWidth / this.height - 0.02;
            this.scale.x = -1;
            this.scale.y = -1;
        }

        // if (number > 2) {
        //     console.log(this.scale.x);

        //     this.anchor.x = 0;
        //     this.scale.x = -1;
        // }

        // if (number > 3) {
        //     this.anchor.x = 0;
        //     this.scale.x = Math.abs(this.scale.x);
        //     this.anchor.y = 0;
        //     this.scale.y = Math.abs(this.scale.y);
        //     if (this.resourcePath == 'door') {
        //         this.position.y += this.width - INTERIOR_WALL_THICKNESS;
        //     }
        // }
        this.orientation = ori;
    }

    private onMouseDown(ev: InteractionEvent) {
        ev.stopPropagation();
        if (ev.data.button == 1) {
            this.zIndex++;
        }
        switch (useStore.getState().activeTool) {
            case Tool.Edit: {
                const action = new EditFurnitureAction(this);

                action.execute();
                break;
            }

            case Tool.Remove: {
                const action = new DeleteFurnitureAction(this.id);

                action.execute();
                break;
            }
        }
    }

    private onMouseMove() {
        //todo update doar la mousedown=true
        TransformLayer.Instance.update();
    }

    public serialize() {
        return {
            x: this.x,
            y: this.y,
            height: this.height / METER,
            width: this.width / METER,
            zIndex: this.zIndex,
            id: this.id,
            texturePath: this.resourcePath,
            rotation: this.rotation,
            orientation: this.orientation,

            attachedToLeft: this.attachedToLeft,
            attachedToRight: this.attachedToRight,
        } as IFurnitureSerializable;
    }
}
