import "dotenv/config";
import { db } from "./index";
import { bankAccount, category } from "./schema/transaction";

type CategoryInsert = typeof category.$inferInsert;
type BankAccountInsert = typeof bankAccount.$inferInsert;

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

const defaultAccounts = [
	{
		name: "Amex",
		type: "credit_card",
		accountNumber: "12897128",
		bankName: "American Express",
		color: "silver",
	},
	{
		name: "Monzo",
		type: "current",
		accountNumber: "98675787",
		bankName: "Monzo",
		color: "orange",
	},
];

async function main() {
	console.log("Starting seed...");

	try {
		const categoriesToInsert: CategoryInsert[] = [];
		const bankAccountsToInsert: BankAccountInsert[] = [];

		for (const categoryName of defaultCategories) {
			const category: CategoryInsert = {
				name: categoryName,
			};
			categoriesToInsert.push(category);
		}

		for (const bankAccount of defaultAccounts) {
			const obj: BankAccountInsert = {
				name: bankAccount.name,
				type: bankAccount.type,
				accountNumber: bankAccount.accountNumber,
				bankName: bankAccount.bankName,
				color: bankAccount.color,
			};
			bankAccountsToInsert.push(obj);
		}

		await db.insert(category).values(categoriesToInsert).onConflictDoNothing();
		await db
			.insert(bankAccount)
			.values(bankAccountsToInsert)
			.onConflictDoNothing();

		console.log("Seed completed successfully!");
		process.exit(0);
	} catch (error) {
		console.error("Error seeding database:", error);
		process.exit(1);
	}
}

main();
