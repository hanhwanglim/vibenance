import { streamToEventIterator, type } from "@orpc/server";
import type { UIMessage } from "ai";
import { protectedProcedure } from "../index";
import { AgentService } from "../services/agent";

export const agentRouter = {
	chat: protectedProcedure
		.input(type<{ chatId: string; messages: UIMessage[] }>())
		.handler(async ({ input }) => {
			const result = await AgentService.stream(input.messages);
			return streamToEventIterator(result.toUIMessageStream());
		}),
};
