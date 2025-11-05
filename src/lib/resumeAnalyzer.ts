/**
 * AI Resume Analyzer
 * Analyzes resumes and provides scoring based on multiple criteria
 */

import { getRoleProfile, type RoleProfile } from "./roleProfiles";

export interface ResumeAnalysis {
  overallScore: number;
  scores: {
    skills: number;
    experience: number;
    education: number;
    formatting: number;
    keywords: number;
  };
  strengths: string[];
  improvements: string[];
  matchScore: number; // Match with job description
  recommendations: string[];
  keywordMatches: string[];
  missingKeywords: string[];
  roleMatch?: {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    roleName: string;
  };
}

export interface JobRequirements {
  requiredSkills: string[];
  preferredSkills: string[];
  minCGPA?: number;
  description: string;
}

/**
 * Analyzes a resume text and returns detailed scoring
 */
export function analyzeResume(
  resumeText: string,
  studentData: {
    cgpa: number;
    branch: string;
    skills?: string;
  },
  jobRequirements?: JobRequirements,
  roleId?: string // NEW: Optional role-based analysis
): ResumeAnalysis {
  const text = resumeText.toLowerCase();

  // 1. Skills Analysis (30 points)
  const skillsScore = analyzeSkills(text, studentData.skills);

  // 2. Experience Analysis (25 points)
  const experienceScore = analyzeExperience(text);

  // 3. Education Analysis (20 points)
  const educationScore = analyzeEducation(text, studentData.cgpa);

  // 4. Formatting Analysis (15 points)
  const formattingScore = analyzeFormatting(resumeText);

  // 5. Keywords Analysis (10 points)
  const keywordScore = analyzeKeywords(text);

  // Calculate overall score
  const overallScore = Math.round(
    skillsScore + experienceScore + educationScore + formattingScore + keywordScore
  );

  // Get strengths and improvements
  const { strengths, improvements } = generateFeedback(
    { skills: skillsScore, experience: experienceScore, education: educationScore,
      formatting: formattingScore, keywords: keywordScore },
    text,
    studentData
  );

  // Calculate job match if requirements provided
  let matchScore = 0;
  let keywordMatches: string[] = [];
  let missingKeywords: string[] = [];
  let recommendations: string[] = [];

  if (jobRequirements) {
    const matchAnalysis = analyzeJobMatch(text, jobRequirements, studentData);
    matchScore = matchAnalysis.score;
    keywordMatches = matchAnalysis.matches;
    missingKeywords = matchAnalysis.missing;
    recommendations = matchAnalysis.recommendations;
  }

  // NEW: Role-based analysis
  let roleMatch;
  if (roleId) {
    const roleProfile = getRoleProfile(roleId);
    if (roleProfile) {
      roleMatch = analyzeRoleMatch(text, roleProfile, studentData);
    }
  }

  return {
    overallScore,
    scores: {
      skills: Math.round(skillsScore),
      experience: Math.round(experienceScore),
      education: Math.round(educationScore),
      formatting: Math.round(formattingScore),
      keywords: Math.round(keywordScore),
    },
    strengths,
    improvements,
    matchScore,
    recommendations,
    keywordMatches,
    missingKeywords,
    roleMatch,
  };
}

function analyzeSkills(text: string, studentSkills?: string): number {
  let score = 0;

  // Normalize text - remove extra spaces, handle different encodings
  const normalizedText = text.replace(/\s+/g, ' ').toLowerCase();

  // Technical skills keywords (expanded for better detection)
  const technicalSkills = [
    // Programming Languages
    'python', 'java', 'javascript', 'typescript', 'react', 'node', 'sql',
    'c++', 'c#', 'golang', 'rust', 'flutter', 'react native', 'swift', 'scala', 'kotlin',

    // Databases
    'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'dynamodb', 'cassandra',
    'sqlalchemy', 'prisma', 'chromadb', 'milvus',

    // Cloud & DevOps
    'aws', 's3', 'ec2', 'lambda', 'sqs', 'docker', 'kubernetes', 'k8s', 'argocd',
    'terraform', 'jenkins', 'github actions', 'ci/cd', 'secrets manager',

    // Frameworks & Libraries
    'django', 'flask', 'fastapi', 'spring', 'express', 'angular', 'vue', 'nextjs',
    'pandas', 'numpy', 'scikit-learn', 'scikit learn', 'sklearn', 'pytorch', 'tensorflow', 'keras',

    // ML/AI & Data Science
    'machine learning', 'deep learning', 'neural network', 'transformer',
    'llm', 'gpt', 'bert', 'llama', 'alpaca', 'hugging face', 'langchain', 'langgraph',
    'rag', 'retrieval augmented generation', 'generative ai', 'nlp', 'computer vision',
    'prompt engineering', 'fine-tuning', 'fine tuning', 'bitsandbytes', 'graph neural network',

    // Tools & Technologies
    'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence',
    'rest api', 'graphql', 'microservices', 'kafka', 'rabbitmq',
    'unstructured', 'volza', 'bm25', 'faiss', 'transformerlens'
  ];

  const softSkills = [
    'leadership', 'communication', 'teamwork', 'problem solving',
    'analytical', 'critical thinking', 'time management'
  ];

  // Count technical skills (max 20 points)
  // Use normalized text for better matching
  const technicalCount = technicalSkills.filter(skill => normalizedText.includes(skill)).length;
  score += Math.min(technicalCount * 2, 20);

  // Count soft skills (max 5 points)
  const softCount = softSkills.filter(skill => normalizedText.includes(skill)).length;
  score += Math.min(softCount * 1, 5);

  // Bonus for student skills listed (max 5 points)
  if (studentSkills) {
    const listedSkills = studentSkills.toLowerCase().split(',').map(s => s.trim());
    const matchedSkills = listedSkills.filter(skill => normalizedText.includes(skill));
    score += Math.min(matchedSkills.length, 5);
  }

  return Math.min(score, 30);
}

function analyzeExperience(text: string): number {
  let score = 0;

  // Normalize text
  const normalizedText = text.replace(/\s+/g, ' ').toLowerCase();

  // Check for experience indicators (expanded)
  const experienceKeywords = [
    'internship', 'intern', 'project', 'developed', 'built', 'implemented',
    'designed', 'created', 'led', 'managed', 'collaborated', 'orchestrated',
    'contributed', 'achieved', 'improved', 'optimized', 'engineered',
    'deployed', 'authored', 'published', 'fine-tuned', 'fine tuned', 'trained',
    'researched', 'analyzed', 'automated', 'integrated', 'migrated'
  ];

  const count = experienceKeywords.filter(keyword => normalizedText.includes(keyword)).length;
  score += Math.min(count * 2, 15);

  // Check for quantifiable achievements
  const hasNumbers = /\d+\s*%|\d+\s*users|\d+\s*applications|\d+x\s*improvement|~\s*\d+\s*%|\d+\s*clients|fortune\s*\d+/i.test(normalizedText);
  if (hasNumbers) score += 5;

  // Check for publications/research (bonus points)
  const hasPublications = /publication|published|ieee|conference|paper|article|medium|research\s*project/i.test(normalizedText);
  if (hasPublications) score += 3;

  // Check for GitHub/portfolio links
  if (normalizedText.includes('github') || normalizedText.includes('portfolio') || normalizedText.includes('repo')) score += 2;

  return Math.min(score, 25);
}

function analyzeEducation(text: string, cgpa: number): number {
  let score = 0;

  // Normalize text
  const normalizedText = text.replace(/\s+/g, ' ').toLowerCase();

  // CGPA-based scoring (max 12 points)
  if (cgpa >= 9.0) score += 12;
  else if (cgpa >= 8.5) score += 10;
  else if (cgpa >= 8.0) score += 8;
  else if (cgpa >= 7.5) score += 6;
  else score += 4;

  // Check for certifications (max 5 points)
  const certKeywords = ['certified', 'certification', 'course completion', 'udemy', 'coursera'];
  const certCount = certKeywords.filter(keyword => normalizedText.includes(keyword)).length;
  score += Math.min(certCount, 5);

  // Check for academic achievements (max 3 points)
  const achievements = ['award', 'prize', 'scholarship', 'dean', 'honor'];
  if (achievements.some(word => normalizedText.includes(word))) score += 3;

  return Math.min(score, 20);
}

function analyzeFormatting(resumeText: string): number {
  let score = 0;

  // Check length (ideal: 400-1500 words)
  const wordCount = resumeText.split(/\s+/).length;
  if (wordCount >= 400 && wordCount <= 1500) score += 5;
  else if (wordCount >= 300 && wordCount <= 2000) score += 3;

  // Check for section headers
  const sections = ['education', 'experience', 'skills', 'projects'];
  const sectionCount = sections.filter(section =>
    resumeText.toLowerCase().includes(section)
  ).length;
  score += Math.min(sectionCount * 2, 6);

  // Check for contact information
  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(resumeText);
  const hasPhone = /\+?\d{10,}/i.test(resumeText);
  if (hasEmail) score += 2;
  if (hasPhone) score += 2;

  return Math.min(score, 15);
}

function analyzeKeywords(text: string): number {
  let score = 0;

  // Normalize text
  const normalizedText = text.replace(/\s+/g, ' ').toLowerCase();

  // Action verbs (max 5 points)
  const actionVerbs = [
    'achieved', 'improved', 'developed', 'designed', 'implemented',
    'created', 'managed', 'led', 'optimized', 'solved', 'orchestrated',
    'engineered', 'deployed', 'built', 'authored'
  ];
  const verbCount = actionVerbs.filter(verb => normalizedText.includes(verb)).length;
  score += Math.min(verbCount, 5);

  // Industry keywords (max 5 points)
  const industryKeywords = [
    'agile', 'scrum', 'ci/cd', 'ci cd', 'api', 'rest', 'microservices',
    'cloud', 'devops', 'machine learning', 'data structures', 'algorithms'
  ];
  const industryCount = industryKeywords.filter(keyword => normalizedText.includes(keyword)).length;
  score += Math.min(industryCount, 5);

  return Math.min(score, 10);
}

function generateFeedback(
  scores: { skills: number; experience: number; education: number; formatting: number; keywords: number },
  text: string,
  studentData: { cgpa: number; branch: string }
): { strengths: string[]; improvements: string[] } {
  const strengths: string[] = [];
  const improvements: string[] = [];

  // Skills feedback
  if (scores.skills >= 20) {
    strengths.push("Strong technical skills demonstrated");
  } else if (scores.skills < 15) {
    improvements.push("Add more relevant technical skills and technologies");
  }

  // Experience feedback
  if (scores.experience >= 18) {
    strengths.push("Excellent project and experience section");
  } else if (scores.experience < 12) {
    improvements.push("Include more projects with quantifiable achievements");
    improvements.push("Add internship experiences or personal projects");
  }

  // Education feedback
  if (scores.education >= 15) {
    strengths.push("Outstanding academic background");
  } else if (scores.education < 10) {
    improvements.push("Highlight academic achievements and certifications");
  }

  // Formatting feedback
  if (scores.formatting >= 12) {
    strengths.push("Well-structured and professional format");
  } else {
    improvements.push("Improve resume structure with clear sections");
    if (!/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text)) {
      improvements.push("Add contact information (email, phone)");
    }
  }

  // Keywords feedback
  if (scores.keywords < 6) {
    improvements.push("Use more action verbs (achieved, developed, implemented)");
    improvements.push("Include industry-relevant keywords");
  }

  // Generic improvements if not mentioned
  if (!text.includes('github')) {
    improvements.push("Add GitHub profile link to showcase your code");
  }
  if (!text.includes('linkedin')) {
    improvements.push("Include LinkedIn profile for professional networking");
  }

  return { strengths, improvements };
}

function analyzeJobMatch(
  text: string,
  requirements: JobRequirements,
  studentData: { cgpa: number; branch: string }
): { score: number; matches: string[]; missing: string[]; recommendations: string[] } {
  let score = 0;
  const matches: string[] = [];
  const missing: string[] = [];
  const recommendations: string[] = [];

  // Required skills (60% weight)
  const requiredMatches = requirements.requiredSkills.filter(skill =>
    text.includes(skill.toLowerCase())
  );
  matches.push(...requiredMatches);

  const requiredMissing = requirements.requiredSkills.filter(skill =>
    !text.includes(skill.toLowerCase())
  );
  missing.push(...requiredMissing);

  const requiredScore = (requiredMatches.length / requirements.requiredSkills.length) * 60;
  score += requiredScore;

  // Preferred skills (30% weight)
  if (requirements.preferredSkills.length > 0) {
    const preferredMatches = requirements.preferredSkills.filter(skill =>
      text.includes(skill.toLowerCase())
    );
    matches.push(...preferredMatches);
    const preferredScore = (preferredMatches.length / requirements.preferredSkills.length) * 30;
    score += preferredScore;
  } else {
    score += 30; // No preferred skills means full points
  }

  // CGPA requirement (10% weight)
  if (requirements.minCGPA) {
    if (studentData.cgpa >= requirements.minCGPA) {
      score += 10;
    } else {
      recommendations.push(`Minimum CGPA required: ${requirements.minCGPA} (Current: ${studentData.cgpa})`);
    }
  } else {
    score += 10;
  }

  // Generate recommendations
  if (requiredMissing.length > 0) {
    recommendations.push(`Add these required skills to your resume: ${requiredMissing.join(', ')}`);
  }
  if (score < 70) {
    recommendations.push("Consider building projects that demonstrate the required skills");
  }
  if (score >= 80) {
    recommendations.push("Great match! You're a strong candidate for this position");
  }

  return {
    score: Math.round(score),
    matches,
    missing,
    recommendations,
  };
}

/**
 * Extract text from resume file buffer
 */
export async function extractResumeText(
  fileBuffer: Buffer,
  fileType: string
): Promise<string> {
  try {
    if (fileType === "application/pdf") {
      // Try pdf-parse first (simpler and often works better)
      try {
        const pdf = require("pdf-parse");
        const data = await pdf(fileBuffer);

        if (data.text && data.text.trim()) {
          // Clean up the text - normalize whitespace
          return data.text
            .replace(/\r\n/g, "\n") // normalize line endings
            .replace(/\n{3,}/g, "\n\n") // max 2 consecutive newlines
            .trim();
        }
      } catch (pdfParseError) {
        console.log("pdf-parse failed, trying pdf2json:", pdfParseError);
      }

      // Fallback to pdf2json if pdf-parse fails
      const PDFParser = (await import("pdf2json")).default;

      return new Promise((resolve, reject) => {
        const pdfParser = new (PDFParser as any)(null, 1);

        pdfParser.on("pdfParser_dataError", (errData: any) => {
          reject(new Error(errData.parserError));
        });

        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
          try {
            let fullText = "";

            if (pdfData.Pages) {
              for (const page of pdfData.Pages) {
                if (!page.Texts) continue;

                // Sort by Y (vertical) then X (horizontal)
                const sorted = page.Texts.sort((a: any, b: any) => {
                  const yDiff = a.y - b.y;
                  if (Math.abs(yDiff) < 0.1) return a.x - b.x;
                  return yDiff;
                });

                let currentY = -1;
                let line = "";

                for (const item of sorted) {
                  if (!item.R || !Array.isArray(item.R)) continue;

                  // Build complete word from all R elements in this text item
                  let word = "";
                  for (const r of item.R) {
                    if (r.T) {
                      try {
                        word += decodeURIComponent(r.T);
                      } catch {
                        word += r.T;
                      }
                    }
                  }

                  // Remove extra spaces within the word (common issue with pdf2json)
                  word = word.replace(/\s+/g, " ").trim();

                  if (!word) continue;

                  // Check if new line
                  if (currentY !== -1 && Math.abs(item.y - currentY) > 0.15) {
                    fullText += line.trim() + "\n";
                    line = word;
                  } else {
                    line += (line ? " " : "") + word;
                  }
                  currentY = item.y;
                }

                if (line.trim()) fullText += line.trim() + "\n";
              }
            }

            // Final cleanup
            fullText = fullText
              .replace(/\s+/g, " ") // collapse all whitespace to single spaces
              .replace(/ \n /g, "\n") // clean line breaks
              .replace(/\n{3,}/g, "\n\n") // max 2 newlines
              .trim();

            if (!fullText) {
              reject(new Error("No text extracted from PDF"));
            } else {
              resolve(fullText);
            }
          } catch (error) {
            reject(error);
          }
        });

        pdfParser.parseBuffer(fileBuffer);
      });
    } else if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileType === "application/msword"
    ) {
      // Dynamic import for mammoth (DOCX parser)
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value;
    } else {
      throw new Error("Unsupported file type. Please upload PDF or DOCX file.");
    }
  } catch (error) {
    console.error("Error extracting text from file:", error);
    throw new Error("Failed to extract text from resume file");
  }
}

/**
 * Analyze resume match with a specific role profile
 */
function analyzeRoleMatch(
  text: string,
  roleProfile: RoleProfile,
  studentData: { cgpa: number; branch: string }
): {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  roleName: string;
} {
  let score = 0;
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  // Check must-have skills (40% weight)
  const mustHaveFound = roleProfile.mustHaveSkills.filter(skill =>
    text.includes(skill.toLowerCase())
  );
  matchedSkills.push(...mustHaveFound);
  const mustHaveMissing = roleProfile.mustHaveSkills.filter(skill =>
    !text.includes(skill.toLowerCase())
  );
  missingSkills.push(...mustHaveMissing);

  score += (mustHaveFound.length / roleProfile.mustHaveSkills.length) * 40;

  // Check good-to-have skills (30% weight)
  const goodToHaveFound = roleProfile.goodToHaveSkills.filter(skill =>
    text.includes(skill.toLowerCase())
  );
  matchedSkills.push(...goodToHaveFound);

  score += (goodToHaveFound.length / roleProfile.goodToHaveSkills.length) * 30;

  // Check critical keywords (15% weight)
  const keywordsFound = roleProfile.criticalKeywords.filter(keyword =>
    text.includes(keyword.toLowerCase())
  );

  score += (keywordsFound.length / roleProfile.criticalKeywords.length) * 15;

  // Check experience keywords (10% weight)
  const expKeywordsFound = roleProfile.experienceKeywords.filter(keyword =>
    text.includes(keyword.toLowerCase())
  );

  score += (expKeywordsFound.length / roleProfile.experienceKeywords.length) * 10;

  // CGPA check (5% weight)
  if (roleProfile.minCGPA) {
    if (studentData.cgpa >= roleProfile.minCGPA) {
      score += 5;
    }
  } else {
    score += 5;
  }

  return {
    score: Math.round(score),
    matchedSkills,
    missingSkills,
    roleName: roleProfile.name,
  };
}
