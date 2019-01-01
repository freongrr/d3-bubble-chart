import "./styles.css";
import {createChart} from "./bubbleChart";
import DataStore from "./dataStore";

const INITIAL_BUBBLES = 100;

const dataStore = new DataStore();
dataStore.init(INITIAL_BUBBLES);

const container = document.getElementById("root");
const chart = createChart(container)
    .id(d => d.id)
    .x(d => d.x)
    .y(d => d.y)
    .z(d => d.z)
    .size(d => d.size);

// Initial data
chart.setData(dataStore.getData());

// Random updates
setInterval(() => {
    dataStore.randomUpdate();
    chart.setData(dataStore.getData());
}, 250);
