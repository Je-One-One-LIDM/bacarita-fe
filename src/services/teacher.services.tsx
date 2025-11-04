import axios, {AxiosError} from "axios";
import Cookies from "js-cookie";
import { ParentsEmailResponse, RegisterStudentPayload, RegisterStudentResponse } from "@/types/teacher.types";
import { AppDispatch } from "@/redux/store";
import { setLoading } from "@/redux/general.slice";
import { ErrorPayload } from "@/types/general.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const TeacherServices = {
    GetParentsEmail: async (dispatch : AppDispatch) => {
        try {
            dispatch(setLoading(true));
            const token = Cookies.get("token");

            if(!token){
                const fallbackError = {
                    success: false, 
                    statusCode: 401,
                    error: "Unauthorized: token tidak tersedia."
                } as ErrorPayload; 

                return fallbackError
            }

            const response = await axios.get<ParentsEmailResponse>(`${BASE_URL}/teachers/students/parents-email`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })

            return response.data;
        }catch (error) {
            const axiosError = error as AxiosError<ParentsEmailResponse>;
            if (axiosError.response?.data) {
                return axiosError.response.data;
            }

            const fallbackError = {
                success: false, 
                statusCode: 500,
                error: "Network or server error occurred."
            } as ErrorPayload;

            return fallbackError
        }finally {
            dispatch(setLoading(false));
        }
    },
    RegisterStudent: async (form : RegisterStudentPayload, dispatch : AppDispatch) => {
        try {
            dispatch(setLoading(true));
            const token = Cookies.get("token");
            if(!token){
                const fallbackError = {
                    success: false, 
                    statusCode: 401,
                    error: "Unauthorized: Token tidak tersedia."
                } as ErrorPayload;

                return fallbackError
            }

            const response = await axios.post<RegisterStudentResponse>(`${BASE_URL}/teachers/students`, form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })

            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ParentsEmailResponse>;
            if (axiosError.response?.data) {
                return axiosError.response.data;
            }

            const fallbackError = {
                success: false, 
                statusCode: 500,
                error: "Network or server error occurred."
            } as ErrorPayload;

            return fallbackError            
        }finally {
            dispatch(setLoading(false));
        }
    }
}

export default TeacherServices;