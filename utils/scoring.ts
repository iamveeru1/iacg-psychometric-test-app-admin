import { UserAnswers, ReportData, RiasecDetail } from '../types';

// Content extracted from the PDF and standard RIASEC definitions
const RIASEC_CONTENT: { [key: string]: RiasecDetail } = {
  R: {
    code: 'R',
    name: 'Realistic',
    description: "Realistic individuals enjoy practical, hands-on activities and prefer working with tools, machines, technology, or outdoor settings. They like tasks that involve building, fixing, operating, or creating physical results, and they feel comfortable in active, task-focused environments.",
    majors: [
      'Agriculture',
      'Health Assistant',
      'Computers',
      'Construction',
      'Mechanic/Machinist',
      'Engineering',
      'Food and Hospitality'
    ],
    pathways: [
      'Natural Resources',
      'Health Services',
      'Industrial and Engineering Technology',
      'Arts and Communication'
    ],
    interests: 'Machines, tools, outdoors, mechanical systems, hands-on work',
    activities: 'Operating equipment, using tools, building, repairing, maintaining vehicles',
    skills: 'Mechanical ability, physical coordination, working with tools, troubleshooting',
    values: 'Practicality, tradition, self-reliance, physical challenge'
  },
  I: {
    code: 'I',
    name: 'Investigative',
    description: "Investigative individuals are curious thinkers who enjoy analyzing, researching, and understanding complex ideas. They like exploring how things work, solving problems using logic, and engaging with subjects like science, mathematics, or technical fields that require deep thinking.",
    majors: [
      'Marine Biology',
      'Engineering',
      'Chemistry',
      'Zoology',
      'Medicine/Surgery',
      'Consumer Economics',
      'Psychology'
    ],
    pathways: [
      'Health Services',
      'Business',
      'Public and Human Services',
      'Industrial and Engineering Technology'
    ],
    interests: 'Science, medicine, mathematics, research, complex problems',
    activities: 'Performing lab experiments, solving abstract problems, conducting research',
    skills: 'Mathematical ability, scientific ability, analytical skills, critical thinking',
    values: 'Curiosity, learning, independence, logic'
  },
  A: {
    code: 'A',
    name: 'Artistic',
    description: "Artistic individuals thrive in creative and expressive environments where they can use imagination and originality. They enjoy activities such as designing, writing, performing, or creating visual and digital art, and prefer work that allows freedom, flexibility, and personal expression.",
    majors: [
      'Communications',
      'Cosmetology',
      'Fine and Performing Arts',
      'Photography',
      'Radio and TV',
      'Interior Design',
      'Architecture'
    ],
    pathways: [
      'Public and Human Services',
      'Arts and Communication'
    ],
    interests: 'Self-expression, art appreciation, communication, culture, design',
    activities: 'Composing music, performing, writing, creating visual art, designing',
    skills: 'Creativity, musical ability, artistic expression, imaginative thinking',
    values: 'Beauty, originality, independence, imagination'
  },
  S: {
    code: 'S',
    name: 'Social',
    description: "Social individuals enjoy helping, guiding, teaching, and supporting others through communication and care. They are empathetic, patient, and motivated by making a positive impact, often choosing environments where they can interact, collaborate, and contribute to people’s growth.",
    majors: [
      'Counseling',
      'Nursing',
      'Physical Therapy',
      'Travel',
      'Advertising',
      'Public Relations',
      'Education'
    ],
    pathways: [
      'Health Services',
      'Public and Human Services'
    ],
    interests: 'People, teamwork, helping, community service, teaching',
    activities: 'Teaching, caring for people, counseling, training employees',
    skills: 'People skills, verbal ability, listening, showing understanding',
    values: 'Cooperation, generosity, service to others, empathy'
  },
  E: {
    code: 'E',
    name: 'Enterprising',
    description: "Enterprising individuals are confident, persuasive, and driven by leadership, achievement, and influence. They enjoy taking initiative, organizing people or projects, and working in business, law, management, or entrepreneurship where decision-making and goal-setting matter.",
    majors: [
      'Fashion Merchandising',
      'Real Estate',
      'Marketing/Sales',
      'Law',
      'Political Science',
      'International Trade',
      'Banking/Finance'
    ],
    pathways: [
      'Business',
      'Public and Human Services',
      'Arts and Communication'
    ],
    interests: 'Business, politics, leadership, entrepreneurship, influencing',
    activities: 'Selling, managing, persuading, marketing, public speaking',
    skills: 'Verbal ability, ability to motivate and direct others, negotiation',
    values: 'Risk taking, status, competition, influence'
  },
  C: {
    code: 'C',
    name: 'Conventional',
    description: "Conventional individuals prefer structured, organized, and detail-oriented tasks that require accuracy and consistency. They enjoy working with data, numbers, systems, and records, and excel in environments where planning, routines, and clear procedures guide the work.",
    majors: [
      'Accounting',
      'Court Reporting',
      'Insurance',
      'Administration',
      'Medical Records',
      'Banking',
      'Data Processing'
    ],
    pathways: [
      'Health Services',
      'Business',
      'Industrial and Engineering Technology'
    ],
    interests: 'Organization, data management, accounting, investing, efficiency',
    activities: 'Setting up procedures, record keeping, data processing, calculating',
    skills: 'Clerical ability, attention to detail, working with numbers, organizing',
    values: 'Accuracy, stability, efficiency, order'
  }
};

// Explicit Mapping of the 50 Questions to RIASEC codes based on content analysis
const QUESTION_TYPE_MAP: { [key: number]: string } = {
  1: 'I',  // Researching/exploring -> Investigative
  2: 'S',  // Caring/supporting -> Social
  3: 'A',  // Designs/artworks -> Artistic
  4: 'E',  // Money/business -> Enterprising
  5: 'R',  // Practical problems -> Realistic
  6: 'A',  // Photos/editing -> Artistic
  7: 'S',  // Helping people -> Social
  8: 'C',  // Arranging order -> Conventional
  9: 'R',  // Building models/DIY -> Realistic
  10: 'S', // Community work -> Social
  11: 'C', // Numbers and data -> Conventional
  12: 'I', // How/why things happen -> Investigative
  13: 'E', // Convincing/influencing -> Enterprising
  14: 'C', // Rules/instructions -> Conventional
  15: 'A', // Writing stories -> Artistic
  16: 'I', // Analysing problems -> Investigative
  17: 'E', // Planning events -> Enterprising
  18: 'R', // Tools/machines -> Realistic
  19: 'A', // Colors/fonts -> Artistic
  20: 'S', // Listening/feelings -> Social
  21: 'C', // Neatness/accuracy -> Conventional
  22: 'R', // Experiments involving machines -> Realistic (could be I, but machines implies R)
  23: 'E', // Speaking to audiences -> Enterprising
  24: 'A', // Drawing/painting -> Artistic
  25: 'I', // Challenging questions/puzzles -> Investigative
  26: 'A', // Expressing ideas -> Artistic
  27: 'S', // Helping decisions -> Social
  28: 'I', // Science experiments -> Investigative
  29: 'S', // Groups -> Social
  30: 'R', // Assembling devices -> Realistic
  31: 'C', // Organizing files -> Conventional
  32: 'E', // Taking charge -> Enterprising
  33: 'A', // Creativity vs rules -> Artistic
  34: 'I', // Reading factual/scientific -> Investigative
  35: 'R', // Fixing things -> Realistic
  36: 'A', // Acting/dancing -> Artistic
  37: 'I', // Patterns/connections -> Investigative
  38: 'A', // Posters/videos -> Artistic
  39: 'S', // Caring/motivating -> Social
  40: 'E', // Selling/promoting -> Enterprising
  41: 'I', // Maths/Physics -> Investigative
  42: 'E', // Own business -> Enterprising
  43: 'A', // Decorating -> Artistic
  44: 'S', // Emotions -> Social
  45: 'C', // Arranging info -> Conventional
  46: 'R', // Engineering/mechanics -> Realistic
  47: 'I', // New ideas to improve -> Investigative (Innovation)
  48: 'A', // Creative ways to present -> Artistic
  49: 'S', // Teaching -> Social
  50: 'R'  // Practical/hands-on -> Realistic
};

const getScore = (ans: string | undefined): number => {
  if (!ans) return 0;
  // Firestore might store "5", "4", "3" etc. or numbers. 
  // Standard Likert usually 1-5.
  const parsed = parseInt(ans, 10);
  return isNaN(parsed) ? 0 : parsed;
};

export const calculateReport = (answers: UserAnswers): ReportData => {

  // Initialize accumulators
  const rawScores: { [key: string]: number } = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const counts: { [key: string]: number } = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const normalizedScores: { [key: string]: number } = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  // Iterate through all 50 questions
  for (let i = 1; i <= 50; i++) {
    const qId = `q_${i}`;
    const val = getScore(answers[qId]);
    const type = QUESTION_TYPE_MAP[i];

    if (type && val > 0) {
      rawScores[type] += val;
      counts[type] += 1;
    } else if (type) {
      // Even if val is 0 or missing, we count the question as part of the category
      // to compute average correctly if we want to penalize skipped questions.
      // Assuming "0" means skipped or "Strongly Disagree" depending on scale.
      // Here we just count it.
      counts[type] += 1;
    }
  }

  // Calculate Normalized Scores (Weighted Average out of 50)
  // Logic: (Total Score / Number of Questions) * 10
  // If a user answers "5" to all questions, Avg is 5, Score is 50.
  // This balances the fact that some categories have more questions than others.
  Object.keys(normalizedScores).forEach(key => {
    if (counts[key] > 0) {
      const avg = rawScores[key] / counts[key];
      normalizedScores[key] = parseFloat((avg * 10).toFixed(2));
    } else {
      normalizedScores[key] = 0;
    }
  });

  // Sort scores to find the top 3 (Interest Code) based on NORMALIZED scores
  const sortedScores = Object.entries(normalizedScores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .map(([code, score]) => ({ code, score }));

  const top3 = sortedScores.slice(0, 3).map(s => s.code);

  return {
    scores: normalizedScores, // Use normalized scores for the chart (0-50 scale)
    sortedScores,
    interestCode: top3,
    details: RIASEC_CONTENT
  };
};