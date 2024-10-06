export interface IVector3 {
    readonly x: number;
    readonly y: number;
    readonly z: number;
}

export class Vector3 {
    public x: number;
    public y: number;
    public z: number;
    constructor();
    constructor(x: Vector3);
    constructor(x: number, y: number, z: number);
    constructor(x?: number | IVector3, y?: number, z?: number);
    constructor(x?: number | IVector3, y?: number, z?: number) {
        const xIsNumber = typeof x === 'number';
        const yIsNumber = typeof y === 'number';
        const zIsNumber = typeof z === 'number';
        if (xIsNumber && yIsNumber && zIsNumber) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        else if (!xIsNumber && x && typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
        }
        else if (xIsNumber === yIsNumber && yIsNumber === zIsNumber) {
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }
        else {
            throw new Error("No x/y/z should be set, or both");
        }
    }

    public get lengthSquared() { return this.x * this.x + this.y * this.y + this.z * this.z; }
    public get length() { return Math.sqrt(this.lengthSquared); }

    public equals(x: IVector3): boolean {
        return x.x === this.x && x.y === this.y && x.z === this.z;
    }
    public normalize() {
        const length = this.length;
        return V3(
            this.x / length,
            this.y / length,
            this.z / length
        );
    }

    public distanceTo(other: Vector3) {
        return Math.sqrt(
            (this.x - other.x) * (this.x - other.x)
            + (this.y - other.y) * (this.y - other.y)
            + (this.z - other.z) * (this.z - other.z)
        );
    }

    public distanceToSquared(other: Vector3) {
        return (this.x - other.x) * (this.x - other.x)
            + (this.y - other.y) * (this.y - other.y)
            + (this.z - other.z) * (this.z - other.z);
    }

    public serialize() {
        return {
            x: this.x, y: this.y, z: this.z
        }
    }
}

export function V3(x?: number | IVector3, y?: number, z?: number) {
    return new Vector3(x, y, z);
}