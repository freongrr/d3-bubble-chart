import * as d3 from "d3";
import "./styles.css";
import DataStore from "./dataStore";

const WIDTH = 800;
const HEIGHT = 800;
const INITIAL_BUBBLES = 100;

const svg = d3.select("#root")
    .append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

const dataStore = new DataStore(WIDTH, HEIGHT);
dataStore.init(INITIAL_BUBBLES);

const selectionBrush = d3.brush()
    .on("brush", brushed);

let pointSelection = svg.selectAll(".point")
    .data(dataStore.getData());

svg.append("g")
    .attr("class", "selectionRectangle")
    .call(selectionBrush);

function brushed() {
    const extent = d3.event.selection;
    pointSelection.each(d => d.selected = false);
    flagSelected(pointSelection.data(), extent[0][0], extent[0][1], extent[1][0], extent[1][1]);
    pointSelection.classed("selected", d => d.selected);
}

function flagSelected(data, left, top, right, bottom) {
    data.forEach(d => {
        d.selected = (d.x >= left) && (d.x < right) && (d.y >= top) && (d.y < bottom);
    });
}

function renderBubbles() {
    // Sets the data in the selection
    const newData = dataStore.getData();
    pointSelection = pointSelection.data(newData, d => d.id);

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

// Initial view
renderBubbles();

// Random updates
setInterval(() => {
    dataStore.randomUpdate();
    renderBubbles();
}, 250);
