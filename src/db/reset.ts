import { db } from "./index";
import { reset } from "drizzle-seed";
import { schemas } from "./schemas";
import readline from "node:readline";

function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    `Are you sure you want to reset the database? (y/n)\n`,
    (answer) => {
      rl.close();
      if (answer.toLowerCase() !== "y") {
        console.log("Aborting...");
        process.exit(0);
      }
      console.log("Resetting database");
      reset(db, schemas)
        .then(() => {
          console.log("Database reset successfully");
          process.exit(0);
        })
        .catch((error) => {
          console.error("Error resetting database:", error);
          process.exit(1);
        });
    },
  );
}

main();
