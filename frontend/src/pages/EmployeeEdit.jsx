import { useState, useEffect } from "react";
import api from "../services/api";
import { useParams, Link, useNavigate } from "react-router-dom";

function EmployeeEdit() {
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        phone: "",
        department: "Development",
        role: "",
        joining_date: "",
        status: "Active",
        skills: "",
        leave_start: "",
        leave_end: ""
    });
    useEffect(() => {
        async function fetchEmployee() {
            try {
                const response = await api.get(`/employee/${id}`);
                setEmployee(response.data);
                setFormData({
                    fullname: response.data.fullname || "",
                    email: response.data.email || "",
                    phone: response.data.phone ?? "",
                    department: response.data.department || "Development",
                    role: response.data.role || "",
                    joining_date: response.data.joining_date
                        ? response.data.joining_date.slice(0, 10)
                        : "",
                    status: response.data.status || "Active",
                    skills: response.data.skills?.join(", ") || "",
                    leave_start: response.data.leave_start
                        ? response.data.leave_start.slice(0, 10)
                        : "",
                    leave_end: response.data.leave_end
                        ? response.data.leave_end.slice(0, 10)
                        : ""
                });
            }
            catch (err) {
                setError(err.response?.data?.message || "Couldn't fetch the employee!");
            }
            finally {
                setLoading(false);
            }
        }
        fetchEmployee();
    }, [id]);

    async function handleSubmit(e) {
        e.preventDefault();

        const payload = {
            ...formData,
            phone: Number(formData.phone),
            skills: formData.skills
                .split(",")
                .map(skill => skill.trim())
                .filter(Boolean)
        };

        try {
            await api.put(`/employee/${id}`, payload);
            alert("Employee updated successfully!");
            navigate(`/employees/${id}`);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to update employee!"
            );
        }
    }
    return (
        <div>
            <h1>Edit Employee</h1>
            {loading && <p>Loading Employee details...</p>}
            {error && <p>Error: {error}</p>}

            {!loading && !error && employee && (
                <div>

                    <form onSubmit={handleSubmit}>
                        <label>Employee ID: {employee.employeeId}</label>
                    <br />
                    <label htmlFor="fullname">Full Name:</label>
                    <input type="text" id="fullname" name="fullname" value={formData.fullname}
                        onChange={(e) =>
                            setFormData({ ...formData, fullname: e.target.value })
                        } required />
                    <br />

                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        } required />
                    <br />

                    <label htmlFor="phone">Phone:</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone}  
                       inputmode="numeric" pattern="[0-9]{1,10}" maxlength="10" 
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })
                        } required />

                    <label htmlFor="department">Department:</label>
                    <select id="department" name="department" value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })} required>
                        <option value="Development">Development</option>
                        <option value="Design">Design</option>
                        <option value="QA">QA</option>
                        <option value="HR">HR</option>
                        <option value="Sales">Sales</option>
                    </select>
                    <br />

                    <label htmlFor="role">Role:</label>
                    <input type="text" id="role" name="role" value={formData.role}
                        onChange={(e) =>
                            setFormData({ ...formData, role: e.target.value })
                        } required />
                    <br />
                    <label>Status:</label>
                    <label htmlFor="status">Status:</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                        }
                        required
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="On Leave">On Leave</option>
                    </select>
                    <br />
                    <label htmlFor="skills">Skills (comma-separated):</label>
                    <input
                        type="text"
                        id="skills"
                        name="skills"
                        value={formData.skills}
                        onChange={(e) =>
                            setFormData({ ...formData, skills: e.target.value })
                        }
                        placeholder="React, Node.js, MongoDB"
                    />
                    <br />

                    {formData.status === "On Leave" && (
                        <div>
                            <label htmlFor="leave_start">Leave Start:</label>
                            <input
                                type="date"
                                id="leave_start"
                                name="leave_start"
                                value={formData.leave_start}
                                onChange={(e) =>
                                    setFormData({ ...formData, leave_start: e.target.value })
                                }
                                required
                            />
                            <br />

                            <label htmlFor="leave_end">Leave End:</label>
                            <input
                                type="date"
                                id="leave_end"
                                name="leave_end"
                                value={formData.leave_end}
                                onChange={(e) =>
                                    setFormData({ ...formData, leave_end: e.target.value })
                                }
                                required
                            />
                            <br />
                        </div>
                    )}
                    <br />
                    <label htmlFor="joining_date">Joining Date:</label>
                    <input
                        type="date"
                        id="joining_date"
                        name="joining_date"
                        value={formData.joining_date}
                        onChange={(e) =>
                            setFormData({ ...formData, joining_date: e.target.value })
                        }
                        required
                    />
                    <br />

                        <button type="submit" disabled={loading}>
                            Save Changes
                        </button>

                        <Link to="/employees">Cancel</Link>
                    </form>
                    <Link to={`/employees`}>Back to Employees</Link>
                </div>
            )}

        </div>
    );
}

export default EmployeeEdit;