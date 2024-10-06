import { V3 } from "../../math/vector3";
import { Entity } from "../entity";
import { Behaviour, BehaviourDTO, BehaviourResult, getProperty } from "./behaviour";
import { CreateBehaviour } from "./behaviourFactory";

export interface InRangeBehaviourDTO extends BehaviourDTO {
    type: "inRange";
    max: number | string;
    targets: string[];
    child: BehaviourDTO;
    toKey?: string;
}

export class InRangeBehaviour implements Behaviour {
    public get active() { return this._active; }
    private _active: boolean = false;
    private owner: Entity;
    private child: Behaviour;
    private readonly toKey?: string;
    private readonly max?: number | string;
    private readonly targets?: string[];

    public constructor(entity: Entity, data: InRangeBehaviourDTO) {
        this.owner = entity;

        this.max = data.max;
        this.toKey = data.toKey;
        this.targets = [...data.targets];
        this.child = CreateBehaviour(this.owner, data.child);
    }

    private started = false;
    public enter() {
        this._active = true;
    }
    public run(delta: number): BehaviourResult {
        const target = this.nearest();
        if (target) {

            if (!this.started) {
                if (this.toKey) {
                    this.owner.properties[this.toKey] = target.id;
                }
                this.child.enter();
                this.started = true;
            }

            const result = this.child.run(delta);

            if (result !== BehaviourResult.active) {
                this.child.exit();
                this.started = false;
            }
            return result;
        }

        return BehaviourResult.failed;
    }
    public exit() {
        this._active = false;
    }

    private nearest(): Entity | null {
        const entity = this.owner;
        const toTarget = this.targets?.map(x => getProperty<string | number>(entity, x));

        const targets = this.owner.game.entities.filter(x => x.hitpoints > 0 && toTarget?.some(y => typeof y === 'string' ? x.name === y : typeof y === 'number' ? x.id === y : false));

        // offset Z, as it's normally just 1-3 deep but the distance should be further for things like attacking or cost
        const sourcePosition = V3(entity.position.x, entity.position.y, entity.position.z * 64);

        const max = this.max ? getProperty<number>(entity, this.max) : false;

        let nearest: Entity | null = null;
        let nearestDistance: number = typeof max === 'number' ? max * max : Number.MAX_SAFE_INTEGER;
        for (const target of targets) {
            const distance = target.position.distanceToSquared(sourcePosition);
            if (distance < nearestDistance) {
                nearest = target;
                nearestDistance = distance;
            }
        }
        return nearest;
    }
}
