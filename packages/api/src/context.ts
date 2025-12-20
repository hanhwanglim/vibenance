import { auth } from "@vibenance/auth";
import type { Context as HonoContext } from "hono";

export type CreateContextOptions = {
	context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
	const apiKey = context.req.header("x-api-key");
	let key = null;
	if (apiKey) {
		const result = await auth.api.verifyApiKey({ body: { key: apiKey } });
		if (result.valid) {
			key = result.key;
		}
	}

	const session = await auth.api.getSession({
		headers: context.req.raw.headers,
	});

	return {
		session,
		key,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
