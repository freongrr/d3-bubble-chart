import * as d3 from "d3";

const DEFAULT_RENDER_FN = (d) => JSON.stringify(d);

export function createTooltip() {

    let render = DEFAULT_RENDER_FN;

    const tooltipDiv = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    function onMouseOver(d) {
        const {x, y} = d3.event;
        tooltipDiv.transition()
            .duration(500)
            .transition()
            .duration(1)
            .duration(200)
            .style("opacity", 1);
        tooltipDiv.html(() => render(d))
            .style("left", (x + 10) + "px")
            .style("top", (y + 10) + "px");
    }

    function onMouseOut() {
        tooltipDiv.transition()
            .duration(500)
            .style("opacity", 0);
    }

    const factory = selection => {
        return selection.on("mouseover", onMouseOver)
            .on("mouseout", onMouseOut);
    };

    factory.render = fn => {
        if (fn === undefined) {
            return render;
        } else {
            render = fn;
            return factory;
        }
    };

    return factory;
}
