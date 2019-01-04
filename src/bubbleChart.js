import * as d3 from "d3";
import debounce from "lodash.debounce";
import "./bubbleChart.css";
import {createSelectionBox} from "./selectionBox";
import {createTooltip} from "./tooltip";
import {adjustScale} from "./autoScale";
import {createAxes} from "./twoAxes";
import EventManager from "./eventManager";

const SELECTED_ATTRIBUTE = "_selected";
const BUBBLE_SIZE_SCALE = 0.075;
const BUBBLE_TRANSITION_DURATION = 200;

const SELECT_EVENT = "select";

export function createChart(container) {
    const xScale = d3.scaleLinear();
    const yScale = d3.scaleLinear();
    const colorScale = d3.scaleLinear().range(["#30bf30", "#bf3030"]);
    const sizeScale = d3.scaleLinear();

    const eventManager = new EventManager([SELECT_EVENT]);

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
        const selectedIdSet = new Set(getSelectedIds());

        // Reset the _selected flag on the data
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

        // Some of the selected data is gone
        if (selectedIdSet.size > 0) {
            fireSelectEvent();
        }
    }

    function updateScales(newData) {
        let updateAxes = false;
        updateAxes |= adjustScale(xScale, newData, d => d.x);
        updateAxes |= adjustScale(yScale, newData, d => d.y);
        // TODO : take in account the number of values in the domain (e.g. 3 or 4 colors)
        adjustScale(colorScale, newData, d => d.z);
        adjustScale(sizeScale, newData, d => d.size, {marginRatio: 0});

        if (updateAxes) {
            axes.refresh();
        }
    }

    function renderBubbles(newData) {
        // Sets the data in the selection
        const updatedSelection = bubbleSelection.data(newData, d => d.id);

        // Update current elements
        updatedSelection.transition().duration(BUBBLE_TRANSITION_DURATION)
            .attr("cx", d => xScale(d.x))
            .attr("cy", d => yScale(d.y))
            .attr("r", d => sizeScale(d.size))
            .style("fill", d => colorScale(d.z));

        // Delete elements that have been removed from the selection
        updatedSelection.exit().transition().duration(BUBBLE_TRANSITION_DURATION)
            .attr("r", 0)
            .remove();

        // Create elements for new what has been added to the selection
        const newSelection = updatedSelection.enter()
            .append("circle")
            .attr("class", "bubble")
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

        newSelection
            .attr("cx", d => xScale(d.x))
            .attr("cy", d => yScale(d.y))
            .style("fill", d => colorScale(d.z))
            .transition().duration(BUBBLE_TRANSITION_DURATION)
            .attr("r", d => sizeScale(d.size));

        bubbleSelection = newSelection.merge(updatedSelection);

        bubbleSelection.order();
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
