import { Bar, Doughnut, Line } from "react-chartjs-2";
import { titleCase } from "../lib/format";

const grid = "rgba(10,10,10,0.08)";
const ticks = "rgba(10,10,10,0.62)";

export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: ticks, boxWidth: 10, boxHeight: 10 } },
    tooltip: { backgroundColor: "#0a0a0a", borderColor: "rgba(242,201,76,0.5)", borderWidth: 1 }
  },
  scales: {
    x: { grid: { color: grid }, ticks: { color: ticks } },
    y: { grid: { color: grid }, ticks: { color: ticks } }
  }
};

export function TrendChart({ trend }) {
  if (!trend) return <EmptyChart label="Upload dated data to detect trends" />;
  return (
    <Line
      options={chartOptions}
      data={{
        labels: trend.points.slice(-16).map((point) => point.label),
        datasets: [
          {
            label: titleCase(trend.column),
            data: trend.points.slice(-16).map((point) => point.value),
            borderColor: "#f2c94c",
            backgroundColor: "rgba(242,201,76,0.18)",
            fill: true,
            tension: 0.35,
            pointRadius: 2
          }
        ]
      }}
    />
  );
}

export function SegmentChart({ performance }) {
  if (!performance) return <EmptyChart label="Upload categories and numeric measures to rank segments" />;
  return (
    <Bar
      options={chartOptions}
      data={{
        labels: performance.ranked.map((item) => item.name),
        datasets: [
          {
            label: titleCase(performance.valueColumn),
            data: performance.ranked.map((item) => item.total),
            backgroundColor: ["#0a0a0a", "#f2c94c", "#555555", "#888888", "#c99a00", "#e6e1d0", "#f7f7f2", "#222222"],
            borderRadius: 4
          }
        ]
      }}
    />
  );
}

export function QualityChart({ analysis }) {
  const score = Math.round(analysis?.qualityScore || 0);
  return (
    <Doughnut
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: "#0a0a0a" }
        },
        cutout: "72%"
      }}
      data={{
        labels: ["Quality", "Risk"],
        datasets: [
          {
            data: [score, 100 - score],
            backgroundColor: ["#f2c94c", "rgba(10,10,10,0.08)"],
            borderWidth: 0
          }
        ]
      }}
    />
  );
}

export function ScenarioChart({ scenario }) {
  if (!scenario) return <EmptyChart label="Run a what-if scenario to compare outcomes" />;
  return (
    <Bar
      options={chartOptions}
      data={{
        labels: ["Baseline", "Projected"],
        datasets: [
          {
            label: titleCase(scenario.column),
            data: [scenario.baseline, scenario.projected],
            backgroundColor: ["rgba(255,255,255,0.22)", "#f5c451"],
            borderRadius: 4
          }
        ]
      }}
    />
  );
}

function EmptyChart({ label }) {
  return (
    <div className="grid h-full min-h-[240px] place-items-center rounded-lg border border-dashed border-white/15 bg-white/[0.03] text-center text-sm font-semibold text-white/50">
      {label}
    </div>
  );
}
