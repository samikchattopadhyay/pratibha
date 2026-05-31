// Export Drizzle client as the primary database interface
// Files importing 'prisma' will now use Drizzle under the hood
export { db as default } from "./db/drizzle";
export { db } from "./db/drizzle";
export * from "./db/schema";
