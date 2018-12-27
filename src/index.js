/* eslint-disable no-unused-vars */

import * as d3 from "d3";
import "./styles.css";
import DataStore from "./dataStore";

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
    .domain([2, 50])
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
        const e = d3.event;
        const extent = e.selection;
        if (extent) {
            // Hide brush rectangle
            const current = svg.select(".selectionRectangle");
            selectionBrush.move(current, null);
        } else if (e.sourceEvent.x) {
            const {x, y, ctrlKey} = e.sourceEvent;
            const replace = !ctrlKey;
            const currentData = pointSelection.data();
            currentData.forEach(d => {
                flagClicked(d, x, y, replace);
            });
            pointSelection.classed("selected", d => d.selected);
        }
    });

function flagClicked(d, x, y, replace) {
    // TODO : intersect1 should give me better results, but it does not
    // I think the scaling is wrong here:
    const scaledX = xScale(d.x);
    const scaledY = yScale(d.y);

    const distance = Math.sqrt(Math.pow(x - scaledX, 2) + Math.pow(y - scaledY, 2));
    const intersect1 = distance < d.size;
    if (intersect1) {
        d.selected = true;
    } else if (replace) {
        d.selected = false;
    }

    const intersect2 = x >= scaledX - d.size && x <= scaledX + d.size &&
        y >= scaledY - d.size && y <= scaledY + d.size;
    if (intersect2) {
        d.selected = true;
    } else if (replace) {
        d.selected = false;
    }

    if (intersect1 || intersect2) {
        d.selected = true;
    } else if (replace) {
        d.selected = false;
    }

    if (intersect1 !== intersect2) {
        console.log("Mismatch");
    }
}

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
    renderSelectionBrush();
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
        .attr("class", "point");

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

function renderSelectionBrush() {
    const current = svg.select(".selectionRectangle");
    if (current.empty()) {
        svg.append("g")
            .attr("class", "selectionRectangle")
            .call(selectionBrush);
    } else {
        current.raise();
    }
}

// Initial view
refresh();

// Random updates
// setInterval(() => {
//     dataStore.randomUpdate();
//     refresh();
// }, 250);
