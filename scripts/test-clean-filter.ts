interface HFRecord {
  question_id: string;
  question: string;
  option_1?: string;
  option_2?: string;
  option_3?: string;
  option_4?: string;
  correct_option?: number | null;
  numerical_answer?: string | null;
  solution?: string;
  subject: string;
  topic?: string;
  subtopic?: string;
  difficulty?: string;
  question_type: string;
  has_image?: boolean;
}

const HF_BASE_URL = "https://huggingface.co/datasets/soughed/jee-main-questions/raw/main";
const SUBJECTS = ["physics", "chemistry", "mathematics"];

async function analyze() {
  for (const sub of SUBJECTS) {
    const url = `${HF_BASE_URL}/${sub}/train.jsonl`;
    const res = await fetch(url);
    const text = await res.text();
    const lines = text.split("\n").filter((l) => l.trim().length > 0);

    let validCount = 0;
    let droppedImages = 0;
    let droppedMissingOpts = 0;
    let droppedShort = 0;

    for (const line of lines) {
      try {
        const q: HFRecord = JSON.parse(line);
        const stem = q.question || "";

        // 1. Skip if question has [IMAGE] placeholder or has_image without text formula
        if (stem.includes("[IMAGE]") || (q.option_1 && q.option_1.includes("[IMAGE]"))) {
          droppedImages++;
          continue;
        }

        // 2. Skip if stem is too short or is exam instructions
        if (stem.length < 20 || stem.includes("has four choices") || stem.includes("ONLY ONE is correct")) {
          droppedShort++;
          continue;
        }

        // 3. For SCQ, require all 4 options to be non-empty and not single fallback letters
        if (q.question_type !== "numerical") {
          const o1 = (q.option_1 || "").trim();
          const o2 = (q.option_2 || "").trim();
          const o3 = (q.option_3 || "").trim();
          const o4 = (q.option_4 || "").trim();

          if (!o1 || !o2 || !o3 || !o4) {
            droppedMissingOpts++;
            continue;
          }

          // Check if option 1 looks like leaked question stem (starts with "= ", "then ", etc.)
          if (o1.startsWith("=") || o1.startsWith("then ") || o1.startsWith("is equal to")) {
            droppedMissingOpts++;
            continue;
          }
        } else {
          if (!q.numerical_answer || q.numerical_answer.trim() === "") {
            droppedMissingOpts++;
            continue;
          }
        }

        validCount++;
      } catch (e) {}
    }

    console.log(`[${sub.toUpperCase()}] Total: ${lines.length} | Valid self-contained: ${validCount} | Dropped images: ${droppedImages} | Dropped broken options: ${droppedMissingOpts} | Dropped short/junk: ${droppedShort}`);
  }
}

analyze();
