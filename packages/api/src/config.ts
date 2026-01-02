import "dotenv/config";
import { z } from "zod";

const configSchema = z.object({
	corsOrigin: z.string().default(""),
	uploadsPath: z.string().default("/app/uploads"),
});

const rawConfig = {
	corsOrigin: process.env.CORS_ORIGIN,
	uploadsPath: process.env.UPLOADS_PATH,
};

export const config = configSchema.parse(rawConfig);

export type Config = z.infer<typeof configSchema>;
