import "./styles.css";
import {createChart} from "d3-bubble-chart";
import DataStore from "./dataStore";

const INITIAL_BUBBLES = 50;

const dataStore = new DataStore();
dataStore.init(INITIAL_BUBBLES);

const container = document.getElementById("root");
const chart = createChart(container);

chart.axes()
    .xTitle("Time (s)")
    .yTitle("Money ($)");

chart.tooltip()
    .render(d => `Bubble: ${d.id}
            <ul>
               <li>Time: ${parseInt(d.x)} s</li>
               <li>Money: $${parseInt(d.y)}</li>
               <li>Other: ${parseInt(d.z)}</li>
               <li>Size: ${parseInt(d.size)}</li>
            </ul>`);

// Initial data
refreshData();

function refreshData() {
    const rawData = dataStore.getData();
    const data = rawData.map(convertObject);
    chart.data(data);
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

// Random updates
let updateInterval;

window.startUpdates = (delay = 250) => {
    if (!updateInterval) {
        updateInterval = setInterval(() => {
            dataStore.randomUpdate();
            refreshData();
        }, delay);
    }
};

window.pauseUpdates = () => {
    clearInterval(updateInterval);
    updateInterval = null;
};

window.selectPoint = () => {
    const data = dataStore.getData();
    if (data.length > 0) {
        const index = Math.floor(Math.random() * data.length);
        const selection = [data[index].id];
        chart.selectedIds(selection);
    }
};

window.selectMultiplePoints = () => {
    const data = dataStore.getData();
    const ids = [];
    data.forEach(d => {
        if (Math.random() > 0.66) {
            ids.push(d.id);
        }
    });
    chart.selectedIds(ids);
};

window.selectedOneMorePoint = () => {
    const data = dataStore.getData();
    if (data.length > 0) {
        const index = Math.floor(Math.random() * data.length);
        const selectedIds = chart.selectedIds();
        const id = data[index].id;
        if (selectedIds.indexOf(id) < 0) {
            chart.selectedIds([...selectedIds, id]);
        }
    }
};
