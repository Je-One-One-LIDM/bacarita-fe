import axios, {AxiosError} from "axios";
import Cookies from "js-cookie";
import { AppDispatch } from "@/redux/store";
import { setLoading } from "@/redux/general.slice";
import { GetLevelsResponse } from "@/types/story.types";
import { ErrorPayload } from "@/types/general.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const StudentServices = {
    GetLevels: async (dispatch : AppDispatch): Promise<GetLevelsResponse> => {
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

            const response = await axios.get<GetLevelsResponse>(`${BASE_URL}/students/levels`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })

            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ErrorPayload>;
            if (axiosError.response?.data) {
                return axiosError.response.data;
            }

            const fallbackError = {
                success: false, 
                statusCode: 500,
                error: "Network or server error occurred."
            } as ErrorPayload;
            return fallbackError
        }finally{
            dispatch(setLoading(false));
        }
    }
}

export default StudentServices;