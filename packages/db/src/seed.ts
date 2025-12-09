import "dotenv/config";
import { faker } from "@faker-js/faker";
import { seed } from "drizzle-seed";
import { db } from "./index";
import { account, todo } from "./schema";
import { bankAccount, category, transaction } from "./schema/transaction";
import { sample } from "./utils";

type CategoryInsert = typeof category.$inferInsert;
type BankAccountInsert = typeof bankAccount.$inferInsert;
type TransactionInsert = typeof transaction.$inferInsert;

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

		const transactions = [];
		const accountIds = (await db.query.bankAccount.findMany()).map(
			(account) => account.id,
		);
		const categoryIds = (await db.query.category.findMany()).map(
			(category) => category.id,
		);
		for (let i = 0; i < 1000; i++) {
			transactions.push(generateTransaction(accountIds, categoryIds));
		}
		await db.insert(transaction).values(transactions).onConflictDoNothing();

		console.log("Seed completed successfully!");
		process.exit(0);
	} catch (error) {
		console.error("Error seeding database:", error);
		process.exit(1);
	}
}

main();

function generateTransaction(
	accountIds: number[],
	categoryIds: number[],
): TransactionInsert {
	return {
		timestamp: faker.date.past(),
		accountId: sample(accountIds),
		transactionHash: faker.string.uuid(),
		name: faker.string.alphanumeric(),
		currency: faker.finance.currencyCode(),
		amount: faker.finance.amount(),
		categoryId: sample(categoryIds),
	};
}
