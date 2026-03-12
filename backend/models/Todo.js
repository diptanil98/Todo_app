const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    isCompleted: { type: Boolean, default: false, index: true },
    createdAt: { type: Date, default: () => new Date(), index: true },
  },
  { collection: "Todo" }
);

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;

