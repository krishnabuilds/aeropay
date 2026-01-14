import axios from "axios";

// IMPORTANT: use your laptop IP, not localhost
const API = axios.create({
  baseURL: "http://172.20.10.2/api",
});

export default API;
