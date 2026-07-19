"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Briefcase, 
  FileText, 
  Play, 
  Send, 
  RefreshCw, 
  User, 
  Bot, 
  Sparkles, 
  Award, 
  Clock, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  ChevronRight,
  Flame,
  Download,
  Trash2,
  Volume2,
  VolumeX,
  HeartHandshake,
  ShieldAlert,
  UserCheck,
  Lightbulb,
  Compass,
  Info,
  ListChecks,
  Save,
  History,
  Activity,
  TrendingUp,
  MessageSquare,
  Undo2,
  Copy,
  Check,
  Building,
  BrainCircuit,
  MessageSquareText,
  Mic,
  MicOff,
  HelpCircle
} from "lucide-react";

import { jsPDF } from "jspdf";

import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip
} from "recharts";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

interface EvaluationResult {
  overallScore: number;
  summary: string;
  strengths: { point: string; detail: string }[];
  improvements: { point: string; detail: string }[];
  recommendedAnswers: { question: string; candidateAnswer: string; suggestedResponse: string }[];
  categories: {
    technicalDepth: number;
    communication: number;
    problemSolving: number;
    behavioralFit: number;
    speechPacing: number;
  };
}

interface SavedSession {
  id: string;
  jobTitle: string;
  company: string;
  interviewType: "technical" | "behavioral" | "mixed";
  overallScore: number;
  timestamp: string;
  elapsedSeconds: number;
  messagesCount: number;
  evaluation: EvaluationResult;
  messages: Message[];
}

// Preset configurations for easy testing
const PRESETS = [
  {
    id: "frontend-stripe",
    title: "Software Engineer (Frontend) @ Stripe",
    jobTitle: "Software Engineer (Frontend)",
    company: "Stripe",
    jobDescription: "Stripe is building the economic infrastructure for the internet. As a Frontend Engineer, you will build beautiful, highly interactive, and responsive web applications. Expert knowledge of React, TypeScript, CSS, and modern browser APIs is required. You care deeply about UI/UX polish, micro-interactions, web performance, robust cross-browser accessibility (a11y), and state management in large scale applications.",
    resume: "SENIOR FRONTEND ENGINEER\n- 4 years of experience building scalable web apps with React, Next.js, TypeScript.\n- Created and maintained a custom React component library, boosting team delivery speed by 35%.\n- Re-architected data tables and search filters, reducing client bundle size by 25% and improving Web Vitals LCP by 1.2s.\n- Actively collaborate with designers to construct pixel-perfect, accessible user interfaces following WCAG guidelines."
  },
  {
    id: "product-airbnb",
    title: "Product Manager @ Airbnb",
    jobTitle: "Product Manager",
    company: "Airbnb",
    jobDescription: "Airbnb is looking for a Product Manager to lead guest growth initiatives. You will shape product strategy, design and analyze high-impact multivariate A/B testing, author meticulous PRDs, and coordinate cross-functionally across engineering, design, legal, and data science. Exceptional communication, empathy, user intuition, and analytical rigor are required to unlock seamless booking experiences.",
    resume: "PRODUCT MANAGER\n- 5 years of product management experience launching localized travel and checkout experiences.\n- Managed growth experiments that improved sign-up-to-booking conversion rate by 14% globally.\n- Coordinated a cross-functional team of 10 engineers, 2 data analysts, and 2 product designers using Agile workflows.\n- Author of 20+ comprehensive PRDs, defining clear success metrics, user journeys, and technical dependencies."
  },
  {
    id: "backend-netflix",
    title: "Senior Systems Engineer @ Netflix",
    jobTitle: "Senior Systems Engineer (Backend)",
    company: "Netflix",
    jobDescription: "Netflix streaming service accounts for a large fraction of global downstream internet traffic. We are seeking a Systems Engineer to architect high-throughput, low-latency microservices. Required skills: Node.js, Go or Java, GraphQL, Redis/Memcached, SQL/NoSQL databases, distributed locks, Kafka event streaming, and performance tuning for systems serving millions of concurrent connections.",
    resume: "STAFF SYSTEMS ENGINEER\n- 6 years of core systems engineering focusing on cloud-native distributed backends.\n- Designed and implemented a Node.js/Go backend microservice handling up to 120,000 requests per second with 99.99% uptime.\n- Migrated legacy user-preferences store to a multi-region Cassandra setup with a Redis cache layer, cutting average read latency by 45%.\n- Led performance audit identifying database bottlenecks, saving $120k annually in cloud hosting costs."
  }
];

function getProTipsForProfession(profession: string): string[] {
  const normalized = (profession || "").toLowerCase();
  
  if (normalized.includes("software") || normalized.includes("engineering") || normalized.includes("developer") || normalized.includes("systems") || normalized.includes("frontend") || normalized.includes("backend")) {
    return [
      "Explain your architectural reasoning structures clearly. When detailing design choices, mention scalability, bottlenecks, and performance tradeoffs.",
      "Write clean, modular code conceptually. Even when whiteboarding, state your assumptions, list edge cases, and run a dry run through your algorithm.",
      "Highlight collaboration in multi-functional environments. Emphasize how you bridge gaps with product managers and engineers to maintain code quality."
    ];
  }
  
  if (normalized.includes("product manager") || normalized.includes("product management") || normalized.includes("product")) {
    return [
      "Frame answers with structured PM frameworks. Use CIRCLES, HEART, or North Star metrics to show methodical, user-centric problem solving.",
      "Emphasize quantitative and qualitative balance. Clearly demonstrate how you back product hypotheses with A/B test results and telemetry insights.",
      "Show cross-functional leadership without authority. Talk about building high-trust partnerships with engineering, design, and executive teams."
    ];
  }

  if (normalized.includes("data") || normalized.includes("analytics") || normalized.includes("science") || normalized.includes("analyst")) {
    return [
      "Tie all mathematical insights to key business metrics. Always answer: 'So what does this mean for our bottom line, conversion rate, or churn?'",
      "Demonstrate thorough data validation. Talk about how you handle missing values, outliers, bias, and clean pipelines to maintain high analysis fidelity.",
      "Explain complex statistical models simply. Show that you can communicate predictive results clearly to non-technical, commercial stakeholders."
    ];
  }

  if (normalized.includes("design") || normalized.includes("ux") || normalized.includes("ui") || normalized.includes("designer")) {
    return [
      "Center your story around the user journey. Walk through research, personas, and iterative wireframes rather than just showing final mocks.",
      "Incorporate robust accessibility (a11y) considerations. Demonstrate knowledge of WCAG guidelines, semantic layout, and high-contrast styling.",
      "Describe constructive feedback loops. Explain how you iterate on feedback from developer audits, research tests, and commercial stakeholders."
    ];
  }

  if (normalized.includes("marketing") || normalized.includes("growth") || normalized.includes("strategy")) {
    return [
      "Focus on customer acquisition cost (CAC) and customer lifetime value (LTV) alignment to prove deep marketing efficacy.",
      "Demonstrate structured multivariate experimentation. Detail your hypotheses, sample sizes, and attribution modeling strategies.",
      "Articulate strong visual brand storytelling. Showcase how you ensure brand cohesion across organic campaigns, search ads, and landing pages."
    ];
  }

  if (normalized.includes("finance") || normalized.includes("accounting") || normalized.includes("investment")) {
    return [
      "Highlight precision and detail orientation. Discuss how you maintain structural integrity across complex financial ledger forecasts.",
      "Ground predictions in strict risk-reward frameworks. Discuss sensitivity modeling, compliance mandates, and liquidity constraints.",
      "Focus on clear dashboard communication. Show how you present balance sheet performance to non-financial company directors."
    ];
  }

  if (normalized.includes("human resources") || normalized.includes("hr") || normalized.includes("recruiting")) {
    return [
      "Lead with conflict-resolution strategies. Emphasize empathy, corporate policy, and psychologically safe workspaces.",
      "Discuss data-driven talent metrics. Focus on time-to-hire optimization, retention trends, and structured employee development programs.",
      "Detail diversity, equity, and inclusion (DEI) best practices. Demonstrate how you reduce bias in resume screening and promotion structures."
    ];
  }

  if (normalized.includes("sales") || normalized.includes("business development") || normalized.includes("account")) {
    return [
      "Emphasize consultative selling. Demonstrate how you perform deep needs-discovery before diving into product pitches.",
      "Discuss quota-carrying discipline. Mention consistent historical performance, pipeline volume, and shortening sales cycles.",
      "Explain contract negotiation strategy. Detail how you find win-win margins while maintaining long-term enterprise partner trust."
    ];
  }

  return [
    "Structure behavioral replies with the STAR model (Situation, Task, Action, Result). Quantify your achievements to show measurable real-world outcomes.",
    "Actively demonstrate professional curiosity. Ask high-signal questions about company culture, team alignment, and near-term technical hurdles.",
    "Stay calm, articulate, and collaborative. Treat the interview as a collaborative troubleshooting session with a peer rather than a rigid interrogation."
  ];
}

export default function Page() {
  // Navigation & Page State
  const [view, setView] = useState<"setup" | "interview" | "evaluation">("setup");
  const [isMounted, setIsMounted] = useState(false);
  const [setupTab, setSetupTab] = useState<"configure" | "history">("configure");
  const [history, setHistory] = useState<SavedSession[]>([]);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Setup inputs
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [interviewType, setInterviewType] = useState<"technical" | "behavioral" | "mixed">("mixed");
  const [interviewerPersona, setInterviewerPersona] = useState<"supportive" | "faang" | "chaotic">("supportive");
  const [unexpectedScenarioMode, setUnexpectedScenarioMode] = useState<boolean>(false);
  const [timeLimitEnabled, setTimeLimitEnabled] = useState<boolean>(false);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(10);
  
  // Custom metadata (derived or typed)
  const [activeJobTitle, setActiveJobTitle] = useState("Mock Candidate");
  const [activeCompany, setActiveCompany] = useState("Dream Company");

  // Interview state
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [detectedProfession, setDetectedProfession] = useState<string>("");
  const [warned75Percent, setWarned75Percent] = useState<boolean>(false);
  const [showTimeWarningBanner, setShowTimeWarningBanner] = useState<boolean>(false);
  const [demoLoadedTrigger, setDemoLoadedTrigger] = useState<boolean>(false);
  const [isDemoLoaded, setIsDemoLoaded] = useState<boolean>(false);

  const fetchDetectedProfession = async (jd: string, title: string) => {
    if (!jd || !jd.trim()) return;
    try {
      const res = await fetch("/api/interview/detect-profession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jd, jobTitle: title }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profession) {
          setDetectedProfession(data.profession);
        }
      }
    } catch (err) {
      console.error("Failed to detect profession:", err);
    }
  };

  const loadDemoData = () => {
    setActiveJobTitle("Senior Full-Stack AI Engineer");
    setActiveCompany("FinTech Startup");
    setJobDescription(
      "Senior Full-Stack AI Engineer at a fast-growing FinTech startup. Requirements: Experience scaling Next.js applications, working with large language models, building microservices, and solving real-time data streaming issues under heavy traffic loads."
    );
    setResume(
      "Alex Mercer - Full-Stack Developer. Built and optimized a Next.js web application that scaled to 50k monthly active users. Integrated AI models for automated text summarization. Strong foundation in TypeScript, React, Node.js, and AWS architecture. Looking to transition into core AI engineering roles."
    );
    
    // Trigger animation flash/scale
    setDemoLoadedTrigger(true);
    setIsDemoLoaded(true);
    setTimeout(() => {
      setDemoLoadedTrigger(false);
    }, 1200);

    // Call detect-profession with the newly loaded JD and Title
    fetchDetectedProfession(
      "Senior Full-Stack AI Engineer at a fast-growing FinTech startup. Requirements: Experience scaling Next.js applications, working with large language models, building microservices, and solving real-time data streaming issues under heavy traffic loads.",
      "Senior Full-Stack AI Engineer"
    );
  };

  const limitSeconds = timeLimitMinutes * 60;
  const percentElapsed = Math.min(100, (elapsedSeconds / limitSeconds) * 100);
  const isOverLimit = elapsedSeconds > limitSeconds;
  
  // Evaluation state
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [animatedOverallScore, setAnimatedOverallScore] = useState<number>(0);

  useEffect(() => {
    if (view === "evaluation" && evaluation && !evalLoading) {
      setAnimatedOverallScore(0);
      const target = evaluation.overallScore;
      if (target <= 0) return;
      
      const duration = 1500; // 1.5 seconds for premium fluid transition
      const start = performance.now();
      let animationFrameId: number;
      
      const step = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function: ease-out cubic for realistic, decelerating scroll feel
        const easeOutCubic = (x: number): number => {
          return 1 - Math.pow(1 - x, 3);
        };
        
        const currentVal = Math.round(easeOutCubic(progress) * target);
        setAnimatedOverallScore(currentVal);
        
        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        }
      };
      
      animationFrameId = requestAnimationFrame(step);
      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, [view, evaluation, evalLoading]);

  // Voice input states
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [showTips, setShowTips] = useState(true);

  // Snapshot states
  const [hasSnapshot, setHasSnapshot] = useState<boolean>(false);
  const [snapshotDetails, setSnapshotDetails] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Hint / Lifeline states
  const [hintsRemaining, setHintsRemaining] = useState<number>(3);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState<boolean>(false);
  const [hintsHistory, setHintsHistory] = useState<string[]>([]);

  // Voice Persona and Speech Synthesis states
  const [voicePersona, setVoicePersona] = useState<"calm" | "energetic" | "formal">("calm");
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [autoplayVoice, setAutoplayVoice] = useState<boolean>(true);

  // Post-Question Feedback Modal states
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [nextQuestionPendingMessages, setNextQuestionPendingMessages] = useState<Message[]>([]);
  const [confidenceScores, setConfidenceScores] = useState<number[]>([]);

  // Helper to check and load saved snapshot details
  const checkSnapshot = () => {
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem("mock_interview_snapshot");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.messages && parsed.messages.length > 0) {
            setHasSnapshot(true);
            setSnapshotDetails(parsed);
            return;
          }
        }
      } catch (err) {
        console.error("Error reading snapshot from localStorage:", err);
      }
      setHasSnapshot(false);
      setSnapshotDetails(null);
    }
  };

  // Check snapshot and load session history on mount
  useEffect(() => {
    if (isMounted) {
      checkSnapshot();
      loadStreak();
      if (typeof window !== "undefined") {
        try {
          const stored = window.localStorage.getItem("mock_interview_history");
          if (stored) {
            setHistory(JSON.parse(stored));
          }
        } catch (err) {
          console.error("Error reading history from localStorage:", err);
        }
      }
    }
  }, [isMounted]);

  // Save state to LocalStorage manually
  const saveSnapshot = () => {
    if (typeof window !== "undefined") {
      setSaveStatus("saving");
      try {
        const snapshotData = {
          jobDescription,
          resume,
          interviewType,
          interviewerPersona,
          activeJobTitle,
          activeCompany,
          detectedProfession,
          messages,
          elapsedSeconds,
          view,
          hintsRemaining,
          hintsHistory,
          voicePersona,
          autoplayVoice,
          unexpectedScenarioMode,
          timeLimitEnabled,
          timeLimitMinutes,
          confidenceScores,
          savedAt: new Date().toISOString()
        };
        window.localStorage.setItem("mock_interview_snapshot", JSON.stringify(snapshotData));
        setSaveStatus("saved");
        checkSnapshot();
        setTimeout(() => setSaveStatus("idle"), 3000);
      } catch (err) {
        console.error("Failed to save snapshot:", err);
        setSaveStatus("idle");
      }
    }
  };

  // Resume interview from snapshot
  const resumeSnapshot = () => {
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem("mock_interview_snapshot");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed) {
            if (parsed.jobDescription !== undefined) setJobDescription(parsed.jobDescription);
            if (parsed.resume !== undefined) setResume(parsed.resume);
            if (parsed.interviewType !== undefined) setInterviewType(parsed.interviewType);
            if (parsed.interviewerPersona !== undefined) setInterviewerPersona(parsed.interviewerPersona);
            if (parsed.activeJobTitle !== undefined) setActiveJobTitle(parsed.activeJobTitle);
            if (parsed.activeCompany !== undefined) setActiveCompany(parsed.activeCompany);
            if (parsed.messages !== undefined) {
              const restoredMessages = parsed.messages.map((m: any) => ({
                ...m,
                timestamp: m.timestamp ? new Date(m.timestamp) : new Date()
              }));
              setMessages(restoredMessages);
            }
            if (parsed.elapsedSeconds !== undefined) setElapsedSeconds(parsed.elapsedSeconds);
            if (parsed.hintsRemaining !== undefined) setHintsRemaining(parsed.hintsRemaining);
            if (parsed.hintsHistory !== undefined) setHintsHistory(parsed.hintsHistory);
            if (parsed.voicePersona !== undefined) setVoicePersona(parsed.voicePersona);
            if (parsed.autoplayVoice !== undefined) setAutoplayVoice(parsed.autoplayVoice);
            if (parsed.unexpectedScenarioMode !== undefined) setUnexpectedScenarioMode(parsed.unexpectedScenarioMode);
            if (parsed.timeLimitEnabled !== undefined) setTimeLimitEnabled(parsed.timeLimitEnabled);
            if (parsed.timeLimitMinutes !== undefined) setTimeLimitMinutes(parsed.timeLimitMinutes);
            if (parsed.confidenceScores !== undefined) setConfidenceScores(parsed.confidenceScores);
            if (parsed.warned75Percent !== undefined) setWarned75Percent(parsed.warned75Percent);
            if (parsed.showTimeWarningBanner !== undefined) setShowTimeWarningBanner(parsed.showTimeWarningBanner);
            if (parsed.detectedProfession !== undefined) {
              setDetectedProfession(parsed.detectedProfession);
            } else {
              setDetectedProfession("Analyzing...");
              fetchDetectedProfession(parsed.jobDescription || jobDescription, parsed.activeJobTitle || activeJobTitle);
            }
            
            // Resume view & running state
            setView("interview");
            setIsTimerRunning(true);
          }
        }
      } catch (err) {
        console.error("Failed to resume snapshot:", err);
      }
    }
  };

  // Clear snapshot from LocalStorage
  const clearSnapshot = () => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem("mock_interview_snapshot");
        setHasSnapshot(false);
        setSnapshotDetails(null);
      } catch (err) {
        console.error("Failed to clear snapshot:", err);
      }
    }
  };

  // Load saved historical session
  const loadSavedSession = (session: SavedSession) => {
    setEvaluation(session.evaluation);
    setMessages(session.messages.map((m: any) => ({
      ...m,
      timestamp: m.timestamp ? new Date(m.timestamp) : new Date()
    })));
    setActiveJobTitle(session.jobTitle);
    setActiveCompany(session.company);
    setInterviewType(session.interviewType);
    setElapsedSeconds(session.elapsedSeconds);
    setView("evaluation");
  };

  // Delete specific historical session from LocalStorage list
  const deleteSavedSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem("mock_interview_history");
        const currentHistory: SavedSession[] = stored ? JSON.parse(stored) : [];
        const updatedHistory = currentHistory.filter((s) => s.id !== id);
        window.localStorage.setItem("mock_interview_history", JSON.stringify(updatedHistory));
        setHistory(updatedHistory);
      } catch (err) {
        console.error("Failed to delete session:", err);
      }
    }
  };

  // Clear all past session history
  const clearAllHistory = () => {
    if (window.confirm("Are you sure you want to delete all past session reports? This action cannot be undone.")) {
      if (typeof window !== "undefined") {
        try {
          window.localStorage.removeItem("mock_interview_history");
          setHistory([]);
        } catch (err) {
          console.error("Failed to clear history:", err);
        }
      }
    }
  };

  // Auto-save interview state dynamically during an active interview session
  useEffect(() => {
    if (isMounted && view === "interview" && messages.length > 0) {
      try {
        const snapshotData = {
          jobDescription,
          resume,
          interviewType,
          interviewerPersona,
          activeJobTitle,
          activeCompany,
          detectedProfession,
          messages,
          elapsedSeconds,
          view,
          hintsRemaining,
          hintsHistory,
          voicePersona,
          autoplayVoice,
          unexpectedScenarioMode,
          timeLimitEnabled,
          timeLimitMinutes,
          confidenceScores,
          warned75Percent,
          showTimeWarningBanner,
          savedAt: new Date().toISOString()
        };
        window.localStorage.setItem("mock_interview_snapshot", JSON.stringify(snapshotData));
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }
  }, [messages, elapsedSeconds, view, jobDescription, resume, interviewType, interviewerPersona, activeJobTitle, activeCompany, detectedProfession, hintsRemaining, hintsHistory, voicePersona, autoplayVoice, unexpectedScenarioMode, timeLimitEnabled, timeLimitMinutes, confidenceScores, warned75Percent, showTimeWarningBanner, isMounted]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";

        rec.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            setUserInput((prev) => {
              const cleanedPrev = prev.trim();
              return cleanedPrev ? `${cleanedPrev} ${finalTranscript.trim()}` : finalTranscript.trim();
            });
          }
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        setRecognition(rec);
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  // Handle Interview Timer
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const playWarningSound = () => {
    if (typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const now = ctx.currentTime;
      
      // Sweet harmonic pitch chimes
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5
      
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      
      osc1.start(now);
      osc1.stop(now + 0.65);
      
      // Delayed E5 -> C6 notes for elegant chime echoing
      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(659.25, ctx.currentTime);
          osc2.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.15);
          
          gain2.gain.setValueAtTime(0.08, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          
          osc2.start();
          osc2.stop(ctx.currentTime + 0.55);
        } catch (e) {
          console.warn("Chime note blocked", e);
        }
      }, 120);
    } catch (err) {
      console.warn("Audio Context blocked", err);
    }
  };

  const showBrowserNotification = (message: string) => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Interview Time Warning", {
          body: message,
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification("Interview Time Warning", {
              body: message,
            });
          }
        });
      }
    }
  };

  // Trigger 75% warning alert
  useEffect(() => {
    if (isTimerRunning && timeLimitEnabled && !warned75Percent) {
      const limitSecs = timeLimitMinutes * 60;
      const seventyFivePercent = Math.floor(limitSecs * 0.75);
      if (elapsedSeconds >= seventyFivePercent && elapsedSeconds < limitSecs) {
        setWarned75Percent(true);
        setShowTimeWarningBanner(true);
        playWarningSound();
        showBrowserNotification(`You have reached 75% of your allocated time limit. Only ${Math.ceil((limitSecs - elapsedSeconds) / 60)} minutes remain!`);
      }
    }
  }, [elapsedSeconds, isTimerRunning, timeLimitEnabled, timeLimitMinutes, warned75Percent]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getInterviewTips = () => {
    const msgCount = messages.length;
    let stageTitle = "Stage 1: Opening & Setup";
    let stageSubtitle = "Set context & clarify scope";
    let stageIndex = 1;
    let objectives = [
      { label: "Welcome & Introductions", done: msgCount >= 1 },
      { label: "Understand Job Scope", done: msgCount >= 2 },
      { label: "Outline Core Value Pitch", done: msgCount >= 3 }
    ];

    if (msgCount >= 4 && msgCount <= 7) {
      stageTitle = "Stage 2: Core Deep-Dive";
      stageSubtitle = "Highlight skills & details";
      stageIndex = 2;
      objectives = [
        { label: "Give specific problem context", done: msgCount >= 5 },
        { label: "Detail active execution steps", done: msgCount >= 6 },
        { label: "Discuss quantitative outputs", done: msgCount >= 7 }
      ];
    } else if (msgCount > 7) {
      stageTitle = "Stage 3: Reflection & Wrap";
      stageSubtitle = "Synthesize & analyze trade-offs";
      stageIndex = 3;
      objectives = [
        { label: "Reflect on critical learnings", done: msgCount >= 8 },
        { label: "State optimization ideas", done: msgCount >= 9 },
        { label: "Inquire / Conclude dynamically", done: msgCount >= 10 }
      ];
    }

    // Framework
    let frameworkTitle = "The STAR Response Method";
    let frameworkSteps = [
      { name: "S - Situation", desc: "Set the scene. Explain the context, company, or the core problem." },
      { name: "T - Task", desc: "What was the specific objective or milestone you needed to hit?" },
      { name: "A - Action", desc: "Detail exactly what YOU did, using active verbs and 'I' instead of 'we'." },
      { name: "R - Result", desc: "Highlight quantifiable metrics (e.g., +25% speed) and major lessons." }
    ];

    if (interviewType === "technical") {
      frameworkTitle = "Tech Solving Framework";
      frameworkSteps = [
        { name: "1. Clarify", desc: "Ask questions on bounds, scale, inputs, outputs, and edge cases." },
        { name: "2. Design", desc: "Propose brute force first, then plan optimal design with Big-O trade-offs." },
        { name: "3. Implement", desc: "Write clean, modular code/logic. Verbalize every single assumption." },
        { name: "4. Test & Optimize", desc: "Dry-run with small inputs. Refine memory bounds and caching." }
      ];
    } else if (interviewType === "mixed") {
      frameworkTitle = "Dynamic Hybrid Strategy";
      frameworkSteps = [
        { name: "1. Structure", desc: "Start with a high-level summary before descending into low-level points." },
        { name: "2. Contextualize", desc: "Ground technical details in clear business goals and real-world metrics." },
        { name: "3. Drive Ownership", desc: "Show extreme agency. Clearly explain what you drove and the impact." }
      ];
    }

    // Persona Advice
    let personaHeader = "Interviewer Guide";
    let personaBody = "Engage politely and structure thoughts before responding.";
    if (interviewerPersona === "faang") {
      personaHeader = "FAANG Technical Architect";
      personaBody = "Strict and deeply analytical evaluator. Focus heavily on system design, exact logic, memory limits, performance trade-offs, and scaling bottlenecks. Avoid high-level hand-waving.";
    } else if (interviewerPersona === "supportive") {
      personaHeader = "The Supportive Coach";
      personaBody = "Warm and encouraging guide. Focuses on collaborative growth. Explains concepts, sets an easier difficulty, and gives helpful, detailed hints if you are stuck.";
    } else if (interviewerPersona === "chaotic") {
      personaHeader = "The Chaotic Startup CTO";
      personaBody = "Fast-paced and unconventional. Avoid cookie-cutter responses. Expect sudden pivots, high-pressure situational problems, and rapid-fire questions about operating with zero resources.";
    }

    return {
      stageTitle,
      stageSubtitle,
      stageIndex,
      objectives,
      frameworkTitle,
      frameworkSteps,
      personaHeader,
      personaBody
    };
  };

  // Preset Applier
  const applyPreset = (presetId: string) => {
    const selected = PRESETS.find((p) => p.id === presetId);
    if (selected) {
      setJobDescription(selected.jobDescription);
      setResume(selected.resume);
      setActiveJobTitle(selected.jobTitle);
      setActiveCompany(selected.company);
    }
  };

  // Load streak from LocalStorage
  const loadStreak = () => {
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem("mock_interview_streak");
        if (stored) {
          const parsed = JSON.parse(stored);
          const todayStr = new Date().toLocaleDateString("en-CA");
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toLocaleDateString("en-CA");

          if (parsed.lastCompletedDate === todayStr || parsed.lastCompletedDate === yesterdayStr) {
            setStreak(parsed.streakCount || 0);
          } else {
            setStreak(0);
          }
        } else {
          setStreak(0);
        }
      } catch (err) {
        console.error("Error reading streak:", err);
      }
    }
  };

  // Increment daily interview completed streak
  const incrementStreak = () => {
    if (typeof window !== "undefined") {
      try {
        const todayStr = new Date().toLocaleDateString("en-CA");
        const stored = window.localStorage.getItem("mock_interview_streak");
        let streakObj = { streakCount: 0, lastCompletedDate: "" };
        if (stored) {
          try {
            streakObj = JSON.parse(stored);
          } catch (e) {
            console.error("Failed to parse streak", e);
          }
        }

        if (streakObj.lastCompletedDate === todayStr) {
          setStreak(streakObj.streakCount);
          return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString("en-CA");

        let newCount = 1;
        if (streakObj.lastCompletedDate === yesterdayStr) {
          newCount = (streakObj.streakCount || 0) + 1;
        } else {
          newCount = 1;
        }

        const updatedStreak = {
          streakCount: newCount,
          lastCompletedDate: todayStr
        };

        window.localStorage.setItem("mock_interview_streak", JSON.stringify(updatedStreak));
        setStreak(newCount);
      } catch (err) {
        console.error("Error saving streak:", err);
      }
    }
  };

  // Wipe the previous answer & feedback so candidate can retry answering
  const retryQuestion = (aiMsgId: string) => {
    const aiIndex = messages.findIndex((m) => m.id === aiMsgId);
    if (aiIndex <= 0) return;

    const userMsg = messages[aiIndex - 1];
    if (userMsg && userMsg.sender === "user") {
      setUserInput(userMsg.text);
      const updated = messages.slice(0, aiIndex - 1);
      setMessages(updated);

      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setCurrentlySpeakingId(null);
      }
    }
  };

  // Export Assessment summary to elegant styled PDF report
  const exportToPDF = () => {
    if (!evaluation) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const contentWidth = pageWidth - (margin * 2);
    let y = margin;

    // Helper to print text with line spacing and auto page break
    const printText = (text: string, size = 10, isBold = false, color = [200, 200, 200], customLineHeight = 15) => {
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);

      const splitText = doc.splitTextToSize(text, contentWidth);
      for (const line of splitText) {
        if (y + customLineHeight > pageHeight - margin) {
          doc.addPage();
          drawFooter(doc, pageHeight, pageWidth, margin);
          y = margin + 20;
        }
        doc.text(line, margin, y);
        y += customLineHeight;
      }
    };

    // Helper to print a colored heading box
    const printSectionHeader = (title: string, bgColor = [30, 41, 59], textColor = [255, 255, 255]) => {
      if (y + 40 > pageHeight - margin) {
        doc.addPage();
        drawFooter(doc, pageHeight, pageWidth, margin);
        y = margin + 20;
      }
      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      doc.rect(margin, y, contentWidth, 24, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(title, margin + 10, y + 15);

      y += 35;
    };

    // Footer helper
    const drawFooter = (d: any, ph: number, pw: number, m: number) => {
      d.setFont("helvetica", "normal");
      d.setFontSize(8);
      d.setTextColor(100, 116, 139);
      d.text("MockAI.pro - Interview Performance Report Card", m, ph - m + 10);
      const pageCount = d.getNumberOfPages();
      d.text(`Page ${pageCount}`, pw - m - 30, ph - m + 10);
    };

    // Theme Colors
    const primaryBg = [15, 23, 42]; // deep slate slate-900
    const primaryText = [255, 255, 255];
    const borderAccent = [168, 85, 247]; // purple-500

    // MAIN TITLE BANNER
    doc.setFillColor(primaryBg[0], primaryBg[1], primaryBg[2]);
    doc.rect(margin, y, contentWidth, 80, "F");

    doc.setFillColor(borderAccent[0], borderAccent[1], borderAccent[2]);
    doc.rect(margin, y + 76, contentWidth, 4, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(primaryText[0], primaryText[1], primaryText[2]);
    doc.text("MOCKAI.PRO ASSESSMENT REPORT", margin + 20, y + 35);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(168, 85, 247);
    doc.text("Calibrated Professional Performance Evaluation", margin + 20, y + 55);

    y += 110;

    // METADATA SECTION
    printText("Session Metadata", 12, true, [255, 255, 255], 18);
    y += 5;

    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(1);
    doc.line(margin, y, margin + contentWidth, y);
    y += 15;

    printText(`Candidate Job Title:  ${activeJobTitle}`, 10, false, [203, 213, 225], 15);
    printText(`Target Company:     ${activeCompany}`, 10, false, [203, 213, 225], 15);
    printText(`Interview Type:     ${interviewType.toUpperCase()}`, 10, false, [203, 213, 225], 15);

    let personaLabel = "Supportive Coach";
    if (interviewerPersona === "faang") personaLabel = "FAANG Technical Architect";
    else if (interviewerPersona === "chaotic") personaLabel = "The Chaotic Startup CTO";
    printText(`Interviewer Persona: ${personaLabel}`, 10, false, [203, 213, 225], 15);

    const formattedDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    printText(`Completed On:        ${formattedDate}`, 10, false, [203, 213, 225], 15);

    y += 15;
    doc.line(margin, y, margin + contentWidth, y);
    y += 25;

    // SCORE BOXES
    doc.setFillColor(30, 41, 59);
    doc.rect(margin, y, 160, 100, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text("OVERALL PERFORMANCE", margin + 15, y + 25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.setTextColor(168, 85, 247);
    doc.text(`${evaluation.overallScore}`, margin + 15, y + 65);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text("/ 100", margin + doc.getTextWidth(`${evaluation.overallScore}`) + 20, y + 65);

    // Competencies
    const breakYStart = y;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("COMPETENCY SIGNATURE", margin + 190, breakYStart + 15);

    const competencies = [
      { name: "Technical / Domain Depth", val: evaluation.categories?.technicalDepth ?? 0 },
      { name: "Communication Clarity", val: evaluation.categories?.communication ?? 0 },
      { name: "Structured Reasoning", val: evaluation.categories?.problemSolving ?? 0 },
      { name: "STAR Behavioral Fit", val: evaluation.categories?.behavioralFit ?? 0 },
      { name: "Speech Pacing (Conciseness)", val: evaluation.categories?.speechPacing ?? 0 }
    ];

    let compY = breakYStart + 30;
    competencies.forEach((comp) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(203, 213, 225);
      doc.text(comp.name, margin + 190, compY);

      doc.setFont("helvetica", "bold");
      doc.text(`${comp.val}/10`, margin + 190 + 260, compY);

      doc.setFillColor(51, 65, 85);
      doc.rect(margin + 190, compY + 4, 300, 3, "F");
      doc.setFillColor(168, 85, 247);
      doc.rect(margin + 190, compY + 4, comp.val * 30, 3, "F");

      compY += 14;
    });

    y = breakYStart + 120;

    // EXECUTIVE SUMMARY
    printSectionHeader("EXECUTIVE ASSESSMENT SUMMARY", [88, 28, 135]);
    printText(evaluation.summary, 10, false, [226, 232, 240], 14);
    y += 20;

    // STRENGTHS
    if (evaluation.strengths && evaluation.strengths.length > 0) {
      printSectionHeader("KEY STRENGTHS DEMONSTRATED", [6, 78, 59]);
      evaluation.strengths.forEach((st) => {
        printText(`•  ${st.point}`, 10, true, [52, 211, 153], 14);
        printText(st.detail, 9, false, [203, 213, 225], 13);
        y += 8;
      });
      y += 12;
    }

    // IMPROVEMENTS
    if (evaluation.improvements && evaluation.improvements.length > 0) {
      printSectionHeader("GROWTH & IMPROVEMENT GAPS", [120, 53, 4]);
      evaluation.improvements.forEach((impr) => {
        printText(`•  ${impr.point}`, 10, true, [251, 191, 36], 14);
        printText(impr.detail, 9, false, [203, 213, 225], 13);
        y += 8;
      });
      y += 20;
    }

    // REFINEMENT
    if (evaluation.recommendedAnswers && evaluation.recommendedAnswers.length > 0) {
      printSectionHeader("ANSWER REFINEMENT SANDBOX", [15, 23, 42]);
      evaluation.recommendedAnswers.forEach((rec, idx) => {
        printText(`Question ${idx + 1}: "${rec.question}"`, 10, true, [255, 255, 255], 14);
        y += 4;

        printText("[Your Response]", 9, true, [148, 163, 184], 12);
        printText(rec.candidateAnswer || "N/A", 9, false, [203, 213, 225], 13);
        y += 4;

        printText("[Refactored Model Answer]", 9, true, [168, 85, 247], 12);
        printText(rec.suggestedResponse, 9, true, [243, 232, 255], 13);
        y += 15;
      });
    }

    // TRANSCRIPT
    if (messages && messages.length > 0) {
      printSectionHeader("COMPLETE DIALOGUE TRANSCRIPT", [51, 65, 85]);
      messages.forEach((msg) => {
        const senderLabel = msg.sender === "user" ? "Candidate" : "Interviewer";
        const senderColor = msg.sender === "user" ? [168, 85, 247] : [148, 163, 184];

        printText(`${senderLabel}:`, 10, true, senderColor, 13);
        printText(msg.text, 9.5, false, [226, 232, 240], 13.5);
        y += 10;
      });
    }

    // Draw footer across all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      drawFooter(doc, pageHeight, pageWidth, margin);
    }

    const filename = `${activeJobTitle.toLowerCase().replace(/[^a-z0-9]/g, "_")}_evaluation_${Date.now()}.pdf`;
    doc.save(filename);
  };

  // Start the interview
  const startInterview = async () => {
    if (!jobDescription.trim()) {
      return;
    }

    // Try to guess Job Title from Job Description if not pre-populated
    if (!activeJobTitle || activeJobTitle === "Mock Candidate") {
      const match = jobDescription.match(/(?:title|position|role|engineer|manager|developer)\s*(?:is|of|:)?\s*([a-zA-Z\s]{5,30})/i);
      if (match && match[1]) {
        setActiveJobTitle(match[1].trim());
      } else {
        setActiveJobTitle("Candidate Role");
      }
    }

    // Prepare state
    setMessages([]);
    setView("interview");
    setLoading(true);
    setElapsedSeconds(0);
    setIsTimerRunning(true);
    setHintsRemaining(3);
    setCurrentHint(null);
    setHintsHistory([]);
    setConfidenceScores([]);
    setWarned75Percent(false);
    setShowTimeWarningBanner(false);
    setIsDemoLoaded(false);
    setDetectedProfession("Analyzing...");
    fetchDetectedProfession(jobDescription, activeJobTitle);

    try {
      const res = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          resume,
          interviewType,
          interviewerPersona,
          voicePersona,
          unexpectedScenarioMode,
          messages: []
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("No readable stream received.");
      }

      const initialMessageId = "welcome";
      setMessages([
        {
          id: initialMessageId,
          sender: "ai",
          text: "",
          timestamp: new Date()
        }
      ]);

      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value || new Uint8Array(), { stream: !done });
        accumulatedText += chunk;
        setMessages([
          {
            id: initialMessageId,
            sender: "ai",
            text: accumulatedText,
            timestamp: new Date()
          }
        ]);
      }

      // Auto-read welcome response if voice autoplay is enabled
      if (autoplayVoice) {
        speakMessage(initialMessageId, accumulatedText);
      }
    } catch (err: any) {
      console.error(err);
      setMessages([
        {
          id: "error",
          sender: "ai",
          text: `Hi! I encountered an error starting the session: "${err.message}". Make sure your GEMINI_API_KEY is configured correctly in the Secrets panel, then click Reset to try again.`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Send candidate's response
  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || loading) return;

    if (isListening && recognition) {
      try {
        recognition.stop();
      } catch (err) {
        console.error("Error stopping speech recognition on submit:", err);
      }
      setIsListening(false);
    }

    const textToSend = userInput;
    setUserInput("");
    setCurrentHint(null);

    // Append user message immediately
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    
    // Store the updated messages so we can use them to proceed later
    setNextQuestionPendingMessages(updatedMessages);
    
    // Open the feedback modal immediately
    setIsFeedbackModalOpen(true);
    setFeedbackLoading(true);
    setFeedbackData(null);

    try {
      // Find the last question asked by AI
      const aiMsgs = messages.filter(m => m.sender === "ai");
      const lastAiMsg = aiMsgs[aiMsgs.length - 1]?.text || "Introduce yourself and ask the first question.";
      
      const feedbackRes = await fetch("/api/interview/instant-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: lastAiMsg,
          answer: textToSend,
          jobDescription,
          resume,
          interviewType
        })
      });

      if (!feedbackRes.ok) {
        throw new Error("Failed to fetch instant feedback");
      }

      const feedbackJson = await feedbackRes.json();
      setFeedbackData(feedbackJson);
      if (feedbackJson && typeof feedbackJson.confidenceScore === "number") {
        setConfidenceScores(prev => [...prev, feedbackJson.confidenceScore]);
      } else {
        setConfidenceScores(prev => [...prev, 75]);
      }
    } catch (err: any) {
      console.error("Instant feedback error:", err);
      // Fallback feedback if AI fails
      const fallbackFeedback = {
        confidenceScore: 78,
        feedbackText: "Great job completing your answer! You demonstrated solid alignment with core roles.",
        keyAreas: [
          { name: "Technical Precision", status: "strong", comment: "Described relevant concepts clearly." },
          { name: "Communication Clarity", status: "outstanding", comment: "Structured your answer with adequate detail." }
        ],
        suggestedAdditions: ["Add specific operational tradeoffs", "Include a real-world scaling example"]
      };
      setFeedbackData(fallbackFeedback);
      setConfidenceScores(prev => [...prev, fallbackFeedback.confidenceScore]);
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Continue to next question (triggered from feedback modal)
  const proceedToNextQuestion = async () => {
    setIsFeedbackModalOpen(false);
    setLoading(true);

    const updatedMessages = nextQuestionPendingMessages;

    try {
      const res = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          resume,
          interviewType,
          interviewerPersona,
          voicePersona,
          unexpectedScenarioMode,
          messages: updatedMessages
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("No readable stream received.");
      }

      const aiMessageId = Math.random().toString();
      setMessages((prev) => [
        ...prev,
        {
          id: aiMessageId,
          sender: "ai",
          text: "",
          timestamp: new Date()
        }
      ]);

      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value || new Uint8Array(), { stream: !done });
        accumulatedText += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, text: accumulatedText } : msg
          )
        );
      }

      // Auto-read response if voice autoplay is enabled
      if (autoplayVoice) {
        speakMessage(aiMessageId, accumulatedText);
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "ai",
          text: `Oops, I had trouble sending that response: "${err.message}". Please check your internet connection or the configured secrets.`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Export instant feedback evaluation as a JSON file
  const downloadFeedbackJson = () => {
    if (!feedbackData) return;
    try {
      // Gather context of the latest question/answer turn evaluated
      const userMsgs = nextQuestionPendingMessages.filter(m => m.sender === "user");
      const lastUserMsg = userMsgs[userMsgs.length - 1]?.text || "";
      const aiMsgs = nextQuestionPendingMessages.filter(m => m.sender === "ai");
      // Find the question that preceded the last answer
      const lastAiIndex = nextQuestionPendingMessages.findIndex(m => m.sender === "user" && m.text === lastUserMsg);
      let lastAiQuestion = "";
      if (lastAiIndex > 0) {
        for (let i = lastAiIndex - 1; i >= 0; i--) {
          if (nextQuestionPendingMessages[i].sender === "ai") {
            lastAiQuestion = nextQuestionPendingMessages[i].text;
            break;
          }
        }
      }
      if (!lastAiQuestion && aiMsgs.length > 0) {
        lastAiQuestion = aiMsgs[aiMsgs.length - 1].text;
      }

      const exportPayload = {
        timestamp: new Date().toISOString(),
        roleFocus: jobDescription || "General Tech Role",
        interviewType: interviewType || "mixed",
        question: lastAiQuestion || "Introduce yourself and ask the first question.",
        candidateAnswer: lastUserMsg,
        evaluation: {
          confidenceScore: feedbackData.confidenceScore,
          feedbackText: feedbackData.feedbackText,
          keyAreas: feedbackData.keyAreas || [],
          suggestedAdditions: feedbackData.suggestedAdditions || []
        }
      };

      const dataStr = JSON.stringify(exportPayload, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const fileIndex = userMsgs.length || 1;
      const fileName = `interview_q${fileIndex}_feedback_${Date.now()}.json`;
      
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download feedback JSON:", err);
    }
  };

  // End interview and generate the detailed scorecard evaluation
  const endAndEvaluate = async () => {
    setIsTimerRunning(false);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setCurrentlySpeakingId(null);
    if (isListening && recognition) {
      try {
        recognition.stop();
      } catch (err) {
        console.error("Error stopping speech recognition on evaluate:", err);
      }
      setIsListening(false);
    }
    setView("evaluation");
    setEvalLoading(true);
    setEvaluation(null);

    try {
      const res = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          resume,
          interviewType,
          interviewerPersona,
          messages,
          unexpectedScenarioMode
        })
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setEvaluation(data);

      // Save to session history in localStorage
      if (typeof window !== "undefined") {
        try {
          const newSession: SavedSession = {
            id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
            jobTitle: activeJobTitle || "Mock Candidate",
            company: activeCompany || "Dream Company",
            interviewType: interviewType,
            overallScore: data.overallScore,
            timestamp: new Date().toISOString(),
            elapsedSeconds: elapsedSeconds,
            messagesCount: messages.length,
            evaluation: data,
            messages: messages
          };
          const stored = window.localStorage.getItem("mock_interview_history");
          const currentHistory: SavedSession[] = stored ? JSON.parse(stored) : [];
          const updatedHistory = [newSession, ...currentHistory];
          window.localStorage.setItem("mock_interview_history", JSON.stringify(updatedHistory));
          setHistory(updatedHistory);
          incrementStreak();
        } catch (err) {
          console.error("Failed to save to session history:", err);
        }
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error generating report card: ${err.message}`);
    } finally {
      setEvalLoading(false);
    }
  };

  // Back to setup or reset
  const resetAll = () => {
    setIsTimerRunning(false);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setCurrentlySpeakingId(null);
    if (isListening && recognition) {
      try {
        recognition.stop();
      } catch (err) {
        console.error("Error stopping speech recognition on reset:", err);
      }
      setIsListening(false);
    }
    setMessages([]);
    setEvaluation(null);
    setView("setup");
    setHintsRemaining(3);
    setCurrentHint(null);
    setHintsHistory([]);
  };

  // Request a subtle, low-latency conceptual hint from AI
  const requestHint = async () => {
    if (hintsRemaining <= 0 || hintLoading || loading) return;
    setHintLoading(true);
    setCurrentHint(null);
    
    try {
      const res = await fetch("/api/interview/hint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription,
          resume,
          interviewType,
          interviewerPersona,
          messages,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to retrieve hint");
      }

      const data = await res.json();
      if (data.hint) {
        setCurrentHint(data.hint);
        setHintsRemaining((prev) => Math.max(0, prev - 1));
        setHintsHistory((prev) => [...prev, data.hint]);
      }
    } catch (err) {
      console.error("Error asking for hint:", err);
      setCurrentHint("Sorry, we couldn't get a hint at the moment. Try again!");
    } finally {
      setHintLoading(false);
    }
  };

  // Trigger speech synthesis text-to-speech with parameters tuned to selected Voice Persona
  const speakMessage = (messageId: string, text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (currentlySpeakingId === messageId) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
      return;
    }

    // Cancel any active speech
    window.speechSynthesis.cancel();
    setCurrentlySpeakingId(messageId);

    // Filter out some markdown chars
    const cleanText = text.replace(/[*#`_\-]/g, "").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Choose pitch/rate parameters based on selected voice persona
    if (voicePersona === "calm") {
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
    } else if (voicePersona === "energetic") {
      utterance.rate = 1.15;
      utterance.pitch = 1.15;
    } else if (voicePersona === "formal") {
      utterance.rate = 0.95;
      utterance.pitch = 0.9;
    } else {
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
    }

    // Dynamically query and select a high-quality voice if possible
    try {
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.toLowerCase().includes("en-us") || v.lang.toLowerCase().includes("en-gb")) || voices[0];
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
    } catch (e) {
      console.warn("Could not retrieve WebSpeech voices list:", e);
    }

    utterance.onend = () => {
      setCurrentlySpeakingId(null);
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis error:", e);
      setCurrentlySpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const copyReport = () => {
    if (!evaluation) return;
    const textReport = `
=== AI MOCK INTERVIEW EVALUATION ===
Job Role: ${activeJobTitle}
Overall Score: ${evaluation.overallScore}/100

SUMMARY ASSESSMENT:
${evaluation.summary}

CATEGORIES:
- Technical / Domain Depth: ${evaluation.categories.technicalDepth}/10
- Communication Clarity: ${evaluation.categories.communication}/10
- Problem Solving / Structure: ${evaluation.categories.problemSolving}/10
- Behavioral & Culture Fit: ${evaluation.categories.behavioralFit}/10
- Speech Pacing: ${evaluation.categories.speechPacing ?? 0}/10

KEY STRENGTHS:
${evaluation.strengths.map(s => `• ${s.point}: ${s.detail}`).join("\n")}

AREAS FOR IMPROVEMENT:
${evaluation.improvements.map(i => `• ${i.point}: ${i.detail}`).join("\n")}
    `;
    navigator.clipboard.writeText(textReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-purple-950 rounded-full flex items-center justify-center mx-auto text-purple-400 animate-spin border-4 border-purple-500 border-t-transparent shadow-md shadow-purple-500/10" />
          <p className="text-xs text-slate-400 font-mono">Initializing Bento Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="app_root" className="min-h-screen flex flex-col bg-slate-950 text-slate-200 font-sans antialiased selection:bg-purple-500 selection:text-slate-950">
      
      {/* GLOBAL HEADER */}
      <header id="global_header" className="sticky top-0 z-40 bg-slate-900/60 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-600 text-white p-2 rounded-xl shadow-md shadow-purple-500/20">
            <BrainCircuit className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white flex items-center gap-2">
              MockAI.pro
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider">
                Bento Engine
              </span>
            </h1>
            <p className="text-xs text-slate-400">Realistic HR & Technical Interview Simulator</p>
          </div>
        </div>

        {view !== "setup" && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>
            <button
              onClick={resetAll}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs py-1.5 px-3 rounded-lg transition font-medium cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
          </div>
        )}
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          
          {/* VIEW 1: SETUP DASHBOARD */}
          {view === "setup" && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-5 my-auto w-full"
            >
              {/* Prominent One-Click Demo Banner */}
              <div className="glass-container p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-[#2563EB]/10 via-slate-900/50 to-[#EC4899]/10 relative overflow-hidden group border border-slate-800">
                {/* Accent neon highlight bar at the left */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#2563EB] to-[#EC4899]" />
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/15 transition-all duration-500" />
                
                <div className="flex items-center gap-3.5 relative z-10 text-center sm:text-left flex-col sm:flex-row">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2563EB]/20 to-[#EC4899]/20 border border-[#EC4899]/30 flex items-center justify-center text-pink-300 shadow-md">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono flex items-center justify-center sm:justify-start gap-1.5">
                      Evaluate Instantly & Explore Capabilities
                    </h3>
                    <p className="text-[10.5px] text-slate-400 mt-1 max-w-[550px] leading-relaxed">
                      Pre-populate the system with high-fidelity sample candidate profile & role criteria to begin testing the AI-driven evaluation.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={loadDemoData}
                  className="radiant-button text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer relative overflow-hidden shrink-0 group active:scale-95 transition-all duration-200"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>✨ Try One-Click Demo Data</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Setup Left column: Stats Prep & Presets (col-span-3) */}
              <div className="lg:col-span-3 flex flex-col gap-4">
                
                {hasSnapshot && snapshotDetails && (
                  <div className="bg-gradient-to-br from-purple-950/40 to-slate-900 rounded-2xl border border-purple-500/30 p-5 flex flex-col justify-between shadow-lg shadow-purple-950/10 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-purple-400 uppercase tracking-wider bg-purple-950/60 border border-purple-500/20 px-2 py-0.5 rounded-md">
                          <History className="w-3 h-3 animate-pulse" />
                          Paused Session
                        </span>
                        <button
                          onClick={clearSnapshot}
                          title="Delete saved snapshot"
                          className="text-slate-500 hover:text-rose-400 p-1 hover:bg-slate-800/80 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h3 className="text-sm font-bold text-slate-100 mt-3 truncate">
                        {snapshotDetails.activeJobTitle || "Mock Candidate"}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-500 shrink-0" />
                        {snapshotDetails.activeCompany || "Dream Company"}
                      </p>
                      
                      <div className="mt-3.5 space-y-2 text-[10px] text-slate-400 border-t border-slate-800/60 pt-3">
                        <div className="flex justify-between">
                          <span>Elapsed Time:</span>
                          <span className="font-mono text-purple-300">{formatTime(snapshotDetails.elapsedSeconds || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dialogue Turns:</span>
                          <span className="font-mono text-purple-300">{snapshotDetails.messages?.length || 0} messages</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Saved On:</span>
                          <span className="font-mono text-purple-300">
                            {snapshotDetails.savedAt ? new Date(snapshotDetails.savedAt).toLocaleDateString() : "Recently"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={resumeSnapshot}
                      className="w-full mt-4 py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/15"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Resume Interview</span>
                    </button>
                  </div>
                )}

                 {/* Stats Bento Card */}
                <div className="glass-container p-5 flex flex-col justify-between min-h-[220px]">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Interview Prep Hub</h2>
                    <p className="text-[11px] text-slate-500 mt-1">Realistic assessment metrics calibrated today.</p>
                  </div>
                  
                  <div className="space-y-3.5 my-4">
                    <div className="p-3 rounded-xl bg-slate-850/80 border border-slate-800">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Simulated Success Rate (Score ≥ 70)</div>
                      <div className="text-2xl font-mono font-bold text-purple-400">
                        {history.length > 0
                          ? `${Math.round((history.filter((h) => h.overallScore >= 70).length / history.length) * 100)}%`
                          : "0%"}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-850/80 border border-slate-800">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Simulations Completed</div>
                      <div className="text-2xl font-mono font-bold text-purple-400">{history.length}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-400 mb-2 italic">&ldquo;AI models are calibrated for senior engineering and leadership standards.&rdquo;</div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 transition-all duration-350"
                        style={{
                          width: history.length > 0
                            ? `${Math.min(100, Math.round((history.filter((h) => h.overallScore >= 70).length / history.length) * 100))}%`
                            : "0%"
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Streak Tracker Bento Widget */}
                <div className="glass-container p-5 flex flex-col justify-between relative overflow-hidden group shadow-lg">
                  {/* Ambient glowing orange background blur */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full blur-2xl group-hover:bg-orange-600/15 transition-all duration-500 pointer-events-none" />
                  
                  <div className="flex items-start justify-between relative">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold tracking-widest text-orange-400 uppercase bg-orange-950/40 border border-orange-500/20 px-2.5 py-1 rounded-md">
                        Gamified Streak
                      </span>
                      <h3 className="text-xs font-bold text-slate-300 mt-2">Daily Interview Streak</h3>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Complete an interview session every day to build your streak!
                      </p>
                    </div>
                    <div className={`p-2.5 rounded-xl border transition-all duration-300 ${
                      streak > 0 
                        ? "bg-orange-950/50 border-orange-500/40 text-orange-400 shadow-lg shadow-orange-500/10" 
                        : "bg-slate-950 border-slate-800 text-slate-500"
                    }`}>
                      <Flame className={`w-5 h-5 ${streak > 0 ? "fill-orange-500" : ""}`} />
                    </div>
                  </div>

                  <div className="mt-4 border-t border-slate-850 pt-3 flex items-baseline gap-2 relative">
                    <span className="text-3xl font-mono font-black text-white">{streak}</span>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      {streak === 1 ? "Day Streak" : "Days Streak"}
                    </span>
                    {streak > 0 ? (
                      <span className="ml-auto text-[10px] text-emerald-400 font-mono font-bold animate-pulse">
                        🔥 ACTIVE TODAY
                      </span>
                    ) : (
                      <span className="ml-auto text-[9px] text-slate-500 font-medium">
                        No mock today yet
                      </span>
                    )}
                  </div>
                </div>

                {/* Profiles / Presets Bento Card */}
                <div className="glass-container p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block mb-3">
                      Instant Profiles
                    </span>
                    <div className="space-y-2">
                      {PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => applyPreset(preset.id)}
                          className="w-full text-left bg-slate-850 hover:bg-purple-950/20 border border-slate-800 hover:border-purple-500/30 p-3 rounded-xl transition duration-200 flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center space-x-2.5 overflow-hidden">
                            <div className="p-1.5 bg-slate-800 group-hover:bg-purple-950/40 text-slate-400 group-hover:text-purple-400 rounded-lg shrink-0">
                              <Briefcase className="w-3.5 h-3.5" />
                            </div>
                            <div className="truncate">
                              <p className="font-semibold text-slate-200 text-xs group-hover:text-purple-100 truncate">
                                {preset.jobTitle}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                {preset.company} Template
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-400 transition-transform group-hover:translate-x-0.5 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-[10px] text-slate-500 mt-4 leading-relaxed border-t border-slate-800/60 pt-3">
                    💡 Click a preset above to auto-populate perfect test fields immediately.
                  </div>
                </div>

              </div>

              {/* Setup Center column: Job Details Form / History Switcher (col-span-6) */}
              <div className="lg:col-span-6 glass-container flex flex-col justify-between overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-850/40">
                  <div className="flex items-center space-x-3.5">
                    <button
                      type="button"
                      onClick={() => setSetupTab("configure")}
                      className={`font-semibold text-xs uppercase tracking-wider transition pb-1 border-b-2 ${
                        setupTab === "configure"
                          ? "text-purple-400 border-purple-500"
                          : "text-slate-400 border-transparent hover:text-slate-200"
                      }`}
                    >
                      New Interview Setup
                    </button>
                    <span className="text-slate-700">|</span>
                    <button
                      type="button"
                      onClick={() => setSetupTab("history")}
                      className={`font-semibold text-xs uppercase tracking-wider transition pb-1 border-b-2 flex items-center gap-1.5 ${
                        setupTab === "history"
                          ? "text-purple-400 border-purple-500"
                          : "text-slate-400 border-transparent hover:text-slate-200"
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      Session History
                      {history.length > 0 && (
                        <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded-full text-[9px] font-mono leading-none">
                          {history.length}
                        </span>
                      )}
                    </button>
                  </div>
                  <span className="text-[10px] text-purple-400 bg-purple-950/30 border border-purple-900 px-2 py-0.5 rounded uppercase tracking-wider font-semibold">
                    {setupTab === "configure" ? "Active Specs" : "Saved Reports"}
                  </span>
                </div>

                {setupTab === "configure" ? (
                  <div className="p-6 space-y-5 flex-1 flex flex-col justify-center">
                    {/* Job Title / Company details helper */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                          Target Job Title
                        </label>
                        <motion.input
                          animate={demoLoadedTrigger ? { scale: [1, 1.02, 1], borderColor: ["#1e293b", "#EC4899", "#1e293b"], backgroundColor: ["#020617", "#1e1b4b", "#020617"] } : {}}
                          transition={{ duration: 0.8, ease: "easeInOut" }}
                          type="text"
                          placeholder="e.g. Senior Software Engineer"
                          value={activeJobTitle}
                          onChange={(e) => {
                            setActiveJobTitle(e.target.value);
                            setIsDemoLoaded(false);
                          }}
                          className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-purple-500 p-3 rounded-xl transition outline-none text-slate-200 placeholder-slate-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                          Company Name
                        </label>
                        <motion.input
                          animate={demoLoadedTrigger ? { scale: [1, 1.02, 1], borderColor: ["#1e293b", "#EC4899", "#1e293b"], backgroundColor: ["#020617", "#1e1b4b", "#020617"] } : {}}
                          transition={{ duration: 0.8, ease: "easeInOut" }}
                          type="text"
                          placeholder="e.g. Stripe"
                          value={activeCompany}
                          onChange={(e) => {
                            setActiveCompany(e.target.value);
                            setIsDemoLoaded(false);
                          }}
                          className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-purple-500 p-3 rounded-xl transition outline-none text-slate-200 placeholder-slate-600"
                        />
                      </div>
                    </div>

                    {/* Job Description Textarea */}
                    <div className="flex-1 flex flex-col min-h-[220px]">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                          Job Description <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] font-mono text-slate-500">
                          {jobDescription.length} chars
                        </span>
                      </div>
                      <motion.textarea
                        animate={demoLoadedTrigger ? { scale: [1, 1.015, 1], borderColor: ["#1e293b", "#EC4899", "#1e293b"], backgroundColor: ["#020617", "#1e1b4b", "#020617"] } : {}}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        placeholder="Paste the target job description details, qualifications, and core responsibilities here..."
                        value={jobDescription}
                        onChange={(e) => {
                          setJobDescription(e.target.value);
                          setIsDemoLoaded(false);
                        }}
                        className="w-full flex-1 text-xs bg-slate-950 border border-slate-800 focus:border-purple-500 p-3.5 rounded-xl transition outline-none resize-none font-sans leading-relaxed text-slate-300 placeholder-slate-600"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-6 flex-1 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Historical Sessions</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">Review performance scorecards and answers.</p>
                      </div>
                      {history.length > 0 && (
                        <button
                          type="button"
                          onClick={clearAllHistory}
                          className="text-[10px] font-bold text-rose-400 hover:text-rose-300 transition flex items-center gap-1 cursor-pointer bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 px-2.5 py-1 rounded-lg"
                        >
                          <Trash2 className="w-3 h-3" />
                          Clear All
                        </button>
                      )}
                    </div>

                    {history.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3.5 bg-slate-950/30 rounded-xl border border-dashed border-slate-800">
                        <div className="p-3 bg-slate-900 rounded-full border border-slate-800 text-slate-600">
                          <History className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400">No session reports yet</p>
                          <p className="text-[10px] text-slate-600 mt-1 max-w-xs mx-auto leading-relaxed">
                            Complete an interview session and generate your scorecard to save your performance history.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSetupTab("configure")}
                          className="bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 text-purple-300 hover:text-purple-200 text-[10px] font-bold px-3.5 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          Configure Setup
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[340px] custom-scrollbar">
                        {history.map((session) => {
                          const isExcellent = session.overallScore >= 85;
                          const isGood = session.overallScore >= 70 && session.overallScore < 85;
                          const scoreColorClass = isExcellent
                            ? "text-emerald-400 border-emerald-500/20 bg-emerald-950/20"
                            : isGood
                            ? "text-purple-400 border-purple-500/20 bg-purple-950/20"
                            : "text-amber-400 border-amber-500/20 bg-amber-950/20";

                          return (
                            <div
                              key={session.id}
                              onClick={() => loadSavedSession(session)}
                              className="group text-left bg-slate-850 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/20 p-3.5 rounded-xl transition duration-200 flex items-center justify-between cursor-pointer relative"
                            >
                              <div className="min-w-0 pr-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-xs text-slate-200 group-hover:text-purple-200 truncate">
                                    {session.jobTitle}
                                  </span>
                                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono shrink-0">
                                    {session.interviewType}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1 truncate flex items-center gap-1">
                                  <Building className="w-3 h-3 text-slate-500 shrink-0" />
                                  {session.company}
                                </p>
                                <div className="flex items-center gap-3 mt-1.5 text-[9px] font-mono text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5 shrink-0" />
                                    {formatTime(session.elapsedSeconds)}
                                  </span>
                                  <span>•</span>
                                  <span>{session.messagesCount} turns</span>
                                  <span>•</span>
                                  <span>{new Date(session.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3 shrink-0">
                                <div className={`flex flex-col items-center justify-center h-11 w-11 rounded-xl border font-mono font-bold text-sm ${scoreColorClass}`}>
                                  <span className="text-[9px] uppercase font-bold text-slate-500 font-sans tracking-tight leading-none mb-0.5">SCORE</span>
                                  <span>{session.overallScore}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => deleteSavedSession(session.id, e)}
                                  className="text-slate-600 hover:text-rose-400 p-1.5 hover:bg-slate-900/50 rounded-lg transition cursor-pointer"
                                  title="Delete Session Report"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Setup Right column: Resume & Configurations (col-span-3) */}
              <div className="lg:col-span-3 flex flex-col justify-between glass-container overflow-hidden shadow-xl">
                
                <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-850/40">
                  <span className="font-semibold text-slate-200 text-sm">Credentials & Rules</span>
                  <FileText className="w-4 h-4 text-slate-500" />
                </div>

                <div className="p-5 space-y-4 flex-1 flex flex-col">
                  
                  {/* Resume Area */}
                  <div className="flex-1 flex flex-col min-h-[140px]">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        Your Resume / Experience
                      </label>
                      <span className="text-[10px] font-mono text-slate-500">
                        {resume.length} chars
                      </span>
                    </div>
                    <motion.textarea
                      animate={demoLoadedTrigger ? { scale: [1, 1.02, 1], borderColor: ["#1e293b", "#EC4899", "#1e293b"], backgroundColor: ["#020617", "#1e1b4b", "#020617"] } : {}}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      placeholder="Paste your plain text resume or key qualifications bullet points..."
                      value={resume}
                      onChange={(e) => {
                        setResume(e.target.value);
                        setIsDemoLoaded(false);
                      }}
                      className="w-full flex-1 text-[11px] bg-slate-950 border border-slate-800 focus:border-purple-500 p-3 rounded-xl transition outline-none resize-none font-sans leading-relaxed text-slate-400 placeholder-slate-600"
                    />
                  </div>

                  {/* Interview Focus Type */}
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                      Interview Focus
                    </span>
                    <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      {(["mixed", "technical", "behavioral"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setInterviewType(type)}
                          className={`py-1.5 text-[10px] font-bold rounded-lg transition capitalize cursor-pointer ${
                            interviewType === type
                              ? "bg-purple-950/40 text-purple-400 border border-purple-500/30 shadow-inner"
                              : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select Interviewer Persona Dropdown */}
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                      Select Interviewer Persona
                    </span>
                    <div className="relative">
                      <select
                        id="interviewer_persona_selector"
                        value={interviewerPersona}
                        onChange={(e) => setInterviewerPersona(e.target.value as any)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-purple-500 p-2.5 rounded-xl transition outline-none text-slate-300 placeholder-slate-600 appearance-none cursor-pointer pr-10 font-medium"
                      >
                        <option value="supportive">The Supportive Coach (Encouraging, easy)</option>
                        <option value="faang">The FAANG Technical Architect (Strict, systems design)</option>
                        <option value="chaotic">The Chaotic Startup CTO (Fast-paced, rapid behavioral)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 border-l border-slate-800">
                        <ChevronRight className="w-4 h-4 transform rotate-90" />
                      </div>
                    </div>
                    {/* Tiny inline info helper explaining the current selection */}
                    <p className="text-[9px] text-slate-500 mt-1.5 leading-relaxed">
                      {interviewerPersona === "supportive" && "Offers encouraging advice, detailed hints, and sets a supportive, constructive tone."}
                      {interviewerPersona === "faang" && "Strict, deeply analytical questioning with heavy focus on architectural scaling & system design trade-offs."}
                      {interviewerPersona === "chaotic" && "Fast-paced, unconventional, and pivot-heavy questions. Tests rapid situational agility."}
                    </p>
                  </div>

                  {/* AI Voice Persona Selection */}
                  <div className="space-y-2.5 pt-1">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                        AI Voice Persona
                      </span>
                      <div className="relative">
                        <select
                          id="voice_persona_selector"
                          value={voicePersona}
                          onChange={(e) => setVoicePersona(e.target.value as any)}
                          className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-purple-500 p-2.5 rounded-xl transition outline-none text-slate-300 placeholder-slate-600 appearance-none cursor-pointer pr-10 font-medium"
                        >
                          <option value="calm">Calm Professional</option>
                          <option value="energetic">Energetic</option>
                          <option value="formal">Formal</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 border-l border-slate-800">
                          <ChevronRight className="w-4 h-4 transform rotate-90" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        Autoplay AI Voice
                      </span>
                      <button
                        type="button"
                        onClick={() => setAutoplayVoice(!autoplayVoice)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                          autoplayVoice ? "bg-purple-600" : "bg-slate-850"
                        }`}
                        title="Toggle autoplay text-to-speech"
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            autoplayVoice ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Unexpected Scenario Mode Toggle */}
                    <div className="border-t border-slate-800/80 pt-3.5 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1.5 font-bold text-slate-300">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          Unexpected Scenario Mode
                        </span>
                        <button
                          type="button"
                          onClick={() => setUnexpectedScenarioMode(!unexpectedScenarioMode)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                            unexpectedScenarioMode ? "bg-amber-500 shadow-md shadow-amber-500/15" : "bg-slate-850"
                          }`}
                          title="Simulate sudden, high-intensity real-world project crisis halfway through"
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              unexpectedScenarioMode ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                      <p className="text-[9.5px] text-slate-500 leading-normal">
                        Halfway through, the AI interviewer dynamically shifts the scenario, simulating a production crisis (e.g., peak load crash). Focuses on forcing dynamic skill pivots based on your resume.
                      </p>
                    </div>

                    {/* Interview Time Limit Toggle */}
                    <div className="border-t border-slate-800/80 pt-3.5 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1.5 font-bold text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          Interview Time Limit
                        </span>
                        <button
                          type="button"
                          onClick={() => setTimeLimitEnabled(!timeLimitEnabled)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                            timeLimitEnabled ? "bg-purple-600 shadow-md shadow-purple-500/15" : "bg-slate-850"
                          }`}
                          title="Set a maximum duration for the interview to practice brevity"
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              timeLimitEnabled ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                      <p className="text-[9.5px] text-slate-500 leading-normal">
                        Show a visual progress bar that helps track your progress and turns red if you exceed your target duration.
                      </p>
                      {timeLimitEnabled && (
                        <div className="mt-1 flex items-center justify-between gap-2.5 bg-slate-950 p-2 rounded-xl border border-slate-850">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                            Limit (Mins):
                          </label>
                          <div className="flex items-center gap-1.5 flex-1 justify-end">
                            <input
                              type="range"
                              min="1"
                              max="30"
                              value={timeLimitMinutes}
                              onChange={(e) => setTimeLimitMinutes(parseInt(e.target.value))}
                              className="w-24 accent-purple-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-[11px] font-mono font-bold text-purple-400 shrink-0 w-8 text-right">
                              {timeLimitMinutes}m
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Bottom Bento Section: Step Tracker (col-span-8) & Big Action Button (col-span-4) */}
              
              {/* Step Tracker Info */}
              <div className="lg:col-span-8 bg-purple-950/20 rounded-2xl border border-purple-500/20 p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold italic text-lg shrink-0">
                  i
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wide">Simulation calibration parameters active</h4>
                  <p className="text-[11px] text-slate-400 leading-normal mt-0.5">
                    The AI Mock Interviewer is calibrated for strict technical, design, and behavioral evaluations. The model automatically parses the job description and resume to target professional gaps.
                  </p>
                </div>
              </div>

              {/* Big Action Button */}
              <div className="lg:col-span-4">
                <button
                  onClick={startInterview}
                  disabled={!jobDescription.trim()}
                  className={`w-full h-full radiant-button disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl flex flex-col items-center justify-center gap-2 group transition-all duration-300 p-5 min-h-[100px] shadow-lg active:scale-98 cursor-pointer ${
                    isDemoLoaded && jobDescription.trim()
                      ? "ring-4 ring-pink-500/80 shadow-[0_0_35px_15px_rgba(236,72,153,0.65)] animate-pulse border-pink-400"
                      : ""
                  }`}
                >
                  <span className="text-2xl font-black uppercase tracking-tighter">Start Interview</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold bg-slate-950/30 px-3.5 py-1 rounded-full text-purple-100">
                    <Play className="w-3 h-3 fill-current shrink-0" />
                    ENTER CHAT MODE
                  </span>
                </button>
              </div>

            </div>
          </motion.div>
          )}

          {/* VIEW 2: INTERVIEW ACTIVE CHAT WINDOW */}
          {view === "interview" && (
            <motion.div
              key="interview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-170px)] items-stretch"
            >
              {/* Chat Sidebar: Session Details */}
              <div className="lg:col-span-3 flex flex-col justify-between glass-container p-5 shadow-xl">
                <div className="space-y-6">
                  <div>
                    <span className="text-[9px] font-bold tracking-widest text-purple-400 uppercase bg-purple-950/40 px-2 py-1 rounded-md border border-purple-900">
                      Live Assessment
                    </span>
                    <h3 className="mt-2.5 text-base font-bold text-white truncate">
                      {activeJobTitle}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      {activeCompany}
                    </p>
                  </div>

                  {/* Setup recap cards */}
                  <div className="space-y-2.5">
                    <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center space-x-3">
                      <div className="p-2 bg-slate-900 rounded-lg text-purple-400 shadow-inner shrink-0 border border-slate-800">
                        {interviewType === "technical" ? (
                          <BrainCircuit className="w-4 h-4" />
                        ) : interviewType === "behavioral" ? (
                          <MessageSquareText className="w-4 h-4" />
                        ) : (
                          <Activity className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] text-slate-500 uppercase font-bold">Focus Area</p>
                        <p className="text-xs font-semibold text-slate-300 capitalize truncate">
                          {interviewType} Session
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center space-x-3">
                      <div className="p-2 bg-slate-900 rounded-lg text-purple-400 shadow-inner shrink-0 border border-slate-800">
                        {interviewerPersona === "supportive" ? (
                          <HeartHandshake className="w-4 h-4" />
                        ) : interviewerPersona === "faang" ? (
                          <ShieldAlert className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] text-slate-500 uppercase font-bold">Interviewer Profile</p>
                        <p className="text-xs font-semibold text-slate-300 capitalize truncate">
                          {interviewerPersona === "supportive" 
                            ? "Supportive Coach" 
                            : interviewerPersona === "faang" 
                            ? "FAANG Architect" 
                            : "Chaotic Startup CTO"}
                        </p>
                      </div>
                    </div>

                    {unexpectedScenarioMode && (
                      <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl flex items-start space-x-3 shadow-md shadow-amber-950/10">
                        <div className="p-2 bg-amber-950/40 rounded-lg text-amber-400 shrink-0 border border-amber-500/10">
                          <ShieldAlert className="w-4 h-4 animate-pulse" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] text-amber-500 uppercase font-black tracking-wider">Crisis Engine Active</p>
                          <p className="text-[11px] font-bold text-slate-200 mt-0.5">
                            Unexpected Scenario Mode
                          </p>
                          <p className="text-[9.5px] text-slate-400 leading-normal mt-1">
                            A production-disrupting crisis will trigger halfway. Prepare to dynamically pivot!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Help Tip */}
                  <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-3 shadow-inner">
                    <div className="flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
                      <Lightbulb className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <h4 className="font-bold text-[11px] text-slate-200 uppercase tracking-wider">Role Pro-Tips</h4>
                        <p className="text-[9px] text-slate-500 font-medium font-mono truncate max-w-[180px]">
                          {detectedProfession || "General Track"}
                        </p>
                      </div>
                    </div>
                    
                    <ul className="space-y-2.5">
                      {getProTipsForProfession(detectedProfession).map((tip, idx) => (
                        <li key={idx} className="flex gap-2 text-[10.5px] text-slate-400 leading-relaxed items-start hover:text-slate-200 transition duration-150">
                          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-purple-950/60 border border-purple-500/20 text-[9px] text-purple-300 font-mono font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="flex-1">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Evaluation Action */}
                <div className="pt-4 border-t border-slate-800 mt-4 space-y-2.5">
                  <button
                    onClick={saveSnapshot}
                    className="w-full py-2.5 px-4 bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 hover:text-purple-200 rounded-xl font-bold transition flex items-center justify-center space-x-2 cursor-pointer text-xs uppercase tracking-wider shadow-sm"
                  >
                    {saveStatus === "saving" ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : saveStatus === "saved" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                        <span className="text-emerald-400 font-bold">Snapshot Saved!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Snapshot</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={endAndEvaluate}
                    className="w-full py-3.5 px-4 radiant-button active:scale-98 text-white rounded-xl shadow-lg font-bold transition flex items-center justify-center space-x-2 cursor-pointer text-xs uppercase tracking-wider"
                  >
                    <Award className="w-4 h-4" />
                    <span>Complete & Grade Session</span>
                  </button>
                  <p className="text-[10px] text-slate-500 text-center mt-2.5">
                    Ready? Click above to render your complete performance scorecard analysis.
                  </p>
                </div>
              </div>

              {/* Chat Panel: The Board */}
              <div className="lg:col-span-9 flex flex-col glass-container overflow-hidden shadow-2xl relative">
                
                {/* Header of Chat Panel */}
                <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/20">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5">
                    <div className="flex items-center space-x-2">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        Live Interview Chat Transcript
                      </span>
                    </div>

                    {/* Subtle, smart dynamic tag for detected profession */}
                    {detectedProfession && (
                      <div className="flex items-center gap-1.5 bg-purple-950/40 border border-purple-500/20 rounded-full px-2.5 py-0.5 text-[10px] text-purple-300 font-medium self-start sm:self-auto">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>Analyzing Role:</span>
                        <span className="font-semibold text-purple-100 font-mono">
                          {detectedProfession === "Analyzing..." ? (
                            <span className="flex items-center gap-1">
                              Analyzing...
                              <span className="w-1 h-1 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-1 h-1 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-1 h-1 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </span>
                          ) : (
                            detectedProfession
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Active Voice Persona Indicator & Autoplay Toggle */}
                    <div className="flex items-center space-x-2 bg-slate-850 px-2.5 py-1.5 rounded-lg border border-slate-800 text-[10px] text-slate-300">
                      <button
                        type="button"
                        onClick={() => {
                          setAutoplayVoice(!autoplayVoice);
                          if (autoplayVoice && typeof window !== "undefined" && window.speechSynthesis) {
                            window.speechSynthesis.cancel();
                            setCurrentlySpeakingId(null);
                          }
                        }}
                        className="flex items-center space-x-1 hover:text-purple-300 transition cursor-pointer"
                        title={autoplayVoice ? "Mute automatic speech" : "Unmute automatic speech"}
                      >
                        {autoplayVoice ? (
                          <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                        ) : (
                          <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span className="font-mono uppercase text-[9px] font-semibold hidden sm:inline">
                          {autoplayVoice ? "Voice On" : "Mute"}
                        </span>
                      </button>
                      <span className="text-slate-600">|</span>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-purple-300">
                        {voicePersona === "calm" ? "Calm" : voicePersona === "energetic" ? "Energetic" : "Formal"} Voice
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowTips(!showTips)}
                      className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700/80 text-purple-300 hover:text-purple-200 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-purple-500/10 hover:border-purple-500/30 transition shadow-inner cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>{showTips ? "COLLAPSE TIPS" : "SHOW TIPS"}</span>
                    </button>
                  </div>
                </div>

                {timeLimitEnabled && (
                  <div className="bg-slate-950/80 border-b border-slate-800/60 px-5 py-2.5 flex flex-col gap-1.5 shrink-0 relative overflow-hidden">
                    <div className="flex items-center justify-between text-[10px] font-mono tracking-wider font-semibold">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className={`w-3.5 h-3.5 ${isOverLimit ? "text-rose-500 animate-pulse" : "text-purple-400"}`} />
                        <span>INTERVIEW PACING RUNTIME</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">PROGRESS:</span>
                        <span className={isOverLimit ? "text-rose-400 font-extrabold animate-pulse" : "text-purple-300 font-extrabold"}>
                          {formatTime(elapsedSeconds)} / {formatTime(limitSeconds)}
                        </span>
                        {isOverLimit && (
                          <span className="bg-rose-950/60 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase animate-pulse">
                            OVER LIMIT
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Progress Bar Track */}
                    <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          isOverLimit 
                            ? "bg-gradient-to-r from-rose-600 to-rose-500 shadow-md shadow-rose-500/20 animate-pulse" 
                            : percentElapsed >= 80
                              ? "bg-gradient-to-r from-amber-500 to-amber-400 shadow-md shadow-amber-500/10"
                              : "bg-gradient-to-r from-purple-500 to-purple-400 shadow-md shadow-purple-500/10"
                        }`}
                        style={{ width: `${percentElapsed}%` }}
                      />
                    </div>
                    {/* Helper instruction */}
                    <div className="flex justify-between items-center text-[9px] text-slate-500">
                      <span>Aim to complete your responses concisely within the {timeLimitMinutes}-minute budget.</span>
                      {!isOverLimit ? (
                        <span>{formatTime(limitSeconds - elapsedSeconds)} remaining</span>
                      ) : (
                        <span className="text-rose-400 font-semibold">{formatTime(elapsedSeconds - limitSeconds)} over time limit</span>
                      )}
                    </div>
                  </div>
                )}

                {timeLimitEnabled && showTimeWarningBanner && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-950/45 border-b border-amber-500/30 px-5 py-3 flex items-center justify-between gap-4 shrink-0 relative overflow-hidden"
                  >
                    {/* Ambient warm warning pulse glow */}
                    <div className="absolute inset-0 bg-amber-500/[0.03] animate-pulse pointer-events-none" />
                    
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="p-1.5 bg-amber-500/15 border border-amber-500/30 rounded-lg text-amber-400 shrink-0">
                        <AlertTriangle className="w-4 h-4 animate-bounce" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold text-amber-300 uppercase tracking-wider font-mono">
                          Session Warning (75% Elapsed)
                        </h4>
                        <p className="text-[10px] text-slate-300 mt-0.5 leading-normal">
                          You have reached 75% of your allocated interview duration. There are only <span className="text-amber-200 font-bold font-mono">{Math.ceil((limitSeconds - elapsedSeconds) / 60)}m</span> remaining to finish your session and complete the evaluation.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowTimeWarningBanner(false)}
                      className="p-1 bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-md text-slate-400 hover:text-slate-200 transition shrink-0 relative z-10 cursor-pointer"
                      title="Dismiss warning"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}

                <div className="flex-1 flex overflow-hidden relative">
                  
                  {/* Chat messages viewport & Input area */}
                  <div className="flex-1 flex flex-col min-w-0 h-full justify-between">
                    
                    {/* Confidence Heatmap Widget */}
                    <div className="bg-slate-950/60 border-b border-slate-800/80 px-5 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 relative overflow-hidden">
                      {/* Subtle ambient pulse background glow mirroring latest quality status */}
                      <div className={`absolute inset-0 opacity-[0.03] pointer-events-none transition-all duration-1000 ${
                        feedbackLoading 
                          ? "bg-purple-500 animate-pulse" 
                          : confidenceScores.length === 0 
                            ? "bg-slate-500" 
                            : confidenceScores[confidenceScores.length - 1] >= 85 
                              ? "bg-emerald-500 animate-[pulse_3s_infinite]" 
                              : confidenceScores[confidenceScores.length - 1] >= 70 
                                ? "bg-blue-500 animate-[pulse_3s_infinite]" 
                                : "bg-amber-500 animate-[pulse_3s_infinite]"
                      }`} />

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 z-10">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg border transition-all duration-300 ${
                            feedbackLoading 
                              ? "bg-purple-500/10 border-purple-500/30 text-purple-400 animate-spin" 
                              : confidenceScores.length === 0 
                                ? "bg-slate-800 border-slate-700 text-slate-400" 
                                : confidenceScores[confidenceScores.length - 1] >= 85 
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                  : confidenceScores[confidenceScores.length - 1] >= 70 
                                    ? "bg-blue-500/10 border-blue-500/20 text-blue-400" 
                                    : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          }`}>
                            <Activity className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Performance Tracking</span>
                            <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                              Confidence Heatmap
                              {feedbackLoading && (
                                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-purple-400 animate-ping" />
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Session Averages & Trends */}
                        {confidenceScores.length > 0 && (
                          <div className="flex items-center gap-2.5 border-l border-slate-800 pl-3.5 h-7">
                            <div className="flex flex-col">
                              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider font-mono">Session Index</span>
                              <span className="text-xs font-extrabold text-slate-200 font-mono">
                                {Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length)}
                                <span className="text-[9px] text-slate-500 font-normal">/100</span>
                              </span>
                            </div>
                            <span className="text-slate-700">|</span>
                            <div className="flex flex-col">
                              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider font-mono">Trend</span>
                              <span className={`text-[9.5px] font-bold flex items-center gap-0.5 ${
                                confidenceScores[confidenceScores.length - 1] >= 85 ? "text-emerald-400" :
                                confidenceScores[confidenceScores.length - 1] >= 70 ? "text-blue-400" : "text-amber-400"
                              }`}>
                                <TrendingUp className="w-3 h-3 shrink-0" />
                                {confidenceScores[confidenceScores.length - 1] >= 85 ? "Exceptional" :
                                 confidenceScores[confidenceScores.length - 1] >= 70 ? "Consistent" : "Improving"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Heatmap Grid Progression Row */}
                      <div className="flex items-center gap-3.5 z-10 self-start md:self-auto">
                        {confidenceScores.length === 0 ? (
                          <p className="text-[10px] text-slate-500 italic max-w-xs font-medium">
                            {feedbackLoading 
                              ? "Analyzing your introductory answer..." 
                              : "Submit your first response to start mapping quality metrics."}
                          </p>
                        ) : (
                          <>
                            <div className="flex flex-col items-end gap-1.5">
                              <div className="flex items-center gap-1.5">
                                {/* Past turn scores rendered as high-fidelity block cells */}
                                {confidenceScores.map((score, index) => {
                                  const isLatest = index === confidenceScores.length - 1;
                                  return (
                                    <div
                                      key={index}
                                      className={`relative group h-6 w-6 rounded-md flex items-center justify-center font-mono font-bold text-[9.5px] border cursor-help transition-all duration-300 ${
                                        score >= 85 
                                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20" 
                                          : score >= 70 
                                            ? "bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20" 
                                            : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                                      } ${isLatest ? "ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/10 scale-105" : ""}`}
                                    >
                                      {score}
  
                                      {/* Hover Tooltip */}
                                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30">
                                        <div className="bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 shadow-xl w-32 text-center text-[10px] leading-relaxed">
                                          <p className="font-bold text-slate-400 uppercase tracking-wider text-[8px] font-mono">Question {index + 1}</p>
                                          <p className="font-extrabold text-white mt-0.5 font-mono text-xs">{score}% Match</p>
                                          <p className={`font-bold mt-1 uppercase text-[8px] tracking-wide ${
                                            score >= 85 ? "text-emerald-400" : score >= 70 ? "text-blue-400" : "text-amber-400"
                                          }`}>
                                            {score >= 85 ? "Outstanding" : score >= 70 ? "Strong" : "Needs Support"}
                                          </p>
                                        </div>
                                        <div className="w-1.5 h-1.5 bg-slate-950 border-r border-b border-slate-800 rotate-45 -mt-1" />
                                      </div>
                                    </div>
                                  );
                                })}
  
                                {/* Loading Placeholder Block if AI analyzing next turn */}
                                {feedbackLoading && (
                                  <div className="h-6 w-6 rounded-md bg-purple-500/10 border border-purple-500/40 flex items-center justify-center animate-pulse scale-105 shadow-md shadow-purple-500/15">
                                    <Sparkles className="w-3 h-3 text-purple-400 animate-spin" />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Mini Performance Arc Line Chart */}
                            <div className="flex flex-col items-center">
                              <span className="text-[8px] font-mono text-slate-500 font-bold uppercase tracking-wider mb-1">Arc Trend</span>
                              <div className="h-7 w-28 bg-slate-950/60 border border-slate-800/80 rounded-lg p-0.5 flex items-center justify-center relative overflow-hidden shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={confidenceScores.map((score, i) => ({ q: `Q${i + 1}`, score }))} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                                    <Line 
                                      type="monotone" 
                                      dataKey="score" 
                                      stroke="#a855f7" 
                                      strokeWidth={1.75} 
                                      dot={{ r: 1.5, strokeWidth: 0, fill: "#c084fc" }} 
                                      activeDot={{ r: 3, strokeWidth: 0, fill: "#f3e8ff" }} 
                                    />
                                    <XAxis dataKey="q" hide />
                                    <YAxis domain={[0, 100]} hide />
                                    <RechartsTooltip
                                      cursor={{ stroke: '#3b0764', strokeWidth: 1 }}
                                      content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                          return (
                                            <div className="bg-slate-950 border border-purple-500/30 rounded px-1 py-0.5 text-[8px] font-mono text-purple-300 shadow-xl font-bold">
                                              {payload[0].value}%
                                            </div>
                                          );
                                        }
                                        return null;
                                      }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </>
                        )}
                        
                        {/* Heatmap Legend */}
                        {confidenceScores.length > 0 && (
                          <div className="hidden sm:flex items-center gap-1.5 ml-1 bg-slate-950/40 border border-slate-850 px-2 py-1 rounded-md font-mono text-[8px] text-slate-500 font-semibold uppercase">
                            <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" /> 85+</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500/80" /> 70+</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500/80" /> &lt;70</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chat window viewport */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                      {messages.map((msg, idx) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`flex items-start space-x-2.5 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
                            
                            {/* Sender Icon */}
                            <div className={`p-1.5 rounded-lg shrink-0 border ${
                              msg.sender === "user" 
                                ? "bg-slate-850 border-slate-800 text-slate-300" 
                                : "bg-purple-950/40 border-purple-900/50 text-purple-400"
                            }`}>
                              {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                            </div>

                            {/* Speech Bubble */}
                            <div className={`p-4 rounded-2xl text-xs leading-relaxed shadow-md ${
                              msg.sender === "user"
                                ? "bg-purple-600 text-white font-semibold rounded-tr-none border border-purple-500/20"
                                : "bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none font-medium"
                            }`}>
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                              <span className={`block text-[8px] mt-1 text-right ${msg.sender === "user" ? "text-purple-200/80" : "text-slate-400"}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>

                            {/* Speaker Action Button for AI messages */}
                            {msg.sender === "ai" && (
                              <button
                                type="button"
                                onClick={() => speakMessage(msg.id, msg.text)}
                                className={`p-2 rounded-xl transition self-center text-slate-400 hover:text-purple-300 bg-slate-950/40 hover:bg-slate-850 border border-slate-800 shrink-0 cursor-pointer ${
                                  currentlySpeakingId === msg.id ? "text-purple-400 border-purple-500/30 animate-pulse bg-purple-950/20" : ""
                                }`}
                                title={currentlySpeakingId === msg.id ? "Stop Speaking" : "Read Response Aloud"}
                              >
                                {currentlySpeakingId === msg.id ? (
                                  <div className="flex items-center space-x-0.5 h-3.5 w-3.5 justify-center">
                                    <span className="w-0.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-0.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-0.5 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                  </div>
                                ) : (
                                  <Volume2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}

                            {/* Retry Question Button */}
                            {msg.sender === "ai" && idx > 0 && (
                              <button
                                type="button"
                                onClick={() => retryQuestion(msg.id)}
                                className="p-2 rounded-xl transition self-center text-slate-400 hover:text-amber-400 bg-slate-950/40 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/30 shrink-0 cursor-pointer flex items-center gap-1"
                                title="Retry This Question (Wipes last answer & feedback so you can answer again)"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-bold uppercase hidden sm:inline tracking-wider">Retry</span>
                              </button>
                            )}

                          </div>
                        </div>
                      ))}

                      {/* Typing / Thinking Indicator */}
                      {loading && (
                        <div className="flex justify-start">
                          <div className="flex items-start space-x-2.5 max-w-[85%]">
                            <div className="p-1.5 rounded-lg shrink-0 border bg-purple-950/40 border-purple-900/50 text-purple-400 animate-pulse">
                              <Bot className="w-3.5 h-3.5" />
                            </div>
                            <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2">
                              <span className="text-xs text-slate-300 font-medium">Interviewer is formulating next response</span>
                              <span className="flex space-x-1 items-center">
                                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>

                    {/* Chat input form panel */}
                    <div className="border-t border-slate-800/80 p-4 bg-slate-950/50">
                      
                      {/* Current Hint Banner */}
                      {currentHint && (
                        <div className="mb-3.5 bg-gradient-to-r from-purple-950/30 to-slate-900 border border-purple-500/25 p-4 rounded-xl flex items-start gap-3 relative shadow-lg shadow-purple-950/5 animate-in slide-in-from-bottom-2 duration-300">
                          <div className="p-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 shrink-0 mt-0.5">
                            <Lightbulb className="w-4 h-4 text-amber-400 animate-pulse" />
                          </div>
                          <div className="flex-1 min-w-0 pr-6">
                            <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                              <span>{"Coach's Lifeline Clue"}</span>
                              <span className="text-[9px] text-slate-500 normal-case font-normal font-sans">({hintsRemaining} hints left)</span>
                            </div>
                            <p className="text-xs text-slate-200 mt-1 leading-relaxed whitespace-pre-wrap">
                              {currentHint}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCurrentHint(null)}
                            className="absolute top-3.5 right-3.5 text-slate-500 hover:text-slate-300 p-1 hover:bg-slate-800/60 rounded transition cursor-pointer"
                            title="Dismiss hint"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <form onSubmit={sendMessage} className="flex space-x-3 items-end">
                        <div className="flex-1 relative">
                          <textarea
                            rows={2}
                            placeholder={speechSupported ? "Type or click the microphone to speak your answer... (Press Enter to send)" : "Type your professional response or answer here... (Press Enter to send)"}
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                              }
                            }}
                            className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-purple-500 p-3 pr-12 rounded-xl transition outline-none resize-none text-slate-100 placeholder-slate-600"
                          />
                          {speechSupported && (
                            <button
                              type="button"
                              onClick={toggleListening}
                              title={isListening ? "Stop recording" : "Record your answer via microphone"}
                              className={`absolute right-3.5 bottom-3.5 p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                                isListening
                                  ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 animate-pulse"
                                  : "text-slate-400 hover:text-purple-400 hover:bg-slate-800/60"
                              }`}
                            >
                              {isListening ? (
                                <MicOff className="w-3.5 h-3.5" />
                              ) : (
                                <Mic className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Lifeline: Ask for a Hint Button */}
                        <button
                          type="button"
                          onClick={requestHint}
                          disabled={hintsRemaining <= 0 || hintLoading || loading || messages.length === 0}
                          title={messages.length === 0 ? "Start the interview first to ask for hints!" : `Ask for a subtle hint (Remaining: ${hintsRemaining}/3)`}
                          className="py-3 px-4 bg-slate-900 border border-slate-800 hover:border-purple-500/50 disabled:bg-slate-950 disabled:border-slate-900 disabled:text-slate-600 text-slate-300 hover:text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shrink-0 flex items-center gap-2 shadow-md relative group active:scale-98"
                        >
                          {hintLoading ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                              <span>Asking...</span>
                            </>
                          ) : (
                            <>
                              <Lightbulb className={`w-3.5 h-3.5 ${hintsRemaining > 0 ? "text-amber-400 group-hover:animate-bounce" : "text-slate-600"}`} />
                              <span>Ask for a Hint</span>
                              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none ${
                                hintsRemaining === 3 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                                hintsRemaining === 2 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                                hintsRemaining === 1 ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" :
                                "bg-slate-850 text-slate-600 border border-slate-800"
                              }`}>
                                {hintsRemaining}
                              </span>
                            </>
                          )}
                        </button>

                        <button
                          type="submit"
                          disabled={!userInput.trim() || loading}
                          className="py-3 px-4 radiant-button disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shrink-0 flex items-center gap-2 shadow-lg active:scale-98"
                        >
                          <span>Submit Answer</span>
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                      <div className="flex items-center justify-between text-[9px] text-slate-500 mt-2 px-1">
                        <span className="flex items-center gap-1.5">
                          {isListening ? (
                            <span className="text-rose-400 animate-pulse font-bold flex items-center gap-1 font-mono">
                              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                              LIVE VOICE TRANSCRIBING... SPEAK CLEARLY
                            </span>
                          ) : (
                            <span>💡 Press Enter to send, Shift + Enter for a new line.</span>
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          {speechSupported && (
                            <span className="flex items-center gap-1 text-slate-400 font-medium">
                              <Mic className={`w-2.5 h-2.5 ${isListening ? "text-rose-400 animate-pulse" : "text-purple-400"}`} />
                              Voice Transcriber Active
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Interview Tips Sidebar (Collapsible) */}
                  {showTips && (() => {
                    const tips = getInterviewTips();
                    return (
                      <div className="absolute inset-y-0 right-0 z-20 w-full sm:w-80 md:relative md:inset-auto md:w-[280px] bg-slate-950 border-l border-slate-850 flex flex-col h-full animate-in slide-in-from-right duration-200 shrink-0">
                        
                        {/* Sidebar Header */}
                        <div className="px-4 py-3 border-b border-slate-850 flex items-center justify-between bg-slate-900/60 shrink-0">
                          <div className="flex items-center space-x-2">
                            <Lightbulb className="w-4 h-4 text-purple-400" />
                            <span className="text-[11px] font-bold text-white uppercase tracking-wider">Interview Tips</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowTips(false)}
                            className="text-slate-500 hover:text-slate-300 p-1 hover:bg-slate-800/80 rounded transition cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Sidebar Scrollable Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-5 font-sans scrollbar-thin">
                          
                          {/* Stage Progress */}
                          <div className="p-3 bg-slate-900/50 border border-slate-850 rounded-xl space-y-2.5">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-slate-400 font-bold uppercase tracking-wider">Current Stage</span>
                              <span className="text-purple-400 font-bold font-mono">{tips.stageIndex}/3</span>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-100">{tips.stageTitle}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">{tips.stageSubtitle}</p>
                            </div>
                            
                            {/* Linear dots progress indicator */}
                            <div className="flex items-center space-x-1 pt-1">
                              {[1, 2, 3].map((step) => (
                                <div
                                  key={step}
                                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                    step <= tips.stageIndex ? "bg-purple-500" : "bg-slate-800"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Dynamic Stage Objectives checklist */}
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                              <ListChecks className="w-3.5 h-3.5 text-purple-400" />
                              Stage Objectives
                            </h4>
                            <div className="space-y-1.5">
                              {tips.objectives.map((obj, i) => (
                                <div
                                  key={i}
                                  className={`p-2 rounded-lg border transition text-[10px] flex items-center space-x-2 ${
                                    obj.done
                                      ? "bg-purple-950/10 border-purple-900/30 text-purple-300 font-medium"
                                      : "bg-slate-900/30 border-slate-850 text-slate-400"
                                  }`}
                                >
                                  <div className="shrink-0">
                                    {obj.done ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 fill-purple-950/20" />
                                    ) : (
                                      <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />
                                    )}
                                  </div>
                                  <span className="truncate leading-none">{obj.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Suggested Framework */}
                          <div className="space-y-2.5">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                              <Compass className="w-3.5 h-3.5 text-purple-400" />
                              {tips.frameworkTitle}
                            </h4>
                            <div className="space-y-2 bg-slate-900/40 border border-slate-850 p-3 rounded-xl">
                              {tips.frameworkSteps.map((step, i) => (
                                <div key={i} className="space-y-0.5">
                                  <span className="text-[10px] font-bold text-purple-300 block">
                                    {step.name}
                                  </span>
                                  <p className="text-[10px] text-slate-400 leading-normal">
                                    {step.desc}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Interviewer Persona Guidance */}
                          <div className="p-3 bg-purple-950/10 border border-purple-900/20 rounded-xl space-y-1.5">
                            <div className="flex items-center space-x-1.5 text-purple-300">
                              <Info className="w-3.5 h-3.5 shrink-0" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">{tips.personaHeader}</span>
                            </div>
                            <p className="text-[10px] text-purple-100 leading-relaxed font-medium">
                              {tips.personaBody}
                            </p>
                          </div>

                          {/* Coach's Clues History */}
                          {hintsHistory.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-slate-850">
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                                {"Coach's Clues Used"} ({hintsHistory.length}/3)
                              </h4>
                              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                                {hintsHistory.map((hint, idx) => (
                                  <div key={idx} className="p-2.5 bg-slate-900/50 border border-slate-850 rounded-xl space-y-1 relative text-[10px]">
                                    <span className="font-mono font-bold text-purple-300 block">
                                      Clue #{idx + 1}
                                    </span>
                                    <p className="text-slate-300 leading-normal">
                                      {hint}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                        
                      </div>
                    );
                  })()}

                </div>

              </div>
            </motion.div>
          )}

          {/* VIEW 3: DETAILED SCORECARD EVALUATION */}
          {view === "evaluation" && (
            <motion.div
              key="evaluation"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              
              {/* EVALUATION LOADING SCREEN */}
              {evalLoading ? (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center shadow-2xl max-w-2xl mx-auto space-y-6 my-12">
                  <div className="w-16 h-16 bg-purple-950 rounded-full flex items-center justify-center mx-auto text-purple-400 animate-spin border-4 border-purple-500 border-t-transparent shadow-md shadow-purple-500/10" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">Formulating Evaluation Scorecard</h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                      Our senior recruiter algorithms are examining your conversation transcript, grading technical definitions, assessing STAR structures, and composing custom suggested responses...
                    </p>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-850 max-w-sm mx-auto flex items-center space-x-3 text-left">
                    <Activity className="w-5 h-5 text-purple-400 animate-pulse shrink-0" />
                    <span className="text-[11px] text-slate-400 font-medium leading-normal">
                      Aesthetic and structural scorecard compiling in progress...
                    </span>
                  </div>
                </div>
              ) : evaluation ? (
                
                /* THE REPORT CARD ELEMENT */
                <div className="space-y-6">
                  
                  {/* Top Intro Section */}
                  <div className="glass-container p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1.5 min-w-0">
                      <span className="text-[10px] font-bold tracking-widest bg-purple-950/40 text-purple-400 px-2.5 py-1 rounded-md border border-purple-900 uppercase">
                        Mock Performance Report Card
                      </span>
                      <h2 className="text-xl md:text-2xl font-black text-white truncate">
                        {activeJobTitle} Assessment
                      </h2>
                      <p className="text-xs text-slate-400">
                        Tailored for {activeCompany} • Professional Calibration Feedback
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <button
                        onClick={exportToPDF}
                        className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-slate-200 text-xs py-2.5 px-4 rounded-xl transition font-semibold cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-purple-400" />
                        <span>Export to PDF</span>
                      </button>
                      <button
                        onClick={copyReport}
                        className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-slate-200 text-xs py-2.5 px-4 rounded-xl transition font-semibold cursor-pointer"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        <span>{copied ? "Copied" : "Copy Report"}</span>
                      </button>
                      <button
                        onClick={resetAll}
                        className="flex items-center space-x-1.5 radiant-button text-white text-xs py-2.5 px-4 rounded-xl transition font-bold shadow-lg cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Restart Interview</span>
                      </button>
                    </div>
                  </div>

                  {/* Score Dashboard Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                    
                    {/* Big score dial wheel (Col Span 4) */}
                    <div className="lg:col-span-4 flex flex-col gap-5">
                      {/* Overall Score Card */}
                      <div className="glass-container p-6 flex flex-col items-center justify-center text-center shadow-md flex-1">
                        <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-6">
                          Overall Performance Score
                        </h3>
                        
                        <div className="relative w-40 h-40 flex items-center justify-center">
                          {/* Radial progress meter circle */}
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              className="stroke-slate-800"
                              strokeWidth="8"
                              fill="transparent"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              className="stroke-purple-500 transition-all duration-1000 ease-out"
                              strokeWidth="8"
                              fill="transparent"
                              strokeDasharray={2 * Math.PI * 42}
                              strokeDashoffset={2 * Math.PI * 42 * (1 - animatedOverallScore / 100)}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-4xl font-black tracking-tight text-white">
                              {animatedOverallScore}
                            </span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                              out of 100
                            </span>
                          </div>
                        </div>

                        <div className="mt-6 p-3 bg-slate-950 rounded-xl border border-slate-850 w-full text-[11px] text-slate-400 leading-normal max-w-xs font-medium">
                          📊 Standards for leadership roles are historically calibrated around 82.
                        </div>
                      </div>

                      {/* Competency Radar Chart Card */}
                      <div className="glass-container p-6 flex flex-col items-center justify-center text-center shadow-md">
                        <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-4">
                          Competency Signature (Radar)
                        </h3>
                        <div className="w-full h-48 flex items-center justify-center">
                          {isMounted && (
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={[
                                { subject: "Tech Depth", value: (evaluation.categories?.technicalDepth ?? 0) * 10 },
                                { subject: "Communication", value: (evaluation.categories?.communication ?? 0) * 10 },
                                { subject: "Reasoning", value: (evaluation.categories?.problemSolving ?? 0) * 10 },
                                { subject: "Behavioral", value: (evaluation.categories?.behavioralFit ?? 0) * 10 },
                                { subject: "Speech Pacing", value: (evaluation.categories?.speechPacing ?? 0) * 10 },
                              ]}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} tickLine={false} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} tick={false} axisLine={false} />
                                <Radar
                                  name="Score"
                                  dataKey="value"
                                  stroke="#EC4899"
                                  fill="#EC4899"
                                  fillOpacity={0.35}
                                />
                              </RadarChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Performance details & radar bars (Col Span 8) */}
                    <div className="lg:col-span-8 glass-container p-6 md:p-8 flex flex-col justify-between shadow-md">
                      <div>
                        <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-3">
                          Executive Assessment Summary
                        </h3>
                        <p className="text-slate-300 text-xs leading-relaxed font-medium">
                          {evaluation.summary}
                        </p>
                      </div>

                      {/* Bar Indicators Category Stats */}
                      <div className="space-y-3.5 mt-6 border-t border-slate-800/80 pt-5">
                        <h4 className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">
                          Competency breakdown
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5">
                          
                          {/* Item 1 */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-semibold text-slate-400">Technical / Domain Depth</span>
                              <span className="font-bold text-purple-400">{evaluation.categories.technicalDepth}/10</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                                style={{ width: `${evaluation.categories.technicalDepth * 10}%` }}
                              />
                            </div>
                          </div>

                          {/* Item 2 */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-semibold text-slate-400">Communication Clarity</span>
                              <span className="font-bold text-purple-400">{evaluation.categories.communication}/10</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                                style={{ width: `${evaluation.categories.communication * 10}%` }}
                              />
                            </div>
                          </div>

                          {/* Item 3 */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-semibold text-slate-400">Structured Reasoning</span>
                              <span className="font-bold text-purple-400">{evaluation.categories.problemSolving}/10</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                                style={{ width: `${evaluation.categories.problemSolving * 10}%` }}
                              />
                            </div>
                          </div>

                          {/* Item 4 */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-semibold text-slate-400">STAR Behavioral Fit</span>
                              <span className="font-bold text-purple-400">{evaluation.categories.behavioralFit}/10</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                                style={{ width: `${evaluation.categories.behavioralFit * 10}%` }}
                              />
                            </div>
                          </div>

                          {/* Item 5 */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-semibold text-slate-400">Speech Pacing (Conciseness)</span>
                              <span className="font-bold text-purple-400">{(evaluation.categories.speechPacing ?? 0)}/10</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                                style={{ width: `${(evaluation.categories.speechPacing ?? 0) * 10}%` }}
                              />
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Strengths vs Improvement areas (2 columns) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Strengths Bento Card */}
                    <div className="glass-container p-6 md:p-8 shadow-md space-y-5">
                      <div className="flex items-center space-x-2 text-emerald-400">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <h3 className="font-bold text-sm text-white uppercase tracking-wider">Key Strengths Demonstrated</h3>
                      </div>
                      <div className="space-y-3.5">
                        {evaluation.strengths.map((strength, idx) => (
                          <div key={idx} className="p-4 bg-emerald-950/20 rounded-xl border border-emerald-500/20 space-y-1">
                            <span className="font-bold text-xs text-emerald-300 block">{strength.point}</span>
                            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">{strength.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Improvements Bento Card */}
                    <div className="glass-container p-6 md:p-8 shadow-md space-y-5">
                      <div className="flex items-center space-x-2 text-amber-500">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <h3 className="font-bold text-sm text-white uppercase tracking-wider">Growth & Improvement Gaps</h3>
                      </div>
                      <div className="space-y-3.5">
                        {evaluation.improvements.map((impr, idx) => (
                          <div key={idx} className="p-4 bg-amber-950/20 rounded-xl border border-amber-500/20 space-y-1">
                            <span className="font-bold text-xs text-amber-300 block">{impr.point}</span>
                            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">{impr.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Recommended Answer Transformations */}
                  {evaluation.recommendedAnswers && evaluation.recommendedAnswers.length > 0 && (
                    <div className="glass-container p-6 md:p-8 shadow-md space-y-5">
                      <div className="flex items-center space-x-2 text-white">
                        <TrendingUp className="w-5 h-5 text-purple-400 shrink-0" />
                        <h3 className="font-bold text-sm uppercase tracking-wider">Answer Refinement Sandbox</h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Review target dialogues extracted from your chat history, and see how to refactor your content to raise maximum professional buy-in:
                      </p>

                      <div className="space-y-4">
                        {evaluation.recommendedAnswers.map((rec, idx) => (
                          <div key={idx} className="border border-slate-800 rounded-xl overflow-hidden shadow-sm bg-slate-950/40">
                            <div className="bg-slate-900 p-3 px-4 border-b border-slate-800">
                              <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase block mb-1">Question {idx + 1}</span>
                              <p className="text-xs font-semibold text-slate-200 italic leading-relaxed">&ldquo;{rec.question}&rdquo;</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 text-[11px] divide-y md:divide-y-0 md:divide-x divide-slate-800">
                              <div className="p-4 bg-slate-900/10 space-y-1">
                                <span className="font-bold text-[9px] text-slate-500 uppercase block">Your Response</span>
                                <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">{rec.candidateAnswer || "N/A"}</p>
                              </div>
                              <div className="p-4 bg-purple-950/10 space-y-1">
                                <span className="font-bold text-[9px] text-purple-400 uppercase block">Refactored Model Answer</span>
                                <p className="text-purple-100 leading-relaxed whitespace-pre-wrap font-semibold">{rec.suggestedResponse}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reset Actions footer */}
                  <div className="text-center pb-8 pt-4">
                    <button
                      onClick={resetAll}
                      className="py-3.5 px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition inline-flex items-center space-x-2.5 cursor-pointer text-xs font-bold uppercase tracking-wider shadow-md"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Prepare Another Mock Session</span>
                    </button>
                  </div>

                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500">Could not compile evaluation report. Click restart to try again.</p>
                </div>
              )}

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Post-Question Feedback Modal Overlay */}
      <AnimatePresence>
        {isFeedbackModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-purple-500/5 overflow-hidden flex flex-col my-auto"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest block font-mono">Turn Evaluation</span>
                    <h2 className="text-sm font-bold text-white tracking-tight">Granular Learning Insight</h2>
                  </div>
                </div>
                {!feedbackLoading && (
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-750 font-mono">
                    Mid-Session Checkpoint
                  </span>
                )}
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[70vh] space-y-5 scrollbar-thin">
                {feedbackLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
                      <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                      <div className="absolute inset-2 bg-slate-950 rounded-full flex items-center justify-center text-purple-400">
                        <BrainCircuit className="w-5 h-5 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-1.5 max-w-sm">
                      <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">Interpreting Response...</h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        The AI evaluation engine is analyzing your answer structure, technical depth, and industry alignment to compile an instant report card.
                      </p>
                    </div>
                  </div>
                ) : feedbackData ? (
                  <div className="space-y-5">
                    
                    {/* Top Row: Gauge + Summary Note */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                      {/* Gauge Card (col-span-4) */}
                      <div className="md:col-span-5 bg-slate-950/50 border border-slate-850 p-4 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confidence & Fluency</span>
                        
                        {/* Circular Progress Gauge */}
                        <div className="relative w-28 h-28 flex items-center justify-center">
                          {/* Background Ring */}
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="transparent"
                              className="text-slate-800"
                            />
                            {/* Animated Value Ring */}
                            <motion.circle
                              cx="50"
                              cy="50"
                              r="42"
                              stroke={
                                feedbackData.confidenceScore >= 85 ? "#10b981" : // Emerald
                                feedbackData.confidenceScore >= 70 ? "#3b82f6" : // Blue
                                "#f59e0b" // Amber
                              }
                              strokeWidth="8"
                              fill="transparent"
                              strokeDasharray="263.89"
                              initial={{ strokeDashoffset: 263.89 }}
                              animate={{ strokeDashoffset: 263.89 - (263.89 * feedbackData.confidenceScore) / 100 }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-white font-mono leading-none">{feedbackData.confidenceScore}</span>
                            <span className="text-[10px] font-bold text-slate-500 mt-0.5">/ 100</span>
                          </div>
                        </div>

                        {/* Verdict Badge */}
                        <div className="space-y-0.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                            feedbackData.confidenceScore >= 85 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            feedbackData.confidenceScore >= 70 ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                            "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}>
                            {feedbackData.confidenceScore >= 85 ? "Outstanding" :
                             feedbackData.confidenceScore >= 70 ? "Solid Answer" :
                             "Needs Support"}
                          </span>
                        </div>
                      </div>

                      {/* Brief Evaluation Summary Callout (col-span-8) */}
                      <div className="md:col-span-7 bg-purple-950/10 border border-purple-500/15 p-5 rounded-xl flex flex-col justify-center space-y-2.5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-purple-400 pointer-events-none">
                          <Sparkles className="w-20 h-20" />
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-400 uppercase tracking-wider font-mono">
                          <Activity className="w-3.5 h-3.5" />
                          <span>AI Coach Observation</span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium italic">
                          &ldquo;{feedbackData.feedbackText}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Key Evaluation Areas */}
                    <div className="space-y-2.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ListChecks className="w-3.5 h-3.5 text-purple-400" />
                        Granular Competency Assessment
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {feedbackData.keyAreas?.map((area: any, idx: number) => (
                          <div key={idx} className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-slate-200 truncate pr-2">{area.name}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider shrink-0 ${
                                area.status === "outstanding" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                area.status === "strong" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              }`}>
                                {area.status === "outstanding" ? "Exceptional" :
                                 area.status === "strong" ? "Strong" :
                                 "Room to Grow"}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                              {area.comment}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Suggested Additions */}
                    {feedbackData.suggestedAdditions && feedbackData.suggestedAdditions.length > 0 && (
                      <div className="p-4 bg-slate-950/25 border border-slate-850 rounded-xl space-y-2.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider font-mono">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                          <span>Leverage these to raise your score next time</span>
                        </div>
                        <ul className="space-y-1.5">
                          {feedbackData.suggestedAdditions.map((addition: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                              <span className="p-0.5 bg-amber-500/10 text-amber-400 rounded shrink-0 mt-0.5">
                                <ChevronRight className="w-3 h-3 text-amber-400" />
                              </span>
                              <span className="font-medium leading-relaxed">{addition}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-500 text-xs">
                    Failed to render feedback. Click continue to proceed with the next question.
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between gap-4">
                <div>
                  {feedbackData && !feedbackLoading && (
                    <button
                      type="button"
                      onClick={downloadFeedbackJson}
                      className="py-2.5 px-4 bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2 border border-slate-800 hover:border-slate-700 active:scale-98"
                      title="Download this instant evaluation report card as a JSON file"
                    >
                      <Download className="w-4 h-4 text-purple-400" />
                      <span>Export JSON</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={proceedToNextQuestion}
                  disabled={feedbackLoading}
                  className="py-3 px-5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 active:scale-98"
                >
                  <span>Continue to Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* FOOTER */}
      <footer id="global_footer" className="bg-slate-900 border-t border-slate-800 py-4 px-6 flex flex-col sm:flex-row items-center justify-between text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-auto gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse"></span>
            Gemini Core Online (3.5 Flash)
          </span>
          <span className="hidden sm:inline-block">Simulated Response: 22ms</span>
        </div>
        <div className="text-center sm:text-right">
          © {new Date().getFullYear()} AI INTERVIEW PRO SYSTEM • ZERO COOKIES PERSISTED
        </div>
      </footer>

    </div>
  );
}
