import { Waypoint } from "../models/waypoint";
import { V2, Vector2 } from "./vector2";
import { Vector3 } from "./vector3";

export type JsonValue = string | number | boolean | { [key: string]: JsonValue } | JsonValue[];

export function clamp(min: number, value: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

export function nearestOnLine(a: Vector2, b: Vector2, p: Vector2): { distance: number, position: Vector2 } {
    const ap = V2(p.x - a.x, p.y - a.y);
    const ab = V2(b.x - a.x, b.y - a.y);

    const magnitudeAB = ab.lengthSquared;     //Magnitude of AB vector (it's length squared)     
    const ABAPproduct = ap.dot(ab);           //The DOT product of a_to_p and a_to_b     
    const distance = ABAPproduct / magnitudeAB; //The normalized "distance" from a to your closest point  

    if (distance < 0)     //Check if P projection is over vectorAB     
    {
        return { distance: distance, position: a };
    }
    else if (distance > 1) {
        return { distance: distance, position: b };
    }
    else {
        return { distance: distance, position: V2(a.x + ab.x * distance, a.y + ab.y * distance) };
    }
}

export function lineOnLineIntersection(a1: Vector2, a2: Vector2, b1: Vector2, b2: Vector2): Vector2|null {
    const denominator = (a1.x - a2.x) * (b1.y - b2.y) - (a1.y - a2.y) * (b1.x - b2.x);
    if (denominator === 0) {
        // Lines are parallel or coincident
        return null;
    }

    const t = ((a1.x - b1.x) * (b1.y - b2.y) - (a1.y - b1.y) * (b1.x - b2.x)) / denominator;
    const u = -((a1.x - a2.x) * (a1.y - b1.y) - (a1.y - a2.y) * (a1.x - b1.x)) / denominator;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        // Intersection point is within the line segments
        return V2(
            a1.x + t * (a2.x - a1.x),
            a1.y + t * (a2.y - a1.y)
        );
    }

    // Intersection point is outside the line segments
    return null;
}

export function nearest(waypoints: readonly Waypoint[], target: Vector3): Vector3 {
    let shortestDistance = Number.MAX_SAFE_INTEGER;
    let nearestWaypoint: Vector3 | null = null;
    for (const waypoint of waypoints) {
        if (Math.ceil(waypoint.position.z) !== Math.ceil(target.z)) {
            continue;
        }
        const distance = waypoint.position.distanceTo(target);
        if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestWaypoint = waypoint.position;
        }
    }
    if (!nearestWaypoint) {
        throw new Error();
    }
    return nearestWaypoint;
}