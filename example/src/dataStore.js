const MIN_X = 500;
const MAX_X = 2000;
const MIN_Y = 100;
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
                this.randomUpdateValue(this.data[index]);
            }
        }
    }

    randomUpdateValue(d) {
        const r = Math.random();
        if (r < 0.1) {
            d.size = normalize(d.size * (0.5 + Math.random()), MAX_SIZE, MIN_SIZE);
        }
        if (r < 0.2) {
            d.x = normalize(d.x * (0.5 + Math.random()), MIN_X, MAX_X);
        }
        if (r < 0.3) {
            d.y = normalize(d.y * (0.5 + Math.random()), MIN_Y, MAX_Y);
        }
        if (r < 0.4) {
            d.z = normalize(d.z * (0.5 + Math.random()), MIN_Z, MAX_Z);
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
