import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../config";
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
import { motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";

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
      console.log('Profile - patientId from session:', patientId);
      console.log('Profile - role from session:', role);
      
      // Don't fetch if no patient ID
      if (!patientId || patientId === 'undefined' || patientId === 'null') {
        console.warn('No valid patient ID in session');
        toast.error('Please login to view profile');
        return;
      }
      
      try {
        console.log(`Fetching patient data: ${baseUrl}/getById/${patientId}`);
        const res = await axios.get(`${baseUrl}/getById/${patientId}`);
        console.log('Patient data fetched:', res.data);
        setPatient(res.data);
        setRole(localStorage.getItem("role") || res.data.role);
      } catch (err) {
        console.error('Failed to fetch patient data:', err);
        console.error('Error response:', err.response?.data);
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
      console.log('Updating profile...');
      console.log('Patient data to update:', patient);
      console.log(`API URL: ${baseUrl}/update/${patient._id}`);
      
      await axios.put(`${baseUrl}/update/${patient._id}`, patient);
      console.log('Profile updated successfully');
      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      console.error('Error response:', err.response?.data);
      toast.error("Error updating profile!");
    }
  };

  const canEdit = true; // Allow all users to edit their profile

  return (
    <div className="container px-2 px-sm-3">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="card shadow-lg p-3 p-sm-4 mx-auto"
        style={{
          maxWidth: "650px",
          borderRadius: "20px",
          background: "linear-gradient(145deg, #fdfbfb 0%, #ebedee 100%)",
        }}
      >
        {/* Profile Avatar */}
        <div className="text-center mb-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="bg-primary text-white rounded-circle mx-auto d-flex align-items-center justify-content-center shadow"
            style={{
              width: "clamp(80px, 15vw, 100px)",
              height: "clamp(80px, 15vw, 100px)",
              fontSize: "clamp(50px, 10vw, 60px)",
              border: "4px solid white",
            }}
          >
            <FaUserCircle />
          </motion.div>
        </div>

        <h4 className="text-center mb-4 fw-bold text-gradient" style={{ fontSize: "clamp(1.25rem, 3vw, 1.5rem)" }}>
          Patient Profile
        </h4>

        {/* Name */}
        <div className="mb-3">
          <label className="form-label fw-semibold">
            <FaUser className="me-2 text-primary" />
            Name
          </label>
          <input
            type="text"
            name="name"
            className="form-control rounded-3"
            value={patient.name}
            onChange={handleChange}
            disabled={!editing || !canEdit}
          />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="form-label fw-semibold">
            <FaEnvelope className="me-2 text-primary" />
            Email
          </label>
          <input
            type="email"
            name="email"
            className="form-control rounded-3"
            value={patient.email}
            onChange={handleChange}
            disabled={!editing || !canEdit}
          />
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="form-label fw-semibold">
            <FaLock className="me-2 text-primary" />
            Password
          </label>
          <input
            type="password"
            name="password"
            className="form-control rounded-3"
            value={patient.password}
            onChange={handleChange}
            disabled={!editing || !canEdit}
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label fw-semibold">
            <FaNotesMedical className="me-2 text-primary" />
            Description
          </label>
          <textarea
            name="description"
            rows="3"
            className="form-control rounded-3"
            value={patient.description}
            onChange={handleChange}
            disabled={!editing || !canEdit}
          ></textarea>
        </div>

        {/* BP */}
        <div className="mb-3">
          <label className="form-label fw-semibold">
            <FaHeartbeat className="me-2 text-danger" />
            Blood Pressure
          </label>
          <input
            type="text"
            name="bp"
            className="form-control rounded-3"
            value={patient.bp}
            onChange={handleChange}
            disabled={!editing || !canEdit}
          />
        </div>

        {/* Regular Doctor */}
        <div className="mb-3">
          <label className="form-label fw-semibold">
            <FaStethoscope className="me-2 text-success" />
            Regular Doctor
          </label>
          <input
            type="text"
            name="regularDoctor"
            className="form-control rounded-3"
            value={patient.regularDoctor}
            onChange={handleChange}
            disabled={!editing || !canEdit}
          />
        </div>

        {/* Care Taker Email */}
        <div className="mb-3">
          <label className="form-label fw-semibold">
            <FaEnvelope className="me-2 text-warning" />
            Caretaker Email
          </label>
          <input
            type="email"
            name="careTakerEmail"
            className="form-control rounded-3"
            value={patient.careTakerEmail}
            onChange={handleChange}
            disabled={!editing || !canEdit}
          />
        </div>

        {/* Buttons */}
        <div className="text-center mt-4">
          {editing ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-success px-4 rounded-pill"
              onClick={handleUpdate}
              disabled={!canEdit}
            >
              <FaSave className="me-2" /> Save
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary px-4 rounded-pill"
              onClick={() => setEditing(true)}
              disabled={!canEdit}
            >
              <FaEdit className="me-2" /> Edit Profile
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Gradient Text */}
      <style>
        {`
          .text-gradient {
            background: linear-gradient(45deg, #007bff, #6610f2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
          @media (min-width: 1200px) {
            .card {
              max-width: 800px !important;
              padding: 2.5rem !important;
            }
            
            .form-control,
            textarea {
              font-size: 1.05rem;
              padding: 0.75rem 1rem;
            }
            
            .btn {
              padding: 0.75rem 2rem;
              font-size: 1.05rem;
            }
          }
          
          @media (min-width: 1600px) {
            .card {
              max-width: 900px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Profile;
