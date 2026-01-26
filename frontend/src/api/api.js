import axios from "axios";

const API = axios.create({
  // baseURL: "http://localhost:5000/api",
  baseURL: "https://campa-cola.onrender.com/api",
});

export default API;
