import "dotenv/config";
import prisma from './lib/prisma';

const initialExercises = [
  "Bench press (bar)",
  "Squat",
  "Deadlift (bar)",
  "Militar press (dumbell)",
  "Triceps extension",
  "Leg Press",
  "Leg extension",
  "Lateral raises (dumbell)",
  "bulgarian squat",
  "Inclined bench press (bar)",
  "Seated row",
  "Bent over row"
]

async function main() {
  for (const name of initialExercises) {
    await prisma.exercise.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }
  console.log("Exercises seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // skip disconnect because of pg pool connection singleton in lib/prisma.ts
  })
