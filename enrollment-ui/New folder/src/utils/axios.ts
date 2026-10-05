import axios, { AxiosError, AxiosResponse } from "axios";
import { normalizeApiErrorBody } from "@/app/api/apiService";
import { JWT_HOST_API } from "@/configs/auth";

const axiosInstance = axios.create({
  baseURL: JWT_HOST_API,
});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) =>
    Promise.reject(
      new Error(
        normalizeApiErrorBody(
          error.response?.data,
          error.message || "Request failed",
        ),
      ),
    ),
);

export default axiosInstance;
