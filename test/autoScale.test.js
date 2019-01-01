import {getExtent} from "../src/autoScale";

const OPTIONS = {
    marginRatio: 0.1,
    extendThreshold: 0.1,
    contractThreshold: 0.2
};

// const scale = {};

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
});
