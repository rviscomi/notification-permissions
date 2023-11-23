import data from "./data.js";

const selectedOrigin = document.getElementById("selected-origin");
const randomizeOrigin = document.getElementById("randomize");
const originList = document.getElementById("origins");
const results = Object.entries(data);
let permissionsChart;

results.forEach(([origin]) => {
  const option = document.createElement("option");
  option.value = origin;
  option.text = origin;
  originList.appendChild(option);
});

const url = new URL(window.location);
const origin = url.searchParams.get("origin") || "https://app.slack.com";
setOrigin(origin);

selectedOrigin.addEventListener("change", (event) => {
  const origin = event.target.value;
  setOrigin(origin);
});

randomizeOrigin.addEventListener("click", () => {
  let randomOrigin;
  do {
    randomOrigin = results[Math.floor(Math.random() * results.length)][0];
  } while (randomOrigin == selectedOrigin.value);
  setOrigin(randomOrigin);
});

function setOrigin(origin) {
  const originData = data[origin];
  selectedOrigin.value = origin;
  replaceState(origin);

  if (permissionsChart) {
    originData.forEach((data, index) => {
      permissionsChart.data.datasets[0].data[index] = data[0];
      permissionsChart.data.datasets[1].data[index] = data[1];
      permissionsChart.data.datasets[2].data[index] = data[2];
      permissionsChart.data.datasets[3].data[index] = data[3];
    });

    permissionsChart.update();
    return;
  }

  // Transposing the data for Chart.js datasets
  let accept = [],
    dismiss = [],
    deny = [],
    ignore = [];
  originData.forEach((data) => {
    accept.push(data[0]);
    dismiss.push(data[1]);
    deny.push(data[2]);
    ignore.push(data[3]);
  });

  // Creating the datasets
  const datasets = [
    {
      label: "Accept",
      data: accept,
      backgroundColor: "rgba(52, 168, 83, 1)", // Green
      fill: true,
      pointRadius: 0,
      pointHitRadius: 10,
      stack: "Stack 0",
    },
    {
      label: "Dismiss",
      data: dismiss,
      backgroundColor: "rgba(251, 188, 4, 1)", // Orange
      fill: true,
      pointRadius: 0,
      pointHitRadius: 10,
      stack: "Stack 0",
    },
    {
      label: "Deny",
      data: deny,
      backgroundColor: "rgba(234, 67, 53, 1)", // Red
      fill: true,
      pointRadius: 0,
      pointHitRadius: 10,
      stack: "Stack 0",
    },
    {
      label: "Ignore",
      data: ignore,
      backgroundColor: "rgba(67, 67, 67, 1)", // Gray
      fill: true,
      pointRadius: 0,
      pointHitRadius: 10,
      stack: "Stack 0",
    },
  ];

  // Setting up the chart options
  const options = {
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        max: 100,
        min: 0,
        ticks: {
          callback: (value) => {
            return value + "%";
          },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return label + ": " + value + "%";
          },
        },
      },
    },
  };

  // Selecting the canvas element and creating the chart
  const ctx = document.getElementById("myChart").getContext("2d");
  permissionsChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: Array.from({ length: originData.length }, (_, i) =>
        indexToMonth(i + 1)
      ),
      datasets: datasets,
    },
    options: options,
  });
}

function indexToMonth(index) {
  const startDate = new Date(2020, 0); // January 2020
  const targetDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + index - 1
  );

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
  }).format(targetDate);
}

function replaceState(origin) {
  const url = new URL(window.location);
  url.searchParams.set("origin", origin);
  window.history.replaceState({}, "", url);
}
