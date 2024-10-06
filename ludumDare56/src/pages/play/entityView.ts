import { Assets, Container, Sprite } from "pixi.js";
import { Entity } from "../../models/entity";
import { Play } from "../play";
import { V2, Vector2 } from "../../math/vector2";

export class EntityView {
    private readonly entity: Entity;
    private readonly play: Play;
    private container?: Container;
    private sprite?: Sprite;

    public constructor(play: Play, entity: Entity, parentContainer: Container) {
        this.entity = entity;
        this.play = play;
        Assets.load(`/assets/${entity.name}.png`).then(asset => {
            this.container = new Container();
            this.container.position.set(entity.position.x, entity.position.y);
            this.sprite = new Sprite(asset);
            this.sprite.scale.set(0.5);
            this.sprite.anchor.set(0.5, 0.9);

            //this.container.addChild(this.sprite);
            this.container = this.sprite;
            parentContainer.addChild(this.container);
        });
    }

    public is(input: any) {
        return this.entity === input || this === input;
    }

    public destroy() {
        this.sprite?.removeFromParent();
        this.container?.removeFromParent();
    }

    private lastPosition: Vector2 = V2();
    public tick(_: number) {
        if (this.sprite && this.container) {
            this.container.position.set(this.entity.position.x, this.entity.position.y);
            this.container.zIndex = 1 + (this.entity.position.z - Math.ceil(this.entity.position.z));

            const deltaX = this.container.position.x - this.lastPosition.x;
            this.lastPosition = V2(this.container.position.x, this.container.position.y);
            if (this.sprite.scale.x < 0 && deltaX > 0 ||
                this.sprite.scale.x > 0 && deltaX < 0) {
                this.sprite.scale.x *=-1;
            }
            

            const expectedLayerIdx = Math.ceil(this.entity.position.z);
            const currentLayerIds = this.play.layers.indexOf(this.sprite.parent)
            if (expectedLayerIdx !== currentLayerIds) {
                const newLayer = this.play.layers[expectedLayerIdx];
                newLayer.addChild(this.sprite);
            }
        }
    }
}
