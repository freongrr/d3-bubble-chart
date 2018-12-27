const MIN_X = 500;
const MAX_X = 2000;
const MIN_Y = 100;
const MAX_Y = 300;
const MIN_Z = 0;
const MAX_Z = 100;
const MIN_SIZE = 2;
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
            console.log("Adding new bubbles");
            this.data.push(randomData());
        } else if (this.data.length > 0) {
            const index = Math.floor(Math.random() * this.data.length);
            if (r < 0.2) {
                console.log(`Deleting bubble at index ${index}`);
                this.data.splice(index, 1);
            } else if (r < 0.3) {
                const newSize = normalize(this.data[index].size * (0.5 + Math.random()), MAX_SIZE, MIN_SIZE);
                console.log(`Updating size of bubble at index ${index} to ${newSize}`);
                this.data[index].size = newSize;
            } else if (r < 0.4) {
                const newX = normalize(this.data[index].x * (0.5 + Math.random()), MIN_X, MAX_X);
                console.log(`Updating X of bubble at index ${index} to ${newX}`);
                this.data[index].x = newX;
            } else if (r < 0.5) {
                const newY = normalize(this.data[index].y * (0.5 + Math.random()), MIN_Y, MAX_Y);
                console.log(`Updating Y of bubble at index ${index} to ${newY}`);
                this.data[index].y = newY;
            } else if (r < 0.6) {
                const newZ = normalize(this.data[index].z * (0.5 + Math.random()), MIN_Z, MAX_Z);
                console.log(`Updating Z of bubble at index ${index} to ${newZ}`);
                this.data[index].z = newZ;
            }
        }
    }
}

function randomData() {
    return {
        id: Math.random() * 10000,
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
