import { db } from "@vibenance/db";
import { sql } from "drizzle-orm";

export async function generateSeries(from: Date, to: Date, interval: string) {
	const result = await db.execute(sql`
		SELECT generate_series(
			date_trunc(${sql.raw(`'${interval}'`)}, ${sql.raw(`'${from.toISOString()}'`)}::timestamp),
			date_trunc(${sql.raw(`'${interval}'`)}, ${sql.raw(`'${to.toISOString()}'`)}::timestamp),
			${sql.raw(`'1 ${interval}'`)}
		) AS bin
		`);

	return result.rows as { bin: string }[];
}
