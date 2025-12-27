import z from "zod";
import { protectedProcedure } from "../index";
import { TelegramCredentialService } from "../services/telegram";

export const settingsRouter = {
	createTelegramCredential: protectedProcedure
		.input(z.object({ telegramUserId: z.string(), telegramChatId: z.string() }))
		.handler(async ({ input, context }) => {
			const credential = await TelegramCredentialService.create({
				...input,
				userId: context.session.user.id,
			});

			return { credential };
		}),

	list: protectedProcedure.handler(async ({ context }) => {
		return await TelegramCredentialService.findByUserId(
			context.session.user.id,
		);
	}),

	delete: protectedProcedure.input(z.string()).handler(async ({ input }) => {
		await TelegramCredentialService.delete(input);
	}),
};
