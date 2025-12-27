import "dotenv/config";
import { db } from "./index";
import { category } from "./schema/transaction";

type CategoryInsert = typeof category.$inferInsert;

const defaultCategories = [
	"Bills",
	"Charity",
	"Eating Out",
	"Expenses",
	"Family",
	"Finances",
	"General",
	"Gifts",
	"Groceries",
	"Holidays",
	"Income",
	"Personal care",
	"Savings",
	"Shopping",
	"Transfers",
	"Transport",
] as const;

async function main() {
	console.log("Starting seed...");

	const categoriesToInsert: CategoryInsert[] = [];

	for (const categoryName of defaultCategories) {
		const category: CategoryInsert = {
			name: categoryName,
		};
		categoriesToInsert.push(category);
	}

	await db.insert(category).values(categoriesToInsert).onConflictDoNothing();

	console.log("Seed completed successfully!");
	process.exit(0);
}

main().catch((error) => {
	console.error("Error seeding database:", error);
	process.exit(1);
});
