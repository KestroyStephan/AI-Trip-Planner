import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  UserTable: defineTable({
    name: v.string(),
    email: v.string(),
  }),

  TripDetailTable: defineTable({
    tripId: v.string(),                  // your UUID
    uid: v.optional(v.id("UserTable")),  // make optional for now
    tripDetail: v.optional(v.any()),     // 👈 optional so no error
  }),
});
