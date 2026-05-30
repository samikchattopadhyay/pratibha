import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!dbInstance) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is required");
    }
    const sql = neon(dbUrl);
    dbInstance = drizzle(sql, { schema });
  }
  return dbInstance;
}

export { getDb };
export const db: any = new Proxy({}, {
  get(_target: any, prop: any) {
    return (getDb() as any)[prop];
  },
});
