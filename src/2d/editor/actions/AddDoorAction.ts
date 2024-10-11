import { Container } from 'pixi.js';
import { Point } from '../../../helpers/Point';
import { FurnitureData } from '../../../stores/FurnitureStore';
import { FloorPlan } from '../objects/FloorPlan';
import { Wall } from '../objects/Walls/Wall';
import { Action } from './Action';
import { Door } from '../objects/Furnitures/Door';

export class AddDoorAction implements Action {
    object: Door;
    attachedTo: Wall;
    position: Point;

    private receiver: FloorPlan;

    constructor(object: Door, attachedTo: Wall, position: Point) {
        this.object = object;
        this.attachedTo = attachedTo;
        this.position = position;

        this.receiver = FloorPlan.Instance;
    }

    public execute() {
        this.receiver.addDoor(this.object, this.attachedTo, this.position);
        this.receiver.actions.push(this);
    }
}