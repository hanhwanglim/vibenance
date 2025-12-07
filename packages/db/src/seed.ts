import "dotenv/config";
import { randomUUID } from "node:crypto";
import { db } from "./index";
import { category } from "./schema/transaction";

type CategoryInsert = typeof category.$inferInsert;

const defaultCategories = [
	"Transport",
	"Eating Out",
	"Groceries",
	"Bills",
	"Entertainment",
	"Other",
	"Income",
	"Investments",
	"Shopping",
] as const;

async function seed() {
	console.log("Starting seed...");

	try {
		const categoriesToInsert: CategoryInsert[] = [];
		for (const categoryName of defaultCategories) {
			const category: CategoryInsert = {
				id: randomUUID(),
				name: categoryName,
			};
			categoriesToInsert.push(category);
		}

		await db.insert(category).values(categoriesToInsert).onConflictDoNothing();
		console.log("Seed completed successfully!");
		process.exit(0);
	} catch (error) {
		console.error("Error seeding database:", error);
		process.exit(1);
	}
}

seed();
