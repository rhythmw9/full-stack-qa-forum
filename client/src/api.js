import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL || "http://localhost:4000";

export const api = axios.create({ baseURL });

// Attach token when present
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}
