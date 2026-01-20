import type { TransactionInsert } from "@vibenance/db/schema/transaction";

type TransactionCreate = Omit<
	TransactionInsert,
	"id" | "accountId" | "categoryId"
>;

interface ImportSession {
	userId: number;
	fileId: string;
	fileImportId: string;
	transactions: Array<TransactionCreate>;
	accounts: Array<{ id: string; name: string }>;
	expiresAt: Date;
}

class BotStateManager {
	private sessions = new Map<number, ImportSession>();

	createSession(
		userId: number,
		fileId: string,
		fileImportId: string,
		transactions: ImportSession["transactions"],
		accounts: ImportSession["accounts"],
		ttlMinutes = 10,
	): void {
		const expiresAt = new Date();
		expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);

		this.sessions.set(userId, {
			userId,
			fileId,
			fileImportId,
			transactions,
			accounts,
			expiresAt,
		});
	}

	getSession(userId: number): ImportSession | undefined {
		const session = this.sessions.get(userId);
		if (!session) {
			return undefined;
		}

		if (new Date() > session.expiresAt) {
			this.sessions.delete(userId);
			return undefined;
		}

		return session;
	}

	deleteSession(userId: number): void {
		this.sessions.delete(userId);
	}

	cleanupExpiredSessions(): void {
		const now = new Date();
		for (const [userId, session] of this.sessions.entries()) {
			if (now > session.expiresAt) {
				this.sessions.delete(userId);
			}
		}
	}
}

export const botState = new BotStateManager();

if (typeof setInterval !== "undefined") {
	setInterval(
		() => {
			botState.cleanupExpiredSessions();
		},
		5 * 60 * 1000,
	);
}
