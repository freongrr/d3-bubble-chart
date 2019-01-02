import * as d3 from "d3";
import "./bubbleChart.css";
import {createSelectionBox} from "./selectionBox";
import {createTooltip} from "./tooltip";
import {adjustScale} from "./autoScale";

const SELECTED_ATTRIBUTE = "_selected";
// TODO : remove these 2?
const GRAPH_WIDTH = 800;
const GRAPH_HEIGHT = 800;
const AXIS_MARGIN = {top: 20, right: 20, bottom: 50, left: 60};
const BUBBLE_SIZE_SCALE = 0.075;

export function createChart(container) {
    const xScale = d3.scaleLinear();
    const yScale = d3.scaleLinear();
    const colorScale = d3.scaleLinear().range(["#30bf30", "#bf3030"]);
    const sizeScale = d3.scaleLog();

    const svg = d3.select(container)
        .append("svg")
        .attr("class", "bubbleChart")
        .attr("width", GRAPH_WIDTH)
        .attr("height", GRAPH_HEIGHT);

    let bubbleSelection = svg.selectAll(".bubble");

    const selectionRectangle = svg.append("g")
        .attr("class", "selectionRectangle");

    const selectionBox = createSelectionBox(selectionRectangle)
        .on("change", onSelectionChange);

    // TODO : expose
    const bubbleTooltip = createTooltip(container)
        .render(d => `Bubble: ${d.id}
            <ul>
               <li>X: ${d.x}</li>
               <li>Y: ${d.y}</li>
               <li>Z: ${d.z}</li>
               <li>Size: ${d.size}</li>
            </ul>`);

    function onSelectionChange(left, top, right, bottom) {
        bubbleSelection.each(d => {
            const scaledX = xScale(d.x);
            const scaledY = yScale(d.y);
            d[SELECTED_ATTRIBUTE] = (scaledX >= left) && (scaledX < right) && (scaledY >= top) && (scaledY < bottom);
        });
        refreshSelection();
    }

    function refreshSelection() {
        bubbleSelection.classed("selected", d => d[SELECTED_ATTRIBUTE]);
    }

    function resizeAndRefresh() {
        const {width, height} = getElementSizeWithoutPadding(container);

        svg.attr("width", width)
            .attr("height", height);

        xScale.range([AXIS_MARGIN.left, width - AXIS_MARGIN.right]);
        yScale.range([height - AXIS_MARGIN.bottom, AXIS_MARGIN.top]);
        sizeScale.range([5, (Math.min(width, height) * BUBBLE_SIZE_SCALE)]);

        selectionBox.resize();

        // Set the same data to force a refresh
        const currentData = bubbleSelection.data();
        setData(currentData);
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

    function setData(newData) {
        const selectedIds = getSelectedIds();

        // Reset the _selected flag on the data
        newData = newData.map(d => ({...d, [SELECTED_ATTRIBUTE]: selectedIds.indexOf(d.id) >= 0}));

        // Order by smaller bubbles to simplify selection
        // TODO : can I use d3's selection.order() here? 
        newData = newData.sort((a, b) => {
            // noinspection JSUnresolvedVariable
            return b.size - a.size;
        });

        adjustScale(xScale, newData, d => d.x);
        adjustScale(yScale, newData, d => d.y);
        // TODO : take in account the number of values in the domain (e.g. 3 or 4 colors)
        adjustScale(colorScale, newData, d => d.z);
        adjustScale(sizeScale, newData, d => d.size, {marginRatio: 0});

        // TODO : only render the axes if the x/y scales have changed 
        renderAxes();
        renderBubbles(newData);
    }

    function renderBubbles(newData) {
        // Sets the data in the selection
        const updatedSelection = bubbleSelection.data(newData, d => d.id);

        // Update current elements
        setupBubbles(updatedSelection.transition().duration(200));

        // Delete elements that have been removed from the selection
        updatedSelection.exit().remove();

        // Create elements for new what has been added to the selection
        const newSelection = updatedSelection.enter()
            .append("circle")
            .attr("class", "bubble")
            .on("click", clicked => {
                const {ctrlKey, shiftKey} = d3.event;
                const select = !clicked[SELECTED_ATTRIBUTE];
                if (!ctrlKey && !shiftKey) {
                    bubbleSelection.each(d => d[SELECTED_ATTRIBUTE] = false);
                }
                clicked[SELECTED_ATTRIBUTE] = select;
                refreshSelection();
            })
            .call(selectionBox)
            .call(bubbleTooltip);

        setupBubbles(newSelection);

        bubbleSelection = newSelection.merge(updatedSelection);
    }

    function setupBubbles(selection) {
        selection
            .attr("cx", d => xScale(d.x))
            .attr("cy", d => yScale(d.y))
            .attr("r", d => sizeScale(d.size))
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
            .attr("transform", `translate(0, ${svgHeight - AXIS_MARGIN.bottom})`)
            .call(xAxis);

        const axisWidth = svgWidth - AXIS_MARGIN.left - AXIS_MARGIN.right;
        axisLayer.append("text")
            .attr("transform", `translate(${AXIS_MARGIN.left + axisWidth / 2}, ${svgHeight - 10})`)
            .attr("class", "title")
            .text("X axis");

        const yAxis = d3.axisLeft(yScale);
        axisLayer.append("g")
            .attr("transform", `translate(${AXIS_MARGIN.left}, 0)`)
            .call(yAxis);

        const axisHeight = svgHeight - AXIS_MARGIN.top - AXIS_MARGIN.bottom;
        axisLayer.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 10)
            .attr("x", -axisHeight / 2)
            .attr("dy", "1em")
            .attr("class", "title")
            .text("Y axis");
    }

    function setSelectedIds(selectedIds) {
        bubbleSelection.each(d => d[SELECTED_ATTRIBUTE] = selectedIds.indexOf(d.id) >= 0);
        refreshSelection();
    }

    function getSelectedIds() {
        const ids = [];
        bubbleSelection.each(d => {
            if (d[SELECTED_ATTRIBUTE]) {
                ids.push(d.id);
            }
        });
        return ids;
    }

    // Delay the first refresh to scale everything to the container
    setTimeout(() => resizeAndRefresh(), 1);

    // TODO : monitor changes in the size of the container instead! 
    window.addEventListener("resize", resizeAndRefresh);

    return {
        setData,
        getSelectedIds,
        setSelectedIds,
    };
}
