import axios, {AxiosError} from "axios";
import Cookies from "js-cookie";
import { AppDispatch } from "@/redux/store";
import { setLoading } from "@/redux/general.slice";
import { ErrorPayload } from "@/types/general.types";
import { TestSessionResponse } from "@/types/story.types";
import { QuestionAnswerResponse, QuestionResponse } from "@/types/question.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const TestSessionServices = {
    StartTest: async (dispatch : AppDispatch, storyId: number) => {
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
            const response = await axios.post<TestSessionResponse>(`${BASE_URL}/students/test-sessions`, {storyId : storyId}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })

            return response.data;
        }catch(error){
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
    },
    GetTestSessionStatus : async (dispatch : AppDispatch, testSessionId: string) => {
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

            const response = await axios.get<TestSessionResponse>(`${BASE_URL}/students/test-sessions/${testSessionId}/status`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })

            return response.data;
        }catch(error){
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
    },
    StartQuestion: async (dispatch: AppDispatch, testSessionId:string, storyId: number) => {
        try {
            dispatch(setLoading(true));
            const token = Cookies.get("token");
            if(!token){
                const fallbackError = {
                    success : false,
                    statusCode: 401,
                    error: "Unauthorized: token tidak tersedia."
                } as ErrorPayload;
                return fallbackError;
            }

            const response = await axios.post<QuestionResponse>(`${BASE_URL}/students/test-sessions/${testSessionId}/stt-questions`, { storyId: storyId }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })

            return response.data;
        }catch(error){
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
    },
    AnswerQuestion: async (dispatch: AppDispatch, testSessionId: string, questionId: number, form: { answer: string, accuracy: number}) => {
        try {
            dispatch(setLoading(true));
            const token = Cookies.get("token");
            if(!token){
                const fallbackError = {
                    success : false,
                    statusCode: 401,
                    error: "Unauthorized: token tidak tersedia."
                } as ErrorPayload;
                return fallbackError;
            }

            const response = await axios.post<QuestionAnswerResponse>(`${BASE_URL}/students/test-sessions/${testSessionId}/stt-questions/${questionId}/answer`, form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })

            return response.data;
        }catch(error){
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
    },
    FinishTest: async (dispatch : AppDispatch, testSessionId: number) => {
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
            const response = await axios.post<TestSessionResponse>(`${BASE_URL}/students/test-sessions/${testSessionId}/finish`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })

            return response.data;
        }catch(error){
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
    },
}

export default TestSessionServices;