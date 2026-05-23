import axios from "axios";

const API = axios.create({
  // baseURL: "http://localhost:5000/api",
  // baseURL: "https://campa-cola-1.onrender.com/api",
  baseURL: "https://janki-random.onrender.com"
});

export default API;