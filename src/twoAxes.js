import * as d3 from "d3";

const AXIS_MARGIN = {top: 20, right: 20, bottom: 50, left: 60};

export function createAxes(svg, xScale, yScale) {

    function resize(width, height) {
        xScale.range([AXIS_MARGIN.left, width - AXIS_MARGIN.right]);
        yScale.range([height - AXIS_MARGIN.bottom, AXIS_MARGIN.top]);
    }

    function refresh() {
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

    return {
        resize,
        refresh,
    };
}
