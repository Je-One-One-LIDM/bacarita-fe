import { SuccessPayload, ErrorPayload } from "./general.types";

// OVERVIEW PAYLOAD

export interface SttWordResult {
    id: string;
    intruction: string | null;
    expectedWord: string;
    spokenWord: string;
    accuracy: number;
    createdAt: string;
}

export interface StudentData {
    id: string;
    username: string;
    fullName: string;
}

export interface TestSessionResult {
    id: string;
    student: StudentData;
    levelFullName: string;
    titleAtTaken: string;
    startedAt: string;
    finishedAt: string;
    medal: string;
    score: number;
    isCompleted: boolean;
    sttWordResults: SttWordResult[];
}

export interface OverviewData {
    totalStudents: number;
    totalTestSessions: number;
    completedTestSessions: number;
    inProgressTestSessions: number;
    averageScore: number;
    testSessions: TestSessionResult[];
}

export interface ParentOverviewSuccessPayload extends SuccessPayload {
    data: OverviewData;
}

export type ParentOverviewResponse = ParentOverviewSuccessPayload | ErrorPayload;

//ALL CHILDREN PAYLOAD

export interface TeacherPayload {
    id: string;
    username:string;
    fullName: string;
}

export interface LevelProgressPayload{
    levelId: number;
    levelNo: number;
    levelName: string;
    levelFullName: string;
    isUnlocked: boolean;
    isCompleted: boolean;
    isSkipped: boolean;
    currentPoints: number;
    maxPoints: number;
    progress: number | null;
    requiredPoints: number;
    goldCount: number;
    silverCount: number;
    bronzeCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ChildrenData {
    id: string;
    username: string;
    fullName: string;
    teacher: TeacherPayload;
    totalTestSessions: number;
    completedTestSessions: number;
    inProgressTestSessions: number;
    averageScore: number;
    lastTestSessionAt: string | null;
    levelProgresses: LevelProgressPayload[]
    createdAt: string;
}

export interface GetAllChildrenSuccessPayload extends SuccessPayload{
    data: ChildrenData[]
}

export type GetAllChildrenResponse = GetAllChildrenSuccessPayload | ErrorPayload

//TEST SESSION OF STUDENTS PAYLOAD

export interface TestSessionOfStudentSuccessPayload extends SuccessPayload {
    data : TestSessionResult[];
}

export type TestSessionOfStudentResponse = TestSessionOfStudentSuccessPayload | ErrorPayload;

//TEST SESSION SINGLE STUDENT PAYLOAD

export interface TestSessionSingleStudentSuccessPayload extends SuccessPayload {
    data : TestSessionResult;
}

export type TestSessionSingleStudentResponse = TestSessionSingleStudentSuccessPayload | ErrorPayload;