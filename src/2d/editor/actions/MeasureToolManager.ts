import { Graphics, FederatedPointerEvent, Texture, Container } from 'pixi.js';
import { euclideanDistance } from '../../../helpers/EuclideanDistance';
import { Point } from '../../../helpers/Point';
import { viewportX, viewportY } from '../../../helpers/ViewportCoordinates';
import { Label } from '../objects/TransformControls/Label';
import { WALL_THICKNESS } from '../constants';

type PreviewProps = {
    color?: number | string;
    showSizeLabel?: boolean;
};

export class Preview {
    private static instance: Preview;
    private showSizeLabel: boolean;
    public isActive = false;
    public preview: Container;

    public startPoint: Point | undefined;
    public endPoint: Point | undefined;

    private sizeGraphic: Graphics;
    private sizeLabel: Label;

    private color: number | string;
    public length: number;

    public constructor({ color = 0x1f1f1f, showSizeLabel = true }: PreviewProps) {
        this.startPoint = undefined;
        this.preview = new Container();
        this.sizeGraphic = new Graphics();

        this.preview.addChild(this.sizeGraphic);

        this.color = color;
        this.showSizeLabel = showSizeLabel;
        this.sizeLabel = new Label();
        this.sizeLabel.visible = false;
        this.preview.addChild(this.sizeLabel);
    }

    public setA(value: Point | undefined) {
        this.isActive = true;
        this.startPoint = value;

        this.sizeGraphic.clear();
        this.sizeLabel.visible = false;
    }

    public setB(value: Point | undefined) {
        this.isActive = false;
        this.endPoint = value;
    }

    public updatePreview(ev: FederatedPointerEvent, isWall = false) {
        if (this.startPoint === undefined) {
            return;
        }
        const newX = viewportX(ev.global.x);
        const newY = viewportY(ev.global.y);

        this.sizeGraphic
            .clear()
            .stroke({ texture: Texture.WHITE, width: 2, color: this.color })
            .moveTo(this.startPoint.x, this.startPoint.y)
            .lineTo(newX, newY);

        const length = euclideanDistance(this.startPoint.x, newX, this.startPoint.y, newY);

        if (isWall) {
            // length += WALL_THICKNESS / 2;
        }

        this.length = length;

        if (this.showSizeLabel) {
            this.sizeLabel.update(length);
            this.sizeLabel.position.x = Math.abs(newX + this.startPoint.x) / 2;
            this.sizeLabel.position.y = Math.abs(newY + this.startPoint.y) / 2;
            this.sizeLabel.visible = true;
        }
    }

    public updateByPoint(point: Point) {
        if (!this.isActive || !this.startPoint) {
            return;
        }

        const newX = point.x;
        const newY = point.y;

        this.sizeGraphic
            .clear()
            .stroke({ texture: Texture.WHITE, width: 2, color: this.color })
            .moveTo(this.startPoint.x, this.startPoint.y)
            .lineTo(newX, newY);

        const length = euclideanDistance(this.startPoint.x, newX, this.startPoint.y, newY);

        this.length = length;

        if (this.showSizeLabel) {
            this.sizeLabel.update(length);
            this.sizeLabel.position.x = Math.abs(newX + this.startPoint.x) / 2;
            this.sizeLabel.position.y = Math.abs(newY + this.startPoint.y) / 2;
            this.sizeLabel.visible = true;
        }
    }

    public getReference() {
        return this.preview;
    }
}