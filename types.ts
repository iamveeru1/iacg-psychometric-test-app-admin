export interface Student {
  id: string;
  name: string;
  schoolName: string;
  email: string;
  grade: string;
  status: string; // 'REGISTERED' | 'COMPLETED'
  lastAssessmentDate: string;
  answers?: UserAnswers; // Added to store student answers
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

export interface UserAnswers {
  [key: string]: string;
}

export interface RiasecDetail {
  code: string;
  name: string;
  description: string;
  majors: string[];
  pathways: string[];
  interests: string;
  activities: string;
  skills: string;
  values: string;
}

export interface ReportData {
  scores: { [key: string]: number };
  sortedScores: { code: string; score: number }[];
  interestCode: string[];
  details: { [key: string]: RiasecDetail };
}