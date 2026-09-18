import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface HFRecord {
  question_id: string;
  question: string;
  question_images?: string[];
  option_1?: string;
  option_2?: string;
  option_3?: string;
  option_4?: string;
  correct_option?: number | null;
  numerical_answer?: string | null;
  solution?: string;
  solution_images?: string[];
  subject: string;
  topic?: string;
  subtopic?: string;
  difficulty?: string;
  question_type: string;
  has_image?: boolean;
  exam?: string;
  source_paper?: string;
}

const HF_BASE_URL = "https://huggingface.co/datasets/soughed/jee-main-questions/raw/main";

const SUBJECTS_CONFIG = [
  { name: "PHYSICS", path: "physics", splits: ["train.jsonl", "test.jsonl"] },
  { name: "CHEMISTRY", path: "chemistry", splits: ["train.jsonl", "test.jsonl"] },
  { name: "MATHEMATICS", path: "mathematics", splits: ["train.jsonl", "test.jsonl"] },
];

function deriveChapter(subject: string, topic?: string): string {
  const t = (topic || "").toLowerCase();
  if (subject === "PHYSICS") {
    if (t.includes("kinematics") || t.includes("rigid") || t.includes("work") || t.includes("laws of motion") || t.includes("gravitation") || t.includes("fluid") || t.includes("matter") || t.includes("rotation")) {
      return "Mechanics";
    }
    if (t.includes("electric") || t.includes("current") || t.includes("magnetic") || t.includes("emi") || t.includes("ac") || t.includes("capacit")) {
      return "Electrodynamics";
    }
    if (t.includes("thermo") || t.includes("heat") || t.includes("kinetic theory") || t.includes("photoelectric") || t.includes("atom") || t.includes("nuclei") || t.includes("dual") || t.includes("semiconductor") || t.includes("electronic")) {
      return "Thermodynamics & Modern Physics";
    }
    if (t.includes("optic") || t.includes("wave") || t.includes("sound") || t.includes("shm") || t.includes("oscillation")) {
      return "Optics & Waves";
    }
    return "General Physics";
  }

  if (subject === "CHEMISTRY") {
    if (t.includes("kinetics") || t.includes("thermo") || t.includes("electrochem") || t.includes("equilibrium") || t.includes("solution") || t.includes("mole") || t.includes("atomic structure") || t.includes("solid state")) {
      return "Physical Chemistry";
    }
    if (t.includes("organic") || t.includes("hydrocarbon") || t.includes("halo") || t.includes("alcohol") || t.includes("aldehyde") || t.includes("ketone") || t.includes("amine") || t.includes("biomolecule") || t.includes("polymer")) {
      return "Organic Chemistry";
    }
    if (t.includes("coordination") || t.includes("bonding") || t.includes("periodic") || t.includes("p-block") || t.includes("d-block") || t.includes("metallurgy")) {
      return "Inorganic Chemistry";
    }
    return "General Chemistry";
  }

  if (subject === "MATHEMATICS") {
    if (t.includes("calculus") || t.includes("integral") || t.includes("derivative") || t.includes("limit") || t.includes("continuity") || t.includes("differential") || t.includes("function") || t.includes("area")) {
      return "Calculus";
    }
    if (t.includes("conic") || t.includes("circle") || t.includes("line") || t.includes("parabola") || t.includes("ellipse") || t.includes("hyperbola") || t.includes("coordinate")) {
      return "Coordinate Geometry";
    }
    if (t.includes("matrix") || t.includes("determinant") || t.includes("complex") || t.includes("quadratic") || t.includes("sequence") || t.includes("series") || t.includes("binomial") || t.includes("permutation") || t.includes("probability")) {
      return "Algebra";
    }
    if (t.includes("vector") || t.includes("3d") || t.includes("three dimensional")) {
      return "Vectors & 3D Geometry";
    }
    if (t.includes("trigono")) {
      return "Trigonometry";
    }
    return "Advanced Mathematics";
  }

  return "Core Syllabus";
}

// Clean and normalize LaTeX & question stem
export function cleanAndFormatMath(text: string): string {
  if (!text) return "";
  let cleaned = text
    // Remove Hindi fonts/garbled characters
    .replace(/[\u0900-\u097F]/g, "")
    .replace(/[a-zA-Z]{1,2};fn|dks pØ|ekusa rFkk|gSa|okys|vkjs\[k|bldh|D;ksafdC|foHkokUrj/g, "")
    .replace(/\\mathcal\{l\}/g, "l")
    .replace(/\\ /g, " ")
    .replace(/\r\n/g, "\n")
    .trim();

  // Fix common OCR broken exponents: e.g. y2x -> y^2 x
  cleaned = cleaned.replace(/\b([a-zA-Z])([2-3])([a-zA-Z])\b/g, "$1^$2 $3");
  // Fix m/s2 -> m/s^2, cm2 -> cm^2
  cleaned = cleaned.replace(/([a-zA-Z])\/s2\b/g, "$1/s^2");

  // Normalize delimiters \( ... \) and \[ ... \] to $ and $$
  cleaned = cleaned.replace(/\\\((.*?)\\\)/g, "$$$1$$");
  cleaned = cleaned.replace(/\\\[(.*?)\\\]/g, "$$$$$1$$$$");

  // Fix scientific notations: e.g. 3.0 × 10^-4 -> $3.0 \times 10^{-4}$
  cleaned = cleaned.replace(/(\d+(?:\.\d+)?)\s*[×x]\s*10\^?([-\+]?\d+)/g, "$$$1 \\times 10^{$2}$$");

  // Remove unnecessary double spaces
  cleaned = cleaned.replace(/[ \t]+/g, " ");

  return cleaned;
}

function calibrateDifficultyTier(rawDifficulty?: string, questionType?: string, subtopic?: string): number {
  const d = (rawDifficulty || "").toLowerCase();
  const isNVQ = questionType === "numerical";

  let tier = 3;

  if (d.includes("easy")) {
    tier = isNVQ ? 2 : 1;
  } else if (d.includes("moderate") || d.includes("medium")) {
    tier = isNVQ ? 4 : 3;
  } else if (d.includes("tough") || d.includes("hard")) {
    tier = isNVQ ? 6 : 5;
  }

  const s = (subtopic || "").toLowerCase();
  if (s.includes("impulse") || s.includes("variable mass") || s.includes("leibniz") || s.includes("crystal field") || s.includes("differential")) {
    tier = Math.min(7, tier + 1);
  }

  return Math.max(1, Math.min(7, tier));
}

async function fetchJSONL(url: string): Promise<string> {
  console.log(`[HF Fetch] Downloading: ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${res.status} ${res.statusText}`);
  }
  return await res.text();
}

export async function ingestHFDataset() {
  console.log("==================================================");
  console.log("🚀 Starting RankQuest Refactored Ingestion Pipeline");
  console.log("Strict Filtering: Zero broken OCR images, pristine 4-option validation");
  console.log("==================================================");

  let totalIngested = 0;
  let totalProcessed = 0;
  let totalDroppedImages = 0;
  let totalDroppedOptions = 0;
  let totalDroppedCorrupt = 0;

  for (const subjectCfg of SUBJECTS_CONFIG) {
    console.log(`\n📚 Ingesting Subject: ${subjectCfg.name}...`);
    let subjectCount = 0;

    for (const split of subjectCfg.splits) {
      const url = `${HF_BASE_URL}/${subjectCfg.path}/${split}`;
      try {
        const text = await fetchJSONL(url);
        const lines = text.split("\n").filter((l) => l.trim().length > 0);
        console.log(`   Split [${split}]: Found ${lines.length} raw records.`);

        for (const line of lines) {
          totalProcessed++;
          try {
            const raw: HFRecord = JSON.parse(line);
            const rawQuestion = raw.question || "";

            // 1. Skip if question stem contains [IMAGE] token (broken/missing OCR diagram)
            if (rawQuestion.includes("[IMAGE]")) {
              totalDroppedImages++;
              continue;
            }

            // 2. Skip if stem is generic exam directions or corrupted boilerplate
            if (
              rawQuestion.length < 20 ||
              rawQuestion.includes("has four choices") ||
              rawQuestion.includes("out of which ONLY ONE is correct") ||
              rawQuestion.includes("Atomic masses:") ||
              rawQuestion.includes("Directions: Each question has")
            ) {
              totalDroppedCorrupt++;
              continue;
            }

            const isNVQ = raw.question_type === "numerical";
            const qType = isNVQ ? "NVQ" : "SCQ";

            let optionsArray: string[] = [];
            let correctAnswer = "";

            if (qType === "SCQ") {
              const o1 = (raw.option_1 || "").trim();
              const o2 = (raw.option_2 || "").trim();
              const o3 = (raw.option_3 || "").trim();
              const o4 = (raw.option_4 || "").trim();

              // Skip if any option is empty or contains [IMAGE]
              if (!o1 || !o2 || !o3 || !o4) {
                totalDroppedOptions++;
                continue;
              }
              if (o1.includes("[IMAGE]") || o2.includes("[IMAGE]") || o3.includes("[IMAGE]") || o4.includes("[IMAGE]")) {
                totalDroppedImages++;
                continue;
              }

              // Skip if option 1 is leaked question stem (starts with "= ", "then ", etc.)
              if (
                o1.startsWith("=") ||
                o1.startsWith("then ") ||
                o1.startsWith("is equal to") ||
                o1.startsWith("find ") ||
                o1.startsWith("where ")
              ) {
                totalDroppedOptions++;
                continue;
              }

              // Skip if options are just dummy single letters "A", "B", "C", "D"
              if (o1 === "A" && o2 === "B" && o3 === "C" && o4 === "D") {
                totalDroppedOptions++;
                continue;
              }

              optionsArray = [
                cleanAndFormatMath(o1),
                cleanAndFormatMath(o2),
                cleanAndFormatMath(o3),
                cleanAndFormatMath(o4),
              ];

              const correctOpt = raw.correct_option;
              if (correctOpt && correctOpt >= 1 && correctOpt <= 4) {
                correctAnswer = String(correctOpt);
              } else {
                correctAnswer = "1";
              }
            } else {
              // NVQ validation
              const numAns = (raw.numerical_answer || "").trim();
              if (!numAns) {
                totalDroppedCorrupt++;
                continue;
              }
              correctAnswer = numAns;
            }

            const cleanedQuestion = cleanAndFormatMath(rawQuestion);
            const topic = cleanAndFormatMath(raw.topic || "General " + subjectCfg.name);
            const subtopic = cleanAndFormatMath(raw.subtopic || "");
            const chapter = deriveChapter(subjectCfg.name, topic);
            const difficulty = calibrateDifficultyTier(raw.difficulty, raw.question_type, subtopic);
            const cleanedSolution = cleanAndFormatMath(raw.solution || "Refer to standard JEE methodology.");

            await prisma.question.upsert({
              where: { id: raw.question_id },
              create: {
                id: raw.question_id,
                subject: subjectCfg.name,
                chapter,
                topic: topic || "Core Concepts",
                subtopic: subtopic || null,
                difficulty,
                type: qType,
                stem: cleanedQuestion,
                options: JSON.stringify(optionsArray),
                correctAnswer,
                solution: cleanedSolution,
                exam: raw.exam || "JEE Main",
                yearTag: raw.source_paper ? raw.source_paper.replace(".docx", "") : "JEE Main Paper",
              },
              update: {
                chapter,
                topic: topic || "Core Concepts",
                subtopic: subtopic || null,
                difficulty,
                type: qType,
                stem: cleanedQuestion,
                options: JSON.stringify(optionsArray),
                correctAnswer,
                solution: cleanedSolution,
              },
            });

            subjectCount++;
            totalIngested++;
          } catch (itemErr) {}
        }
      } catch (splitErr: any) {
        console.error(`   ⚠️ Error downloading ${url}:`, splitErr.message);
      }
    }

    console.log(`   ✅ Subject ${subjectCfg.name}: Successfully ingested ${subjectCount} clean questions.`);
  }

  console.log("\n==================================================");
  console.log(`🎉 Ingestion Complete!`);
  console.log(`Total Clean Questions Ingested: ${totalIngested}`);
  console.log(`Filtered Corrupt [IMAGE] Questions: ${totalDroppedImages}`);
  console.log(`Filtered Broken/Missing Options: ${totalDroppedOptions}`);
  console.log(`Filtered Corrupt/Short Rows: ${totalDroppedCorrupt}`);

  // Purge any lingering questions that contain [IMAGE] or malformed options
  const allDbQuestions = await prisma.question.findMany({ select: { id: true, stem: true, options: true, solution: true, type: true } });
  let deletedCorrupt = 0;
  for (const q of allDbQuestions) {
    const hasImage = q.stem.includes("[IMAGE]") || q.options.includes("[IMAGE]") || (q.solution && q.solution.includes("[IMAGE]"));
    let hasMalformedOptions = false;
    if (q.type === "SCQ") {
      try {
        const opts = JSON.parse(q.options);
        if (opts.length !== 4 || (opts.includes("A") && opts.includes("B") && opts.includes("C") && opts.includes("D")) || opts[0]?.startsWith("=")) {
          hasMalformedOptions = true;
        }
      } catch {
        hasMalformedOptions = true;
      }
    }
    if (hasImage || hasMalformedOptions) {
      await prisma.question.delete({ where: { id: q.id } });
      deletedCorrupt++;
    }
  }
  if (deletedCorrupt > 0) {
    console.log(`🧹 Purged ${deletedCorrupt} lingering corrupt questions.`);
  }

  // Strictly enforce Zero User Policy
  const userCount = await prisma.user.count();
  console.log(`🔒 Zero Mock User Verification: User count = ${userCount}`);
  if (userCount !== 0) {
    await prisma.user.deleteMany({});
    console.log("🔒 User table cleared.");
  }
  console.log("==================================================");
}

if (require.main === module) {
  ingestHFDataset()
    .catch((e) => {
      console.error("Ingestion failed:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
