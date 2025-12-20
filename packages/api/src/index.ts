import { ORPCError, os } from "@orpc/server";
import { db } from "@vibenance/db";
import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
	if (!context.session?.user && !context.key?.id) {
		throw new ORPCError("UNAUTHORIZED");
	}

	let user = null;
	if (context.session?.user) {
		user = context.session.user;
	} else if (context.key?.userId) {
		user = await db.query.user.findFirst({
			where: (user, { eq }) => eq(user.id, context.key?.userId),
		});
	}

	return next({
		context: {
			session: context.session,
			key: context.key,
			user: user,
		},
	});
});

export const protectedProcedure = publicProcedure.use(requireAuth);
