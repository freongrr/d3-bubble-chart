import * as d3 from "d3";
import "./styles.css";

const WIDTH = 800;
const HEIGHT = 800;
const INITIAL_BUBBLES = 100;

const svg = d3.select("#root")
    .append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

function randomData() {
    return {
        id: Math.random() * 10000,
        x: Math.random() * WIDTH,
        y: Math.random() * HEIGHT,
        size: 2 + Math.random() * 50,
        selected: false
    };
}

const data = d3.range(INITIAL_BUBBLES)
    .map(() => randomData());

const selectionBrush = d3.brush()
    .on("brush", brushed);

let pointSelection = svg.selectAll(".point")
    .data(data);

svg.append("g")
    .attr("class", "selectionRectangle")
    .call(selectionBrush);

renderBubbles();

function brushed() {
    const extent = d3.event.selection;
    pointSelection.each(d => d.selected = false);
    search(data, extent[0][0], extent[0][1], extent[1][0], extent[1][1]);
    pointSelection.classed("selected", d => d.selected);
}

function search(data, left, top, right, bottom) {
    data.forEach(d => {
        d.selected = (d.x >= left) && (d.x < right) && (d.y >= top) && (d.y < bottom);
    });
}

function renderBubbles() {
    // Sets the data in the selection
    pointSelection = pointSelection.data(data, d => d.id);

    pointSelection
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => d.size);

    // Delete elements that have been removed from the selection
    pointSelection.exit().remove();

    // Create elements for new what has been added to the selection
    const newSelection = pointSelection.enter()
        .append("circle")
        .attr("class", "point")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => d.size);

    pointSelection = newSelection.merge(pointSelection);
}

setInterval(() => {

    const r = Math.random();
    if (r < 0.1) {
        console.log("Adding new bubbles");
        data.push(randomData());
    } else if (data.length > 0) {
        const index = Math.floor(Math.random() * data.length);
        if (r < 0.2) {
            console.log(`Deleting bubble at index ${index}`);
            data.splice(index, 1);
        } else if (r < 0.3) {
            const newSize = data[index].size * (0.5 + Math.random());
            console.log(`Updating size of bubble at index ${index} to ${newSize}`);
            data[index].size = newSize;
        } else if (r < 0.4) {
            const newX = data[index].x * (0.5 + Math.random());
            console.log(`Updating X of bubble at index ${index} to ${newX}`);
            data[index].x = newX;
        } else if (r < 0.5) {
            const newY = data[index].y * (0.5 + Math.random());
            console.log(`Updating Y of bubble at index ${index} to ${newY}`);
            data[index].y = newY;
        }
    }

    renderBubbles();
}, 100);
