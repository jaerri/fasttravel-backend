import { Type } from "@sinclair/typebox";
import { createInsertSchema } from "drizzle-typebox";
import { vehiclesTable } from "../db/schema.js";

export const VehicleUpdateTypeBox = createInsertSchema(vehiclesTable);