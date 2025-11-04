import { SuccessPayload, ErrorPayload, BadRequestErrorPayload } from "./general.types";

export interface Question {
    id: string;
    instruction: string;
    expectedWord: string;
    createdAt: string;
    updatedAt: string;
}

export interface QuestionSuccessPayload extends SuccessPayload {
    data: Question;
}

export type QuestionResponse = QuestionSuccessPayload | ErrorPayload;

export interface QuestionAnswer {
    id: string;
    instruction: string;
    expectedWord: string;
    spokenWord: string;
    accuracy: number;
    createdAt: string;
    updatedAt: string;
}

export interface QuestionAnswerSuccessPayload extends SuccessPayload {
    data: QuestionAnswer;
}

export type QuestionAnswerResponse = QuestionAnswerSuccessPayload | ErrorPayload | BadRequestErrorPayload;


