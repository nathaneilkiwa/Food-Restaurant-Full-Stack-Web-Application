const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    date: String,
    time: String,
    requests: String,
    items: [
      {
        name: String,
        price: Number,
        qty: Number
      }
    ],
    totalAmount: Number,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },
    stripeSessionId: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
