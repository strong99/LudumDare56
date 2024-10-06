export interface IVector2 {
    x: number;
    y: number;
}
export class Vector2 {
    public x: number;
    public y: number;
    constructor();
    constructor(x: number, y: number);
    constructor(x?: number | IVector2, y?: number);
    constructor(x?: number | IVector2, y?: number) {
        const xIsNumber = typeof x === 'number';
        const yIsNumber = typeof y === 'number';
        if (xIsNumber && yIsNumber) {
            this.x = x;
            this.y = y;
        }
        else if (!xIsNumber && x && typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
        }
        else if (xIsNumber === yIsNumber) {
            this.x = 0;
            this.y = 0;
        }
        else {
            throw new Error("No x/y should be set, or both");
        }
    }
    public get length() { return Math.sqrt(this.lengthSquared); }
    public get lengthSquared() { return this.x * this.x + this.y * this.y; }

    public dot(b: Vector2) {
        return this.x * b.x + this.y * b.y;
    }
    public det(b: Vector2) {
        return this.x * b.x - this.y * b.y;
    }

    public distanceTo(other: Vector2) {
        return Math.sqrt(
            (this.x - other.x) * (this.x - other.x)
            + (this.y - other.y) * (this.y - other.y)
        );
    }
    public normalize() {
        const length = this.length;
        return V2(
            this.x / length,
            this.y / length
        );
    }

    public serialize() {
        return {
            x: this.x, y: this.y
        }
    }
}

export function V2(x?: number | IVector2, y?: number) {
    return new Vector2(x, y);
}
