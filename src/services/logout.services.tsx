import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import { LogoutResponse, AuthFailurePayload } from "@/types/auth.types";
import type { AppDispatch } from "@/redux/store";
import { setLoading } from "@/redux/general.slice";
import { setLogout } from "@/redux/auth.slice";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function logoutUser(role: "teachers" | "parents" | "students", dispatch: AppDispatch): Promise<LogoutResponse | AuthFailurePayload> {
  try {
    dispatch(setLoading(true));
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
      dispatch(setLogout());
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
  }finally {
    dispatch(setLoading(false));
  }
}

const LogoutServices = {
  LogoutGuru: (dispatch : AppDispatch) => logoutUser("teachers", dispatch),
  LogoutOrangTua: (dispatch : AppDispatch) => logoutUser("parents", dispatch),
  LogoutSiswa: (dispatch : AppDispatch) => logoutUser("students", dispatch),
};

export default LogoutServices;
