import { lineOnLineIntersection, nearest } from "../math/utils";
import { V2 } from "../math/vector2";
import { V3, Vector3 } from "../math/vector3";
import { Waypoint, WaypointType } from "../models/waypoint";


function get (list: { key: any, value: any }[], key: any, defaultValue?: any) {
    const exist = list.find(x => x.key === key);
    return exist ? exist.value : defaultValue;
}
function set(list: { key: any, value: any }[], key: any, value: any) {
    const found = list.find(x => x.key === key);
    if (found) {
        found.value = value;
    }
    else {
        list.push({ key, value });
    }
}

function getDistance(a: Vector3, b: Vector3) {
    return a.distanceTo(b);
}

function reconstructPath(cameFrom: { key: Vector3, value: Vector3 }[], current: Vector3): Vector3[] {
    let totalPath: Vector3[] = [
        current
    ];
    while (current = get(cameFrom, current, false)) {
        totalPath.unshift(current);
    }
    return totalPath;
}

export function generatePath(waypoints: readonly Waypoint[], start: Vector3, goal: Vector3, options?: {
    avoid?: WaypointType[],
    never?: WaypointType[],
}): Vector3[] | null {
    // The set of discovered nodes that may need to be (re-)expanded.
    // Initially, only the start node is known.
    const openSet: Vector3[] = [start];

    // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from the start
    // to n currently known.
    const cameFrom: { key: Vector3, value: Vector3 }[] = [];

    // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
    const gScore: { key: Vector3, value: number }[] = [
        { key: start, value: 0 }
    ];

    const h = (current: Vector3) => {
        return current.distanceTo(goal);
    }

    // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
    // how cheap a path could be from start to finish if it goes through n.
    const fScore: { value: number, key: Vector3 }[] = [
        { value: h(start), key: start }
    ];

    while (openSet.length > 0) {
        // This operation can occur in O(Log(N)) time if openSet is a min-heap or a priority queue
        const current = openSet.reduce((a, b) => get(fScore, a) < get(fScore, b) ? a : b);

        if (current.equals(goal)) {
            return reconstructPath(cameFrom, current);
        }

        openSet.splice(openSet.findIndex(x => x.equals(current)), 1);

        const neighbours = waypoints.find(x => x.position.equals(current))!.exits ?? [];
        for (const neighbour of neighbours) {
            const neighbourWaypoint = waypoints.find(x => x.position.equals(neighbour));
            if (!neighbourWaypoint) {
                console.warn('something is wrong with this node');
                continue;
            }

            if (options?.never && neighbourWaypoint.hints && options.never.some(x => neighbourWaypoint.hints.includes(x))) {
                continue;
            }

            const additiveScore = options?.avoid && options.avoid.some(neighbourWaypoint.hints.includes) ? 1.5 : 1;

            // d(current,neighbor) is the weight of the edge from current to neighbor
            // tentative_gScore is the distance from start to the neighbor through current
            const tentativeGScore: number = get(gScore, current) + getDistance(current, neighbour) * additiveScore;
            if (tentativeGScore < get(gScore, neighbour, Number.MAX_SAFE_INTEGER)) {
                // This path to neighbor is better than any previous one. Record it!
                set(cameFrom, neighbour, current);
                set(gScore, neighbour, tentativeGScore);
                set(fScore, neighbour, tentativeGScore + h(neighbour));
                if (!openSet.includes(neighbour)) {
                    openSet.push(neighbour);
                }
            }
        }

    }
    // Open set is empty but goal was never reached
    return null;
}

export function generatePathFromOutsidePath(waypoints: readonly Waypoint[], start: Vector3, goal: Vector3, options?: {
    avoid?: WaypointType[],
    never?: WaypointType[],
}): Vector3[] | null {
    const startNode = nearest(waypoints, start)
    const goalNode = nearest(waypoints, goal);
    const path = generatePath(waypoints, startNode, goalNode, options);
    if (!path) {
        return path;
    }

    //smooth start
    if (path.length > 1) {
        const a = path[0];
        const b = path[1];
        const minHeight = Math.min(a.y, b.y) - 1;
        const maxHeight = Math.max(a.y, b.y) + 1;
        const result = lineOnLineIntersection(V2(start.x, minHeight), V2(start.x, maxHeight), V2(a.x, a.y), V2(b.x, b.y));
        if (result) {
            path.shift();
        }
    }

    // smooth ending
    if (path.length > 1)
    {
        const a = path[path.length - 2];
        const b = path[path.length - 1];
        const minHeight = Math.min(a.y, b.y) - 1;
        const maxHeight = Math.max(a.y, b.y) + 1;
        const result = lineOnLineIntersection(V2(goal.x, minHeight), V2(goal.x, maxHeight), V2(a.x, a.y), V2(b.x, b.y));
        if (result) {
            path.pop();
            path.push(V3(result.x, result.y, Math.max(a.z, b.z)));
        } else {
            path.push(V3(goal.x, goal.y, Math.max(a.z, b.z)));
        }
    }

    if (path.length == 1) {
        const a = start;
        const b = path[0];
        const minHeight = Math.min(a.y, b.y) - 1;
        const maxHeight = Math.max(a.y, b.y) + 1;
        const result = lineOnLineIntersection(V2(goal.x, minHeight), V2(goal.x, maxHeight), V2(a.x, a.y), V2(b.x, b.y));
        if (result) {
            return [start, goal];
        }
        else {
            return [start, b, goal];
        }
    }

    return path;
}
