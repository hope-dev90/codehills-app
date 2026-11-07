export interface BundledStory {
  id: string;
  title: string;
  category: string;
  location: string;
  imageKey: string;
  explorerCategory: string;
  xpReward: number;
  description: string;
  contentSummary: string;
}

export interface BundledExploreStory {
  id: string;
  title: string;
  category: string;
  location: string;
  imageKey: string;
  era: string;
  latitude: number;
  longitude: number;
  description: string;
}

export const stories: BundledStory[];
export const exploreStories: BundledExploreStory[];
declare const bundled: { stories: BundledStory[]; exploreStories: BundledExploreStory[] };
export default bundled;
