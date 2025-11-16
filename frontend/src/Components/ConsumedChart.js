import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { API_ENDPOINTS } from "../api";

const ConsumedChart = () => {
  const [chartData, setChartData] = useState([]);
  const [medications, setMedications] = useState([]);
  const patientId = localStorage.getItem("pid");

  // Expected times (in hours)
  const expectedTimes = {
    Morning: 9,
    Afternoon: 14,
    Evening: 19,
  };

  useEffect(() => {
    console.log("ConsumedChart - patientId:", patientId);
    if (patientId) {
      fetchConsumedData();
    } else {
      console.error("No patient ID found in session!");
    }
  }, [patientId]);

  const fetchConsumedData = async () => {
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
    }
  };

  const processData = (data) => {
    if (!data || data.length === 0) return;

    const meds = [...new Set(data.map((d) => d.medication.tableName))];
    setMedications(meds);

    // Sort data by datetime
    data.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    const pointsMap = {};

    data.forEach((item) => {
      const date = item.dateTime.split("T")[0];
      if (!pointsMap[date]) pointsMap[date] = { date };

      const medName = item.medication.tableName;
      const actualHour =
        new Date(item.dateTime).getHours() +
        new Date(item.dateTime).getMinutes() / 60;

      // Find which timing window the actual hour fits best
      let bestTiming = null;
      let minDiff = Infinity;

      item.medication.timing.split(",").forEach((t) => {
        const time = t.trim();
        const diff = Math.abs(actualHour - expectedTimes[time]);
        if (diff < minDiff && diff <= 3) {
          bestTiming = time;
          minDiff = diff;
        }
      });

      if (bestTiming) {
        const key = `${medName} (${bestTiming})`;
        pointsMap[date][key] = actualHour;
      }
    });

    setChartData(Object.values(pointsMap));
  };

  const renderCustomDot = (props) => {
    const { cx, cy, payload, dataKey } = props;
    const timing = dataKey.split("(")[1].replace(")", "").trim();
    const expected = expectedTimes[timing];
    const actual = payload[dataKey];
    if (actual === undefined) return null;

    const diff = actual - expected;
    let fill = "#32CD32"; // on-time (green)
    if (diff > 1 || diff < -1) fill = "#FF0000"; // too early/late
    else if (diff > 0.5 || diff < -0.5) fill = "#FFA500"; // slightly off

    return (
      <circle cx={cx} cy={cy} r={6} fill={fill} stroke="#000" strokeWidth={1} />
    );
  };

  return (
    <div className="container mt-2 mt-sm-3 mt-md-4 px-2 px-sm-3">
      <h3
        className="text-center mb-3 mb-md-4"
        style={{ fontSize: "clamp(1.25rem, 4vw, 1.75rem)" }}
      >
        Medication Consumption Chart
      </h3>

      {chartData.length > 0 ? (
        <ResponsiveContainer
          width="100%"
          height={
            window.innerWidth >= 1200
              ? 500
              : window.innerWidth >= 768
              ? 450
              : 400
          }
        >
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: window.innerWidth >= 1200 ? 50 : 30,
              left: window.innerWidth >= 1200 ? 30 : 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(tick) =>
                new Date(tick).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis
              type="number"
              domain={[0, 24]}
              ticks={[9, 14, 19]}
              tickFormatter={(tick) => {
                if (tick === 9) return "9 AM";
                if (tick === 14) return "2 PM";
                if (tick === 19) return "7 PM";
                return `${tick}:00`;
              }}
              label={{
                value: "Medication Time",
                angle: -90,
                position: "insideLeft",
                offset: 1,
              }}
            />

            <Tooltip
              formatter={(value) =>
                value
                  ? `${Math.floor(value)}:${Math.round((value % 1) * 60)
                      .toString()
                      .padStart(2, "0")}`
                  : ""
              }
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend verticalAlign="top" height={36} />

            {medications.map((med, index) =>
              ["Morning", "Afternoon", "Evening"].map((time) => {
                const key = `${med} (${time})`;
                return (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={
                      ["#FFA500", "#1E90FF", "#32CD32", "#FF1493", "#00CED1"][
                        index % 5
                      ]
                    }
                    activeDot={renderCustomDot}
                    connectNulls={true}
                  />
                );
              })
            )}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-center text-muted">No consumption data available.</p>
      )}
    </div>
  );
};

export default ConsumedChart;
