export default class DataStore {

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.data = [];
    }

    init(count) {
        for (let i = 0; i < count; i++) {
            this.data.push(this.randomData());
        }
    }

    getData() {
        return [...this.data];
    }

    randomData() {
        return {
            id: Math.random() * 10000,
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            size: 2 + Math.random() * 50,
            selected: false
        };
    }

    randomUpdate() {
        const r = Math.random();
        if (r < 0.1) {
            console.log("Adding new bubbles");
            this.data.push(this.randomData());
        } else if (this.data.length > 0) {
            const index = Math.floor(Math.random() * this.data.length);
            if (r < 0.2) {
                console.log(`Deleting bubble at index ${index}`);
                this.data.splice(index, 1);
            } else if (r < 0.3) {
                const newSize = this.data[index].size * (0.5 + Math.random());
                console.log(`Updating size of bubble at index ${index} to ${newSize}`);
                this.data[index].size = newSize;
            } else if (r < 0.4) {
                const newX = this.data[index].x * (0.5 + Math.random());
                console.log(`Updating X of bubble at index ${index} to ${newX}`);
                this.data[index].x = newX;
            } else if (r < 0.5) {
                const newY = this.data[index].y * (0.5 + Math.random());
                console.log(`Updating Y of bubble at index ${index} to ${newY}`);
                this.data[index].y = newY;
            }
        }
    }
}
