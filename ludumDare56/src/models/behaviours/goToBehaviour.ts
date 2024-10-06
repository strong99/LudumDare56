import { Vector3, V3 } from "../../math/vector3";
import { generatePathFromOutsidePath } from "../../services/pathfinder";
import { Entity } from "../entity";
import { WaypointType } from "../waypoint";
import { Behaviour, BehaviourDTO, BehaviourResult, getProperty } from "./behaviour";

export interface GoToBehaviourDTO extends BehaviourDTO {
    type: "goto";
    position: { x: number, y: number, z: number } | string;
    minDistance: number | string;
    never?: WaypointType[];
    avoid?: WaypointType[];
}



export class GoToBehaviour implements Behaviour {
    public get active() { return this._active; }
    private _active: boolean = false;
    private readonly owner: Entity;
    private position: { x: number, y: number, z: number } | string;
    private minDistance: number | string;
    private avoid: WaypointType[];
    private never: WaypointType[];

    public constructor(entity: Entity, data: GoToBehaviourDTO) {
        this.owner = entity;
        this.position = data.position;
        this.minDistance = data.minDistance;
        this.avoid = data.avoid ?? [];
        this.never = data.never ?? [];
    }

    public enter() {
        delete this.path;
        delete this.cachedTarget;
        this._active = true;
    }
    public run(delta: number): BehaviourResult {
        try {
            const nextTarget = this.next();
            if (!nextTarget || !this.path) {
                return BehaviourResult.succeeded;
            }

            const reached = this.moveTo(nextTarget, delta);
            if (reached) {
                this.path.shift();
                if (!this.hasNext()) {
                    return BehaviourResult.succeeded;
                }
            }
        }
        catch (e) {
            console.error(e);
        }

        return BehaviourResult.active;
    }
    private path?: Vector3[];
    private cachedTarget?: Entity;
    private next(): Vector3 | null {
        if (this.path && this.cachedTarget && !(this.cachedTarget?.position.equals(this.path[this.path.length - 1]))) {
            delete this.path;
            return null;
        }
        if (!this.path) {
            let targetPosition = getProperty<Vector3|number>(this.owner, this.position);
            if (typeof targetPosition === 'number') {
                targetPosition = (this.cachedTarget = this.owner.game.entities.find(x => x.id === targetPosition)!).position;
            }
            const path = generatePathFromOutsidePath(this.owner.game.waypoints, this.owner.position, targetPosition, {
                never: this.never,
                avoid: this.avoid
            });

            if (path) {
                this.path = path;
            } else {
                delete this.path;
                return null;
            }
        }
        return this.path[0] ?? null;
    }
    private hasNext() {
        return this.path && this.path.length > 0;
    }
    private moveTo(target: Vector3, delta: number) {
        const minDistance = getProperty<number>(this.owner, this.minDistance);

        const currentPosition = this.owner.position;

        const deltaPosition = V3(
            target.x - currentPosition.x,
            target.y - currentPosition.y,
            target.z - currentPosition.z
        );
        if (deltaPosition.lengthSquared === 0) {
            return true;
        }

        const expectedDistance = deltaPosition.length;
        if (expectedDistance < minDistance) {
            return BehaviourResult.succeeded;
        }
        const direction = deltaPosition.normalize();

        const speed = 5;
        const traveledDistance = speed * delta;
        this.owner.position = V3(
            currentPosition.x + direction.x * traveledDistance,
            currentPosition.y + direction.y * traveledDistance,
            target.z//currentPosition.z + direction.z * traveledDistance
        );

        return traveledDistance > expectedDistance;
    }
    public exit() {
        this._active = false;
    }
}
