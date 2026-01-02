import "dotenv/config";
import { z } from "zod";

const configSchema = z.object({
	nodeEnv: z.enum(["development", "production", "test"]).default("development"),
	corsOrigin: z.string().default(""),
	staticPath: z.string().default("../web/dist"),
	viteDevUrl: z.url().default("http://localhost:3001"),
	telegramBotToken: z.string().optional(),
	uploadsPath: z.string().default("/app/uploads"),
});

const rawConfig = {
	nodeEnv: process.env.NODE_ENV,
	corsOrigin: process.env.CORS_ORIGIN,
	staticPath: process.env.STATIC_PATH,
	viteDevUrl: process.env.VITE_DEV_URL,
	telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
	uploadsPath: process.env.UPLOADS_PATH,
};

export const config = configSchema.parse(rawConfig);

export type Config = z.infer<typeof configSchema>;
