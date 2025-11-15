import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { 
  FaPills, FaChartLine, FaCheckCircle, FaUser, FaBrain, FaBell, FaSignOutAlt, FaBars, FaTimes 
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

const UserDashBoard = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState("patient");
  const [alertStatus, setAlertStatus] = useState(false);
  const [pid, setPid] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check authentication from localStorage
    const authDataStr = localStorage.getItem("adherex_auth");
    
    if (authDataStr) {
      try {
        const authData = JSON.parse(authDataStr);
        
        // Check if auth has expired (2 days)
        if (Date.now() > authData.expiresAt) {
          // Auth expired, clear and redirect to login
          localStorage.clear();
          navigate("/");
          return;
        }
        
        // Valid auth data, set state
        setName(authData.name);
        setRole(authData.role);
        setPid(authData.pid);
      } catch (err) {
        console.error('Error parsing auth data:', err);
        localStorage.clear();
        navigate("/");
        return;
      }
    } else {
      // Fallback to old individual localStorage items
      const storedName = localStorage.getItem("name");
      const storedRole = localStorage.getItem("role");
      const storedPid = localStorage.getItem("pid");

      if (!storedName || !storedPid) {
        navigate("/");
        return;
      }

      setName(storedName);
      setRole(storedRole);
      setPid(storedPid);
      fetchAlertStatus(storedPid, storedRole);
    }
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
    localStorage.clear();
    navigate("/");
  };

  const handleAlert = async () => {
    if (!pid) return;
    try {
      const response = await axios.put(`http://localhost:8080/setAlert/${pid}`);
      if (response.status === 200) {
        setAlertStatus(true);
        localStorage.setItem("alert", "true");
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
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", position: "relative" }}>

      {/* Mobile Header with Hamburger */}
      <div className="d-md-none position-fixed w-100 bg-dark text-white p-3 d-flex justify-content-between align-items-center" style={{ zIndex: 1030, top: 0 }}>
        <h5 className="mb-0 fw-bold">💊 Adherex</h5>
        <button 
          className="btn btn-dark border-0" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ fontSize: "1.5rem" }}
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="d-md-none position-fixed w-100 h-100 bg-dark" 
          style={{ opacity: 0.5, zIndex: 1039, top: 0, left: 0 }}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Vertical Sidebar */}
      <div 
        className={`bg-dark text-white d-flex flex-column p-3 ${sidebarOpen ? 'sidebar-open' : ''}`}
        style={{ 
          width: "clamp(200px, 18vw, 280px)",
          minWidth: "200px",
          maxWidth: "280px",
          position: "fixed",
          height: "100vh",
          overflowY: "auto",
          zIndex: 1040,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease-in-out",
        }}
      >
        <h3 className="mb-4 text-center fw-bold d-none d-md-block">💊 Adherex</h3>
        <div className="d-md-none mb-3 text-end">
          <button className="btn btn-dark border-0" onClick={() => setSidebarOpen(false)}>
            <FaTimes />
          </button>
        </div>

       <ul className="nav flex-column text-start">
  <li className="nav-item mb-2">
    <Link 
      to="/userDashboard/manageMedication" 
      className="nav-link text-white"
      onClick={() => setSidebarOpen(false)}
    >
      <FaPills className="me-2" /> Manage Medication
    </Link>
  </li>
  <li className="nav-item mb-2">
    <Link 
      to="/userDashboard/consumedChart" 
      className="nav-link text-white"
      onClick={() => setSidebarOpen(false)}
    >
      <FaChartLine className="me-2" /> Consumed Chart
    </Link>
  </li>
  <li className="nav-item mb-2">
    <Link 
      to="/userDashboard/consumedCount" 
      className="nav-link text-white"
      onClick={() => setSidebarOpen(false)}
    >
      <FaCheckCircle className="me-2" /> Consumed Count
    </Link>
  </li>
  <li className="nav-item mb-2">
    <Link 
      to="/userDashboard/mentalSupport" 
      className="nav-link text-white"
      onClick={() => setSidebarOpen(false)}
    >
      <FaBrain className="me-2" /> Ask AI for Mental Support
    </Link>
  </li>
  <li className="nav-item mb-2">
    <Link 
      to="/userDashboard/profile" 
      className="nav-link text-white"
      onClick={() => setSidebarOpen(false)}
    >
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
      <div 
        className="flex-grow-1 p-2 p-sm-3 p-md-4 p-lg-4" 
        style={{ 
          backgroundColor: "#ffffff",
          marginLeft: "0",
          marginTop: "60px",
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <Outlet />
      </div>

      {/* Responsive styles */}
      <style>
        {`
          @media (min-width: 768px) {
            .bg-dark.text-white.d-flex.flex-column {
              transform: translateX(0) !important;
              position: fixed !important;
            }
            
            .flex-grow-1 {
              margin-left: clamp(200px, 18vw, 280px) !important;
              margin-top: 0 !important;
              width: calc(100% - clamp(200px, 18vw, 280px)) !important;
            }
          }
          
          @media (min-width: 1200px) {
            .flex-grow-1 {
              max-width: calc(100vw - clamp(200px, 18vw, 280px));
            }
          }
          
          @media (min-width: 1600px) {
            .flex-grow-1 {
              padding: 2rem 3rem !important;
            }
          }
          
          @media (max-width: 767px) {
            .flex-grow-1 {
              width: 100% !important;
              margin-left: 0 !important;
            }
          }
        `}
      </style>

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
