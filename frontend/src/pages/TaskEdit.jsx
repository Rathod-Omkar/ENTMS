
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function TaskEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
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
        async function fetchTask() {
            try {
                const response = await api.get(`/tasks/${id}`);
                const data = response.data;

                setTask(data);
                setFormData({
                    title: data.title || "",
                    description: data.description || "",
                    assignedEmployee:
                        data.assignedEmployee?._id ||
                        data.assignedEmployee ||
                        "",
                    department: data.department || "Development",
                    priority: data.priority || "Medium",
                    startDate: data.startDate
                        ? data.startDate.slice(0, 10)
                        : "",
                    dueDate: data.dueDate
                        ? data.dueDate.slice(0, 10)
                        : ""
                });
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Could not load task."
                );
            } finally {
                setLoading(false);
            }
        }

        fetchTask();
    }, [id]);

    function handleChange(e) {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }
    async function handleSubmit(e) {
    e.preventDefault();
    if (formData.dueDate < formData.startDate) {
    setError("Due date cannot be earlier than start date.");
    return;
}
    setError("");

    try {
        await api.put(`/tasks/${id}`, {
            title: formData.title,
            description: formData.description,
            department: formData.department,
            priority: formData.priority,
            startDate: formData.startDate,
            dueDate: formData.dueDate
        });

        alert("Task updated successfully!");
        navigate(`/tasks/${id}`);
    } catch (err) {
        setError(
            err.response?.data?.message ||
            "Failed to update task."
        );
    }
}
    return (
        <div>
            <h1>Edit Task</h1>

            {loading && <p>Loading task...</p>}
            {error && <p>{error}</p>}

            {!loading && !error && task && (
                <>
                    {["Completed", "Cancelled"].includes(task.status) ? (
                        <p>
                            This task cannot be edited because its status
                            is {task.status}.
                        </p>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <label htmlFor="title">Title:</label>
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
                                min={formData.startDate || undefined}
                                onChange={handleChange}
                                required
                            />
                            <br />

                            <button type="submit">Save Changes</button>
                        </form>
                    )}

                    <Link to={`/tasks/${id}`}>Cancel</Link>
                </>
            )}
        </div>
    );
}

export default TaskEdit;
