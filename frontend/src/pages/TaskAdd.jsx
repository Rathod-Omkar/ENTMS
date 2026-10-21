
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function TaskAdd() {
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [error, setError] = useState("");
    

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        assignedEmployee: "",
        department: "Development",
        priority: "Medium",
        startDate: "",
        dueDate: ""
    });

    useEffect(() => {
        async function fetchEmployees() {
            try {
                const response = await api.get("/employee");

                // Adjust this if your employee API is paginated.
                setEmployees(
                    response.data.filter(
                        employee => employee.status === "Active"
                    )
                );
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Could not load employees."
                );
            } finally {
                setLoadingEmployees(false);
            }
        }

        fetchEmployees();
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === "department" && { assignedEmployee: "" })
        }));
    }
    const filteredEmployees = employees.filter((employee) => {
        if (employee.department !== formData.department) {
            return false;
        }

        if (employee.status === "Inactive") {
            return false;
        }

        if (employee.status === "Active") {
            return true;
        }

        if (employee.status === "On Leave") {
            if (!formData.startDate) {
                return true;
            }

            const taskStart = formData.startDate.slice(0, 10);
            const leaveStart = employee.leave_start?.slice(0, 10);
            const leaveEnd = employee.leave_end?.slice(0, 10);

            if (!leaveStart || !leaveEnd) {
                return false;
            }

            return taskStart < leaveStart || taskStart > leaveEnd;
        }

        return false;
    });
    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        const payload = {
            ...formData,
            assignedEmployee: formData.assignedEmployee
        };

        try {
            await api.post("/tasks", payload);
            alert("Task created successfully!");
            navigate("/tasks");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to create task."
            );
        }
    }

    return (
        <div>
            <h1>Add Task</h1>

            {loadingEmployees && <p>Loading employees...</p>}
            {error && <p>{error}</p>}

            {!loadingEmployees && !error && (
                <form onSubmit={handleSubmit}>
                    <label htmlFor="title">Task Title:</label>
                    <input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />

                    <br />

                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    />

                    <br />

                    <label htmlFor="assignedEmployee">
                        Assign Employee:
                    </label>
                    <select
                        id="assignedEmployee"
                        name="assignedEmployee"
                        value={formData.assignedEmployee}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select employee</option>
                        {filteredEmployees.map(employee => (
                            <option
                                key={employee._id}
                                value={employee._id}
                            >
                                {employee.fullname} ({employee.employeeId})
                            </option>
                        ))}
                    </select>

                    <br />

                    <label htmlFor="department">Department:</label>
                    <select
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                    >
                        {["Development", "Design", "QA", "HR", "Sales"].map(
                            department => (
                                <option key={department} value={department}>
                                    {department}
                                </option>
                            )
                        )}
                    </select>

                    <br />

                    <label htmlFor="priority">Priority:</label>
                    <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        required
                    >
                        {["Low", "Medium", "High", "Critical"].map(
                            priority => (
                                <option key={priority} value={priority}>
                                    {priority}
                                </option>
                            )
                        )}
                    </select>

                    <br />

                    <label htmlFor="startDate">Start Date:</label>
                    <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                    />

                    <br />

                    <label htmlFor="dueDate">Due Date:</label>
                    <input
                        type="date"
                        id="dueDate"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        min={formData.startDate || undefined}
                        required
                    />

                    <br />

                    <button type="submit">Create Task</button>
                    <Link to="/tasks">Cancel</Link>
                </form>
            )}
        </div>
    );
}

export default TaskAdd;
