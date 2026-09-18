const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
} = require("docx");

// Color Palette Constants
const COLOR_PRIMARY = "1E3A8A";    // Deep Navy / Indigo
const COLOR_SECONDARY = "0284C7";  // Cyan / Sky Blue
const COLOR_DARK = "0F172A";       // Slate 900
const COLOR_BODY = "334155";       // Slate 700
const COLOR_MUTED = "64748B";      // Slate 500
const COLOR_BG_LIGHT = "F8FAFC";   // Slate 50
const COLOR_BORDER = "CBD5E1";     // Slate 300
const COLOR_ACCENT = "4F46E5";     // Indigo 600

function createHeaderCell(text, widthPercent) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: "1E3A8A" },
    margins: { top: 140, bottom: 140, left: 180, right: 180 },
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({
            text,
            bold: true,
            color: "FFFFFF",
            size: 20, // 10pt
            font: "Calibri",
          }),
        ],
      }),
    ],
  });
}

function createDataCell(text, widthPercent, isCode = false, isAlt = false) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: isAlt ? { type: ShadingType.CLEAR, fill: "F1F5F9" } : undefined,
    margins: { top: 120, bottom: 120, left: 160, right: 160 },
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({
            text,
            color: isCode ? "0969DA" : COLOR_BODY,
            font: isCode ? "Consolas" : "Calibri",
            size: isCode ? 18 : 20, // 9pt for code, 10pt for normal
          }),
        ],
      }),
    ],
  });
}

function createSectionTitle(number, title) {
  return [
    new Paragraph({
      spacing: { before: 360, after: 120 },
      heading: HeadingLevel.HEADING_1,
      children: [
        new TextRun({
          text: `${number}. ${title}`,
          bold: true,
          color: COLOR_PRIMARY,
          size: 32, // 16pt
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 160 },
      border: { bottom: { color: COLOR_SECONDARY, size: 8, style: BorderStyle.SINGLE } },
      children: [],
    }),
  ];
}

function createSubTitle(title) {
  return new Paragraph({
    spacing: { before: 240, after: 100 },
    heading: HeadingLevel.HEADING_2,
    children: [
      new TextRun({
        text: title,
        bold: true,
        color: COLOR_ACCENT,
        size: 26, // 13pt
        font: "Calibri",
      }),
    ],
  });
}

function createParagraph(text, isBold = false) {
  return new Paragraph({
    spacing: { after: 120, line: 276 },
    children: [
      new TextRun({
        text,
        color: COLOR_BODY,
        size: 22, // 11pt
        font: "Calibri",
        bold: isBold,
      }),
    ],
  });
}

function createBullet(title, description, isCodeTitle = false) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 100, line: 260 },
    children: [
      new TextRun({
        text: title + (title.endsWith(":") ? " " : ": "),
        bold: true,
        color: COLOR_DARK,
        font: isCodeTitle ? "Consolas" : "Calibri",
        size: 21,
      }),
      new TextRun({
        text: description,
        color: COLOR_BODY,
        font: "Calibri",
        size: 21,
      }),
    ],
  });
}

function createCallout(title, text) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      left: { style: BorderStyle.SINGLE, size: 24, color: COLOR_ACCENT },
      top: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: "EEF2FF" },
            margins: { top: 140, bottom: 140, left: 200, right: 200 },
            children: [
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  new TextRun({
                    text: title,
                    bold: true,
                    color: COLOR_ACCENT,
                    size: 22,
                    font: "Calibri",
                  }),
                ],
              }),
              new Paragraph({
                spacing: { line: 260 },
                children: [
                  new TextRun({
                    text,
                    color: COLOR_BODY,
                    size: 20,
                    font: "Calibri",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

async function buildDocument() {
  const doc = new Document({
    title: "RankQuest System Architecture & Workflow Specification",
    description: "In-depth technical breakdown of the RankQuest JEE platform",
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            color: COLOR_BODY,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, // 1 inch margins
          },
        },
        children: [
          // Document Header / Title
          new Paragraph({
            spacing: { before: 200, after: 100 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "RankQuest",
                bold: true,
                color: COLOR_PRIMARY,
                size: 54, // 27pt
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 80 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Comprehensive System Architecture & Workflow Specification",
                bold: true,
                color: COLOR_SECONDARY,
                size: 28, // 14pt
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 360 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Full Technical Breakdown: Student Lifecycle, Adaptive Engine Mechanics, Database Schema, Ingestion Pipeline & Cloud Deployment",
                italics: true,
                color: COLOR_MUTED,
                size: 20,
                font: "Calibri",
              }),
            ],
          }),

          // Metadata Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "E2E8F0" },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  createDataCell("Project Target", 25, false, true),
                  createDataCell("IIT-JEE Main & Advanced Adaptive Preparation Platform", 75, false, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("Architecture Stack", 25, false, false),
                  createDataCell("Next.js 14 (App Router), TypeScript, Prisma ORM, Supabase (PostgreSQL), Tailwind CSS, KaTeX", 75, false, false),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("Dataset Source", 25, false, true),
                  createDataCell("Hugging Face soughed/jee-main-questions (1,500+ Cleaned Multi-Discipline Problems)", 75, false, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("Document Version & Date", 25, false, false),
                  createDataCell("v1.0.0 Production Release | September 2026", 75, false, false),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 300 }, children: [] }),

          // 1. Executive Summary
          ...createSectionTitle("1", "Executive Summary & System Overview"),
          createParagraph(
            "RankQuest is an intelligent, high-stakes adaptive examination and diagnostics platform engineered specifically for IIT-JEE candidates. Unlike conventional mock test suites that rely on static question sets or uncurated synthetic test data, RankQuest is built upon a rigorously sanitized database of authentic JEE Main and Advanced questions ingested directly from Hugging Face."
          ),
          createParagraph(
            "The platform dynamically benchmarks each candidate against a 7-tier competency hierarchy (Level 1: Foundations & Recall through Level 7: Advanced Elite Problem Solver). A calibrated 30-question diagnostic suite establishes an initial baseline, followed by rolling-window real-time difficulty adaptation, granular topic mastery tracking, and official 300-mark JEE Main simulations."
          ),

          // 2. End-to-End System Flow & Student Lifecycle
          ...createSectionTitle("2", "End-to-End System Flow & Student Lifecycle"),
          createParagraph(
            "The student journey is governed by deterministic state transitions enforced both at the UI layer and across backend API interceptors. The complete lifecycle proceeds through the following sequential phases:"
          ),
          createSubTitle("Phase 1: Student Registration & Credential Provisioning"),
          createParagraph(
            "Candidates initiate their onboarding at /auth/register. Upon form submission, the backend route /api/auth/register hashes the password using bcryptjs (cost factor 10) and creates a User record with isOnboarded strictly set to false. A cryptographically signed JWT session token (7-day validity) is generated and stored in an httpOnly, Secure, SameSite=Lax cookie named rankquest_token. The client is immediately routed to the diagnostic assessment suite."
          ),
          createSubTitle("Phase 2: Calibrated Diagnostic Assessment"),
          createParagraph(
            "Before gaining access to the main dashboard or general practice modes, the student must complete the diagnostic suite at /diagnostic. The page queries /api/diagnostic/questions, which generates a 30-question test composed of exactly 10 questions per subject (Physics, Chemistry, Mathematics). Within each subject, questions span calibrated difficulty tiers: 2 questions at L1, 3 questions at L2, 3 questions at L3, and 2 questions at L4/L5. Solutions and correct answers are stripped from the payload to prevent client-side inspection."
          ),
          createSubTitle("Phase 3: Diagnostic Scoring & Competency Tier Assignment"),
          createParagraph(
            "When the student finishes the assessment, /api/diagnostic/submit evaluates each answer (SCQ exact match or NVQ numerical float comparison within a 0.05 tolerance). The AdaptiveEngine executes weighted scoring to compute an authentic starting tier (L1 to L7) for each subject independently. The engine updates SubjectLevel records, creates initial TopicMastery rows, records a completed TestSession of type 'DIAGNOSTIC', and flips the student's isOnboarded flag to true."
          ),
          createSubTitle("Phase 4: Main Analytics Dashboard & Weak Area Profiling"),
          createParagraph(
            "Once onboarded, students are admitted to /dashboard. The dashboard serves as the central command center, presenting: (a) Current competency tiers across Physics, Chemistry, and Mathematics; (b) A 9-axis radar visualization analyzing mastery across core JEE domains; (c) Speed versus accuracy scatter plots derived from recent submissions; (d) High-priority weak topics exhibiting mastery scores below 65%; and (e) Historical test session score cards."
          ),
          createSubTitle("Phase 5: Dynamic Adaptive Practice Sessions"),
          createParagraph(
            "Students initiate targeted drills via /practice/quiz, selecting either a specific subject or a targeted weak topic. For each question, /api/practice/next queries the database for an unattempted question matching the student's current tier. When an answer is submitted to /api/practice/submit, the system evaluates correctness, logs time taken, updates the topic mastery score, and executes a rolling-window promotion/demotion evaluation over the last 5 questions."
          ),
          createSubTitle("Phase 6: Full-Scale JEE Main Mock Simulations"),
          createParagraph(
            "At /mock-test/jee-full, students undertake a comprehensive 3-hour, 300-mark official simulation consisting of 90 total questions (Section A: 20 SCQs per subject with +4/-1 marking; Section B: 10 NVQs per subject with +4/0 marking). Submissions compute real-time score breakdowns, accuracy rates, and percentile projections based on historical JEE Main distributions."
          ),

          new Paragraph({ spacing: { after: 160 }, children: [] }),
          createCallout(
            "Security & Onboarding Guard",
            "Any attempt by an un-onboarded student (isOnboarded = false) to access the dashboard or practice quiz routes is automatically intercepted and redirected to /diagnostic until the baseline assessment is officially submitted."
          ),

          // 3. Backend Architecture & Route Handlers
          ...createSectionTitle("3", "Backend Architecture & Route Handlers"),
          createParagraph(
            "RankQuest is implemented using the Next.js 14 App Router API framework. All server endpoints reside under src/app/api/ and are configured with standard Node.js serverless runtimes (export const runtime = 'nodejs') and dynamic request handling (export const dynamic = 'force-dynamic') to prevent stale pre-rendering at build time."
          ),

          // API Routes Table
          new Paragraph({
            spacing: { before: 160, after: 120 },
            children: [
              new TextRun({
                text: "Table 1: Complete Backend Route Handler Inventory",
                bold: true,
                color: COLOR_DARK,
                size: 22,
                font: "Calibri",
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
              left: { style: BorderStyle.SINGLE, size: 2, color: COLOR_BORDER },
              right: { style: BorderStyle.SINGLE, size: 2, color: COLOR_BORDER },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "E2E8F0" },
              insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "E2E8F0" },
            },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell("Endpoint Route", 26),
                  createHeaderCell("HTTP", 10),
                  createHeaderCell("Auth Required", 14),
                  createHeaderCell("Functionality & Role", 50),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("/api/auth/register", 26, true, false),
                  createDataCell("POST", 10, false, false),
                  createDataCell("No", 14, false, false),
                  createDataCell("Validates input, hashes password via bcrypt, creates user with isOnboarded=false, sets JWT cookie.", 50, false, false),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("/api/auth/login", 26, true, true),
                  createDataCell("POST", 10, false, true),
                  createDataCell("No", 14, false, true),
                  createDataCell("Authenticates credentials, signs 7-day JWT, sets httpOnly cookie, determines redirect destination.", 50, false, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("/api/auth/logout", 26, true, false),
                  createDataCell("POST", 10, false, false),
                  createDataCell("No", 14, false, false),
                  createDataCell("Terminates active session by expiring rankquest_token cookie (maxAge=0).", 50, false, false),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("/api/auth/me", 26, true, true),
                  createDataCell("GET", 10, false, true),
                  createDataCell("Yes", 14, false, true),
                  createDataCell("Returns profile metadata, calculates consecutive active streak days, and computes total XP.", 50, false, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("/api/diagnostic/questions", 26, true, false),
                  createDataCell("GET", 10, false, false),
                  createDataCell("No", 14, false, false),
                  createDataCell("Supplies 30 calibrated diagnostic questions across Physics, Chem, and Math with stripped solutions.", 50, false, false),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("/api/diagnostic/submit", 26, true, true),
                  createDataCell("POST", 10, false, true),
                  createDataCell("Yes", 14, false, true),
                  createDataCell("Scores assessment, computes L1-L7 tiers via AdaptiveEngine, initializes masteries, sets isOnboarded=true.", 50, false, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("/api/dashboard/stats", 26, true, false),
                  createDataCell("GET", 10, false, false),
                  createDataCell("Yes", 14, false, false),
                  createDataCell("Aggregates subject tiers, computes 9-domain radar data, filters weak topics (<65%), builds scatter plots.", 50, false, false),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("/api/practice/next", 26, true, true),
                  createDataCell("POST", 10, false, true),
                  createDataCell("Yes", 14, false, true),
                  createDataCell("Retrieves next adaptive question using tier matching, adjacent tier fallback, and topic filtering.", 50, false, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("/api/practice/submit", 26, true, false),
                  createDataCell("POST", 10, false, false),
                  createDataCell("Yes", 14, false, false),
                  createDataCell("Evaluates answer, updates topic mastery, checks anti-guessing (<15s), evaluates level promotion/demotion.", 50, false, false),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("/api/mock-test/session", 26, true, true),
                  createDataCell("GET/POST", 10, false, true),
                  createDataCell("Yes (POST)", 14, false, true),
                  createDataCell("GET generates 90-question full JEE simulation; POST grades answers with +4/-1 scheme and estimates percentile.", 50, false, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("/api/subject/[id]", 26, true, false),
                  createDataCell("GET", 10, false, false),
                  createDataCell("Yes", 14, false, false),
                  createDataCell("Returns detailed syllabus breakdown, chapter aggregations, question counts, and mastery percentages.", 50, false, false),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("/api/profile/reset-diagnostic", 26, true, true),
                  createDataCell("POST", 10, false, true),
                  createDataCell("Yes", 14, false, true),
                  createDataCell("Resets student onboarding flag to false and returns tiers to L1 for recalibration.", 50, false, true),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 200 }, children: [] }),
          createSubTitle("Request Interception & Session Verification"),
          createParagraph(
            "Every authenticated endpoint calls getCurrentUser() from src/lib/auth/jwt.ts. The utility inspects incoming cookies for rankquest_token. To guarantee seamless compatibility with reverse proxies, API clients, and CDN edge terminations, it incorporates an automatic fallback that checks the Authorization: Bearer <token> request header. The extracted user ID is cross-referenced with the database to verify that the account remains active and to fetch real-time onboarding status."
          ),

          // 4. Database Schema & Entity Relationships
          ...createSectionTitle("4", "Database Schema & Entity Relationships"),
          createParagraph(
            "The data model is authored in Prisma (prisma/schema.prisma) and targets Supabase PostgreSQL in production while maintaining development parity with local SQLite engines. The relational architecture comprises 6 core models:"
          ),
          createBullet("User", "Root identity entity storing credentials, name, email, target examination year, avatar, and onboarding status flag. Configured with cascade deletion to clean up dependent rows upon account removal.", true),
          createBullet("SubjectLevel", "Stores real-time competency rating per subject (PHYSICS, CHEMISTRY, MATHEMATICS). Holds currentLevel (1-7), accumulated experiencePoints, and overall accuracyRate. Enforced by a compound unique constraint @@unique([userId, subject]).", true),
          createBullet("Question", "The central repository of ingested JEE questions. Attributes include subject, chapter domain, topic, subtopic, difficulty (1-7), question type (SCQ or NVQ), stem (LaTeX Markdown), options (JSON array), correctAnswer, and step-by-step solution.", true),
          createBullet("TestSession", "Encapsulates distinct testing events (DIAGNOSTIC, ADAPTIVE_QUIZ, or FULL_MOCK). Records aggregate score, total marks, time spent in seconds, counts of correct, incorrect, and unattempted answers, and completion timestamp.", true),
          createBullet("Submission", "Logs every individual question attempt. Stores the user's submitted answer, boolean correctness, time taken in seconds, and levelAtTime (capturing the question difficulty at the moment of the attempt).", true),
          createBullet("TopicMastery", "Maintains high-resolution micro-concept mastery scores (0 to 100) per topic (e.g., 'Current Electricity', 'Definite Integration'). Enforced by a compound unique constraint @@unique([userId, topicName]).", true),

          new Paragraph({ spacing: { after: 160 }, children: [] }),
          createCallout(
            "Mathematical Formula for Topic Mastery Updates",
            "When a question is answered during practice, the topic's mastery score is adjusted using the formula:\n\n" +
            "Δ = +(difficulty / 7) * 20   [if answered correctly]\n" +
            "Δ = -15                       [if answered incorrectly]\n\n" +
            "New Mastery = clamp(Current Mastery + Δ, 5, 100)\n\n" +
            "This mechanism ensures that conquering difficult problems (L5-L7) produces substantial mastery gains, while wrong answers incur a consistent penalty to trigger targeted revision."
          ),

          // 5. The Adaptive Engine Mechanics
          ...createSectionTitle("5", "The Adaptive Engine Mechanics"),
          createParagraph(
            "The algorithmic core of RankQuest resides in src/lib/adaptive/engine.ts. The engine provides mathematical precision across diagnostic placement, dynamic question selection, and rolling-window promotion/demotion."
          ),

          // Tiers Table
          new Paragraph({
            spacing: { before: 120, after: 100 },
            children: [
              new TextRun({
                text: "Table 2: The Seven JEE Competency Tiers (L1–L7)",
                bold: true,
                color: COLOR_DARK,
                size: 22,
                font: "Calibri",
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
              left: { style: BorderStyle.SINGLE, size: 2, color: COLOR_BORDER },
              right: { style: BorderStyle.SINGLE, size: 2, color: COLOR_BORDER },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "E2E8F0" },
              insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "E2E8F0" },
            },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell("Tier", 10),
                  createHeaderCell("Classification Title", 32),
                  createHeaderCell("Pedagogical Scope & JEE Relevance", 58),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("L1", 10, true, false),
                  createDataCell("Foundations & Recall", 32, false, false),
                  createDataCell("Direct formula recall, units and dimensions, fundamental definitions, straightforward NCERT questions.", 58, false, false),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("L2", 10, true, true),
                  createDataCell("Single-Concept Application", 32, false, true),
                  createDataCell("Application of a single core equation or concept with standard numerical substitutions.", 58, false, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("L3", 10, true, false),
                  createDataCell("Standard JEE Main Moderate", 32, false, false),
                  createDataCell("The benchmark JEE Main difficulty. Requires algebraic manipulation and intermediate problem formulation.", 58, false, false),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("L4", 10, true, true),
                  createDataCell("Multi-Step Analysis", 32, false, true),
                  createDataCell("Two-step problems requiring intermediate variable substitution, boundary evaluation, or case analysis.", 58, false, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("L5", 10, true, false),
                  createDataCell("JEE Advanced Intro / Multi-Concept", 32, false, false),
                  createDataCell("Cross-chapter problem solving connecting 2 or more distinct subtopics (e.g. Thermodynamics + Kinematics).", 58, false, false),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("L6", 10, true, true),
                  createDataCell("Advanced Problem Solver", 32, false, true),
                  createDataCell("High-complexity JEE Advanced problems featuring intricate coordinate geometry, non-trivial integrals, or multiple constraints.", 58, false, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("L7", 10, true, false),
                  createDataCell("Olympiad & Elite Advanced", 32, false, false),
                  createDataCell("Top-percentile elite questions demanding creative mathematical synthesis, symmetry arguments, and multi-variable optimization.", 58, false, false),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 200 }, children: [] }),
          createSubTitle("Diagnostic Placement Algorithm"),
          createParagraph(
            "Diagnostic placement evaluates test performance by weighting each answer against question difficulty rather than computing a simple unweighted percentage. For each question i:"
          ),
          createBullet("Weight Assignment", "weight_i = levelAtTime_i (defaults to 2 if unspecified). Max possible weighted marks = weight_i * 4.", false),
          createBullet("Score Accumulation", "If correct: weightedScore += weight_i * 4. If incorrect: weightedScore = max(0, weightedScore - 1) [imposing a calibrated -1 penalty].", false),
          createBullet("Weighted Ratio", "weightedRatio = weightedScore / maxWeightedScore.", false),
          createParagraph(
            "Starting tiers are assigned based on strict ratio thresholds: ratio >= 0.85 -> Level 6; ratio >= 0.72 -> Level 5; ratio >= 0.58 -> Level 4; ratio >= 0.44 -> Level 3; ratio >= 0.30 -> Level 2; and ratio < 0.30 -> Level 1. Experience points are awarded as: XP = (correctCount * 75) + (assignedLevel * 50)."
          ),

          createSubTitle("Dynamic Question Selection Algorithm"),
          createParagraph(
            "The method calculateNextQuestion queries the available question bank through a deterministic 3-tier fallback strategy:"
          ),
          createBullet("Filter Unattempted", "Eliminates all question IDs previously attempted by the student in the current session.", false),
          createBullet("Topic Narrowing", "If a target topic is specified, filters candidates to that topic. If exhausted, broadens back to the full subject pool.", false),
          createBullet("Priority 1 (Exact Match)", "Searches for unattempted questions where difficulty == currentLevel. Returns a random pick if available.", false),
          createBullet("Priority 2 (Adjacent Tier)", "Searches for unattempted questions where |difficulty - currentLevel| <= 1. Returns a random pick if available.", false),
          createBullet("Priority 3 (Distance Fallback)", "Sorts remaining unattempted questions by min |difficulty - currentLevel| and selects the nearest item.", false),

          createSubTitle("Rolling-Window Level Shifts & Anti-Guessing Heuristics"),
          createParagraph(
            "During adaptive practice drills, evaluateLevelShift evaluates the student's rolling history over a window of W = min(5, recentCount) questions. At least 3 questions must be completed in the window before a promotion or demotion can trigger:"
          ),
          createBullet("Promotion Threshold", "Accuracy >= 80% on current level questions triggers a level increase (Ln -> Ln+1, bounded at L7), accompanied by a +100 XP promotion bonus.", false),
          createBullet("Demotion Threshold", "Accuracy <= 40% triggers a level decrease (Ln -> Ln-1, bounded at L1) to reinforce core concepts and rebuild confidence.", false),
          createBullet("Stability Band", "Accuracy between 41% and 79% maintains the student at their current tier to reinforce subtopic edge cases.", false),
          createBullet("Anti-Rapid-Guessing Heuristic", "If a student answers incorrectly in less than 15 seconds, the attempt is flagged as a rapid guess. Participation XP is set to 0 to discourage reckless elimination guessing.", false),
          createBullet("XP & Streak Compounding", "Base attempt XP is calculated as (currentLevel * 15) + 10. Consecutive correct answers award a streak bonus of min(streak * 5, 25) XP.", false),

          // 6. Data Ingestion & Sanitization Pipeline
          ...createSectionTitle("6", "Data Ingestion & Sanitization Pipeline"),
          createParagraph(
            "The question ingestion pipeline is implemented in scripts/ingest-hf-dataset.ts. It streams raw JSONL records from the Hugging Face dataset repository (soughed/jee-main-questions) across physics, chemistry, and mathematics splits."
          ),
          createSubTitle("Sanitization & OCR Normalization (cleanAndFormatMath)"),
          createBullet("Hindi & Corrupted Glyph Stripping", "Removes legacy Hindi fonts, devanagari characters [\\u0900-\\u097F], and OCR garbled strings such as ';fn', 'okys', and 'dks pØ'.", false),
          createBullet("Broken Exponent Repair", "Regex repairs common OCR scanning errors where superscripts were concatenated into variable names (e.g., 'y2x' -> 'y^2 x', 'm/s2' -> 'm/s^2').", false),
          createBullet("LaTeX Delimiter Standardization", "Transforms LaTeX brackets \\( ... \\) and \\[ ... \\] into standard inline $ ... $ and block $$ ... $$ for seamless KaTeX rendering.", false),
          createBullet("Scientific Notation Normalization", "Converts plain text scientific representations (e.g., '3.0 × 10^-4') into proper mathematical LaTeX expressions ($3.0 \\times 10^{-4}$).", false),

          createSubTitle("Strict Data Quality Filters"),
          createBullet("Zero Broken OCR Diagrams", "Any question whose stem, options, or solution contains an [IMAGE] token is immediately dropped to prevent student confusion.", false),
          createBullet("Boilerplate Exclusion", "Drops corrupted rows containing generic exam directions (e.g. 'has four choices', 'Directions: Each question has', or length < 20 characters).", false),
          createBullet("Pristine 4-Option Verification", "Single-choice questions must contain exactly 4 non-empty options. Discards malformed rows where options are equation fragments (e.g. starting with '= ') or placeholder letters ('A', 'B', 'C', 'D').", false),
          createBullet("Numerical Answer Validation", "Numerical value questions (NVQs) are verified to ensure valid floating-point parseability.", false),
          createBullet("Automated Chapter Mapping", "Heuristically classifies hundreds of discrete topics into foundational JEE chapters (e.g., Mechanics, Electrodynamics, Organic Chemistry, Calculus).", false),
          createBullet("Zero Mock User Policy", "At the conclusion of the ingestion run, any mock or test users created during testing are strictly purged to guarantee a clean database.", false),

          // 7. Production Deployment & Infrastructure Runbook
          ...createSectionTitle("7", "Production Deployment & Infrastructure Runbook"),
          createParagraph(
            "RankQuest is configured for production hosting on Vercel paired with a Supabase PostgreSQL managed database. The deployment process follows four verified steps:"
          ),
          createSubTitle("Step 1: Supabase Managed Database Provisioning"),
          createParagraph(
            "Create a new Supabase project in the target region (e.g. ap-south-1 Mumbai). Retrieve the Transaction Pooler URI (port 6543 with ?pgbouncer=true) for runtime queries, and the Direct Connection URI (port 5432) for running Prisma migrations."
          ),
          createSubTitle("Step 2: Schema Migration & Question Bank Seeding"),
          createParagraph(
            "Export the connection strings in your local terminal and push the Prisma schema directly to Supabase:\n\n" +
            "$env:DATABASE_URL=\"postgresql://postgres.[REF]:[PW]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true\"\n" +
            "$env:DIRECT_URL=\"postgresql://postgres.[REF]:[PW]@aws-0-[REGION].pooler.supabase.com:5432/postgres\"\n" +
            "npx prisma db push\n" +
            "npm run seed\n\n" +
            "This applies all tables, compound indexes, and cascades to Supabase and populates the database with over 1,500+ cleaned JEE problems."
          ),
          createSubTitle("Step 3: Vercel Project Import & Environment Configuration"),
          createParagraph(
            "Import the GitHub repository (mxdhuwu/RankQuest) into Vercel. In Project Settings -> Environment Variables, configure DATABASE_URL, DIRECT_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, JWT_SECRET (256-bit random key), and NEXT_PUBLIC_APP_URL. The package.json postinstall hook ('prisma generate') automatically compiles the Prisma Client engine during build time."
          ),
          createSubTitle("Step 4: Post-Deployment Smoke Verification"),
          createParagraph(
            "Verify the live deployment at https://rankquest.vercel.app: (1) Register a test account; (2) Complete the 30-question diagnostic; (3) Verify tier assignment and dashboard radar charts; (4) Execute an adaptive practice quiz; and (5) Launch a full-length mock simulation."
          ),

          new Paragraph({ spacing: { after: 300 }, children: [] }),
          createCallout(
            "Documentation Verification",
            "This specification accurately represents the production codebase as implemented on branch main of https://github.com/mxdhuwu/RankQuest."
          ),
        ],
      },
    ],
  });

  const outputPath = path.resolve(__dirname, "..", "RankQuest_Project_Workflow_Explanation.docx");
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Word document generated successfully at: ${outputPath}`);
}

buildDocument().catch((err) => {
  console.error("Error generating docx:", err);
  process.exit(1);
});
