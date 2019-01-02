import * as d3 from "d3";
import "./bubbleChart.css";
import {createSelectionBox} from "./selectionBox";
import {createTooltip} from "./tooltip";
import {adjustScale} from "./autoScale";
import {createAxes} from "./twoAxes";

const SELECTED_ATTRIBUTE = "_selected";
const BUBBLE_SIZE_SCALE = 0.075;

export function createChart(container) {
    const xScale = d3.scaleLinear();
    const yScale = d3.scaleLinear();
    const colorScale = d3.scaleLinear().range(["#30bf30", "#bf3030"]);
    const sizeScale = d3.scaleLog();

    const svg = d3.select(container)
        .append("svg")
        .attr("class", "bubbleChart");

    let bubbleSelection = svg.selectAll(".bubble");

    const selectionRectangle = svg.append("g")
        .attr("class", "selectionRectangle");

    const selectionBox = createSelectionBox(selectionRectangle)
        .on("change", onSelectionChange);

    const axes = createAxes(svg, xScale, yScale);

    const bubbleTooltip = createTooltip(container);

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

        axes.resize(width, height);

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

        // Sort by reverse size to allow selection of smaller bubbles
        newData = newData.sort((a, b) => {
            // noinspection JSUnresolvedVariable
            return b.size - a.size;
        });

        let updateAxes = false;
        updateAxes |= adjustScale(xScale, newData, d => d.x);
        updateAxes |= adjustScale(yScale, newData, d => d.y);
        // TODO : take in account the number of values in the domain (e.g. 3 or 4 colors)
        adjustScale(colorScale, newData, d => d.z);
        adjustScale(sizeScale, newData, d => d.size, {marginRatio: 0});

        if (updateAxes) {
            axes.refresh();
        }

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

        bubbleSelection.order();
    }

    function setupBubbles(selection) {
        selection
            .attr("cx", d => xScale(d.x))
            .attr("cy", d => yScale(d.y))
            .attr("r", d => sizeScale(d.size))
            .style("fill", d => colorScale(d.z));
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

    const self = {
        data: (data) => {
            if (data === undefined) {
                return bubbleSelection.data();
            } else {
                setData(data);
                return self;
            }
        },
        selectedIds: (ids) => {
            if (ids === undefined) {
                return getSelectedIds();
            } else {
                setSelectedIds(ids);
                return self;
            }
        },
        axes: () => axes,
        tooltip: () => bubbleTooltip,
    };

    return self;
}
