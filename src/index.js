import * as d3 from "d3";
import "./styles.css";

const WIDTH = 800;
const HEIGHT = 800;

const svg = d3.select("#root")
    .append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

const data = d3.range(100)
    .map(() => ({
        x: Math.random() * WIDTH,
        y: Math.random() * HEIGHT,
        size: 1 + Math.random() * 50,
        selected: false
    }));

const selectionBrush = d3.brush()
    .on("brush", brushed);

const pointSelection = svg.selectAll(".point")
    .data(data)
    .enter().append("circle")
    .attr("class", "point")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", d => d.size);

svg.append("g")
    .attr("class", "selectionRectangle")
    .call(selectionBrush);

function brushed() {
    const extent = d3.event.selection;
    pointSelection.each(d => d.selected = false);
    search(data, extent[0][0], extent[0][1], extent[1][0], extent[1][1]);
    pointSelection.classed("selected", d => d.selected);
}

function search(data, left, top, right, bottom) {
    data.forEach(d => {
        d.selected = (d.x >= left) && (d.x < right) && (d.y >= top) && (d.y < bottom);
    });
}
