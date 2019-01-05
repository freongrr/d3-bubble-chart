import * as d3 from "d3";

const DEFAULT_RENDER_FN = (d) => JSON.stringify(d);
const SHOW_DELAY = 500;
const SHOW_DURATION = 200;
const HIDE_DURATION = 500;

export function createTooltip(container) {

    let render = DEFAULT_RENDER_FN;

    const tooltipDiv = d3.select(container || "body")
        .append("div")
        .attr("class", "d3bc-tooltip")
        .style("opacity", 0);

    function onMouseOver(d) {
        const {x, y} = d3.event;
        tooltipDiv.transition()
            .duration(SHOW_DELAY)
            .transition()
            .duration(SHOW_DURATION)
            .style("opacity", 0.9);
        tooltipDiv.html(() => `<div class="d3bc-tooltip-content">${render(d)}</div>`)
            .style("left", (x + 10) + "px")
            .style("top", (y + 10) + "px");
    }

    function onMouseOut() {
        tooltipDiv.transition()
            .duration(HIDE_DURATION)
            .style("opacity", 0);
    }

    const self = selection => {
        return selection.on("mouseover", onMouseOver)
            .on("mouseout", onMouseOut);
    };

    self.render = (renderFunction) => {
        if (renderFunction === undefined) {
            return render;
        } else {
            render = renderFunction;
            return self;
        }
    };

    return self;
}
