/**
 * Job Description (JD) Analyzer
 * Extracts requirements from job descriptions and matches with resumes
 */

export interface JDAnalysis {
  requiredSkills: string[];
  preferredSkills: string[];
  experience: string[];
  education: string[];
  responsibilities: string[];
  keywords: string[];
  tools: string[];
  companyName?: string;
  role?: string;
}

export interface JDMatchResult {
  overallMatch: number;
  skillsMatch: number;
  experienceMatch: number;
  keywordsMatch: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  atsScore: number; // How likely to pass ATS
}

/**
 * Extract structured data from a job description
 */
export function analyzeJobDescription(jdText: string): JDAnalysis {
  const text = jdText.toLowerCase();
  const lines = jdText.split('\n');

  // Common technical skills to look for
  const allTechSkills = [
    // Programming Languages
    'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'golang', 'rust',
    'scala', 'kotlin', 'swift', 'php', 'ruby', 'r',

    // Frontend
    'react', 'angular', 'vue', 'nextjs', 'html', 'css', 'tailwind', 'sass',
    'redux', 'webpack', 'vite',

    // Backend
    'node', 'nodejs', 'express', 'django', 'flask', 'fastapi', 'spring boot',
    'nest', 'laravel', 'rails',

    // Databases
    'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
    'dynamodb', 'cassandra', 'oracle', 'sqlite',

    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'k8s', 'terraform',
    'jenkins', 'gitlab', 'github actions', 'ci/cd', 'ansible', 'helm',

    // ML/AI
    'machine learning', 'deep learning', 'neural networks', 'tensorflow',
    'pytorch', 'scikit-learn', 'keras', 'transformers', 'llm', 'gpt',
    'bert', 'nlp', 'computer vision', 'opencv', 'hugging face',
    'langchain', 'rag', 'prompt engineering', 'fine-tuning',

    // Data Engineering
    'spark', 'hadoop', 'airflow', 'kafka', 'flink', 'etl', 'data pipeline',
    'snowflake', 'databricks', 'pandas', 'numpy',

    // Tools & Others
    'git', 'jira', 'confluence', 'figma', 'postman', 'swagger',
    'rest api', 'graphql', 'microservices', 'agile', 'scrum'
  ];

  const requiredSkills: string[] = [];
  const preferredSkills: string[] = [];
  const keywords: string[] = [];

  // Extract skills mentioned in JD
  allTechSkills.forEach(skill => {
    if (text.includes(skill)) {
      const isRequired =
        text.includes(`required ${skill}`) ||
        text.includes(`must have ${skill}`) ||
        text.includes(`${skill} required`) ||
        text.includes(`proficiency in ${skill}`) ||
        text.includes(`strong ${skill}`);

      if (isRequired) {
        requiredSkills.push(skill);
      } else {
        preferredSkills.push(skill);
      }
      keywords.push(skill);
    }
  });

  // Extract experience requirements
  const experience: string[] = [];
  const expPatterns = [
    /(\d+\+?\s*years?)\s+(?:of\s+)?(?:experience|exp)/gi,
    /experience\s+(?:of\s+)?(\d+\+?\s*years?)/gi,
  ];

  expPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) experience.push(match[1]);
    }
  });

  // Extract education requirements
  const education: string[] = [];
  const eduKeywords = ['bachelor', 'master', 'phd', 'degree', 'b.tech', 'm.tech', 'mba', 'b.e', 'm.e'];
  eduKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      education.push(keyword);
    }
  });

  // Extract responsibilities (lines with action verbs)
  const responsibilities: string[] = [];
  const actionVerbs = ['develop', 'build', 'design', 'implement', 'create', 'lead', 'manage', 'collaborate'];

  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    if (actionVerbs.some(verb => lowerLine.includes(verb)) && line.length < 200) {
      responsibilities.push(line.trim());
    }
  });

  // Extract tools mentioned
  const tools: string[] = [];
  const commonTools = ['git', 'docker', 'kubernetes', 'aws', 'azure', 'jira', 'jenkins'];
  commonTools.forEach(tool => {
    if (text.includes(tool)) {
      tools.push(tool);
    }
  });

  // Try to extract company name (if mentioned)
  let companyName;
  const companyMatch = text.match(/(?:at|for|with)\s+([A-Z][a-zA-Z\s&]+)(?:\s+is|,|\.|$)/);
  if (companyMatch) {
    companyName = companyMatch[1].trim();
  }

  // Try to extract role
  let role;
  const rolePatterns = [
    /(?:hiring|looking for|seeking)\s+(?:a\s+)?([A-Za-z\s]+?)(?:\s+to|\s+for|\s+who)/i,
    /position:\s*([A-Za-z\s]+)/i,
    /role:\s*([A-Za-z\s]+)/i,
  ];

  for (const pattern of rolePatterns) {
    const match = jdText.match(pattern);
    if (match) {
      role = match[1].trim();
      break;
    }
  }

  return {
    requiredSkills: [...new Set(requiredSkills)],
    preferredSkills: [...new Set(preferredSkills)],
    experience,
    education,
    responsibilities: responsibilities.slice(0, 10), // Top 10
    keywords: [...new Set(keywords)],
    tools,
    companyName,
    role,
  };
}

/**
 * Match resume against job description
 */
export function matchResumeWithJD(
  resumeText: string,
  jdAnalysis: JDAnalysis
): JDMatchResult {
  const resumeLower = resumeText.toLowerCase();

  // 1. Skills Match (40% weight)
  const matchedRequiredSkills = jdAnalysis.requiredSkills.filter(skill =>
    resumeLower.includes(skill.toLowerCase())
  );
  const missingRequiredSkills = jdAnalysis.requiredSkills.filter(skill =>
    !resumeLower.includes(skill.toLowerCase())
  );

  const matchedPreferredSkills = jdAnalysis.preferredSkills.filter(skill =>
    resumeLower.includes(skill.toLowerCase())
  );

  const requiredSkillsScore = jdAnalysis.requiredSkills.length > 0
    ? (matchedRequiredSkills.length / jdAnalysis.requiredSkills.length) * 100
    : 100;

  const preferredSkillsScore = jdAnalysis.preferredSkills.length > 0
    ? (matchedPreferredSkills.length / jdAnalysis.preferredSkills.length) * 100
    : 100;

  const skillsMatch = Math.round((requiredSkillsScore * 0.7) + (preferredSkillsScore * 0.3));

  // 2. Keywords Match (30% weight)
  const matchedKeywords = jdAnalysis.keywords.filter(keyword =>
    resumeLower.includes(keyword.toLowerCase())
  );
  const missingKeywords = jdAnalysis.keywords.filter(keyword =>
    !resumeLower.includes(keyword.toLowerCase())
  );

  const keywordsMatch = jdAnalysis.keywords.length > 0
    ? Math.round((matchedKeywords.length / jdAnalysis.keywords.length) * 100)
    : 100;

  // 3. Experience Match (20% weight)
  let experienceMatch = 50; // Default
  if (jdAnalysis.experience.length > 0) {
    // Check if resume mentions experience, projects, internships
    const hasExperience = /experience|internship|project|work/i.test(resumeText);
    experienceMatch = hasExperience ? 80 : 30;
  }

  // 4. Calculate overall match
  const overallMatch = Math.round(
    (skillsMatch * 0.4) + (keywordsMatch * 0.3) + (experienceMatch * 0.2) + (10) // 10% buffer
  );

  // 5. ATS Score (how likely to pass automated screening)
  const atsScore = Math.round(
    (matchedRequiredSkills.length >= jdAnalysis.requiredSkills.length * 0.7 ? 40 : 20) +
    (matchedKeywords.length >= jdAnalysis.keywords.length * 0.5 ? 30 : 15) +
    (resumeText.length > 500 ? 15 : 5) + // Has content
    (resumeLower.includes('github') || resumeLower.includes('linkedin') ? 15 : 5) // Has links
  );

  // 6. Generate suggestions
  const suggestions: string[] = [];

  if (missingRequiredSkills.length > 0) {
    suggestions.push(`⚠️ Add these REQUIRED skills: ${missingRequiredSkills.slice(0, 5).join(', ')}`);
  }

  if (matchedRequiredSkills.length < jdAnalysis.requiredSkills.length * 0.8) {
    suggestions.push('💡 Your resume is missing key required skills from the JD');
  }

  if (keywordsMatch < 60) {
    suggestions.push(`📝 Use more keywords from JD: ${missingKeywords.slice(0, 5).join(', ')}`);
  }

  if (matchedKeywords.length > 0) {
    suggestions.push(`✅ Good! You have these JD keywords: ${matchedKeywords.slice(0, 5).join(', ')}`);
  }

  if (overallMatch >= 80) {
    suggestions.push('🎉 Excellent match! Your resume aligns well with this JD');
  } else if (overallMatch >= 60) {
    suggestions.push('👍 Good match! A few improvements could make it stronger');
  } else {
    suggestions.push('⚠️ Low match. Consider tailoring your resume for this role');
  }

  if (atsScore < 50) {
    suggestions.push('🤖 ATS Warning: Your resume may not pass automated screening');
  }

  return {
    overallMatch: Math.min(overallMatch, 100),
    skillsMatch,
    experienceMatch,
    keywordsMatch,
    matchedSkills: [...matchedRequiredSkills, ...matchedPreferredSkills],
    missingSkills: missingRequiredSkills,
    matchedKeywords,
    missingKeywords,
    suggestions,
    atsScore: Math.min(atsScore, 100),
  };
}
