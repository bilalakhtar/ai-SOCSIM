export interface GameState {
  round: number;
  score: number;
  riskLevel: number; // 0-100
  confidenceLevel: number; // 0-100
  history: DecisionRecord[];
  status: 'start' | 'playing' | 'round_feedback' | 'game_over';
  currentScenario?: Scenario;
  currentFeedback?: Feedback;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  options: Option[];
}

export interface Option {
  id: string;
  label: string;
  explanation: string;
}

export interface DecisionRecord {
  round: number;
  scenario: string;
  userDecision: string;
  consequence: string;
  scoreDelta: number;
  riskDelta: number;
  isCorrect: boolean;
}

export interface Feedback {
  consequence: string;
  scoreDelta: number;
  riskDelta: number;
  confidenceDelta: number;
  explanation: string;
}

export interface FinalReport {
  rating: string;
  goodDecisions: string[];
  riskyChoices: string[];
  recommendations: string[];
}
