import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../api";
import {
  FaSave,
  FaEdit,
  FaUser,
  FaEnvelope,
  FaLock,
  FaStethoscope,
  FaHeartbeat,
  FaNotesMedical,
  FaUserCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";

const Profile = () => {
  const [patient, setPatient] = useState({
    name: "",
    email: "",
    password: "",
    description: "",
    bp: "",
    regularDoctor: "",
    careTakerEmail: "",
  });
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const patientId = localStorage.getItem("pid");

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId || patientId === "undefined" || patientId === "null") {
        toast.error("Please login to view profile");
        return;
      }

      try {
        const res = await axios.get(API_ENDPOINTS.PATIENT_PROFILE(patientId));
        setPatient(res.data);
        setRole(localStorage.getItem("role") || res.data.role);
      } catch (err) {
        toast.error("Failed to fetch patient data!");
      }
    };
    fetchPatient();
  }, [patientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatient((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      await axios.put(API_ENDPOINTS.PATIENT_UPDATE(patient._id), patient);
      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      toast.error("Error updating profile!");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div
        className="bg-white dark:bg-[#171717] border border-gray-200 dark:border-gray-800 
                    rounded-2xl shadow-lg p-6 md:p-8 lg:p-10 transition-all duration-300"
      >
        {/* Profile Avatar */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-black dark:bg-white 
                        text-white dark:text-black rounded-full flex items-center justify-center 
                        text-4xl md:text-5xl lg:text-6xl border-4 border-gray-200 dark:border-gray-700 
                        shadow-lg transition-transform hover:scale-105"
          >
            <FaUserCircle />
          </div>
        </div>

        <h2
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 
                     text-gray-900 dark:text-white"
        >
          Patient Profile
        </h2>

        <div className="space-y-5 md:space-y-6">
          {/* Name */}
          <div>
            <label
              className="flex items-center gap-2 text-sm md:text-base font-semibold mb-2 
                           text-gray-700 dark:text-gray-300"
            >
              <FaUser className="text-gray-600 dark:text-gray-400" />
              Name
            </label>
            <input
              type="text"
              name="name"
              className="input-field text-base md:text-lg"
              value={patient.name}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>

          {/* Email */}
          <div>
            <label
              className="flex items-center gap-2 text-sm md:text-base font-semibold mb-2 
                           text-gray-700 dark:text-gray-300"
            >
              <FaEnvelope className="text-gray-600 dark:text-gray-400" />
              Email
            </label>
            <input
              type="email"
              name="email"
              className="input-field text-base md:text-lg"
              value={patient.email}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>

          {/* Password */}
          <div>
            <label
              className="flex items-center gap-2 text-sm md:text-base font-semibold mb-2 
                           text-gray-700 dark:text-gray-300"
            >
              <FaLock className="text-gray-600 dark:text-gray-400" />
              Password
            </label>
            <input
              type="password"
              name="password"
              className="input-field text-base md:text-lg"
              value={patient.password}
              onChange={handleChange}
              disabled={!editing}
              placeholder={!editing ? "••••••••" : "Enter new password"}
            />
          </div>

          {/* Description */}
          <div>
            <label
              className="flex items-center gap-2 text-sm md:text-base font-semibold mb-2 
                           text-gray-700 dark:text-gray-300"
            >
              <FaNotesMedical className="text-gray-600 dark:text-gray-400" />
              Medical Description
            </label>
            <textarea
              name="description"
              rows="4"
              className="input-field text-base md:text-lg resize-none"
              value={patient.description}
              onChange={handleChange}
              disabled={!editing}
              placeholder="Medical history, conditions, allergies..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {/* BP */}
            <div>
              <label
                className="flex items-center gap-2 text-sm md:text-base font-semibold mb-2 
                             text-gray-700 dark:text-gray-300"
              >
                <FaHeartbeat className="text-red-600 dark:text-red-400" />
                Blood Pressure
              </label>
              <input
                type="text"
                name="bp"
                className="input-field text-base md:text-lg"
                value={patient.bp}
                onChange={handleChange}
                disabled={!editing}
                placeholder="e.g., 120/80"
              />
            </div>

            {/* Regular Doctor */}
            <div>
              <label
                className="flex items-center gap-2 text-sm md:text-base font-semibold mb-2 
                             text-gray-700 dark:text-gray-300"
              >
                <FaStethoscope className="text-green-600 dark:text-green-400" />
                Regular Doctor
              </label>
              <input
                type="text"
                name="regularDoctor"
                className="input-field text-base md:text-lg"
                value={patient.regularDoctor}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Dr. Name"
              />
            </div>
          </div>

          {/* Care Taker Email */}
          <div>
            <label
              className="flex items-center gap-2 text-sm md:text-base font-semibold mb-2 
                           text-gray-700 dark:text-gray-300"
            >
              <FaEnvelope className="text-yellow-600 dark:text-yellow-400" />
              Caretaker Email
            </label>
            <input
              type="email"
              name="careTakerEmail"
              className="input-field text-base md:text-lg"
              value={patient.careTakerEmail}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center mt-8">
          {editing ? (
            <button
              className="btn-primary flex items-center gap-2 px-8 py-3 text-base md:text-lg"
              onClick={handleUpdate}
            >
              <FaSave /> Save Changes
            </button>
          ) : (
            <button
              className="btn-primary flex items-center gap-2 px-8 py-3 text-base md:text-lg"
              onClick={() => setEditing(true)}
            >
              <FaEdit /> Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
