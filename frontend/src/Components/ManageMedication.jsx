import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaSave, FaPlusCircle, FaTrash } from "react-icons/fa";
import { API_ENDPOINTS } from "../api";
import { motion } from "framer-motion";
import Modal from "./Modal";
import Loader from "./Loader";
import { toast } from "react-toastify";

const ManageMedication = () => {
  const [medications, setMedications] = useState([]);
  const [form, setForm] = useState({
    tableName: "",
    tabletQty: "",
    timing: ["Morning"],
    doctor: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const patientId = localStorage.getItem("pid");
  const userRole = localStorage.getItem("role"); // Get user role
  const isCaretaker = userRole === "caretaker";
  const isPatient = userRole === "patient";

  useEffect(() => {
    if (patientId) fetchMedications();
  }, [patientId]);

  const fetchMedications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_ENDPOINTS.MEDICATIONS_GET(patientId));
      setMedications(res.data);
    } catch (err) {
      toast.error(
        `Failed to fetch medications: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isCaretaker) {
      toast.error("Only caretakers can add medications.");
      return;
    }
    if (!patientId) {
      toast.error("Patient not found in session.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(API_ENDPOINTS.MEDICATIONS_ADD(patientId), {
        ...form,
        timing: form.timing.join(", "),
        tabletConsumed: 0,
      });
      toast.success("Medication added successfully!");
      resetForm();
      fetchMedications();
    } catch (err) {
      toast.error(`Failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!isCaretaker) {
      toast.error("Only caretakers can update medications.");
      return;
    }
    setLoading(true);
    try {
      await axios.put(API_ENDPOINTS.MEDICATIONS_UPDATE(editingId), {
        ...form,
        timing: form.timing.join(", "),
      });
      toast.success("Medication updated successfully!");
      resetForm();
      fetchMedications();
    } catch (err) {
      toast.error(`Failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isCaretaker) {
      toast.error("Only caretakers can delete medications.");
      return;
    }
    setLoading(true);
    try {
      await axios.delete(API_ENDPOINTS.MEDICATIONS_DELETE(deleteModal.id));
      toast.success("Medication deleted successfully!");
      setDeleteModal({ isOpen: false, id: null });
      fetchMedications();
    } catch (err) {
      toast.error(`Failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ tableName: "", tabletQty: "", timing: ["Morning"], doctor: "" });
  };

  if (loading && medications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading medications..." />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
      <h2
        className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 md:mb-8 
                   text-gray-900 dark:text-white"
      >
        Manage Medication
      </h2>

      {/* Role Badge */}
      {isPatient && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="text-center text-blue-700 dark:text-blue-300 font-medium">
            👁️ You are viewing as <span className="font-bold">Patient</span>.
            Only caretakers can add, edit, or delete medications.
          </p>
        </div>
      )}

      {/* Add/Edit Form */}
      <div className={`card mb-6 md:mb-8 ${isPatient ? "opacity-70" : ""}`}>
        <h3 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-gray-800 dark:text-gray-200">
          {editingId ? "Edit" : "Add"} Medication
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            <div>
              <label className="block text-sm md:text-base font-medium mb-2 text-gray-700 dark:text-gray-300">
                Tablet Name
              </label>
              <input
                type="text"
                name="tableName"
                className="input-field text-sm md:text-base"
                value={form.tableName}
                onChange={(e) =>
                  setForm({ ...form, tableName: e.target.value })
                }
                required
                placeholder="e.g., Aspirin"
                disabled={isPatient}
              />
            </div>
            <div>
              <label className="block text-sm md:text-base font-medium mb-2 text-gray-700 dark:text-gray-300">
                Quantity
              </label>
              <input
                type="number"
                name="tabletQty"
                className="input-field text-sm md:text-base"
                value={form.tabletQty}
                onChange={(e) =>
                  setForm({ ...form, tabletQty: e.target.value })
                }
                required
                placeholder="e.g., 2"
                disabled={isPatient}
              />
            </div>
            <div>
              <label className="block text-sm md:text-base font-medium mb-2 text-gray-700 dark:text-gray-300">
                Doctor
              </label>
              <input
                type="text"
                name="doctor"
                className="input-field text-sm md:text-base"
                value={form.doctor}
                onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                required
                placeholder="Dr. Name"
                disabled={isPatient}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm md:text-base font-medium mb-3 text-gray-700 dark:text-gray-300">
              Timing
            </label>
            <div className="flex flex-wrap gap-4 md:gap-6">
              {["Morning", "Afternoon", "Evening"].map((time) => (
                <label
                  key={time}
                  className={`flex items-center gap-2 ${
                    isPatient ? "cursor-not-allowed" : "cursor-pointer"
                  } group`}
                >
                  <input
                    type="checkbox"
                    value={time}
                    checked={form.timing.includes(time)}
                    onChange={(e) => {
                      const t = [...form.timing];
                      e.target.checked
                        ? t.push(time)
                        : t.splice(t.indexOf(time), 1);
                      setForm({ ...form, timing: t });
                    }}
                    disabled={isPatient}
                    className="w-4 h-4 md:w-5 md:h-5 text-black dark:text-white border-gray-300 
                             dark:border-gray-600 rounded focus:ring-2 focus:ring-black 
                             dark:focus:ring-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span
                    className="text-sm md:text-base text-gray-700 dark:text-gray-300 
                               group-hover:text-black dark:group-hover:text-white transition-colors"
                  >
                    {time}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-center pt-2">
            {editingId ? (
              <button
                type="button"
                className="btn-primary inline-flex items-center gap-2 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleUpdate}
                disabled={isPatient}
              >
                <FaSave /> Update Medication
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary inline-flex items-center gap-2 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isPatient}
              >
                <FaPlusCircle /> Add Medication
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Medications Table/Cards */}
      <div className="card">
        <h3 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-gray-800 dark:text-gray-200">
          Your Medications
        </h3>

        {/* Desktop Table View (hidden on mobile) */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th
                  className="px-4 xl:px-6 py-3 xl:py-4 text-sm xl:text-base font-semibold 
                             text-gray-700 dark:text-gray-300 border-b dark:border-gray-700"
                >
                  Tablet Name
                </th>
                <th
                  className="px-4 xl:px-6 py-3 xl:py-4 text-sm xl:text-base font-semibold 
                             text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 text-center"
                >
                  Quantity
                </th>
                <th
                  className="px-4 xl:px-6 py-3 xl:py-4 text-sm xl:text-base font-semibold 
                             text-gray-700 dark:text-gray-300 border-b dark:border-gray-700"
                >
                  Doctor
                </th>
                <th
                  className="px-4 xl:px-6 py-3 xl:py-4 text-sm xl:text-base font-semibold 
                             text-gray-700 dark:text-gray-300 border-b dark:border-gray-700"
                >
                  Timing
                </th>
                <th
                  className="px-4 xl:px-6 py-3 xl:py-4 text-sm xl:text-base font-semibold 
                             text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 text-center"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {medications.length > 0 ? (
                medications.map((med) => (
                  <tr
                    key={med._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td
                      className="px-4 xl:px-6 py-3 xl:py-4 font-medium text-sm xl:text-base 
                               text-gray-900 dark:text-white"
                    >
                      {med.tableName}
                    </td>
                    <td
                      className="px-4 xl:px-6 py-3 xl:py-4 text-sm xl:text-base text-gray-700 
                               dark:text-gray-300 text-center font-semibold"
                    >
                      {med.tabletQty}
                    </td>
                    <td
                      className="px-4 xl:px-6 py-3 xl:py-4 text-sm xl:text-base text-gray-700 
                               dark:text-gray-300"
                    >
                      {med.doctor}
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <span
                        className="inline-block px-3 py-1 text-xs xl:text-sm font-medium 
                                   bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 
                                   rounded-full"
                      >
                        {med.timing}
                      </span>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4 text-center">
                      <div className="flex items-center justify-center gap-2 xl:gap-3">
                        <button
                          className={`p-2 xl:p-2.5 text-blue-600 dark:text-blue-400 
                                       hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg 
                                       transition-colors ${
                                         isPatient
                                           ? "opacity-50 cursor-not-allowed"
                                           : ""
                                       }`}
                          onClick={() => {
                            if (isPatient) return;
                            setEditingId(med._id);
                            setForm({
                              tableName: med.tableName,
                              tabletQty: med.tabletQty,
                              timing: med.timing
                                .split(",")
                                .map((t) => t.trim()),
                              doctor: med.doctor || "",
                            });
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          disabled={isPatient}
                          title={
                            isPatient
                              ? "Only caretakers can edit"
                              : "Edit medication"
                          }
                        >
                          <FaEdit className="text-lg xl:text-xl" />
                        </button>
                        <button
                          className={`p-2 xl:p-2.5 text-red-600 dark:text-red-400 
                                       hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg 
                                       transition-colors ${
                                         isPatient
                                           ? "opacity-50 cursor-not-allowed"
                                           : ""
                                       }`}
                          onClick={() => {
                            if (isPatient) return;
                            setDeleteModal({ isOpen: true, id: med._id });
                          }}
                          disabled={isPatient}
                          title={
                            isPatient
                              ? "Only caretakers can delete"
                              : "Delete medication"
                          }
                        >
                          <FaTrash className="text-lg xl:text-xl" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-gray-500 dark:text-gray-400 
                                           text-sm md:text-base"
                  >
                    No medications found. Add your first medication above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card View (shown on small screens) */}
        <div className="lg:hidden space-y-4">
          {medications.length > 0 ? (
            medications.map((med) => (
              <div
                key={med._id}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border 
                                        border-gray-200 dark:border-gray-700 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {med.tableName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Dr. {med.doctor}
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {med.tabletQty}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 
                               dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                  >
                    {med.timing}
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
                                 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 
                                 rounded-lg font-medium transition-colors hover:bg-blue-100 
                                 dark:hover:bg-blue-900/50 ${
                                   isPatient
                                     ? "opacity-50 cursor-not-allowed"
                                     : ""
                                 }`}
                    onClick={() => {
                      if (isPatient) return;
                      setEditingId(med._id);
                      setForm({
                        tableName: med.tableName,
                        tabletQty: med.tabletQty,
                        timing: med.timing.split(",").map((t) => t.trim()),
                        doctor: med.doctor || "",
                      });
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={isPatient}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
                                 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 
                                 rounded-lg font-medium transition-colors hover:bg-red-100 
                                 dark:hover:bg-red-900/50 ${
                                   isPatient
                                     ? "opacity-50 cursor-not-allowed"
                                     : ""
                                 }`}
                    onClick={() => {
                      if (isPatient) return;
                      setDeleteModal({ isOpen: true, id: med._id });
                    }}
                    disabled={isPatient}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No medications found. Add your first medication above.
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="Delete Medication"
      >
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Are you sure you want to delete this medication? This action cannot be
          undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteModal({ isOpen: false, id: null })}
            className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 
                     rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg 
                     font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageMedication;
