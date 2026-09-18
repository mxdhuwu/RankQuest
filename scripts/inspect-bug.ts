import { prisma } from "../src/lib/prisma";

async function main() {
  const qs = await prisma.question.findMany({
    where: {
      subject: "MATHEMATICS",
      OR: [
        { options: { contains: "y (e)" } },
        { options: { contains: "y(e)" } },
        { stem: { contains: "y (e)" } },
        { stem: { contains: "y(e)" } },
      ],
    },
    take: 5,
  });

  console.log("Found Math questions:", qs.length);
  for (const q of qs) {
    console.log("-----------------------------------------");
    console.log("ID:", q.id);
    console.log("Stem:", q.stem);
    console.log("Options:", q.options);
    console.log("Correct:", q.correctAnswer);
  }
}

main().finally(() => prisma.$disconnect());
