d3-bubble-chart
===============

Bubble chart build using D3 (d3-axis, d3-brush, d3-drag, etc).

API
---

The `d3-bubble-chart` module only has one export:

* `createChart(container)`

  Renders a new bubble chart in the given container and returns an instance of the chart.

* `chart.data([newData])`

  If `newData` is specified, replaces the data shows in the graph and returns the chart object.
  Otherwise returns the current data in the graph.

  The data objects have to define the `id`, `x`, `y`, `z` and `size` attributes:

      {
        id: "bubble1",
        x: 1234,
        y: 567,
        z: 0.1,
        size: 10.5
      }

* `chart.selectedIds([selectedIds])`

  If `selectedIds` is defined, replaces the selection and returns the chart object.
  Otherwise returns the ids of the selected objects. 
  
  Note: setting the selection manually does not trigger the `select` event.

* `chart.axes()`

  Returns the object that renders the X and Y axis (see below).

* `chart.tooltip()`

  Returns the object that renders the tooltip (see below).

* `chart.on(type, listener)`

  Registers a listener for the given event type.

  The type must be one of the following:

  * `select`: invoked with a list of selected id (potentially empty):

        chart.on("select", (selectedIds) => {
          console.log("User has changed the selection", selectedIds);
        });

Axes
----

The X and Y axes are controlled by a single object that exposes the following methods: 

* `axes.xTitle([title])`
* `axes.yTitle([title])`

  If `title` is defined, sets the title of the axis and returns the axes object.
  Otherwise returns the current title of the axis (default to empty string).

      chart.axes()
        .xTitle("Time (s)")
        .yTitle("Money ($)");

* `axes.xFormat([format])`
* `axes.yFormat([format])`

  If `format` is defined, sets the format function of the labels on the axis.
  Otherwise returns the current format.
  
  The format can be a pattern or a function (see https://github.com/d3/d3-format).

Tooltip
-------

* `tooltip.render([function])`

  If `function` is defined, set the render function and returns the tooltip object.
  Otherwise return the current render function (defaults to `Object.toString`).

      chart.tooltip().render(d => `Element ${d.id}`);

Example
-------

Please refer to the example app in the `example` sub-module for more details.
