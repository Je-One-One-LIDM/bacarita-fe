import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import { LoginResponse, AuthFailurePayload, RegisterGuruPayload, RegisterResponse } from "@/types/auth.types";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type LoginPayloadMap = {
  teachers: { email: string; password: string };
  parents: { email: string; password: string };
  students: { username: string; password: string };
};
type LoginRole = keyof LoginPayloadMap;

async function Login<Role extends LoginRole>(role: Role, payload: LoginPayloadMap[Role]): Promise<LoginResponse | AuthFailurePayload> {
  try {
    const response = await axios.post<LoginResponse>(`${BASE_URL}/auth/${role}/login`, payload);

    if (response.data.success) {
      const token = response.data.data.token;
      Cookies.set("token", token);
    }

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<LoginResponse>;
    if (axiosError.response?.data) {
      return axiosError.response.data;
    }

    const fallbackError: AuthFailurePayload = {
      success: false,
      statusCode: 500,
      error: "Network or server error occurred.",
    };

    return fallbackError;
  }
}

const AuthServices = {
  //PART LOGIN
  LoginGuru: (email: string, password: string) => Login("teachers", { email, password }),
  LoginOrangTua: (email: string, password: string) => Login("parents", { email, password }),
  LoginSiswa: (username: string, password: string) => Login("students", { username, password }),
  
  //PART REGISTER
  RegisterGuru: async (form: RegisterGuruPayload) => {
    try {
      const response = await axios.post<RegisterResponse>(`${BASE_URL}/teachers`, form);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<RegisterResponse>;
      if (axiosError.response?.data) {
        return axiosError.response.data;
      }

      const fallbackError: AuthFailurePayload = {
        success: false,
        statusCode: 500,
        error: "Network or server error occurred.",
      };

      return fallbackError;
    }
  },
};

export default AuthServices;
