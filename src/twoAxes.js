import * as d3 from "d3";

const AXIS_MARGIN = {top: 20, right: 20, bottom: 50, left: 60};
const UPDATE_DURATION = 200;
const BOTTOM_TITLE_MARGIN = 5;

export function createAxes(svg, xScale, yScale) {

    const axisLayer = svg.append("g")
        .attr("class", "d3bc-axisLayer");

    const xAxis = d3.axisBottom(xScale);
    const xAxisGroup = axisLayer.append("g");
    const xAxisText = axisLayer.append("text")
        .attr("class", "d3bc-axisTitle");

    const yAxis = d3.axisLeft(yScale);
    const yAxisGroup = axisLayer.append("g");
    const yAxisText = axisLayer.append("text")
        .attr("transform", "rotate(-90)")
        .attr("dy", "1em")
        .attr("class", "d3bc-axisTitle");

    function resize(width, height, animate = false) {
        xScale.range([AXIS_MARGIN.left, width - AXIS_MARGIN.right]);
        yScale.range([height - AXIS_MARGIN.bottom, AXIS_MARGIN.top]);

        transition(xAxisGroup, animate)
            .attr("transform", `translate(0, ${height - AXIS_MARGIN.bottom})`)
            .call(xAxis);

        const axisWidth = width - AXIS_MARGIN.left - AXIS_MARGIN.right;
        transition(xAxisText, animate)
            .attr("transform", `translate(${AXIS_MARGIN.left + axisWidth / 2}, ${height - BOTTOM_TITLE_MARGIN})`);

        transition(yAxisGroup, animate)
            .attr("transform", `translate(${AXIS_MARGIN.left}, 0)`)
            .call(yAxis);

        const axisHeight = height - AXIS_MARGIN.top - AXIS_MARGIN.bottom;
        transition(yAxisText, animate)
            .attr("x", -axisHeight / 2);
    }

    function refresh(animate = false) {
        transition(xAxisGroup, animate).call(xAxis);
        transition(yAxisGroup, animate).call(yAxis);
    }

    function transition(something, animate) {
        if (animate) {
            return something.transition().duration(UPDATE_DURATION);
        } else {
            return something;
        }
    }

    const self = {
        resize: resize,
        refresh: refresh,
        xTitle: (title) => {
            if (title === undefined) {
                return xAxisText.text();
            } else {
                xAxisText.text(title);
                return self;
            }
        },
        yTitle: (title) => {
            if (title === undefined) {
                return yAxisText.text();
            } else {
                yAxisText.text(title);
                return self;
            }
        },
        xFormat: (format) => {
            return xAxis.tickFormat(format);
        },
        yFormat: (format) => {
            return yAxis.tickFormat(format);
        },
    };

    // TODO : expose label format functions
    return self;
}
