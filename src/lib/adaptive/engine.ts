export interface QuestionRecord {
  id: string;
  subject: string;
  chapter: string;
  topic: string;
  subtopic?: string | null;
  difficulty: number; // 1 to 7
  type: string; // "SCQ" | "NVQ"
  stem: string;
  options: string;
  correctAnswer: string;
  solution: string;
  yearTag?: string | null;
}

export interface SubmissionRecord {
  questionId: string;
  isCorrect: boolean;
  timeTakenSeconds: number;
  levelAtTime: number;
  topic?: string;
}

export interface LevelShiftResult {
  previousLevel: number;
  newLevel: number;
  shift: "PROMOTED" | "DEMOTED" | "MAINTAINED";
  reason: string;
  accuracy: number;
  recentCount: number;
  xpAwarded: number;
  streak: number;
}

export class AdaptiveEngine {
  /**
   * Evaluates diagnostic test results and assigns initial competency tier (L1 to L7).
   * Diagnostic assessment covers 10-15 calibrated questions spanning L1 to L5.
   */
  public static getDiagnosticPlacement(submissions: SubmissionRecord[]): {
    assignedLevel: number;
    accuracy: number;
    score: number;
    total: number;
    xpEarned: number;
    levelName: string;
  } {
    if (!submissions || submissions.length === 0) {
      return {
        assignedLevel: 1,
        accuracy: 0,
        score: 0,
        total: 0,
        xpEarned: 0,
        levelName: "L1: Foundations & Formula Recall",
      };
    }

    const total = submissions.length;
    const correctCount = submissions.filter((s) => s.isCorrect).length;
    const accuracy = (correctCount / total) * 100;

    // Weight score by difficulty of answered questions
    let weightedScore = 0;
    let maxWeightedScore = 0;

    for (const sub of submissions) {
      const weight = sub.levelAtTime || 2;
      maxWeightedScore += weight * 4;
      if (sub.isCorrect) {
        weightedScore += weight * 4;
      } else {
        // -1 penalty for incorrect
        weightedScore = Math.max(0, weightedScore - 1);
      }
    }

    const weightedRatio = maxWeightedScore > 0 ? weightedScore / maxWeightedScore : accuracy / 100;

    // Tier calibration based on weighted performance:
    let level = 1;
    if (weightedRatio >= 0.85) {
      level = 6;
    } else if (weightedRatio >= 0.72) {
      level = 5;
    } else if (weightedRatio >= 0.58) {
      level = 4;
    } else if (weightedRatio >= 0.44) {
      level = 3;
    } else if (weightedRatio >= 0.30) {
      level = 2;
    } else {
      level = 1;
    }

    const levelNames: Record<number, string> = {
      1: "L1: Foundations & Formula Recall",
      2: "L2: Single-Concept Application",
      3: "L3: Standard JEE Main Moderate",
      4: "L4: Multi-Step Analysis",
      5: "L5: JEE Advanced Intro / Multi-Concept",
      6: "L6: Advanced Problem Solver",
      7: "L7: Olympiad & JEE Advanced Elite",
    };

    const xpEarned = correctCount * 75 + level * 50;

    return {
      assignedLevel: level,
      accuracy: Math.round(accuracy),
      score: weightedScore,
      total,
      xpEarned,
      levelName: levelNames[level] || `L${level}`,
    };
  }

  /**
   * Dynamic level shift evaluator based on rolling window (e.g. last 5 questions or current quiz accuracy + speed).
   * - Accuracy >= 80% on current level questions -> Level increment (Ln -> Ln+1, bounded at L7).
   * - Accuracy <= 40% -> Level decrement (Ln -> Ln-1, bounded at L1).
   * - Accuracy between 41% and 79% -> Maintain level and reinforce edge-case subtopics.
   * - Rapid guessing (< 15 seconds per question with wrong answer) applies a penalty.
   */
  public static evaluateLevelShift(
    currentLevel: number,
    recentHistory: SubmissionRecord[],
    currentStreak: number = 0
  ): LevelShiftResult {
    const windowSize = Math.min(5, recentHistory.length);
    const window = recentHistory.slice(-windowSize);

    if (window.length === 0) {
      return {
        previousLevel: currentLevel,
        newLevel: currentLevel,
        shift: "MAINTAINED",
        reason: "No submissions recorded yet.",
        accuracy: 0,
        recentCount: 0,
        xpAwarded: 0,
        streak: 0,
      };
    }

    const correctCount = window.filter((s) => s.isCorrect).length;
    const accuracy = (correctCount / window.length) * 100;
    const latestSubmission = window[window.length - 1];

    // Detect rapid guessing penalty (< 15s wrong answer)
    const isRapidGuess = !latestSubmission.isCorrect && latestSubmission.timeTakenSeconds < 15;

    let newStreak = latestSubmission.isCorrect ? currentStreak + 1 : 0;
    let xpAwarded = 0;

    if (latestSubmission.isCorrect) {
      // Base XP scaled by difficulty (L1 = 20 XP, L7 = 100 XP) + streak multiplier
      const baseXP = currentLevel * 15 + 10;
      const streakBonus = Math.min(newStreak * 5, 25);
      xpAwarded = baseXP + streakBonus;
    } else {
      xpAwarded = isRapidGuess ? 0 : 5; // Minimal participation XP unless penalized for reckless guessing
    }

    let newLevel = currentLevel;
    let shift: "PROMOTED" | "DEMOTED" | "MAINTAINED" = "MAINTAINED";
    let reason = `Maintaining Level ${currentLevel}: Performance within calibrated stability threshold (${Math.round(accuracy)}%).`;

    // Only trigger shifts once at least 3 attempts in rolling window exist
    if (window.length >= 3) {
      if (accuracy >= 80) {
        if (currentLevel < 7) {
          newLevel = currentLevel + 1;
          shift = "PROMOTED";
          reason = `Level Up! High accuracy of ${Math.round(accuracy)}% over the last ${window.length} questions unlocked Level ${newLevel}!`;
          xpAwarded += 100; // Promotion bonus
        } else {
          reason = `Apex Mastery! You are maintaining maximum Tier L7 with ${Math.round(accuracy)}% accuracy.`;
        }
      } else if (accuracy <= 40) {
        if (currentLevel > 1) {
          newLevel = currentLevel - 1;
          shift = "DEMOTED";
          reason = `Calibrating difficulty: Accuracy dropped to ${Math.round(accuracy)}%. Shifting to Level ${newLevel} to reinforce core concepts.`;
        } else {
          reason = `Maintaining Level 1 to build foundational mastery.`;
        }
      }
    }

    return {
      previousLevel: currentLevel,
      newLevel,
      shift,
      reason,
      accuracy: Math.round(accuracy),
      recentCount: window.length,
      xpAwarded,
      streak: newStreak,
    };
  }

  /**
   * Dynamic question selection matching target difficulty or topic gaps.
   * If current level questions are exhausted, searches adjacent levels.
   */
  public static calculateNextQuestion(
    currentLevel: number,
    attemptedIds: Set<string>,
    pool: QuestionRecord[],
    targetTopic?: string
  ): QuestionRecord | null {
    // Filter out already attempted questions
    const unattempted = pool.filter((q) => !attemptedIds.has(q.id));
    if (unattempted.length === 0) return null;

    // Filter by topic if requested
    let candidates = targetTopic
      ? unattempted.filter((q) => q.topic.toLowerCase() === targetTopic.toLowerCase())
      : unattempted;

    if (candidates.length === 0) {
      candidates = unattempted;
    }

    // Try exact level match first
    const exactLevel = candidates.filter((q) => q.difficulty === currentLevel);
    if (exactLevel.length > 0) {
      const idx = Math.floor(Math.random() * exactLevel.length);
      return exactLevel[idx];
    }

    // Try +/- 1 level
    const adjacentLevel = candidates.filter(
      (q) => Math.abs(q.difficulty - currentLevel) <= 1
    );
    if (adjacentLevel.length > 0) {
      const idx = Math.floor(Math.random() * adjacentLevel.length);
      return adjacentLevel[idx];
    }

    // Fallback to any unattempted question closest in difficulty
    const sorted = [...candidates].sort(
      (a, b) => Math.abs(a.difficulty - currentLevel) - Math.abs(b.difficulty - currentLevel)
    );

    return sorted[0] || null;
  }

  /**
   * Updates topic mastery percentage based on exponential moving average.
   */
  public static calculateUpdatedMastery(
    currentMastery: number,
    isCorrect: boolean,
    questionDifficulty: number
  ): number {
    const delta = isCorrect ? (questionDifficulty / 7) * 20 : -15;
    const updated = Math.max(5, Math.min(100, currentMastery + delta));
    return Math.round(updated);
  }
}
