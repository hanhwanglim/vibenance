import "dotenv/config";
import { z } from "zod";

const configSchema = z.object({
	databaseUrl: z.string(),
});

const rawConfig = {
	databaseUrl: process.env.DATABASE_URL,
};

export const config = configSchema.parse(rawConfig);

export type Config = z.infer<typeof configSchema>;
