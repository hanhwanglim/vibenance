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
	expiresAt: Date;
}

class BotStateManager {
	private sessions = new Map<number, ImportSession>();

	createSession(
		userId: number,
		fileId: string,
		fileImportId: string,
		transactions: ImportSession["transactions"],
		ttlMinutes = 10,
	): void {
		const expiresAt = new Date();
		expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);

		this.sessions.set(userId, {
			userId,
			fileId,
			fileImportId,
			transactions,
			expiresAt,
		});
	}

	getSession(userId: number): ImportSession | undefined {
		const session = this.sessions.get(userId);
		if (!session) {
			return undefined;
		}

		// Check if session expired
		if (new Date() > session.expiresAt) {
			this.sessions.delete(userId);
			return undefined;
		}

		return session;
	}

	updateSessionAccount(userId: number, _accountId: string): boolean {
		const session = this.getSession(userId);
		if (!session) {
			return false;
		}

		// Store accountId in session (we'll use it when creating transactions)
		// Since we need to modify the session, we'll store it separately
		// For now, we'll just return true and pass accountId when needed
		return true;
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

// Cleanup expired sessions every 5 minutes
if (typeof setInterval !== "undefined") {
	setInterval(
		() => {
			botState.cleanupExpiredSessions();
		},
		5 * 60 * 1000,
	);
}
