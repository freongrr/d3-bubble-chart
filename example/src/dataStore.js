const MIN_X = 500;
const MAX_X = 2000;
const MIN_Y = -100;
const MAX_Y = 300;
const MIN_Z = 0;
const MAX_Z = 100;
const MIN_SIZE = 5;
const MAX_SIZE = 50;

export default class DataStore {

    constructor() {
        this.data = [];
    }

    init(count) {
        for (let i = 0; i < count; i++) {
            this.data.push(randomData());
        }
    }

    getData() {
        return [...this.data];
    }

    randomUpdate() {
        const r = Math.random();
        if (r < 0.1) {
            this.data.push(randomData());
        } else if (this.data.length > 0) {
            const index = Math.floor(Math.random() * this.data.length);
            if (r < 0.2) {
                this.data.splice(index, 1);
            } else {
                DataStore.randomUpdateValue(this.data[index]);
            }
        }
    }

    static randomUpdateValue(d) {
        const r = Math.random();
        if (r < 0.1) {
            d.size = DataStore.randomValueCloseTo(d.size, MIN_SIZE, MAX_SIZE);
        }
        if (r < 0.2) {
            d.x = DataStore.randomValueCloseTo(d.x, MIN_X, MAX_X);
        }
        if (r < 0.3) {
            d.y = DataStore.randomValueCloseTo(d.y, MIN_Y, MAX_Y);
        }
        if (r < 0.4) {
            d.z = DataStore.randomValueCloseTo(d.z, MIN_Z, MAX_Z);
        }
    }

    static randomValueCloseTo(value, min, max) {
        if (value === 0) {
            return min + (max - min) * Math.random();
        } else {
            return normalize(value * (0.5 + Math.random()), min, max);
        }
    }
}

function randomData() {
    return {
        id: "B" + parseInt(Math.random() * 10000),
        x: MIN_X + Math.random() * (MAX_X - MIN_X),
        y: MIN_Y + Math.random() * (MAX_Y - MIN_Y),
        z: MIN_Z + Math.random() * (MAX_Z - MIN_Z),
        size: MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE),
        selected: false
    };
}

function normalize(value, min, max) {
    return Math.max(Math.min(value, max), min);
}
