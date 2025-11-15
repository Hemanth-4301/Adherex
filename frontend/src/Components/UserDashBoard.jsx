import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { 
  FaPills, FaChartLine, FaCheckCircle, FaUser, FaBrain, FaBell, FaSignOutAlt 
} from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserDashBoard = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState("patient");
  const [alertStatus, setAlertStatus] = useState(false);
  const [pid, setPid] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);

  useEffect(() => {
    const storedName = sessionStorage.getItem("name");
    const storedRole = sessionStorage.getItem("role");
    const storedPid = sessionStorage.getItem("pid");

    if (!storedName || !storedPid) {
      navigate("/");
      return;
    }

    setName(storedName);
    setRole(storedRole);
    setPid(storedPid);
    fetchAlertStatus(storedPid, storedRole);
  }, [navigate]);

  const fetchAlertStatus = async (id, userRole) => {
    try {
      const response = await axios.get(`http://localhost:8080/getById/${id}`);
      if (response.status === 200) {
        const alertValue = response.data.alert;
        setAlertStatus(alertValue);
        sessionStorage.setItem("alert", alertValue.toString());
        if (userRole === "caretaker" && alertValue) {
          setShowAlertModal(true);
        }
      }
    } catch (error) {
      console.error("Error fetching alert status:", error);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const handleAlert = async () => {
    if (!pid) return;
    try {
      const response = await axios.put(`http://localhost:8080/setAlert/${pid}`);
      if (response.status === 200) {
        setAlertStatus(true);
        sessionStorage.setItem("alert", "true");
        toast.success("Alert sent successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("❌ Failed to send alert!");
    }
  };

  const handleClearAlert = async () => {
    if (!pid) return;
    try {
      const response = await axios.put(`http://localhost:8080/clearAlert/${pid}`);
      if (response.status === 200) {
        setAlertStatus(false);
        setShowAlertModal(false);
        sessionStorage.setItem("alert", "false");
        toast.success("Alert cleared successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("❌ Failed to clear alert!");
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <ToastContainer position="top-center" autoClose={2000} />

      {/* Vertical Sidebar */}
      <div className="bg-dark text-white d-flex flex-column p-3" style={{ width: "250px" }}>
        <h3 className="mb-4 text-center fw-bold">💊 Adherex</h3>

       <ul className="nav flex-column text-start ">
  <li className="nav-item mb-2">
    <Link to="/userDashBoard/manageMedication" className="nav-link text-white">
      <FaPills className="me-2" /> Manage Medication
    </Link>
  </li>
  <li className="nav-item mb-2">
    <Link to="/userDashBoard/consumedChart" className="nav-link text-white">
      <FaChartLine className="me-2" /> Consumed Chart
    </Link>
  </li>
  <li className="nav-item mb-2">
    <Link to="/userDashBoard/ConsumedCount" className="nav-link text-white">
      <FaCheckCircle className="me-2" /> Consumed Count
    </Link>
  </li>
  <li className="nav-item mb-2">
    <Link to="/userDashBoard/mentalSupport" className="nav-link text-white">
      <FaBrain className="me-2" /> Ask AI for Mental Support
    </Link>
  </li>
  <li className="nav-item mb-2">
    <Link to="/userDashBoard/profile" className="nav-link text-white">
      <FaUser className="me-2" /> Profile
    </Link>
  </li>
          {role === "patient" && (
            <li className="nav-item mt-3">
              <button
                className={`btn ${alertStatus ? "btn-secondary" : "btn-warning"} w-100 fw-bold d-flex align-items-center justify-content-center gap-2`}
                disabled={alertStatus}
                onClick={handleAlert}
              >
                <FaBell /> {alertStatus ? "Alert Sent" : "Send Alert"}
              </button>
            </li>
          )}
          <li className="nav-item mt-auto">
            <button
              className="btn btn-danger w-100 fw-bold d-flex align-items-center justify-content-center mt-3 gap-2"
              onClick={handleLogout}
            >
              <FaSignOutAlt /> Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4" style={{ backgroundColor: "#ffffff" }}>
        <Outlet />
      </div>

      {/* Caretaker Alert Modal */}
      {role === "caretaker" && showAlertModal && (
        <div className="modal show fade" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-warning">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">⚠️ Patient Alert</h5>
              </div>
              <div className="modal-body">
                <p>Your associate patient has triggered an alert! Please contact immediately.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-success" onClick={handleClearAlert}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashBoard;
