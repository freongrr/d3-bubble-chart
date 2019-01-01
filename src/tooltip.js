import * as d3 from "d3";

const DEFAULT_RENDER_FN = (d) => JSON.stringify(d);
const SHOW_DELAY = 500;
const SHOW_DURATION = 200;
const HIDE_DURATION = 500;

export function createTooltip(container) {

    let render = DEFAULT_RENDER_FN;

    const tooltipDiv = d3.select(container || "body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    function onMouseOver(d) {
        const {x, y} = d3.event;
        tooltipDiv.transition()
            .duration(SHOW_DELAY)
            .transition()
            .duration(SHOW_DURATION)
            .style("opacity", 0.9);
        tooltipDiv.html(() => render(d))
            .style("left", (x + 10) + "px")
            .style("top", (y + 10) + "px");
    }

    function onMouseOut() {
        tooltipDiv.transition()
            .duration(HIDE_DURATION)
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
