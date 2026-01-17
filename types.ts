export enum WritingMode {
  DRAFT = 'DRAFT',        // Topic -> Essay
  REFINE = 'REFINE',      // Rough -> Smooth
  ACADEMIC = 'ACADEMIC',  // Casual -> Formal (Style Transfer)
  CRITIQUE = 'CRITIQUE',  // Check for citations/logic
}

export interface WritingState {
  inputText: string;
  outputText: string;
  isStreaming: boolean;
  mode: WritingMode;
  error: string | null;
}

export interface PromptTemplate {
  systemInstruction: string;
  userPromptWrapper: (input: string) => string;
}