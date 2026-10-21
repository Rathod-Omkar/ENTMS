
const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const Task = require("../models/Task");
const Employee = require("../models/Employee");

const router = express.Router();

const activeStatuses = ["Todo", "In Progress"];
const finalStatuses = ["Completed", "Cancelled"];

function isSameOrWithinLeavePeriod(startDate, leaveStart, leaveEnd) {
  const start = new Date(startDate);
  const leaveFrom = new Date(leaveStart);
  const leaveTo = new Date(leaveEnd);

  // Compare calendar dates, inclusive.
  start.setHours(0, 0, 0, 0);
  leaveFrom.setHours(0, 0, 0, 0);
  leaveTo.setHours(0, 0, 0, 0);

  return start >= leaveFrom && start <= leaveTo;
}

async function checkEmployeeEligibility(employee, startDate, excludeTaskId = null) {
  if (employee.status === "Inactive") {
    return "Cannot assign tasks to an inactive employee";
  }

  if (employee.status === "On Leave") {
    if (
      employee.leave_start &&
      employee.leave_end &&
      isSameOrWithinLeavePeriod(
        startDate,
        employee.leave_start,
        employee.leave_end
      )
    ) {
      return "Employee is on leave during the task start date";
    }
  }

  const query = {
    assignedEmployee: employee._id,
    status: { $in: activeStatuses },
  };

  if (excludeTaskId) {
    query._id = { $ne: excludeTaskId };
  }

  const activeCount = await Task.countDocuments(query);

  if (activeCount >= 3) {
    return "Employee already has 3 active tasks";
  }

  return null;
}

// GET tasks: paginated, with basic filters and search.
router.get("/", wrapAsync(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const filter = {};

  if (req.query.department) filter.department = req.query.department;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.status) filter.status = req.query.status;

  if (req.query.dueFrom || req.query.dueTo) {
    filter.dueDate = {};

    if (req.query.dueFrom) {
      const from = new Date(req.query.dueFrom);

      if (Number.isNaN(from.getTime())) {
        return res.status(400).json({ message: "Invalid dueFrom date" });
      }

      from.setUTCHours(0, 0, 0, 0);
      filter.dueDate.$gte = from;
    }

    if (req.query.dueTo) {
      const to = new Date(req.query.dueTo);

      if (Number.isNaN(to.getTime())) {
        return res.status(400).json({ message: "Invalid dueTo date" });
      }

      to.setUTCHours(23, 59, 59, 999);
      filter.dueDate.$lte = to;
    }
  }

  if (req.query.search) {
    const employees = await Employee.find({
      fullname: { $regex: req.query.search, $options: "i" },
    }).select("_id");

    filter.$or = [
      { title: { $regex: req.query.search, $options: "i" } },
      { assignedEmployee: { $in: employees.map(e => e._id) } },
      { "employeeSnapshot.fullname": { $regex: req.query.search, $options: "i" } },
    ];
  }

  const sortOptions = {
    createdAt: { createdAt: -1 },
    dueDate: { dueDate: 1 },
    title: { title: 1 },
    priority: { priority: 1 },
  };
  let tasksQuery = Task.find(filter);

  if (req.query.sort === "priority") {
    tasksQuery = tasksQuery.sort({ priority: 1 });
  }

  const sort = sortOptions[req.query.sort] || sortOptions.createdAt;
  const total = await Task.countDocuments(filter);

  let tasks;

  if (req.query.sort === "priority") {
    const priorityOrder = {
      Critical: 1,
      High: 2,
      Medium: 3,
      Low: 4,
    };

    tasks = await Task.find(filter)
      .populate("assignedEmployee", "employeeId fullname department");

    tasks.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    tasks = tasks.slice((page - 1) * limit, page * limit);
  } else {
    const sort = sortOptions[req.query.sort] || sortOptions.createdAt;

    tasks = await Task.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("assignedEmployee", "employeeId fullname department");
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const results = tasks.map(task => {
    const item = task.toObject();
    const due = new Date(item.dueDate);
    due.setHours(0, 0, 0, 0);

    item.employee = item.assignedEmployee || item.employeeSnapshot;
    item.isOverdue =
      due < today && !finalStatuses.includes(item.status);

    return item;
  });

  res.json({
    tasks: results,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}));

// GET one task by MongoDB ID.
router.get("/:id", wrapAsync(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate("assignedEmployee", "employeeId fullname department");

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  const item = task.toObject();
  item.employee = item.assignedEmployee || item.employeeSnapshot;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(item.dueDate);
  due.setHours(0, 0, 0, 0);

  item.isOverdue = due < today && !finalStatuses.includes(item.status);

  res.json(item);
}));

// CREATE task. Status always starts as Todo.
router.post("/", wrapAsync(async (req, res) => {
  const { title, description, assignedEmployee, priority, startDate, dueDate } = req.body;

  if (!title || !assignedEmployee || !priority || !startDate || !dueDate) {
    return res.status(400).json({ message: "Missing required task fields" });
  }

  const start = new Date(startDate);
  const due = new Date(dueDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(due.getTime())) {
    return res.status(400).json({ message: "Invalid task date" });
  }

  if (due < start) {
    return res.status(400).json({
      message: "Due date cannot be earlier than start date",
    });
  }

  const employee = await Employee.findById(assignedEmployee);

  if (!employee) {
    return res.status(404).json({ message: "Assigned employee not found" });
  }

  const eligibilityError = await checkEmployeeEligibility(employee, start);

  if (eligibilityError) {
    return res.status(400).json({ message: eligibilityError });
  }

  const task = new Task({
    title,
    description,
    assignedEmployee: employee._id,
    employeeSnapshot: {
      employeeId: employee.employeeId,
      fullname: employee.fullname,
      department: employee.department,
    },
    department: employee.department,
    priority,
    startDate: start,
    dueDate: due,
    status: "Todo",
    completedDate: null,
  });

  await task.save();

  res.status(201).json({
    message: "Task created successfully",
    task,
  });
}));

// EDIT task details. Status and completedDate cannot be changed here.
router.put("/:id", wrapAsync(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  if (finalStatuses.includes(task.status)) {
    return res.status(400).json({
      message: "Completed or cancelled tasks cannot be edited",
    });
  }

  const allowedFields = ["title", "description", "priority", "startDate", "dueDate", "assignedEmployee"];

  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const startDate = updates.startDate ?? task.startDate;
  const dueDate = updates.dueDate ?? task.dueDate;

  if (
    Number.isNaN(new Date(startDate).getTime()) ||
    Number.isNaN(new Date(dueDate).getTime()) ||
    new Date(dueDate) < new Date(startDate)
  ) {
    return res.status(400).json({
      message: "Invalid dates or due date is earlier than start date",
    });
  }

  if (updates.assignedEmployee || updates.startDate) {
    const employeeId = updates.assignedEmployee || task.assignedEmployee;
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Assigned employee not found" });
    }

    const eligibilityError = await checkEmployeeEligibility(
      employee,
      startDate,
      task._id
    );

    if (eligibilityError) {
      return res.status(400).json({ message: eligibilityError });
    }

    updates.assignedEmployee = employee._id;
    updates.department = employee.department;
    updates.employeeSnapshot = {
      employeeId: employee.employeeId,
      fullname: employee.fullname,
      department: employee.department,
    };
  }

  Object.assign(task, updates);
  await task.save();

  res.json({ message: "Task updated successfully", task });
}));

// CHANGE STATUS only through this endpoint.
router.put("/:id/status", wrapAsync(async (req, res) => {
  const { status } = req.body;

  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  const validNextStatuses = {
    "Todo": ["In Progress", "Cancelled"],
    "In Progress": ["Completed", "Cancelled"],
    "Completed": [],
    "Cancelled": [],
  };

  if (!validNextStatuses[task.status]?.includes(status)) {
    return res.status(400).json({
      message: `Cannot change status from ${task.status} to ${status}`,
    });
  }

  task.status = status;

  if (status === "Completed") {
    task.completedDate = new Date();
  }

  await task.save();

  res.json({ message: "Task status updated successfully", task });
}));

// DELETE task.
router.delete("/:id", wrapAsync(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  await task.deleteOne();

  res.json({ message: "Task deleted successfully" });
}));

module.exports = router;
