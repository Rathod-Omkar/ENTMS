const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const Employee = require("../models/Employee.js");
const Task = require("../models/Task.js");
const router = express.Router();

router.get("/",wrapAsync(async (req,res)=>{
  const result = await Employee.find();
  res.send(result);
}))

router.get("/:id", wrapAsync(async (req, res) => {
  const employee = await Employee.findOne({employeeId: req.params.id,});

  if (!employee) {
    return res.status(404).json({
      message: "Employee not found",
    });
  }

  res.json(employee);
}));

router.delete("/:id", wrapAsync(async (req, res) => {

    const { id } = req.params;

    const employee = await Employee.findOne({
      employeeId: id,
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }
    
    const activeTask = await Task.exists({
        assignedEmployee: employee._id,
        status: { $in: ["Todo", "In Progress"] },
    });

    if (activeTask) {
        return res.status(400).json({
            message: "Cannot delete employee with active tasks",
        });
    }


    const result = await Employee.findByIdAndDelete(employee._id);

    res.json({
      message: "Employee deleted successfully",
      employee: result,
    });
  
}));

router.post("/", wrapAsync(async (req, res) => {

    const newEmployee = new Employee(req.body);
    const savedEmployee = await newEmployee.save();

    res.status(201).json({
      message: "Employee created successfully",
      employee: savedEmployee,
    });  
}));


router.put("/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;

  const employee = await Employee.findOne({
    employeeId: id,
  });

  if (!employee) {
    return res.status(404).json({
      message: "Employee not found",
    });
  }

  Object.assign(employee, req.body);

  const updatedEmployee = await employee.save();

  res.json({
    message: "Employee updated successfully",
    employee: updatedEmployee,
  });
}));



module.exports = router;