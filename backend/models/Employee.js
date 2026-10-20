const mongoose = require("mongoose");
const employeeSchema = new mongoose.Schema({
     employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fullname:{
        type:String,
        required:true,
        trim: true,
    },
    email:{
        type:String,
        required:true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    department:{
        type: String,
        enum:["Development", "Design", "QA", "HR", "Sales"],
        required:true,
    },
    role:{
        type:String,
        required:true,
        trim:true,
    },
    joining_date:{
        type:Date,
        required:true,
    },
     status: {
      type: String,
      enum: ["Active", "Inactive", "On Leave"],
      default: "Active",
      required: true,
    },
    skills:{
        type:[String],
        default:[],
    },
    leave_start: {
      type: Date,
      required: function () {
        return this.status === "On Leave";
      },
    },
    leave_end: {
      type: Date,
      required: function () {
        return this.status === "On Leave";
      },
    },
},
{
    timestamps: true,
  }
);


employeeSchema.pre("validate", function () {
  if (this.status === "On Leave") {
    if (
      this.leave_start &&
      this.leave_end &&
      this.leave_end < this.leave_start
    ) {
      this.invalidate(
        "leave_end",
        "Leave end date cannot be before leave start date!"
      );
    }
  } else {
    this.leave_start = undefined;
    this.leave_end = undefined;
  }
});

module.exports = mongoose.model("Employee",employeeSchema);