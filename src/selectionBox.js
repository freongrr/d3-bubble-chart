import * as d3 from "d3";

// If I render the selection area above the elements I want to select then I can't get click events on them
// But if I render the selection area below, I can't use the selection box when dragging on the elements.
// This function combines d3-brush with d3-drag to overcome these 2 problems. 
export function createSelectionBox(rectangle) {

    const callbacks = {};

    const brush = d3.brush()
        .on("brush", onBrush)
        .on("end", () => {
            const {selection, sourceEvent} = d3.event;
            const isDrag = sourceEvent && sourceEvent.type === "drag";
            if (!isDrag && selection) {
                hideSelectionRectangle();
            }
        });

    function onBrush() {
        const extent = d3.event.selection;
        const cb = callbacks["change"];
        if (extent && cb) {
            const [left, top] = extent[0];
            const [right, bottom] = extent[1];
            cb(left, top, right, bottom);
        }
    }

    function hideSelectionRectangle() {
        brush.move(rectangle, null);
    }

    rectangle.call(brush);

    // Update the brush programmatically when dragging on an element in the selection
    let dragStartLeft, dragStartTop;
    const drag = d3.drag()
        .on("start", () => {
            const {offsetX, offsetY} = d3.event.sourceEvent;
            dragStartLeft = offsetX;
            dragStartTop = offsetY;
        })
        .on("drag", () => {
            if (dragStartLeft && dragStartTop) {
                const {offsetX, offsetY} = d3.event.sourceEvent;
                const left = Math.min(dragStartLeft, offsetX);
                const top = Math.min(dragStartTop, offsetY);
                const right = Math.max(dragStartLeft, offsetX);
                const bottom = Math.max(dragStartTop, offsetY);
                brush.move(rectangle, [[left, top], [right, bottom]]);
            }
        })
        .on("end", () => {
            hideSelectionRectangle();
        });

    const self = (selection) => {
        selection.call(drag);
        return self;
    };

    self.on = (type, cb) => {
        callbacks[type] = cb;
        return self;
    };

    self.resize = () => {
        rectangle.call(brush);
    };

    return self;
}
