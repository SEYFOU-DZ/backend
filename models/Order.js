const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String },
    title: { type: String, required: true },
    image: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ["DA", "USD"], required: true },
    size: { type: String, default: null },
    color: { type: String, default: null },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
      index: true,
    },
    customer: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, default: "" },
    },
    shipping: {
      wilaya: { type: String, required: true },
      municipality: { type: String, required: true },
      deliveryType: { type: String, enum: ["office", "home"], required: true },
      addressLine: { type: String, default: "" }, // required only when deliveryType === "home"
    },
    items: { type: [orderItemSchema], required: true },
    totals: {
      totalByCurrency: {
        type: Map,
        of: Number,
        default: { DA: 0, USD: 0 },
      },
      // Useful when the UI needs to show "mixed currencies" without conversion.
      totalQuantity: { type: Number, default: 0 },
    },
    confirmedAt: { type: Date, default: null },
    // Simple audit fields
    createdBy: { type: String, default: "web" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);

