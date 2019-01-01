import "./styles.css";
import {createChart} from "./bubbleChart";
import DataStore from "./dataStore";

const INITIAL_BUBBLES = 100;

const container = document.getElementById("root");
const chart = createChart(container);

const dataStore = new DataStore();
dataStore.init(INITIAL_BUBBLES);

// Initial data
chart.setData(dataStore.getData());

// Random updates
setInterval(() => {
    dataStore.randomUpdate();
    chart.setData(dataStore.getData());
}, 250);
