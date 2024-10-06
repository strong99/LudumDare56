import { clamp, JsonValue } from "../math/utils";
import { V3, IVector3, Vector3 } from "../math/vector3";
import { Behaviour, BehaviourDTO, BehaviourResult } from "./behaviours/behaviour";
import { CreateBehaviour } from "./behaviours/behaviourFactory";
import { Game } from "./game";

export interface EntityDTO {
    id?: number;
    name: string;
    position: IVector3;
    behaviour?: BehaviourDTO;
    properties: { [key: string]: JsonValue };

    hitpoints: number;
    maxHitpoints?: number;
}

let lastId = 0;

export class Entity {
    public id: number = ++lastId;
    public position: Vector3;
    public behaviour: Behaviour|null;
    public readonly properties: { [key: string]: JsonValue };
    public readonly game: Game;
    public readonly name: string;
    public get hitpoints(): number { return this._hitpoints; }
    public set hitpoints(value: number) {
        this._hitpoints = clamp(0, value, this.maxHitpoints ?? value);
    }
    private _hitpoints: number = 0;

    public readonly maxHitpoints: number;

    public constructor(game: Game, data: EntityDTO) {
        this.game = game;
        this.name = data.name;
        this.position = V3(data.position);
        this.behaviour = data.behaviour ? CreateBehaviour(this, data.behaviour) : null;
        this.properties = data.properties ? { ...data.properties } : {};

        this.maxHitpoints = data.maxHitpoints ?? data.hitpoints;
        this.hitpoints = data.hitpoints;
    }

    public tick(delta: number) {
        if (this.behaviour) {
            if (!this.behaviour.active) {
                this.behaviour.enter();
            }

            if (this.behaviour.run(delta) !== BehaviourResult.active) {
                this.behaviour.exit();
            }
        }
    }

    public serialize(): EntityDTO {
        return {
            id: this.id,
            name: this.name,
            position: this.position,
            properties: this.properties,

            hitpoints: this.hitpoints,
            maxHitpoints: this.maxHitpoints
        }
    }
}
