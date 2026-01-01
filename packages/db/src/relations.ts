import { defineRelations } from "drizzle-orm";
import * as schema from "./schema/index";

export const relations = defineRelations(schema, (r) => ({
	account: {
		user: r.one.user({
			from: r.account.userId,
			to: r.user.id,
		}),
	},
	user: {
		accounts: r.many.account(),
		sessions: r.many.session(),
		telegramCredentials: r.many.telegramCredential(),
	},
	file: {
		fileImport: r.one.fileImport({
			from: r.file.fileImportId,
			to: r.fileImport.id,
		}),
	},
	fileImport: {
		files: r.many.file(),
		bankAccounts: r.many.bankAccount(),
		transactions: r.many.transaction(),
	},
	bankAccount: {
		fileImports: r.many.fileImport({
			from: r.bankAccount.id.through(r.investmentTransaction.accountId),
			to: r.fileImport.id.through(r.investmentTransaction.fileImportId),
		}),
		transactions: r.many.transaction(),
	},
	session: {
		user: r.one.user({
			from: r.session.userId,
			to: r.user.id,
		}),
	},
	telegramCredential: {
		user: r.one.user({
			from: r.telegramCredential.userId,
			to: r.user.id,
		}),
	},
	transaction: {
		bankAccount: r.one.bankAccount({
			from: r.transaction.accountId,
			to: r.bankAccount.id,
		}),
		category: r.one.category({
			from: r.transaction.categoryId,
			to: r.category.id,
		}),
		fileImport: r.one.fileImport({
			from: r.transaction.fileImportId,
			to: r.fileImport.id,
		}),
	},
	category: {
		transactions: r.many.transaction(),
	},
}));
