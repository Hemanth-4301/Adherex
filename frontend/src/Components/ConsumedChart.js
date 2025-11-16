import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { API_ENDPOINTS } from "../api";
import Loader from "./Loader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ConsumedChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const patientId = localStorage.getItem("pid");

  const expectedTimes = {
    Morning: 9,
    Afternoon: 14,
    Evening: 19,
  };

  useEffect(() => {
    if (patientId) {
      fetchConsumedData();
    } else {
      setLoading(false);
      setError("No patient ID found");
    }
  }, [patientId]);

  const fetchConsumedData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_ENDPOINTS.CONSUMED_GET(patientId));
      console.log("Raw data:", res.data);
      processDataForChart(res.data);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const processDataForChart = (data) => {
    if (!data || data.length === 0) {
      setChartData(null);
      return;
    }

    // Group by date and medication
    const dateSet = new Set();
    const medicationData = {};

    data.forEach((item) => {
      const date = new Date(item.dateTime);
      const dateKey = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      dateSet.add(dateKey);

      const medName = item.medication?.tableName || "Unknown";
      const timing =
        item.medication?.timing?.split(",")[0]?.trim() || "Morning";
      const actualHour = date.getHours() + date.getMinutes() / 60;
      const key = `${medName} (${timing})`;

      if (!medicationData[key]) {
        medicationData[key] = {};
      }
      medicationData[key][dateKey] = actualHour;
    });

    const labels = Array.from(dateSet).sort((a, b) => {
      return new Date(a + " 2025") - new Date(b + " 2025");
    });

    const colors = [
      "#3B82F6",
      "#F97316",
      "#10B981",
      "#8B5CF6",
      "#EF4444",
      "#06B6D4",
    ];
    const datasets = Object.keys(medicationData).map((medKey, idx) => {
      const dataPoints = labels.map(
        (label) => medicationData[medKey][label] || null
      );

      // Create point colors based on adherence
      const pointBackgroundColors = dataPoints.map((value) => {
        if (value === null) return colors[idx % colors.length];
        const timing = medKey.match(/\(([^)]+)\)/)?.[1] || "Morning";
        const expected = expectedTimes[timing] || 9;
        const diff = Math.abs(value - expected);
        if (diff <= 0.5) return "#10b981"; // green
        if (diff <= 1.5) return "#f59e0b"; // orange
        return "#ef4444"; // red
      });

      return {
        label: medKey,
        data: dataPoints,
        borderColor: colors[idx % colors.length],
        backgroundColor: colors[idx % colors.length],
        pointBackgroundColor: pointBackgroundColors,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.3,
      };
    });

    setChartData({
      labels,
      datasets,
    });

    console.log("Chart data set:", { labels, datasets });
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#9CA3AF",
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: "#1F2937",
        titleColor: "#F3F4F6",
        bodyColor: "#F3F4F6",
        borderColor: "#374151",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context) {
            const value = context.parsed.y;
            const hours = Math.floor(value);
            const minutes = Math.round((value - hours) * 60);
            return `${context.dataset.label}: ${hours}:${minutes
              .toString()
              .padStart(2, "0")}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#9CA3AF",
        },
        grid: {
          color: "#374151",
          opacity: 0.2,
        },
      },
      y: {
        min: 0,
        max: 24,
        ticks: {
          stepSize: 3,
          color: "#9CA3AF",
          callback: function (value) {
            if (value === 9) return "9 AM";
            if (value === 14) return "2 PM";
            if (value === 19) return "7 PM";
            if (value === 0) return "12 AM";
            if (value === 24) return "12 AM";
            return `${value}:00`;
          },
        },
        grid: {
          color: "#374151",
          opacity: 0.2,
        },
        title: {
          display: true,
          text: "Medication Time",
          color: "#9CA3AF",
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] py-8">
        <Loader size="lg" text="Loading chart..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white dark:bg-[#171717] rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Medication Consumption Chart
          </h3>
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No consumption data available
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white dark:bg-[#171717] rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          Medication Consumption Chart
        </h3>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">On Time</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-gray-600 dark:text-gray-400">
              Slightly Off
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600 dark:text-gray-400">
              Too Early/Late
            </span>
          </div>
        </div>

        {/* Chart Container */}
        <div style={{ height: "400px", position: "relative" }}>
          <Line data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default ConsumedChart;
