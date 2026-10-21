import { useState } from "react";
import api from "../services/api";
function EmployeeAdd(){
    const [formData,setFormData] = useState({
        employeeId:"",
        fullname:"",
        email:"",
        phone: "",
        department: "Development",
        role: "",
        joining_date: "",
        status: "Active",
        skills: "",
        leave_start: "",
        leave_end: "",
    });

    const payload = {
        ...formData,
        phone: Number(formData.phone),
        skills: formData.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
    };

    async function handleSubmit (e){
        e.preventDefault();
        try{
            const response = await api.post("/employee",payload);
            console.log("employee Created:",response.data);
            alert("employee created successfully!");
        }
        catch(error){
            console.error("Failed to add employee: ",error);
            alert(error.response?.data?.message || "Failed to add employee.");
        }
    }

    return(
        <div>
            <h1>Add New Employee</h1>
            <form action="" onSubmit={handleSubmit}>
                <label htmlFor="employeeId">EmployeeID</label>
                <input id="employeeId" type="text" name="employeeId"
                    value={formData.employeeId}
                    onChange={(e)=>
                        setFormData({...formData,employeeId:e.target.value})
                    }
                /> <br /><br />

                <label htmlFor="fullname">Full Name</label>
                <input id="fullname" type="text" name="fullname"
                    value={formData.fullname}
                    onChange={(e)=>
                        setFormData({...formData,fullname:e.target.value})
                    }
                /><br /><br />

                <label htmlFor="email">Email</label>
                <input id="email" type="email" name="email"
                    value={formData.email}
                    onChange={(e)=>
                        setFormData({...formData,email:e.target.value})
                    }
                /><br /><br />

                <label htmlFor="phone">Phone</label>
                <input id="phone" type="tel" name="phone" inputmode="numeric" pattern="[0-9]{1,10}" maxlength="10" 
                    value={formData.phone}
                    onChange={(e)=>
                        setFormData({...formData,phone:e.target.value})
                    }
                /><br /><br />

                
                <label htmlFor="department">Department</label>
                <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                    }
                >
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="QA">QA</option>
                    <option value="HR">HR</option>
                    <option value="Sales">Sales</option>
                </select><br /><br />


                <label htmlFor="role">Role</label>
                <input id="role" type="text" name="role"
                    value={formData.role}
                    onChange={(e)=>
                        setFormData({...formData,role:e.target.value})
                    }
                /><br /><br />

                <label htmlFor="joining_date">joining_date</label>
                <input id="joining_date" type="date" name="joining_date"
                    value={formData.joining_date}
                    onChange={(e)=>
                        setFormData({...formData,joining_date:e.target.value})
                    }
                /><br /><br />

                
                <label htmlFor="status">Status</label>
                <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                    }
                >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                </select><br />
                {formData.status === "On Leave" && (
                    <>
                        <label htmlFor="leave_start">Leave Start</label>
                        <input
                            id="leave_start"
                            type="date"
                            name="leave_start"
                            required
                            min={formData.joining_date}
                            value={formData.leave_start}
                            onChange={(e) =>
                                setFormData({ ...formData, leave_start: e.target.value })
                            }
                        />

                        <label htmlFor="leave_end">Leave End</label>
                        <input
                            id="leave_end"
                            type="date"
                            name="leave_end"
                            required
                            min={formData.leave_start || undefined}
                            value={formData.leave_end}
                            onChange={(e) =>
                                setFormData({ ...formData, leave_end: e.target.value })
                            }
                        />
                    </>
                )}<br /><br />


                <label htmlFor="skills">Skills (comma-separated)</label>
                <input
                    id="skills"
                    name="skills"
                    type="text"
                    placeholder="React, Node.js, MongoDB"
                    value={formData.skills}
                    onChange={(e) =>
                        setFormData({ ...formData, skills: e.target.value })
                    }
                /><br /><br />

                <button type="submit">Add Employee</button>
            </form>
        </div>
    )
}

export default EmployeeAdd;