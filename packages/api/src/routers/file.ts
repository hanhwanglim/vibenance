import { ORPCError } from "@orpc/server";
import z from "zod";
import { protectedProcedure } from "../index";
import { FileService } from "../services/file";

export const fileRouter = {
	upload: protectedProcedure.input(z.file()).handler(async ({ input }) => {
		return await FileService.uploadFile(input);
	}),

	get: protectedProcedure.input(z.number()).handler(async ({ input }) => {
		try {
			return await FileService.getFile(input);
		} catch (error) {
			const err = error as Error;
			if (err.message === "NOT_FOUND") {
				throw new ORPCError("NOT_FOUND");
			}
		}
	}),
};
