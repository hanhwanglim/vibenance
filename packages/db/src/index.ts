import { drizzle } from "drizzle-orm/node-postgres";
import { config } from "./config";
import * as schema from "./schema/index";

export const db = drizzle(config.databaseUrl, { schema: schema });
