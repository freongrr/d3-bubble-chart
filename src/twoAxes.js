import * as d3 from "d3";

const AXIS_MARGIN = {top: 20, right: 20, bottom: 50, left: 60};
const UPDATE_DURATION = 200;

export function createAxes(svg, xScale, yScale) {

    const axisLayer = svg.append("g")
        .attr("class", "axisLayer");

    const xAxis = d3.axisBottom(xScale);
    const xAxisGroup = axisLayer.append("g");
    const xAxisText = axisLayer.append("text")
        .attr("class", "title");

    const yAxis = d3.axisLeft(yScale);
    const yAxisGroup = axisLayer.append("g");
    const yAxisText = axisLayer.append("text")
        .attr("transform", "rotate(-90)")
        .attr("dy", "1em")
        .attr("class", "title");

    function resize(width, height) {
        xScale.range([AXIS_MARGIN.left, width - AXIS_MARGIN.right]);
        yScale.range([height - AXIS_MARGIN.bottom, AXIS_MARGIN.top]);

        xAxisGroup.transition().duration(UPDATE_DURATION)
            .attr("transform", `translate(0, ${height - AXIS_MARGIN.bottom})`)
            .call(xAxis);

        const axisWidth = width - AXIS_MARGIN.left - AXIS_MARGIN.right;
        xAxisText.transition().duration(UPDATE_DURATION)
            .attr("transform", `translate(${AXIS_MARGIN.left + axisWidth / 2}, ${height - 10})`);

        yAxisGroup.transition().duration(UPDATE_DURATION)
            .attr("transform", `translate(${AXIS_MARGIN.left}, 0)`)
            .call(yAxis);

        const axisHeight = height - AXIS_MARGIN.top - AXIS_MARGIN.bottom;
        yAxisText.transition().duration(UPDATE_DURATION)
            .attr("y", 10)
            .attr("x", -axisHeight / 2);
    }

    function refresh() {
        xAxisGroup.transition()
            .duration(UPDATE_DURATION)
            .call(xAxis);

        yAxisGroup.transition()
            .duration(UPDATE_DURATION)
            .call(yAxis);
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
