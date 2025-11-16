import React, { useEffect, useState } from "react";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { API_ENDPOINTS } from "../api";
import Loader from "./Loader";

const ConsumedCount = () => {
  const [progressData, setProgressData] = useState([]);
  const [medications, setMedications] = useState([]);
  const [consumedData, setConsumedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const patientId = localStorage.getItem("pid");

  useEffect(() => {
    console.log("ConsumedCount - patientId:", patientId);
    if (patientId) {
      fetchConsumedData();
    } else {
      console.error("No patient ID found in session!");
    }
  }, [patientId]);

  const fetchConsumedData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(
        `Fetching consumed data: ${API_ENDPOINTS.CONSUMED_GET(patientId)}`
      );
      const res = await axios.get(API_ENDPOINTS.CONSUMED_GET(patientId));
      console.log("Consumed data fetched:", res.data);
      processData(res.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      console.error("Error response:", err.response?.data);
      setError(
        err.response?.data?.message || "Failed to load consumption data"
      );
      setProgressData([]);
    } finally {
      setLoading(false);
    }
  };

  const processData = (data) => {
    if (!data || !Array.isArray(data)) {
      setProgressData([]);
      return;
    }

    const grouped = {};

    data.forEach((item) => {
      const med = item.medication;
      if (!med) return;

      const name = med.tableName || "Unknown";
      const qty = med.tabletQty || 1;
      const timing = med.timing || "Morning";

      if (!grouped[name]) {
        grouped[name] = {
          total: qty,
          consumed: 0,
          timing,
        };
      }

      grouped[name].consumed += 1;
    });

    const formatted = Object.keys(grouped).map((name) => {
      const { total, consumed, timing } = grouped[name];
      const percentage = Math.round((consumed / total) * 100);

      // 🔁 Original badge logic: accumulate all earned badges
      const badges = [];
      if (consumed >= total * 0.33) badges.push("brown");
      if (consumed >= total * 0.66) badges.push("silver");
      if (consumed >= total * 0.93) badges.push("gold");

      return { name, total, consumed, timing, percentage, badges };
    });

    setProgressData(formatted);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] py-8">
        <Loader size="lg" text="Loading consumption progress..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400 text-base md:text-lg font-medium">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Medication Progress
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track your medication adherence
        </p>
      </div>

      {progressData.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {progressData.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-[#1a1a1a] rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow"
            >
              {/* Circular Progress */}
              <div className="w-28 h-28 mx-auto mb-4">
                <CircularProgressbar
                  value={item.percentage}
                  text={`${item.consumed}/${item.total}`}
                  styles={buildStyles({
                    textSize: "16px",
                    pathColor:
                      item.percentage >= 80
                        ? "#10b981"
                        : item.percentage >= 50
                        ? "#f59e0b"
                        : "#ef4444",
                    textColor: "#6B7280",
                    trailColor: "#e5e7eb",
                    pathTransitionDuration: 0.5,
                  })}
                />
              </div>

              {/* Medication Info */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2 truncate">
                {item.name}
              </h3>

              <div className="flex items-center justify-center mb-3">
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
                  {item.timing}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span className="font-medium">{item.percentage}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.percentage >= 80
                        ? "bg-green-500"
                        : item.percentage >= 50
                        ? "bg-orange-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Achievement Badge */}
              {item.percentage >= 80 && (
                <div className="flex items-center justify-center mt-3">
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                    ✓ Excellent
                  </span>
                </div>
              )}
              {item.percentage >= 50 && item.percentage < 80 && (
                <div className="flex items-center justify-center mt-3">
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
                    Good
                  </span>
                </div>
              )}
              {item.percentage < 50 && (
                <div className="flex items-center justify-center mt-3">
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
                    Needs Attention
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Data Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start tracking your medications to see progress here
          </p>
        </div>
      )}
    </div>
  );
};

export default ConsumedCount;
