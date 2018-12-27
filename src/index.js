/* eslint-disable no-unused-vars */

import * as d3 from "d3";
import "./styles.css";
import DataStore from "./dataStore";

const GRAPH_WIDTH = 800;
const GRAPH_HEIGHT = 800;
const INITIAL_BUBBLES = 100;
const MARGIN = {top: 20, right: 20, bottom: 30, left: 30};

const xScale = d3.scaleLinear()
    .domain([0, 5000])
    .range([MARGIN.left, GRAPH_WIDTH - MARGIN.right]);

const yScale = d3.scaleLinear()
    .domain([0, 5000])
    .range([GRAPH_HEIGHT - MARGIN.bottom, MARGIN.top]);

// var colorScale = d3.scaleLinear()
//     .domain([-1, 0, 1])
//     .range(["red", "white", "green"]);

const svg = d3.select("#root")
    .append("svg")
    .attr("width", GRAPH_WIDTH)
    .attr("height", GRAPH_HEIGHT);

const dataStore = new DataStore();
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
        const adjustedX = xScale(d.x);
        const adjustedY = yScale(d.y);
        d.selected = (adjustedX >= left) && (adjustedX < right) && (adjustedY >= top) && (adjustedY < bottom);
    });
}

function adjustScale(scale, data, getter) {
    let min = null, max = null;
    data.forEach(d => {
        const v = getter(d);
        if (min === null || v < min) {
            min = v;
        }
        if (max === null || v > max) {
            max = v;
        }
    });
    if (min !== null && max !== null) {
        const margin = (max - min) / 10;
        scale.domain([min - margin, max + margin]);
    }
}

function refresh() {
    const newData = dataStore.getData();

    adjustScale(xScale, newData, d => d.x);
    adjustScale(yScale, newData, d => d.y);

    renderBubbles();

    // In a real life scenario, we should only update the scale/axes in extreme cases
    renderAxes();
}

function renderBubbles() {
    // Sets the data in the selection
    const newData = dataStore.getData();
    pointSelection = pointSelection.data(newData, d => d.id);

    // Update current elements
    pointSelection
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", d => d.size);

    // Delete elements that have been removed from the selection
    pointSelection.exit().remove();

    // Create elements for new what has been added to the selection
    const newSelection = pointSelection.enter()
        .append("circle")
        .attr("class", "point")
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", d => d.size);

    pointSelection = newSelection.merge(pointSelection);
}

function renderAxes() {
    d3.select(".axisLayer").remove();

    const axisLayer = svg.append("g")
        .attr("class", "axisLayer");

    const xAxis = d3.axisBottom(xScale);
    axisLayer.append("g")
        .attr("transform", `translate(0, ${GRAPH_HEIGHT - MARGIN.bottom})`)
        .call(xAxis);

    const yAxis = d3.axisLeft(yScale);
    axisLayer.append("g")
        .attr("transform", `translate(${MARGIN.left}, 0)`)
        .call(yAxis);
}

// Initial view
refresh();

// Random updates
setInterval(() => {
    dataStore.randomUpdate();
    refresh();
}, 250);
