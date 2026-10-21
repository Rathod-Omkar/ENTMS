
const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const Employee = require("../models/Employee");
const Task = require("../models/Task");

const router = express.Router();

const finalStatuses = ["Completed", "Cancelled"];

router.get("/", wrapAsync(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
        totalEmployees,
        employeesByStatus,
        totalTasks,
        tasksByStatus,
        overdueTasks
    ] = await Promise.all([
        Employee.countDocuments(),

        Employee.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]),

        Task.countDocuments(),

        Task.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]),

        Task.countDocuments({
            dueDate: { $lt: today },
            status: { $nin: finalStatuses }
        })
    ]);

    const employeeCounts = {
        Active: 0,
        Inactive: 0,
        "On Leave": 0
    };

    employeesByStatus.forEach(item => {
        employeeCounts[item._id] = item.count;
    });

    const taskCounts = {
        Todo: 0,
        "In Progress": 0,
        Completed: 0,
        Cancelled: 0
    };

    tasksByStatus.forEach(item => {
        taskCounts[item._id] = item.count;
    });

    res.json({
        employees: {
            total: totalEmployees,
            byStatus: employeeCounts
        },
        tasks: {
            total: totalTasks,
            byStatus: taskCounts,
            overdue: overdueTasks
        }
    });
}));

module.exports = router;
