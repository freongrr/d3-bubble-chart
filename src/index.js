/* eslint-disable no-unused-vars */

import * as d3 from "d3";
import "./styles.css";
import DataStore from "./dataStore";
import tooltip from "./tooltip";

const GRAPH_WIDTH = 800;
const GRAPH_HEIGHT = 800;
const INITIAL_BUBBLES = 100;
const MARGIN = {top: 20, right: 20, bottom: 50, left: 60};

const xScale = d3.scaleLinear()
    .domain([0, 5000])
    .range([MARGIN.left, GRAPH_WIDTH - MARGIN.right]);

const yScale = d3.scaleLinear()
    .domain([0, 5000])
    .range([GRAPH_HEIGHT - MARGIN.bottom, MARGIN.top]);

const colorScale = d3.scaleLinear()
    .domain([0, 50])
    .range(["#0F0", "#F00"]);

const svg = d3.select("#root")
    .append("svg")
    .attr("width", GRAPH_WIDTH)
    .attr("height", GRAPH_HEIGHT);

const dataStore = new DataStore();
dataStore.init(INITIAL_BUBBLES);

const selectionBrush = d3.brush()
    .on("brush", brushed)
    .on("end", () => {
        const {selection, sourceEvent} = d3.event;
        const isDrag = sourceEvent && sourceEvent.type === "drag";
        if (!isDrag && selection) {
            hideSelectionRectangle();
        }
    });

const selectionRectangle = svg.append("g")
    .attr("class", "selectionRectangle")
    .call(selectionBrush);

// Because bubbles are rendered above the selection area,
// we have to update the selection brush programmatically
let dragStartLeft, dragStartTop;
const drag = d3.drag()
    .on("start", () => {
        const {offsetX, offsetY} = d3.event.sourceEvent;
        dragStartLeft = offsetX;
        dragStartTop = offsetY;
    })
    .on("drag", () => {
        if (dragStartLeft && dragStartTop) {
            const {offsetX, offsetY} = d3.event.sourceEvent;
            const left = Math.min(dragStartLeft, offsetX);
            const top = Math.min(dragStartTop, offsetY);
            const right = Math.max(dragStartLeft, offsetX);
            const bottom = Math.max(dragStartTop, offsetY);
            selectionBrush.move(selectionRectangle, [[left, top], [right, bottom]]);
        }
    })
    .on("end", () => {
        hideSelectionRectangle();
    });

function hideSelectionRectangle() {
    selectionBrush.move(selectionRectangle, null);
}

const bubbleTooltip = tooltip()
    .render(d => `Bubble: ${d.id}
            <ul>
               <li>X: ${d.x}</li>
               <li>Y: ${d.y}</li>
               <li>Z: ${d.z}</li>
               <li>Size: ${d.size}</li>
            </ul>`);

let pointSelection = svg.selectAll(".point");

function brushed() {
    const extent = d3.event.selection;
    if (extent) {
        const currentData = pointSelection.data();
        flagSelected(currentData, extent[0][0], extent[0][1], extent[1][0], extent[1][1]);
        pointSelection.classed("selected", d => d.selected);
    }
}

function flagSelected(data, left, top, right, bottom) {
    data.forEach(d => {
        const scaledX = xScale(d.x);
        const scaledY = yScale(d.y);
        d.selected = (scaledX >= left) && (scaledX < right) && (scaledY >= top) && (scaledY < bottom);
    });
}

function refresh() {
    const newData = dataStore.getData();

    // In a real life scenario, we should only update the scale/axes in extreme cases
    adjustScale(xScale, newData, d => d.x);
    adjustScale(yScale, newData, d => d.y);

    renderBubbles();
    renderAxes();
}

function adjustScale(scale, data, getter) {
    const [min, max] = d3.extent(data, getter);
    if (min !== undefined && max !== undefined) {
        const margin = max === min ? (max / 10) : (max - min) / 10;
        scale.domain([min - margin, max + margin]);
    }
}

function renderBubbles() {
    // Sets the data in the selection
    const newData = dataStore.getData();
    const updatedSelection = pointSelection.data(newData, d => d.id);

    // Update current elements
    setupBubbles(updatedSelection);

    // Delete elements that have been removed from the selection
    updatedSelection.exit().remove();

    // Create elements for new what has been added to the selection
    const newSelection = updatedSelection.enter()
        .append("circle")
        .attr("class", "point")
        .call(drag)
        .on("click", d => {
            const {ctrlKey, shiftKey} = d3.event;
            if (!ctrlKey && !shiftKey) {
                const currentData = pointSelection.data();
                currentData.forEach(d => d.selected = false);
            }
            d.selected = true;
            pointSelection.classed("selected", d => d.selected);
        })
        .call(bubbleTooltip);

    setupBubbles(newSelection);

    pointSelection = newSelection.merge(updatedSelection);
}

function setupBubbles(selection) {
    selection
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", d => d.size)
        .style("fill", d => colorScale(d.z));
}

function renderAxes() {
    d3.select(".axisLayer").remove();

    const axisLayer = svg.append("g")
        .attr("class", "axisLayer");

    const xAxis = d3.axisBottom(xScale);
    axisLayer.append("g")
        .attr("transform", `translate(0, ${GRAPH_HEIGHT - MARGIN.bottom})`)
        .call(xAxis);

    const axisWidth = GRAPH_WIDTH - MARGIN.left - MARGIN.right;
    axisLayer.append("text")
        .attr("transform", `translate(${MARGIN.left + axisWidth / 2}, ${GRAPH_HEIGHT - 10})`)
        .attr("class", "title")
        .text("X axis");

    const yAxis = d3.axisLeft(yScale);
    axisLayer.append("g")
        .attr("transform", `translate(${MARGIN.left}, 0)`)
        .call(yAxis);

    const axisHeight = GRAPH_HEIGHT - MARGIN.top - MARGIN.bottom;
    axisLayer.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("x", -axisHeight / 2)
        .attr("dy", "1em")
        .attr("class", "title")
        .text("Y axis");
}

// Initial view
refresh();

// Random updates
setInterval(() => {
    dataStore.randomUpdate();
    refresh();
}, 250);
