import React, { useEffect, useState } from "react";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { API_ENDPOINTS } from "../api";

const ConsumedCount = () => {
  const [progressData, setProgressData] = useState([]);
  const [medications, setMedications] = useState([]);
  const [consumedData, setConsumedData] = useState([]);
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
      setProgressData([]);
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

  const renderBadges = (badges) => {
    const badgeConfig = {
      brown: {
        label: "Bronze",
        color: "#8B4513",
        textColor: "#fff",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="currentColor"
            style={{ marginRight: "4px", verticalAlign: "middle" }}
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V20h2v-2h2v2h2v-4.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5 0 1.66-.82 3.16-2.09 4.09l-.41.28-.5.13v-2.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v2.5l-.5-.13-.41-.28C7.82 14.16 7 12.66 7 11c0-2.76 2.24-5 5-5z" />
          </svg>
        ),
      },
      silver: {
        label: "Silver",
        color: "#C0C0C0",
        textColor: "#222",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="currentColor"
            style={{ marginRight: "4px", verticalAlign: "middle" }}
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V20h2v-2h2v2h2v-4.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5 0 1.66-.82 3.16-2.09 4.09l-.41.28-.5.13v-2.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v2.5l-.5-.13-.41-.28C7.82 14.16 7 12.66 7 11c0-2.76 2.24-5 5-5z" />
          </svg>
        ),
      },
      gold: {
        label: "Gold",
        color: "#FFD700",
        textColor: "#222",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="currentColor"
            style={{ marginRight: "4px", verticalAlign: "middle" }}
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V20h2v-2h2v2h2v-4.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5 0 1.66-.82 3.16-2.09 4.09l-.41.28-.5.13v-2.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v2.5l-.5-.13-.41-.28C7.82 14.16 7 12.66 7 11c0-2.76 2.24-5 5-5z" />
          </svg>
        ),
      },
    };

    return (
      <div className="d-flex justify-content-center flex-wrap gap-1 mb-2">
        {badges.map((type, i) => {
          const config = badgeConfig[type];
          return (
            <span
              key={i}
              style={{
                padding: "5px 10px",
                borderRadius: "20px",
                backgroundColor: config.color,
                color: config.textColor,
                fontSize: "0.75rem",
                fontWeight: "bold",
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "72px",
              }}
            >
              {config.icon}
              {config.label}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mt-2 mt-sm-3 mt-md-4 px-2 px-sm-3">
      <h3
        className="text-center mb-3 mb-md-4"
        style={{ fontSize: "clamp(1.25rem, 4vw, 1.75rem)" }}
      >
        Medication Consumption Progress
      </h3>

      {progressData.length > 0 ? (
        <div className="d-flex flex-wrap justify-content-center gap-3 gap-md-4">
          {progressData.map((item, index) => (
            <div
              key={index}
              className="text-center p-3 rounded-3"
              style={{
                width: "clamp(180px, 45vw, 220px)",
                minWidth: "180px",
                background: "#ffffff",
                border: "1px solid #eee",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                borderRadius: "14px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.04)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
              }}
            >
              {/* ✅ Badges with icons at the TOP */}
              {item.badges.length > 0 && renderBadges(item.badges)}

              {/* Progress Circle */}
              <div
                style={{
                  width: "clamp(90px, 20vw, 110px)",
                  height: "clamp(90px, 20vw, 110px)",
                  margin: "0 auto",
                }}
              >
                <CircularProgressbar
                  value={item.percentage}
                  text={`${item.consumed}/${item.total}`}
                  styles={buildStyles({
                    textSize: "16px",
                    pathColor:
                      item.percentage >= 80
                        ? "#28a745"
                        : item.percentage >= 40
                        ? "#ffc107"
                        : "#dc3545",
                    textColor: "#333",
                    trailColor: "#f5f5f5",
                  })}
                />
              </div>

              {/* Medication Info */}
              <h6 className="mt-3 fw-bold">{item.name}</h6>
              <p className="mb-1 text-secondary">
                <small>{item.timing}</small>
              </p>
              <p
                className="text-muted"
                style={{
                  fontSize: "0.9em",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                  display: "inline-block",
                  padding: "4px 10px",
                  marginTop: "4px",
                }}
              >
                {item.percentage}% consumed
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted">No consumption data available.</p>
      )}

      <style>
        {`
          @media (min-width: 1200px) {
            .container {
              max-width: 1400px;
            }
            
            /* Show 4 cards per row on large screens */
            .d-flex.flex-wrap > div {
              width: calc(25% - 1.5rem) !important;
              min-width: 200px;
            }
          }
          
          @media (min-width: 1600px) {
            /* Show 5 cards per row on extra large screens */
            .d-flex.flex-wrap > div {
              width: calc(20% - 1.5rem) !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ConsumedCount;
