import { SuccessPayload, ErrorPayload } from "./general.types";

// GET PARENTS EMAIL PAYLOAD TYPES

export interface ParentsEmailandFullName {
    email: string;
    fullName: string;
}

export interface ParentsEmailPayload extends SuccessPayload {
    data: ParentsEmailandFullName[];
}

export type ParentsEmailResponse = ParentsEmailPayload | ErrorPayload;

// REGISTER STUDENT PAYLOAD TYPES

export interface RegisterStudentPayload { 
    studentUsername: string;
    studentFullName: string;
    parentEmail: string;
    parentFullName?: string;
}
export interface Student {
    id: string;
    username: string;
    fullName: string;
    createdAt: string;
    updatedAt: string;
}

export interface Parent {
    id: string;
    email: string;
    username: string;
    fullName: string;
    createdAt: string;
    updatedAt: string;
}

export interface Teacher {
    id: string;
    email: string;
    username: string;
    fullName: string;
    schoolName: string;
    createdAt: string;
    updatedAt: string;
}

export interface ParentWithStudents extends Parent {
    students: Student[];
}

export interface RegisterStudentSuccessPayload extends SuccessPayload { 
    data: {
        id: string;
        username: string;
        fullName: string;
        teacher: Teacher;
        parent: Parent;
        createdAt: string;
        updatedAt: string;
    }
}

export interface RegisterStudentSuccessPayloadWithParent extends SuccessPayload {
    data: {
        id: string;
        username: string;
        fullName: string;
        teacher: Teacher;
        parent: ParentWithStudents;
        createdAt: string;
        updatedAt: string;
    }
} 

export type RegisterStudentResponse = RegisterStudentSuccessPayload | RegisterStudentSuccessPayloadWithParent | ErrorPayload;