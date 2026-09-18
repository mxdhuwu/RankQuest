import { prisma } from "../src/lib/prisma";

async function main() {
  const userCount = await prisma.user.count();
  const questionCount = await prisma.question.count();
  const physicsCount = await prisma.question.count({ where: { subject: "PHYSICS" } });
  const chemistryCount = await prisma.question.count({ where: { subject: "CHEMISTRY" } });
  const mathCount = await prisma.question.count({ where: { subject: "MATHEMATICS" } });

  console.log("=== RankQuest Clean Database State Verification ===");
  console.log(`Users count: ${userCount} (Target: 0 strictly empty)`);
  console.log(`Total Clean Questions: ${questionCount}`);
  console.log(` - Physics Questions: ${physicsCount}`);
  console.log(` - Chemistry Questions: ${chemistryCount}`);
  console.log(` - Mathematics Questions: ${mathCount}`);

  // Check bad questions
  const badImages = await prisma.question.count({ where: { stem: { contains: "[IMAGE]" } } });
  const badOption11 = await prisma.question.findUnique({ where: { id: "M-01-Q11" } });

  console.log(`Corrupt [IMAGE] in questions: ${badImages}`);
  console.log(`Corrupt M-01-Q11 in DB: ${badOption11 ? "YES (ERROR)" : "NO (CLEAN)"}`);

  const sampleMath = await prisma.question.findFirst({ where: { subject: "MATHEMATICS", type: "SCQ" } });
  console.log("\nSample Valid Mathematics SCQ:");
  console.log("Stem:", sampleMath?.stem);
  console.log("Options:", sampleMath?.options);
  console.log("Correct:", sampleMath?.correctAnswer);
}

main().finally(() => prisma.$disconnect());
