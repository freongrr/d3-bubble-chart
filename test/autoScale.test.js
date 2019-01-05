import {getExtent} from "../src/autoScale";

const OPTIONS = {
    marginRatio: 0.1,
    extendThreshold: 0.1,
    contractThreshold: 0.2
};

beforeEach(() => {
    jest.resetAllMocks();
});

describe("getExtent", () => {

    test("when new min and new max are undefined, then return old extent", () => {
        const extent = getExtent(0, 0, undefined, undefined, OPTIONS);
        expect(extent).toEqual([0, 0]);
    });

    test("when old min equals old max, then return new values", () => {
        const extent = getExtent(0, 0, -10, 20, OPTIONS);
        expect(extent).toEqual([-10, 20]);
    });

    test("when new min equals new max, then return new values", () => {
        const extent = getExtent(-10, 10, 5, 5, OPTIONS);
        expect(extent).toEqual([5, 5]);
    });

    describe("when new min is lower than old min", () => {

        test("and ratio between new and old range does not exceed threshold, then return old extent", () => {
            const extent = getExtent(-10, 20, -11, 20, OPTIONS);
            expect(extent).toEqual([-10, 20]);
        });

        test("and ratio between new and old range exceeds threshold, then returns new min", () => {
            const extent = getExtent(-10, 20, -18, 20, OPTIONS);
            expect(extent).toEqual([-18, 20]);
        });
    });

    describe("when new min is greater than old min", () => {

        test("and ratio between new and old range does not exceed threshold, then return old extent", () => {
            const extent = getExtent(-10, 20, -9, 20, OPTIONS);
            expect(extent).toEqual([-10, 20]);
        });

        test("and ratio between new and old range exceeds threshold, then returns new min", () => {
            const extent = getExtent(-10, 20, -1, 20, OPTIONS);
            expect(extent).toEqual([-1, 20]);
        });
    });

    describe("when range is shifted left", () => {

        test("and difference is less than both thresholds then result old range", () => {
            const extent = getExtent(-10, 10, -11, 9, {extendThreshold: 0.5, contractThreshold: 0.5});
            expect(extent).toEqual([-10, 10]);
        });

        test("and difference is greater than increase threshold then returns new min and old max", () => {
            const extent = getExtent(-10, 10, -14, 6, {extendThreshold: 0.1, contractThreshold: 0.5});
            expect(extent).toEqual([-14, 10]);
        });

        test("and difference is greater than decrease threshold then returns old min and new max", () => {
            const extent = getExtent(-10, 10, -14, 6, {extendThreshold: 0.5, contractThreshold: 0.1});
            expect(extent).toEqual([-10, 6]);
        });

        test("and difference is greater than both thresholds then returns new values", () => {
            const extent = getExtent(-10, 10, -14, 6, {extendThreshold: 0.1, contractThreshold: 0.1});
            expect(extent).toEqual([-14, 6]);
        });
    });

    describe("when range is shifted right", () => {

        test("and difference is less than both thresholds then result old range", () => {
            const extent = getExtent(-10, 10, -9, 11, {extendThreshold: 0.5, contractThreshold: 0.5});
            expect(extent).toEqual([-10, 10]);
        });

        test("and difference is greater than increase threshold then returns old min and new max", () => {
            const extent = getExtent(-10, 10, -6, 14, {extendThreshold: 0.1, contractThreshold: 0.5});
            expect(extent).toEqual([-10, 14]);
        });

        test("and difference is greater than decrease threshold then returns new min and old max", () => {
            const extent = getExtent(-10, 10, -6, 14, {extendThreshold: 0.5, contractThreshold: 0.1});
            expect(extent).toEqual([-6, 10]);
        });

        test("and difference is greater than both thresholds then returns new values", () => {
            const extent = getExtent(-10, 10, -6, 14, {extendThreshold: 0.1, contractThreshold: 0.1});
            expect(extent).toEqual([-6, 14]);
        });
    });

    test("when new range does not intersect with old range then return new range", () => {
        const extent = getExtent(-10, 10, 40, 70, OPTIONS);
        expect(extent).toEqual([40, 70]);
    });
});
