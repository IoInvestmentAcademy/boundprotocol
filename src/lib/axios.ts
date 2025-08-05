import axios from "axios";

export const vaultApi = axios.create({
  baseURL: "https://msoapi.ioinvestment.finance/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for error handling
vaultApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);
