import { describe, it, expect } from 'vitest';
import { lineOnLineIntersection } from '../src/math/utils';
import { V2 } from '../src/math/vector2';

describe('A first test to do', () => {
    it('failed', () => expect(0).toBe(1))
    it('succeeds', () => expect(0).toBe(0))
});

describe('vector2', () => {
    it('line intersection', () => {
        const a1 = V2(-10, 0);
        const a2 = V2(10, 0);

        const b1 = V2(-1, -10);
        const b2 = V2(-1, 10);

        const result = lineOnLineIntersection(a1, a2, b1, b2);

        expect(result!.x).toBe(-1);
        expect(result!.y).toBe(0);
    });
});