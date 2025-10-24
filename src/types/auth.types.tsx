export interface LoginSuccessPayload {
    success: true;
    statusCode: number;
    message: string;
    data: {
        token: string;
    };
}

export interface LoginFailurePayload {
    success: false;
    statusCode: number;
    error: string;
}

export interface LoginFailurePayloadValidation extends LoginFailurePayload {
    errors: string[];
}

export type LoginResponse = LoginSuccessPayload | LoginFailurePayload | LoginFailurePayloadValidation;