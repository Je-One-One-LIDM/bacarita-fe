import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import { LoginResponse, AuthFailurePayload, RegisterGuruPayload, RegisterResponse, LogoutResponse} from "@/types/auth.types";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const AuthServices = {
    //PART LOGIN
    LoginGuru: async (email: string, password:string) => {
        try {
            const response = await axios.post<LoginResponse>(`${BASE_URL}/auth/teachers/login`, {
                email,
                password
            });

            if (response.data.success){
                const token = response.data.data.token;
                Cookies.set("token", token);
            }

            return response.data
        } catch (error) {
            const axiosError = error as AxiosError<LoginResponse>;
            if(axiosError.response?.data){
                return axiosError.response.data;
            }

            const fallbackError: AuthFailurePayload = {
                success: false,
                statusCode: 500,
                error: "Network or server error occurred."
            };

            return fallbackError;
        }
    },
    LoginOrangTua: async (email: string, password:string) => {
        try {
            const response = await axios.post<LoginResponse>(`${BASE_URL}/auth/parents/login`, {
                email,
                password
            });

            if (response.data.success){
                const token = response.data.data.token;
                Cookies.set("token", token);
            }

            return response.data
        } catch (error) {
            const axiosError = error as AxiosError<LoginResponse>;
            if(axiosError.response?.data){
                return axiosError.response.data;
            }

            const fallbackError: AuthFailurePayload = {
                success: false,
                statusCode: 500,
                error: "Network or server error occurred."
            };

            return fallbackError;
        }
    },
    LoginSiswa: async (username: string, password:string) => {
        try {
            const response = await axios.post<LoginResponse>(`${BASE_URL}/auth/students/login`, {
                username,
                password
            });

            if (response.data.success){
                const token = response.data.data.token;
                Cookies.set("token", token);
            }

            return response.data
        } catch (error) {
            const axiosError = error as AxiosError<LoginResponse>;
            if(axiosError.response?.data){
                return axiosError.response.data;
            }

            const fallbackError: AuthFailurePayload = {
                success: false,
                statusCode: 500,
                error: "Network or server error occurred."
            };

            return fallbackError;
        }
    },
    //PART REGISTER
    RegisterGuru: async (form : RegisterGuruPayload) => {
        try {
            const response = await axios.post<RegisterResponse>(`${BASE_URL}/teachers`, form);
            return response.data
        } catch (error) {
            const axiosError = error as AxiosError<RegisterResponse>;
            if(axiosError.response?.data){
                return axiosError.response.data;
            }

            const fallbackError: AuthFailurePayload = {
                success: false,
                statusCode: 500,
                error: "Network or server error occurred."
            };

            return fallbackError;
        }
    },
    //PART LOGOUT
    LogoutGuru: async () => {
        try {
            const response = await axios.post<LogoutResponse>(`${BASE_URL}/auth/teachers/logout`, {}, {
                headers: {
                    Authorization: `Bearer ${Cookies.get("token")}`,
                },
            });

            if (response.data.success){
                Cookies.remove("token");
            }

            return response.data
        } catch (error) {
            const axiosError = error as AxiosError<LogoutResponse>;
            if(axiosError.response?.data){
                return axiosError.response.data;
            }

            const fallbackError: AuthFailurePayload = {
                success: false,
                statusCode: 500,
                error: "Network or server error occurred."
            };

            return fallbackError;
        }
    },
    LogoutOrangTua: async () => {
        try {
            const response = await axios.post<LogoutResponse>(`${BASE_URL}/auth/parents/logout`, {}, {
                headers: {
                    Authorization: `Bearer ${Cookies.get("token")}`,
                },
            });

            if (response.data.success){
                Cookies.remove("token");
            }

            return response.data
        } catch (error) {
            const axiosError = error as AxiosError<LogoutResponse>;
            if(axiosError.response?.data){
                return axiosError.response.data;
            }

            const fallbackError: AuthFailurePayload = {
                success: false,
                statusCode: 500,
                error: "Network or server error occurred."
            };

            return fallbackError;
        }
    },
    LogoutSiswa: async () => {
        try {
            const response = await axios.post<LogoutResponse>(`${BASE_URL}/auth/students/logout`, {}, {
                headers: {
                    Authorization: `Bearer ${Cookies.get("token")}`,
                },
            });

            if (response.data.success){
                Cookies.remove("token");
            }

            return response.data
        } catch (error) {
            const axiosError = error as AxiosError<LogoutResponse>;
            if(axiosError.response?.data){
                return axiosError.response.data;
            }

            const fallbackError: AuthFailurePayload = {
                success: false,
                statusCode: 500,
                error: "Network or server error occurred."
            };

            return fallbackError;
        }
    },
}

export default AuthServices;