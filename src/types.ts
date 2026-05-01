export interface GameState {
  round: number;
  score: number;
  xp: number;
  rank: string;
  riskLevel: number; // 0-100
  confidenceLevel: number; // 0-100
  history: DecisionRecord[];
  activeFlags: string[]; // e.g., 'phishing_ignored', 'isolation_delayed'
  status: 'start' | 'playing' | 'round_feedback' | 'game_over';
  currentScenario?: Scenario;
  currentFeedback?: Feedback;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  mitreStage: MitreStage;
  artifacts: Artifact[];
  options: Option[];
}

export type MitreStage = 
  | 'Initial Access' 
  | 'Execution' 
  | 'Persistence' 
  | 'Privilege Escalation' 
  | 'Defense Evasion' 
  | 'Credential Access' 
  | 'Discovery' 
  | 'Lateral Movement' 
  | 'Collection' 
  | 'Exfiltration' 
  | 'Impact';

export interface Artifact {
  type: 'log' | 'email' | 'network' | 'process';
  content: string;
  label: string;
}

export interface Option {
  id: string;
  label: string;
  explanation: string;
  flag?: string; // Flag to set in state if chosen
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
  chainEffect?: string; // Narrative on how this affects the future
}

export interface FinalReport {
  rating: string;
  rankTitle: string;
  goodDecisions: string[];
  riskyChoices: string[];
  recommendations: string[];
}
