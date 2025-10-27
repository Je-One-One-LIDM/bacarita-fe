import { SuccessPayload, ErrorPayload } from "@/types/general.types";

export interface Level {
    id: number;
    no: number;
    name: string;
    fullName: string;
    isUnlocked: boolean;
    isSkipped?: boolean;
    requiredPoints: number;
    isBonusLevel: boolean;
    maxPoints: number;
    goldCount: number;
    silverCount: number;
    bronzeCount: number;
    isCompleted: boolean;
    progress: number;
    createdAt: string;
    updatedAt: string;
    stories: Story[];
}

export interface Story {
    id: number;
    titel: string;
    description: string;
    imageUrl: string | null;
    isGoldMedal: boolean;
    isSilverMedal: boolean;
    isBronzeMedal:boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LevelsData extends SuccessPayload {
    data: Level[];
}

export type GetLevelsResponse = LevelsData | ErrorPayload;

