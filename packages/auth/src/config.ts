import "dotenv/config";
import { z } from "zod";

const configSchema = z.object({
	corsOrigin: z.string().default(""),
});

const rawConfig = {
	corsOrigin: process.env.CORS_ORIGIN,
};

export const config = configSchema.parse(rawConfig);

export type Config = z.infer<typeof configSchema>;
