//LOGIN PAYLOAD TYPES

export interface LoginSuccessPayload {
    success: true;
    statusCode: number;
    message: string;
    data: {
        token: string;
    };
}

export interface AuthFailurePayload {
    success: false;
    statusCode: number;
    error: string;
}

export interface AuthFailurePayloadValidation extends AuthFailurePayload {
    errors: string[];
}

export type LoginResponse = LoginSuccessPayload | AuthFailurePayload | AuthFailurePayloadValidation;

//REGISTER PAYLOAD TYPES

export type RegisterGuruPayload = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  schoolName: string;
};

export interface RegisterSuccessPayload {
    success: true;
    statusCode: number;
    message: string;
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

export type RegisterResponse = RegisterSuccessPayload | AuthFailurePayload | AuthFailurePayloadValidation;

//LOGOUT PAYLOAD TYPES

export interface LogoutSuccessPayload {
    success: true;
    statusCode: number;
    message: string;
}

export type LogoutResponse = LogoutSuccessPayload | AuthFailurePayload;