import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import { LogoutResponse, AuthFailurePayload } from "@/types/auth.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function logoutUser(role: "teachers" | "parents" | "students"): Promise<LogoutResponse | AuthFailurePayload> {
  try {
    const response = await axios.post<LogoutResponse>(
      `${BASE_URL}/auth/${role}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      }
    );

    if (response.data.success) {
      Cookies.remove("token");
    }

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<LogoutResponse>;
    if (axiosError.response?.data) {
      return axiosError.response.data;
    }

    return {
      success: false,
      statusCode: 500,
      error: "Network or server error occurred.",
    };
  }
}

const LogoutServices = {
  LogoutGuru: () => logoutUser("teachers"),
  LogoutOrangTua: () => logoutUser("parents"),
  LogoutSiswa: () => logoutUser("students"),
};

export default LogoutServices;
