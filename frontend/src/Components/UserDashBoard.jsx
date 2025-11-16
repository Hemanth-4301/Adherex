import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import {
  FaPills,
  FaChartLine,
  FaCheckCircle,
  FaUser,
  FaBrain,
  FaBell,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaCamera,
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import ThemeToggle from "./ThemeToggle";

const UserDashBoard = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState("patient");
  const [alertStatus, setAlertStatus] = useState(false);
  const [pid, setPid] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const authDataStr = localStorage.getItem("adherex_auth");
    if (authDataStr) {
      try {
        const authData = JSON.parse(authDataStr);
        if (Date.now() > authData.expiresAt) {
          localStorage.clear();
          navigate("/");
          return;
        }
        setName(authData.name);
        setRole(authData.role);
        setPid(authData.pid);
      } catch (err) {
        console.error("Error parsing auth data:", err);
        localStorage.clear();
        navigate("/");
      }
    } else {
      const storedName = localStorage.getItem("name");
      const storedPid = localStorage.getItem("pid");
      if (!storedName || !storedPid) {
        navigate("/");
        return;
      }
      setName(storedName);
      setRole(localStorage.getItem("role"));
      setPid(storedPid);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleAlert = async () => {
    if (!pid) return;
    try {
      await axios.put(`https://adherex-sm-api.onrender.com/setAlert/${pid}`);
      setAlertStatus(true);
      toast.success("Alert sent successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send alert!");
    }
  };

  const handleClearAlert = async () => {
    if (!pid) return;
    try {
      await axios.put(`https://adherex-sm-api.onrender.com/clearAlert/${pid}`);
      setAlertStatus(false);
      setShowAlertModal(false);
      toast.success("Alert cleared successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear alert!");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0a0a0a] relative transition-colors duration-300">
      <div
        className="md:hidden fixed w-full bg-white dark:bg-[#171717] text-black dark:text-white 
                      flex justify-between items-center z-[1030] top-0 px-4 py-3 shadow-md border-b border-gray-200 dark:border-gray-800"
      >
        <div className="flex items-center gap-3">
          <h5 className="font-bold text-lg md:text-xl">💊 Adherex</h5>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle className="w-10 h-10" />
          <button
            className="text-2xl p-2 focus:outline-none"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-[1039]"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      <div
        className={`fixed h-screen bg-white dark:bg-[#171717] text-black dark:text-white 
                      flex flex-col p-4 z-[1040] transition-transform duration-300 ease-in-out
                      w-64 md:w-72 border-r border-gray-200 dark:border-gray-800
                      ${
                        sidebarOpen ? "translate-x-0" : "-translate-x-full"
                      } md:translate-x-0`}
      >
        <div className="hidden md:flex items-center justify-between mb-6">
          <h3 className="font-bold text-xl lg:text-2xl">💊 Adherex</h3>
          <ThemeToggle className="w-10 h-10" />
        </div>
        <div className="md:hidden mb-6 flex items-center justify-between">
          <h4 className="font-bold text-lg">Menu</h4>
          <ThemeToggle className="w-10 h-10" />
        </div>
        <nav className="flex-1 flex flex-col space-y-2">
          <Link
            to="/userDashboard/manageMedication"
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 
                       text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <FaPills className="text-lg" />
            <span>Manage Medication</span>
          </Link>
          <Link
            to="/userDashboard/consumedChart"
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 
                       text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <FaChartLine className="text-lg" />
            <span>Consumed Chart</span>
          </Link>
          <Link
            to="/userDashboard/consumedCount"
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 
                       text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <FaCheckCircle className="text-lg" />
            <span>Consumed Count</span>
          </Link>
          <Link
            to="/userDashboard/mentalSupport"
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 
                       text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <FaBrain className="text-lg" />
            <span>AI Mental Support</span>
          </Link>
          <Link
            to="/userDashboard/medicineScanner"
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 
                       text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <FaCamera className="text-lg" />
            <span>Medicine Scanner</span>
          </Link>
          <Link
            to="/userDashboard/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 
                       text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <FaUser className="text-lg" />
            <span>Profile</span>
          </Link>
          {role === "patient" && (
            <div className="mt-4">
              <button
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold 
                                 transition-all ${
                                   alertStatus
                                     ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                                     : "bg-yellow-500 hover:bg-yellow-600 text-white hover:scale-105"
                                 }`}
                disabled={alertStatus}
                onClick={handleAlert}
              >
                <FaBell /> {alertStatus ? "Alert Sent" : "Send Alert"}
              </button>
            </div>
          )}
          <div className="mt-auto pt-4">
            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg 
                             bg-red-600 hover:bg-red-700 text-white font-semibold transition-all hover:scale-105"
              onClick={handleLogout}
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </nav>
      </div>
      <div
        className="flex-1 bg-gray-50 dark:bg-[#0a0a0a] pt-16 md:pt-0 md:ml-64 lg:ml-72 
                   p-4 md:p-6 lg:p-8 min-h-screen transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </div>
      {role === "caretaker" && showAlertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className="bg-white dark:bg-[#171717] rounded-2xl shadow-2xl max-w-md w-[90%] 
                         border-2 border-yellow-500 dark:border-yellow-600 overflow-hidden"
          >
            <div className="bg-yellow-500 dark:bg-yellow-600 text-white px-6 py-4">
              <h5 className="text-xl font-bold">⚠️ Patient Alert</h5>
            </div>
            <div className="p-6">
              <p className="text-gray-800 dark:text-gray-200 text-lg">
                Your associate patient has triggered an alert! Please contact
                immediately.
              </p>
            </div>
            <div className="px-6 pb-6 flex justify-end">
              <button
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold 
                                rounded-lg transition-all hover:scale-105"
                onClick={handleClearAlert}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashBoard;
