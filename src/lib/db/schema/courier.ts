import { pgTable, text, timestamp, integer, boolean, unique, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { shipmentStatusEnum, packageSKUEnum } from "./enums";
import { prizeAwards } from "./prizes";

export const physicalPrizeOrders = pgTable("PhysicalPrizeOrder", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  prizeAwardId: text("prizeAwardId").notNull().unique(),
  recipientName: text("recipientName").notNull(),
  recipientPhone: text("recipientPhone").notNull(),
  recipientAddress: text("recipientAddress").notNull(),
  recipientCity: text("recipientCity").notNull(),
  recipientState: text("recipientState").notNull(),
  recipientPostalCode: text("recipientPostalCode").notNull(),
  recipientCountry: text("recipientCountry").notNull().default("India"),
  packageSKU: packageSKUEnum("packageSKU").notNull(),
  weightGrams: integer("weightGrams").notNull(),
  lengthCm: integer("lengthCm").notNull(),
  widthCm: integer("widthCm").notNull(),
  heightCm: integer("heightCm").notNull(),
  shiprocketOrderId: text("shiprocketOrderId").unique(),
  shiprocketShipmentId: text("shiprocketShipmentId").unique(),
  shiprocketLabelUrl: text("shiprocketLabelUrl"),
  awbNumber: text("awbNumber"),
  courierName: text("courierName"),
  estimatedDelivery: timestamp("estimatedDelivery", { precision: 3 }),
  status: shipmentStatusEnum("status").default("PENDING").notNull(),
  batchId: text("batchId"),
  labelGeneratedAt: timestamp("labelGeneratedAt", { precision: 3 }),
  pickupScheduledAt: timestamp("pickupScheduledAt", { precision: 3 }),
  dispatchedAt: timestamp("dispatchedAt", { precision: 3 }),
  deliveredAt: timestamp("deliveredAt", { precision: 3 }),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).defaultNow().notNull(),
}, (table) => [
  index("PhysicalPrizeOrder_batchId_idx").on(table.batchId),
  index("PhysicalPrizeOrder_status_idx").on(table.status),
]);

export const shipmentBatches = pgTable("ShipmentBatch", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  batchNumber: text("batchNumber").notNull().unique(),
  description: text("description"),
  totalOrders: integer("totalOrders").default(0).notNull(),
  processedAt: timestamp("processedAt", { precision: 3 }),
  manifestUrl: text("manifestUrl"),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
});

// Relations
export const physicalPrizeOrdersRelations = relations(physicalPrizeOrders, ({ one }) => ({
  prizeAward: one(prizeAwards, {
    fields: [physicalPrizeOrders.prizeAwardId],
    references: [prizeAwards.id],
  }),
  batch: one(shipmentBatches, {
    fields: [physicalPrizeOrders.batchId],
    references: [shipmentBatches.id],
  }),
}));

export const shipmentBatchesRelations = relations(shipmentBatches, ({ many }) => ({
  orders: many(physicalPrizeOrders),
}));
