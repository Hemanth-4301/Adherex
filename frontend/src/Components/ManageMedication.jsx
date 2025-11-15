import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaSave, FaPlusCircle, FaTrash } from "react-icons/fa";
import { baseUrl } from "../config";
import "bootstrap/dist/css/bootstrap.min.css";

const ManageMedication = () => {
  const [medications, setMedications] = useState([]);
  const [form, setForm] = useState({
    tableName: "",
    tabletQty: "",
    timing: ["Morning"],
    doctor: "",
  });
  const [editingId, setEditingId] = useState(null);
  const patientId = localStorage.getItem("pid");
  const role = localStorage.getItem("role"); // 🔹 Get user role

  useEffect(() => {
    console.log('ManageMedication - patientId from session:', patientId);
    console.log('ManageMedication - role from session:', role);
    if (patientId) {
      fetchMedications();
    } else {
      console.error('No patient ID found in session!');
    }
  }, [patientId]);

  const fetchMedications = async () => {
    try {
      console.log(`Fetching medications for patient: ${patientId}`);
      console.log(`API URL: ${baseUrl}/medications/get/patient/${patientId}`);
      const res = await axios.get(`${baseUrl}/medications/get/patient/${patientId}`);
      console.log('Medications fetched:', res.data);
      setMedications(res.data);
    } catch (err) {
      console.error("Error fetching medications:", err);
      console.error("Error response:", err.response?.data);
      alert(`Failed to fetch medications: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimingChange = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => {
      let updatedTimings = [...prev.timing];
      if (checked) updatedTimings.push(value);
      else updatedTimings = updatedTimings.filter((t) => t !== value);
      return { ...prev, timing: updatedTimings };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Submitting medication form...');
    console.log('Patient ID:', patientId);
    console.log('Form data:', form);
    
    if (!patientId) {
      alert("Patient not found in session. Please login again.");
      return;
    }

    const payload = {
      ...form,
      timing: form.timing.join(", "),
      tabletConsumed: 0,
    };

    console.log('Payload to send:', payload);

    try {
      console.log(`Posting to: ${baseUrl}/medications/add/${patientId}`);
      const response = await axios.post(`${baseUrl}/medications/add/${patientId}`, payload);
      console.log('Medication added successfully:', response.data);
      alert("Medication added successfully!");
      resetForm();
      fetchMedications();
    } catch (err) {
      console.error("Error adding medication:", err);
      console.error("Error response:", err.response?.data);
      alert(`Failed to add medication: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleEdit = (med) => {
    console.log('Editing medication:', med);
    setEditingId(med._id);
    setForm({
      tableName: med.tableName,
      tabletQty: med.tabletQty,
      timing: med.timing.split(",").map((t) => t.trim()),
      doctor: med.doctor || "",
    });
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        ...form,
        timing: form.timing.join(", "),
      };
      await axios.put(`${baseUrl}/medications/update/${editingId}`, payload);
      alert("Medication updated successfully!");
      resetForm();
      fetchMedications();
    } catch (err) {
      console.error("Error updating medication:", err);
      alert(`Failed to update medication: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDelete = async (medicationId) => {
    console.log('Attempting to delete medication with ID:', medicationId);
    if (window.confirm("Are you sure you want to delete this medication?")) {
      try {
        const response = await axios.delete(`${baseUrl}/medications/delete/${medicationId}`);
        console.log('Delete response:', response.data);
        alert("Medication deleted successfully!");
        fetchMedications();
      } catch (err) {
        console.error("Error deleting medication:", err);
        console.error('Error response:', err.response?.data);
        alert(`Failed to delete medication: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      tableName: "",
      tabletQty: "",
      timing: ["Morning"],
      doctor: "",
    });
  };

  return (
    <div className="container mt-2 mt-sm-3 mt-md-4 px-2 px-sm-3">
      <h3 className="text-center mb-3 mb-md-4" style={{ fontSize: "clamp(1.25rem, 4vw, 1.75rem)" }}>Manage Medication</h3>

      {/* Add / Edit Form */}
      <div className="card shadow-lg p-3 p-sm-4 mb-4 mb-md-5">
        <h5 className="mb-3" style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }}>{editingId ? "Edit Medication" : "Add New Medication"}</h5>
        <form onSubmit={handleSubmit} className="row g-2 g-sm-3">
          <div className="col-12 col-md-4">
            <label className="form-label">Tablet Name</label>
            <input
              type="text"
              name="tableName"
              className="form-control"
              value={form.tableName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label">Tablet Quantity</label>
            <input
              type="number"
              name="tabletQty"
              className="form-control"
              value={form.tabletQty}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label">Doctor</label>
            <input
              type="text"
              name="doctor"
              className="form-control"
              value={form.doctor}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label d-block">Timing</label>
            {["Morning", "Afternoon", "Evening"].map((time) => (
              <div className="form-check form-check-inline" key={time}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  value={time}
                  checked={form.timing.includes(time)}
                  onChange={handleTimingChange}
                />
                <label className="form-check-label">{time}</label>
              </div>
            ))}
          </div>

          <div className="col-12 text-center mt-3">
            {editingId ? (
              <button
                type="button"
                className="btn btn-success px-4"
                onClick={handleUpdate}
              >
                <FaSave className="me-2" /> Update Medication
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary px-4"
              >
                <FaPlusCircle className="me-2" /> Add Medication
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Medication Table */}
      <div className="table-responsive shadow-sm rounded">
        <table className="table table-striped table-bordered table-hover mb-0">
          <thead className="table-dark">
            <tr>
              <th className="text-nowrap">Name</th>
              <th className="text-nowrap">Quantity</th>
              <th className="text-nowrap">Doctor</th>
              <th className="text-nowrap">Timing</th>
              <th className="text-center text-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {medications.length > 0 ? (
              medications.map((med) => (
                <tr key={med._id}>
                  <td className="text-nowrap">{med.tableName}</td>
                  <td className="text-center">{med.tabletQty}</td>
                  <td className="text-nowrap">{med.doctor}</td>
                  <td><span className="badge bg-info text-dark">{med.timing}</span></td>
                  <td className="text-center text-nowrap">
                    <button
                      className="btn btn-outline-primary btn-sm me-2"
                      onClick={() => handleEdit(med)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(med._id)}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  No medications found. Add your first medication above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageMedication;
