import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { schemas } from "./schemas";

export const db = drizzle(process.env.DATABASE_URL!, { schema: schemas });
