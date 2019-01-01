import * as d3 from "d3";
import "./bubbleChart.css";
import {createSelectionBox} from "./selectionBox";
import {createTooltip} from "./tooltip";
import {adjustScale} from "./autoScale";

const GRAPH_WIDTH = 800;
const GRAPH_HEIGHT = 800;
const MARGIN = {top: 20, right: 20, bottom: 50, left: 60};
const SIZE_SCALE = 0.075;

export function createChart(container) {
    let getId = (d) => d.id;
    let getX = () => 0;
    let getY = () => 0;
    let getZ = () => 0;
    let getSize = () => 0;

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
        .render(d => `Bubble: ${getId(d)}
            <ul>
               <li>X: ${getX(d)}</li>
               <li>Y: ${getY(d)}</li>
               <li>Z: ${getZ(d)}</li>
               <li>Size: ${getSize(d)}</li>
            </ul>`);

    function onSelectionChange(left, top, right, bottom) {
        bubbleSelection.each(d => {
            const scaledX = xScale(getX(d));
            const scaledY = yScale(getY(d));
            d.selected = (scaledX >= left) && (scaledX < right) && (scaledY >= top) && (scaledY < bottom);
        });
        bubbleSelection.classed("selected", d => d.selected);
    }

    function resizeAndRefresh() {
        const {width, height} = getElementSizeWithoutPadding(container);

        svg.attr("width", width)
            .attr("height", height);

        xScale.range([MARGIN.left, width - MARGIN.right]);
        yScale.range([height - MARGIN.bottom, MARGIN.top]);
        sizeScale.range([5, (Math.min(width, height) * SIZE_SCALE)]);

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
        // Order by smaller bubbles to simplify selection 
        newData = [...newData].sort((a, b) => {
            return getSize(b) - getSize(a);
        });

        adjustScale(xScale, newData, getX);
        adjustScale(yScale, newData, getY);
        adjustScale(colorScale, newData, getZ);
        adjustScale(sizeScale, newData, getSize, {marginRatio: 0});

        // TODO : only render the axes if the x/y scales have changed 
        renderAxes();
        renderBubbles(newData);
    }

    function renderBubbles(newData) {
        // Sets the data in the selection
        const updatedSelection = bubbleSelection.data(newData, getId);

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
                const select = !clicked.selected;
                if (!ctrlKey && !shiftKey) {
                    bubbleSelection.each(d => d.selected = false);
                }
                clicked.selected = select;
                bubbleSelection.classed("selected", d => d.selected);
            })
            .call(selectionBox)
            .call(bubbleTooltip);

        setupBubbles(newSelection);

        bubbleSelection = newSelection.merge(updatedSelection);
    }

    function setupBubbles(selection) {
        selection
            .attr("cx", d => xScale(getX(d)))
            .attr("cy", d => yScale(getY(d)))
            .attr("r", d => sizeScale(getSize(d)))
            .style("fill", d => colorScale(getZ(d)));
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

    // Delay the first refresh to scale everything to the container
    setTimeout(() => resizeAndRefresh(), 1);

    // TODO : monitor changes in the size of the container instead! 
    window.addEventListener("resize", resizeAndRefresh);

    const factory = {
        id: (fn) => {
            if (fn === undefined) {
                return getId;
            } else {
                getId = fn;
                return factory;
            }
        },
        x: (fn) => {
            if (fn === undefined) {
                return getX;
            } else {
                getX = fn;
                return factory;
            }
        },
        y: (fn) => {
            if (fn === undefined) {
                return getY;
            } else {
                getY = fn;
                return factory;
            }
        },
        z: (fn) => {
            if (fn === undefined) {
                return getZ;
            } else {
                getZ = fn;
                return factory;
            }
        },
        size: (fn) => {
            if (fn === undefined) {
                return getSize;
            } else {
                getSize = fn;
                return factory;
            }
        },
        setData: setData
    };

    return factory;
}
