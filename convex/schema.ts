import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    name: v.string(),
    category: v.string(),
    price: v.number(),
    description: v.string(),
    imageUrl: v.optional(v.string()), // Assuming you'll store image URL
    inStock: v.optional(v.boolean()), // Optional stock status
    quantity: v.number(), // Optional quantity tracking
  }).index("by_category", ["category"])
   .index("by_price", ["price"])
});