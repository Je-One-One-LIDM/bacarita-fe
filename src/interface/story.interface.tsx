export interface Story {
  id: number;
  title: string;
  description: string;
  image: string;
  goldMedal: boolean;
  silverMedal: boolean;
  bronzeMedal: boolean;
}

export interface Level {
  id: number;
  name: string;
  isUnlocked: boolean;
  requiredPoints: number;
  stories: Story[];
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
  progress: number;
}

