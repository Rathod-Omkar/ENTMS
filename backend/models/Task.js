
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    unique: true,
    immutable: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  assignedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  
  employeeSnapshot: {
    employeeId: String,
    fullname: String,
    department: String,
  },
  department: {
    type: String,
    enum: ["Development", "Design", "QA", "HR", "Sales"],
    required: true,
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    required: true,
  },
  status: {
    type: String,
    enum: ["Todo", "In Progress", "Completed", "Cancelled"],
    default: "Todo",
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  completedDate: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

taskSchema.pre("validate", function () {
  if (this.startDate && this.dueDate && this.dueDate < this.startDate) {
    this.invalidate("dueDate", "Due date cannot be earlier than start date");
  }
});


taskSchema.pre("save", async function () {
  if (!this.isNew || this.taskId) return;

  const latestTask = await this.constructor
    .findOne({ taskId: { $exists: true } })
    .sort({ createdAt: -1 })
    .select("taskId");

  const lastNumber = latestTask?.taskId
    ? Number(latestTask.taskId.split("-")[1]) || 0
    : 0;

  this.taskId = `TSK-${String(lastNumber + 1).padStart(3, "0")}`;
});

module.exports = mongoose.model("Task", taskSchema);