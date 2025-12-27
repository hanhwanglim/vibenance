import { drizzle } from "drizzle-orm/node-postgres";
import { config } from "./config.js";
import * as schema from "./schema/index.js";

export const db = drizzle(config.databaseUrl, { schema: schema });
