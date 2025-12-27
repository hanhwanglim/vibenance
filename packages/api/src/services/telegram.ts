import type { TelegramCredentialInsert } from "@vibenance/db/schema/telegram";
import { TelegramCredentialRepository } from "../repository/telegram";

export const TelegramCredentialService = {
	findByUserId: async (userId: string) => {
		return await TelegramCredentialRepository.findByUserId(userId);
	},

	create: async (data: TelegramCredentialInsert) => {
		return await TelegramCredentialRepository.create(data);
	},

	delete: async (id: string) => {
		return await TelegramCredentialRepository.delete(id);
	},
};
