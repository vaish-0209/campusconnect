/**
 * Role-based Resume Analysis Profiles
 * Different roles look for different skills, keywords, and sections
 */

export interface RoleProfile {
  id: string;
  name: string;
  description: string;
  mustHaveSkills: string[];
  goodToHaveSkills: string[];
  criticalKeywords: string[];
  experienceKeywords: string[];
  projectTypes: string[];
  minCGPA?: number;
  certifications?: string[];
  sections: {
    required: string[];
    recommended: string[];
  };
}

export const roleProfiles: Record<string, RoleProfile> = {
  "software-engineer": {
    id: "software-engineer",
    name: "Software Engineer / Developer",
    description: "Full-stack or backend development roles",
    mustHaveSkills: [
      "programming language", "data structures", "algorithms",
      "git", "version control"
    ],
    goodToHaveSkills: [
      "python", "java", "javascript", "typescript", "c++",
      "react", "node", "spring", "django", "flask",
      "sql", "postgresql", "mongodb", "redis",
      "docker", "kubernetes", "aws", "ci/cd"
    ],
    criticalKeywords: [
      "developed", "built", "implemented", "deployed",
      "rest api", "microservices", "backend", "frontend",
      "database", "optimization", "scalable"
    ],
    experienceKeywords: [
      "project", "internship", "hackathon", "open source",
      "github", "portfolio"
    ],
    projectTypes: [
      "web application", "mobile app", "api", "system design",
      "database", "full-stack"
    ],
    minCGPA: 7.0,
    sections: {
      required: ["education", "skills", "projects", "experience"],
      recommended: ["certifications", "github", "hackathons"]
    }
  },

  "data-scientist": {
    id: "data-scientist",
    name: "Data Scientist / ML Engineer",
    description: "Machine learning, AI, and data analysis roles",
    mustHaveSkills: [
      "python", "machine learning", "statistics",
      "data analysis", "pandas", "numpy"
    ],
    goodToHaveSkills: [
      "pytorch", "tensorflow", "scikit-learn", "keras",
      "sql", "spark", "hadoop", "tableau", "power bi",
      "jupyter", "r", "matplotlib", "seaborn",
      "deep learning", "nlp", "computer vision",
      "aws", "gcp", "azure"
    ],
    criticalKeywords: [
      "model", "trained", "accuracy", "precision", "recall",
      "dataset", "feature engineering", "classification",
      "regression", "clustering", "neural network",
      "prediction", "analysis", "visualization"
    ],
    experienceKeywords: [
      "kaggle", "research", "data science project",
      "machine learning model", "poc", "published"
    ],
    projectTypes: [
      "ml model", "data analysis", "prediction",
      "recommendation system", "nlp", "computer vision",
      "time series", "sentiment analysis"
    ],
    minCGPA: 7.5,
    certifications: [
      "coursera", "udemy", "deeplearning.ai", "fast.ai",
      "kaggle", "tensorflow", "aws ml"
    ],
    sections: {
      required: ["education", "skills", "projects", "technical skills"],
      recommended: ["publications", "kaggle", "certifications", "research"]
    }
  },

  "ai-ml-engineer": {
    id: "ai-ml-engineer",
    name: "AI/ML Engineer (Advanced)",
    description: "Advanced ML, LLMs, Generative AI, Research roles",
    mustHaveSkills: [
      "machine learning", "deep learning", "python",
      "neural networks", "transformers"
    ],
    goodToHaveSkills: [
      "llm", "gpt", "bert", "transformers", "hugging face",
      "pytorch", "tensorflow", "langchain", "langgraph",
      "rag", "prompt engineering", "fine-tuning",
      "generative ai", "diffusion models", "gpt-4",
      "llama", "alpaca", "mistral", "anthropic",
      "vector databases", "embeddings", "chromadb", "pinecone"
    ],
    criticalKeywords: [
      "fine-tuned", "trained", "llm", "generative",
      "rag", "embeddings", "prompt", "inference",
      "model optimization", "deployed", "production",
      "research", "published", "paper", "poc",
      "fortune 500", "production deployment"
    ],
    experienceKeywords: [
      "research", "published", "paper", "conference",
      "ieee", "arxiv", "medium", "poc", "production"
    ],
    projectTypes: [
      "llm", "generative ai", "rag", "chatbot",
      "text generation", "summarization", "question answering",
      "retrieval", "semantic search"
    ],
    minCGPA: 8.0,
    certifications: [
      "deeplearning.ai", "fast.ai", "hugging face",
      "stanford nlp", "coursera ml", "andrew ng"
    ],
    sections: {
      required: ["education", "skills", "projects", "experience", "publications"],
      recommended: ["research", "github", "medium", "kaggle", "certifications"]
    }
  },

  "frontend-developer": {
    id: "frontend-developer",
    name: "Frontend Developer",
    description: "UI/UX focused development roles",
    mustHaveSkills: [
      "html", "css", "javascript", "react", "responsive design"
    ],
    goodToHaveSkills: [
      "typescript", "react", "vue", "angular", "nextjs",
      "tailwind", "sass", "styled-components",
      "redux", "zustand", "webpack", "vite",
      "figma", "ui/ux", "accessibility", "performance"
    ],
    criticalKeywords: [
      "responsive", "ui", "component", "frontend",
      "user interface", "interactive", "animations",
      "performance", "optimization", "accessible"
    ],
    experienceKeywords: [
      "designed", "built", "implemented ui",
      "portfolio", "landing page", "dashboard"
    ],
    projectTypes: [
      "web app", "dashboard", "landing page",
      "portfolio", "e-commerce", "admin panel"
    ],
    minCGPA: 7.0,
    sections: {
      required: ["education", "skills", "projects", "portfolio"],
      recommended: ["github", "live demos", "design"]
    }
  },

  "backend-developer": {
    id: "backend-developer",
    name: "Backend Developer",
    description: "Server-side development and API roles",
    mustHaveSkills: [
      "programming language", "database", "api", "server"
    ],
    goodToHaveSkills: [
      "node", "python", "java", "golang", "rust",
      "express", "django", "flask", "fastapi", "spring boot",
      "postgresql", "mongodb", "redis", "mysql",
      "rest api", "graphql", "microservices",
      "docker", "kubernetes", "aws", "nginx"
    ],
    criticalKeywords: [
      "api", "backend", "server", "database",
      "scalable", "microservices", "distributed",
      "rest", "graphql", "authentication", "authorization"
    ],
    experienceKeywords: [
      "built api", "backend", "server", "database design",
      "deployed", "production"
    ],
    projectTypes: [
      "rest api", "backend system", "microservices",
      "authentication", "database", "server"
    ],
    minCGPA: 7.0,
    sections: {
      required: ["education", "skills", "projects", "experience"],
      recommended: ["github", "system design", "certifications"]
    }
  },

  "devops-sre": {
    id: "devops-sre",
    name: "DevOps / SRE Engineer",
    description: "Infrastructure, deployment, and reliability roles",
    mustHaveSkills: [
      "linux", "docker", "kubernetes", "ci/cd", "scripting"
    ],
    goodToHaveSkills: [
      "aws", "azure", "gcp", "terraform", "ansible",
      "kubernetes", "docker", "jenkins", "github actions",
      "prometheus", "grafana", "elk", "monitoring",
      "bash", "python", "helm", "argocd"
    ],
    criticalKeywords: [
      "deployed", "infrastructure", "automation",
      "ci/cd", "pipeline", "monitoring", "scalability",
      "containerized", "orchestrated", "cloud"
    ],
    experienceKeywords: [
      "deployed", "automated", "infrastructure",
      "ci/cd", "monitoring", "production"
    ],
    projectTypes: [
      "ci/cd pipeline", "infrastructure", "automation",
      "monitoring", "deployment", "cloud"
    ],
    minCGPA: 7.0,
    certifications: [
      "aws certified", "kubernetes", "terraform", "linux"
    ],
    sections: {
      required: ["education", "skills", "projects", "experience"],
      recommended: ["certifications", "github", "aws"]
    }
  },

  "data-engineer": {
    id: "data-engineer",
    name: "Data Engineer",
    description: "Data pipelines, ETL, and big data roles",
    mustHaveSkills: [
      "sql", "python", "etl", "data pipeline", "database"
    ],
    goodToHaveSkills: [
      "spark", "hadoop", "airflow", "kafka", "flink",
      "python", "scala", "sql", "nosql",
      "aws", "azure", "gcp", "snowflake", "databricks",
      "postgresql", "mongodb", "redis", "elasticsearch"
    ],
    criticalKeywords: [
      "pipeline", "etl", "data warehouse", "big data",
      "stream processing", "batch processing",
      "data integration", "data quality"
    ],
    experienceKeywords: [
      "built pipeline", "etl", "data processing",
      "migrated", "integrated"
    ],
    projectTypes: [
      "data pipeline", "etl", "data warehouse",
      "streaming", "batch processing"
    ],
    minCGPA: 7.5,
    sections: {
      required: ["education", "skills", "projects", "experience"],
      recommended: ["certifications", "sql projects"]
    }
  },

  "product-manager": {
    id: "product-manager",
    name: "Product Manager / APM",
    description: "Product management and strategy roles",
    mustHaveSkills: [
      "product management", "user research", "roadmap", "metrics"
    ],
    goodToHaveSkills: [
      "agile", "scrum", "jira", "figma", "analytics",
      "sql", "python", "data analysis",
      "a/b testing", "user research", "wireframing"
    ],
    criticalKeywords: [
      "product", "roadmap", "stakeholder", "user",
      "feature", "launched", "metrics", "impact",
      "strategy", "prioritization"
    ],
    experienceKeywords: [
      "launched", "managed", "led", "product",
      "internship", "case study"
    ],
    projectTypes: [
      "product launch", "feature", "user research",
      "case study", "product strategy"
    ],
    minCGPA: 7.5,
    sections: {
      required: ["education", "experience", "projects", "skills"],
      recommended: ["case studies", "internships", "leadership"]
    }
  },

  "cybersecurity": {
    id: "cybersecurity",
    name: "Cybersecurity Engineer",
    description: "Security, penetration testing, and compliance roles",
    mustHaveSkills: [
      "security", "networking", "linux", "cryptography"
    ],
    goodToHaveSkills: [
      "penetration testing", "ethical hacking", "kali linux",
      "metasploit", "burp suite", "wireshark",
      "owasp", "vulnerability assessment", "siem",
      "splunk", "firewall", "ids/ips"
    ],
    criticalKeywords: [
      "security", "vulnerability", "penetration",
      "exploit", "threat", "compliance", "audit",
      "encryption", "authentication"
    ],
    experienceKeywords: [
      "security audit", "penetration test", "vulnerability",
      "ctf", "bug bounty"
    ],
    projectTypes: [
      "security project", "penetration testing",
      "vulnerability assessment", "secure application"
    ],
    minCGPA: 7.0,
    certifications: [
      "ceh", "oscp", "cissp", "comptia security+", "cisa"
    ],
    sections: {
      required: ["education", "skills", "projects", "certifications"],
      recommended: ["ctf", "bug bounty", "security research"]
    }
  }
};

export function getRoleProfile(roleId: string): RoleProfile | null {
  return roleProfiles[roleId] || null;
}

export function getAllRoles(): RoleProfile[] {
  return Object.values(roleProfiles);
}
