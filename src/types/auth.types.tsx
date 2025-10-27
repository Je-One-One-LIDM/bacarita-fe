import {SuccessPayload, ErrorPayload } from "./general.types";

//LOGIN PAYLOAD TYPES

export interface LoginSuccessPayload extends SuccessPayload {
    data: {
        token: string;
    };
}

export interface AuthFailurePayloadValidation extends ErrorPayload {
    errors: string[];
}

export type LoginResponse = LoginSuccessPayload | ErrorPayload | AuthFailurePayloadValidation;

//REGISTER PAYLOAD TYPES

export type RegisterGuruPayload = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  schoolName: string;
};

export interface RegisterSuccessPayload extends SuccessPayload {
    data: {
        id: string;
        email: string;
        username: string;
        fullName: string;
        schoolName: string;
        createdAt: string;
        updatedAt: string;
    }
}

export type RegisterResponse = RegisterSuccessPayload | ErrorPayload | AuthFailurePayloadValidation;

//LOGOUT PAYLOAD TYPES
export type LogoutResponse = SuccessPayload | ErrorPayload;