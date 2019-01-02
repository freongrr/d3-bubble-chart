import "./styles.css";
import {createChart} from "./bubbleChart";
import DataStore from "./dataStore";

const INITIAL_BUBBLES = 100;

const dataStore = new DataStore();
dataStore.init(INITIAL_BUBBLES);

const container = document.getElementById("root");
const chart = createChart(container);

// Initial data
refreshData();

// Random updates
setInterval(() => {
    dataStore.randomUpdate();
    refreshData();
}, 250);

function refreshData() {
    const rawData = dataStore.getData();
    const data = rawData.map(convertObject);
    chart.setData(data);
}

function convertObject(object) {
    return {
        id: object.id,
        x: object.x,
        y: object.y,
        z: object.z,
        size: object.size,
    };
}
