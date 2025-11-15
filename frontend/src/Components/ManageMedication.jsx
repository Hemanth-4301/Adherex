import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaSave, FaPlusCircle, FaTrash } from "react-icons/fa";
import { baseUrl } from "../App";
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
  const patientId = sessionStorage.getItem("pid");
  const role = sessionStorage.getItem("role"); // 🔹 Get user role

  useEffect(() => {
    if (patientId) fetchMedications();
  }, [patientId]);

  const fetchMedications = async () => {
    try {
      const res = await axios.get(`${baseUrl}/medications/get/patient/${patientId}`);
      setMedications(res.data);
    } catch (err) {
      console.error("Error fetching medications:", err);
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
    if (!patientId) {
      alert("Patient not found in session.");
      return;
    }

    const payload = {
      ...form,
      timing: form.timing.join(", "),
      tabletConsumed: 0,
    };

    try {
      await axios.post(`${baseUrl}/medications/add/${patientId}`, payload);
      alert("Medication added successfully!");
      resetForm();
      fetchMedications();
    } catch (err) {
      console.error("Error adding medication:", err);
    }
  };

  const handleEdit = (med) => {
    setEditingId(med.mid);
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
    }
  };

  const handleDelete = async (mid) => {
    if (window.confirm("Are you sure you want to delete this medication?")) {
      try {
        await axios.delete(`${baseUrl}/medications/delete/${mid}`);
        alert("Medication deleted successfully!");
        fetchMedications();
      } catch (err) {
        console.error("Error deleting medication:", err);
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
    <div className="container mt-4">
      <h3 className="text-center mb-4">Manage Medication</h3>

      {/* Add / Edit Form */}
      <div className="card shadow-lg p-4 mb-5">
        <h5 className="mb-3">{editingId ? "Edit Medication" : "Add New Medication"}</h5>
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Tablet Name</label>
            <input
              type="text"
              name="tableName"
              className="form-control"
              value={form.tableName}
              onChange={handleInputChange}
              required
              disabled={role === "patient"}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Tablet Quantity</label>
            <input
              type="number"
              name="tabletQty"
              className="form-control"
              value={form.tabletQty}
              onChange={handleInputChange}
              required
              disabled={role === "patient"}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Doctor</label>
            <input
              type="text"
              name="doctor"
              className="form-control"
              value={form.doctor}
              onChange={handleInputChange}
              required
              disabled={role === "patient"}
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
                  disabled={role === "patient"}
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
                disabled={role === "patient"}
              >
                <FaSave className="me-2" /> Update Medication
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={role === "patient"}
              >
                <FaPlusCircle className="me-2" /> Add Medication
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Medication Table */}
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Quantity</th>
              <th>Doctor</th>
              <th>Timing</th>
              {role !== "patient" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {medications.length > 0 ? (
              medications.map((med) => (
                <tr key={med.mid}>
                  <td>{med.tableName}</td>
                  <td>{med.tabletQty}</td>
                  <td>{med.doctor}</td>
                  <td>{med.timing}</td>
                  {role !== "patient" && (
                    <td>
                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() => handleEdit(med)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(med.mid)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={role === "patient" ? 4 : 5} className="text-center text-muted">
                  No medications found.
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
