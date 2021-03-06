import * as d3 from "d3";
import debounce from "lodash.debounce";
import "./bubbleChart.css";
import {createSelectionBox} from "./selectionBox";
import {createTooltip} from "./tooltip";
import {adjustScale} from "./autoScale";
import {createAxes} from "./twoAxes";
import EventManager from "./eventManager";

const SELECTED_ATTRIBUTE = "_selected";
const BUBBLE_MIN_SIZE = 8;
const BUBBLE_SIZE_SCALE = 0.075;
const BUBBLE_TRANSITION_DURATION = 200;

const SELECT_EVENT = "select";

export function createChart(container) {
    let initialized = false;

    // TODO : make scales configurable
    // - log/linear
    // - colors
    // - min/max size?
    const xScale = d3.scaleLinear();
    const yScale = d3.scaleLinear();
    const colorScale = d3.scaleLinear().range(["#30bf30", "#bf3030"]);
    const sizeScale = d3.scaleLinear();

    const eventManager = new EventManager([SELECT_EVENT]);

    const svg = d3.select(container)
        .append("svg")
        .attr("class", "d3bc-chart");

    let bubbleSelection = svg.selectAll(".d3bc-bubble");

    const selectionRectangle = svg.append("g")
        .attr("class", "d3bc-selectionRectangle");

    const selectionBox = createSelectionBox(selectionRectangle)
        .on("change", onSelectionChange);

    const axes = createAxes(svg, xScale, yScale);

    const bubbleTooltip = createTooltip(container);

    const fireSelectEvent = debounce(() => {
        eventManager.fireEvent(SELECT_EVENT, getSelectedIds());
    }, 100);

    function onSelectionChange(left, top, right, bottom) {
        bubbleSelection.each(d => {
            const scaledX = xScale(d.x);
            const scaledY = yScale(d.y);
            setSelection(d, (scaledX >= left) && (scaledX < right) && (scaledY >= top) && (scaledY < bottom));
        });
        refreshSelection();
    }

    function setSelection(data, newSelection) {
        if (data[SELECTED_ATTRIBUTE] !== newSelection) {
            data[SELECTED_ATTRIBUTE] = newSelection;
            fireSelectEvent();
        }
    }

    function refreshSelection() {
        bubbleSelection.classed("d3bc-bubble-selected", d => d[SELECTED_ATTRIBUTE]);
    }

    function resizeAndRefresh() {
        const {width, height} = getElementSizeWithoutPadding(container);

        svg.attr("width", width)
            .attr("height", height);

        axes.resize(width, height, initialized);

        sizeScale.range([BUBBLE_MIN_SIZE, (Math.min(width, height) * BUBBLE_SIZE_SCALE)]);

        selectionBox.resize();

        // Set the same data to force a refresh
        const currentData = bubbleSelection.data();
        setData(currentData);

        initialized = true;
    }

    function getElementSizeWithoutPadding(element) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        const containerStyle = window.getComputedStyle(element, null);
        const left = getPadding(containerStyle, "left");
        const right = getPadding(containerStyle, "right");
        const top = getPadding(containerStyle, "top");
        const bottom = getPadding(containerStyle, "bottom");
        return {
            width: width - left - right,
            height: height - top - bottom
        };
    }

    function getPadding(elementStyle, name) {
        const string = elementStyle.getPropertyValue("padding-" + name);
        if (string === undefined || string === "") {
            return 0;
        } else {
            return parseFloat(string);
        }
    }

    function setData(newData) {
        // Reset the _selected flag on the data
        const selectedIdSet = new Set(getSelectedIds());
        newData = newData.map(d => {
            const selected = selectedIdSet.has(d.id);
            selectedIdSet.delete(d.id);
            return {...d, [SELECTED_ATTRIBUTE]: selected};
        });

        // Sort by reverse size to allow selection of smaller bubbles
        newData = newData.sort((a, b) => {
            // noinspection JSUnresolvedVariable
            return b.size - a.size;
        });

        updateScales(newData);
        renderBubbles(newData);
    }

    function updateScales(newData) {
        let updateAxes = false;
        updateAxes |= adjustScale(xScale, newData, d => d.x);
        updateAxes |= adjustScale(yScale, newData, d => d.y);
        // TODO : take in account the number of values in the domain (e.g. 3 or 4 colors)
        adjustScale(colorScale, newData, d => d.z);
        adjustScale(sizeScale, newData, d => d.size, {marginRatio: 0.05});

        if (updateAxes) {
            axes.refresh(initialized);
        }
    }

    function renderBubbles(newData) {
        // Sets the data in the selection
        const updatedSelection = bubbleSelection.data(newData, d => d.id);

        // Update current elements
        transition(updatedSelection)
            .attr("cx", d => xScale(d.x))
            .attr("cy", d => yScale(d.y))
            .attr("r", d => sizeScale(d.size))
            .style("fill", d => colorScale(d.z));

        // Delete elements that have been removed from the selection
        transition(updatedSelection.exit())
            .attr("r", 0)
            .remove();

        // Create elements for new what has been added to the selection
        const newSelection = updatedSelection.enter()
            .append("circle")
            .attr("class", "d3bc-bubble")
            .on("click", clicked => {
                const {ctrlKey, shiftKey} = d3.event;
                const selectedIds = getSelectedIds();
                // Deselect everything else when not using a meta key
                if (!ctrlKey && !shiftKey) {
                    bubbleSelection.each(d => {
                        if (d !== clicked) {
                            setSelection(d, false);
                        }
                    });
                }
                // Toggle the selection when using a meta key or when it's the only selected bubble
                if (ctrlKey || shiftKey || selectedIds.length === 1) {
                    setSelection(clicked, !clicked[SELECTED_ATTRIBUTE]);
                } else {
                    setSelection(clicked, true);
                }
                refreshSelection();
            })
            .call(selectionBox)
            .call(bubbleTooltip);

        transition(newSelection
            .attr("cx", d => xScale(d.x))
            .attr("cy", d => yScale(d.y))
            .style("fill", d => colorScale(d.z))
        ).attr("r", d => sizeScale(d.size));

        bubbleSelection = newSelection.merge(updatedSelection);

        bubbleSelection.order();
    }

    function transition(something) {
        if (initialized) {
            return something.transition().duration(BUBBLE_TRANSITION_DURATION);
        } else {
            return something;
        }
    }

    function setSelectedIds(selectedIds) {
        const selectedIdSet = new Set(selectedIds);
        bubbleSelection.each(d => d[SELECTED_ATTRIBUTE] = selectedIdSet.has(d.id));
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

    // HACK - delay the first refresh to scale everything to the container
    setTimeout(() => resizeAndRefresh(), 1);
    setTimeout(() => resizeAndRefresh(), 500);

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
        on: (eventType, callback) => {
            eventManager.register(eventType, callback);
            return self;
        },
        axes: () => axes,
        tooltip: () => bubbleTooltip,
    };

    return self;
}
