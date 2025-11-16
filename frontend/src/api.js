// Centralized API configuration
// export const API_BASE_URL = "https://adherex-sm-api.onrender.com";
export const API_BASE_URL = "http://localhost:8080";

// API endpoints
export const API_ENDPOINTS = {
  // Patient routes
  PATIENT_LOGIN: `${API_BASE_URL}/login`,
  PATIENT_REGISTER: `${API_BASE_URL}/register`,
  PATIENT_PROFILE: (pid) => `${API_BASE_URL}/getById/${pid}`,
  PATIENT_UPDATE: (pid) => `${API_BASE_URL}/updatePatient/${pid}`,
  SET_ALERT: (pid) => `${API_BASE_URL}/setAlert/${pid}`,
  CLEAR_ALERT: (pid) => `${API_BASE_URL}/clearAlert/${pid}`,

  // Medication routes
  MEDICATIONS_GET: (pid) => `${API_BASE_URL}/medications/get/patient/${pid}`,
  MEDICATIONS_ADD: (pid) => `${API_BASE_URL}/medications/add/${pid}`,
  MEDICATIONS_UPDATE: (id) => `${API_BASE_URL}/medications/update/${id}`,
  MEDICATIONS_DELETE: (id) => `${API_BASE_URL}/medications/delete/${id}`,

  // Consumed routes
  CONSUMED_GET: (pid) => `${API_BASE_URL}/consumed/bypatient/${pid}`,
  CONSUMED_ADD: `${API_BASE_URL}/consumed/add`,
  CONSUMED_DELETE: (id) => `${API_BASE_URL}/consumed/delete/${id}`,

  // Gemini AI routes
  GEMINI_ASK: `${API_BASE_URL}/api/gemini/medication/ask`,
};

export default API_BASE_URL;
