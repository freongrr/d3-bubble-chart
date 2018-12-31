import * as d3 from "d3";
import "./styles.css";
import DataStore from "./dataStore";
import {createSelectionBox} from "./selectionBox";
import {createTooltip} from "./tooltip";

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

const container = document.getElementById("root");
const svg = d3.select(container)
    .append("svg")
    .attr("width", GRAPH_WIDTH)
    .attr("height", GRAPH_HEIGHT);

let pointSelection = svg.selectAll(".point");

const selectionRectangle = svg.append("g")
    .attr("class", "selectionRectangle");

const selectionBox = createSelectionBox(selectionRectangle)
    .on("change", onSelectionChange);

const bubbleTooltip = createTooltip()
    .render(d => `Bubble: ${d.id}
            <ul>
               <li>X: ${d.x}</li>
               <li>Y: ${d.y}</li>
               <li>Z: ${d.z}</li>
               <li>Size: ${d.size}</li>
            </ul>`);

function onSelectionChange(left, top, right, bottom) {
    pointSelection.each(d => {
        const scaledX = xScale(d.x);
        const scaledY = yScale(d.y);
        d.selected = (scaledX >= left) && (scaledX < right) && (scaledY >= top) && (scaledY < bottom);
    });
    pointSelection.classed("selected", d => d.selected);
}

function resizeAndRefresh() {
    const {width, height} = getElementSizeWithoutPadding(container);

    svg.attr("width", width)
        .attr("height", height);

    xScale.range([MARGIN.left, width - MARGIN.right]);
    yScale.range([height - MARGIN.bottom, MARGIN.top]);

    selectionBox.resize();

    refresh(dataStore.getData());
}

function getElementSizeWithoutPadding(element) {
    const containerStyle = window.getComputedStyle(element, null);
    const left = parseInt(containerStyle.getPropertyValue("padding-left").replace("px", ""));
    const right = parseInt(containerStyle.getPropertyValue("padding-right").replace("px", ""));
    const top = parseInt(containerStyle.getPropertyValue("padding-top").replace("px", ""));
    const bottom = parseInt(containerStyle.getPropertyValue("padding-bottom").replace("px", ""));
    return {
        width: container.clientWidth - left - right,
        height: container.clientHeight - top - bottom
    };
}

function refresh(newData) {
    // In a real life scenario, we should only update the scale/axes in extreme cases
    adjustScale(xScale, newData, d => d.x);
    adjustScale(yScale, newData, d => d.y);

    renderBubbles(newData);
    renderAxes();
}

function adjustScale(scale, data, getter) {
    const [min, max] = d3.extent(data, getter);
    if (min !== undefined && max !== undefined) {
        const margin = max === min ? (max / 10) : (max - min) / 10;
        scale.domain([min - margin, max + margin]);
    }
}

function renderBubbles(newData) {
    // Sets the data in the selection
    const updatedSelection = pointSelection.data(newData, d => d.id);

    // Update current elements
    setupBubbles(updatedSelection);

    // Delete elements that have been removed from the selection
    updatedSelection.exit().remove();

    // Create elements for new what has been added to the selection
    const newSelection = updatedSelection.enter()
        .append("circle")
        .attr("class", "point")
        .on("click", d => {
            const {ctrlKey, shiftKey} = d3.event;
            if (!ctrlKey && !shiftKey) {
                const currentData = pointSelection.data();
                currentData.forEach(d => d.selected = false);
            }
            d.selected = true;
            pointSelection.classed("selected", d => d.selected);
        })
        .call(selectionBox)
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

    const svgWidth = svg.attr("width");
    const svgHeight = svg.attr("height");

    const axisLayer = svg.append("g")
        .attr("class", "axisLayer");

    const xAxis = d3.axisBottom(xScale);
    axisLayer.append("g")
        .attr("transform", `translate(0, ${svgHeight - MARGIN.bottom})`)
        .call(xAxis);

    const axisWidth = svgWidth - MARGIN.left - MARGIN.right;
    axisLayer.append("text")
        .attr("transform", `translate(${MARGIN.left + axisWidth / 2}, ${svgHeight - 10})`)
        .attr("class", "title")
        .text("X axis");

    const yAxis = d3.axisLeft(yScale);
    axisLayer.append("g")
        .attr("transform", `translate(${MARGIN.left}, 0)`)
        .call(yAxis);

    const axisHeight = svgHeight - MARGIN.top - MARGIN.bottom;
    axisLayer.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("x", -axisHeight / 2)
        .attr("dy", "1em")
        .attr("class", "title")
        .text("Y axis");
}

const dataStore = new DataStore();
dataStore.init(INITIAL_BUBBLES);

// Initial view
setTimeout(() => resizeAndRefresh(), 1);

// Random updates
setInterval(() => {
    dataStore.randomUpdate();
    refresh(dataStore.getData());
}, 250);

window.addEventListener("resize", resizeAndRefresh);
