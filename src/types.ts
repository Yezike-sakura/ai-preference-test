export type IdentityKey = "learning" | "engineering" | "creative" | "efficiency";

export type DimensionKey = "agency" | "tempo" | "output" | "risk";

export type ScoreMap<T extends string> = Record<T, number>;

export interface WeightedOption {
  id: string;
  text: string;
  identityWeights: Partial<ScoreMap<IdentityKey>>;
  dimensionWeights: Partial<ScoreMap<DimensionKey>>;
}

export interface Question {
  id: string;
  prompt: string;
  options: WeightedOption[];
}

export interface DimensionPole {
  letter: string;
  label: string;
  description: string;
}

export interface DimensionDefinition {
  key: DimensionKey;
  positive: DimensionPole;
  negative: DimensionPole;
}

export interface Persona {
  title: string;
  identityLine: string;
  keywords: string[];
  goldenLine: string;
  summary: string;
  strengths: string[];
  risks: string[];
  advice: string[];
}

export interface QuizResult {
  mainIdentity: IdentityKey;
  secondaryIdentity: IdentityKey;
  identityScores: ScoreMap<IdentityKey>;
  dimensionScores: ScoreMap<DimensionKey>;
  typeCode: string;
  dimensions: Array<{
    key: DimensionKey;
    letter: string;
    label: string;
    description: string;
    score: number;
  }>;
  persona: Persona;
}
