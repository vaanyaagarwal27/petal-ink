export interface Poem {
  id: string;
  title: string;
  content: string;
  theme: string;
  createdAt: number;
  updatedAt: number;
}

export interface ThemeGeneration {
  theme: string;
  imagery: string[];
  metaphors: string[];
  atmosphere: string;
  personification?: string[];
  simile?: string[];
  hyperbole?: string[];
}

export interface LibraryPoem {
  id: string;
  title: string;
  author: string;
  content: string;
  description: string;
  category: 'Romantic' | 'Nature' | 'Classic' | 'Narrative' | 'Indian' | 'Hindi';
  themeBreakdown: string;
}

export type View = 'dashboard' | 'new-poem' | 'theme-generator' | 'saved-poems' | 'rhyming-dictionary' | 'writing-insights' | 'poetry-library';
