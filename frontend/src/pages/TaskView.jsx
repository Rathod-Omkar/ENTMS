
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import "../styles/details.css";

function TaskView() {
    const { id } = useParams();

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        async function fetchTask() {
            setLoading(true);
            setError("");

            try {
                const response = await api.get(`/tasks/${id}`);
                setTask(response.data);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Could not find task!"
                );
            } finally {
                setLoading(false);
            }
        }

        fetchTask();
    }, [id]);

    const allowedStatuses = {
        Todo: ["In Progress", "Cancelled"],
        "In Progress": ["Completed", "Cancelled"],
        Completed: [],
        Cancelled: []
    };

    const nextStatuses = task
        ? allowedStatuses[task.status] || []
        : [];

    async function handleStatusChange(e) {
        const newStatus = e.target.value;

        if (!newStatus) return;

        const confirmed = window.confirm(
            `Change task status to ${newStatus}?`
        );

        if (!confirmed) {
            e.target.value = "";
            return;
        }

        setUpdatingStatus(true);
        setError("");

        try {
            const response = await api.put(`/tasks/${id}/status`, {
                status: newStatus
            });

            setTask(response.data.task || response.data);
            alert("Task status updated successfully!");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update task status!"
            );
        } finally {
            setUpdatingStatus(false);
        }
    }

    return (
        <div className="details-page">
            {loading && <p>Loading task details...</p>}

            {error && <p className="error-message">{error}</p>}

            {!loading && !error && task && (
                <>
                    <div className="details-header">
                        <h1>Task Details</h1>
                    </div>

                    <div className="details-card">
                        <div className="details-grid">
                            <div className="detail-item">
                                <span className="detail-label">Task ID</span>
                                <div className="detail-value">
                                    {task.taskId}
                                </div>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Title</span>
                                <div className="detail-value">
                                    {task.title}
                                </div>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">
                                    Assigned Employee
                                </span>
                                <div className="detail-value">
                                    {task.employee?.fullname ||
                                        task.employeeSnapshot?.fullname ||
                                        task.assignedEmployee?.fullname ||
                                        "Unknown"}
                                </div>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Department</span>
                                <div className="detail-value">
                                    {task.department}
                                </div>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Priority</span>
                                <div className="detail-value">
                                    {task.priority}
                                </div>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Status</span>
                                <div className="detail-value">
                                    <span
                                        className={`details-status ${task.status.toLowerCase().replace(" ", "-")}`}
                                    >
                                        {task.status}
                                    </span>
                                </div>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Start Date</span>
                                <div className="detail-value">
                                    {task.startDate?.slice(0, 10) || "—"}
                                </div>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Due Date</span>
                                <div className="detail-value">
                                    {task.dueDate?.slice(0, 10) || "—"}
                                </div>
                            </div>

                            {task.completedDate && (
                                <div className="detail-item">
                                    <span className="detail-label">
                                        Completed Date
                                    </span>
                                    <div className="detail-value">
                                        {task.completedDate.slice(0, 10)}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="details-description">
                            <span className="detail-label">Description</span>
                            <p>
                                {task.description || "No description provided."}
                            </p>
                        </div>

                        {task.isOverdue && (
                            <p>
                                <span className="details-status overdue">
                                    Overdue
                                </span>
                            </p>
                        )}

                        {nextStatuses.length > 0 && (
                            <div className="task-view-status">
                                <label htmlFor="taskStatus">
                                    Change Status
                                </label>

                                <select
                                    id="taskStatus"
                                    value=""
                                    onChange={handleStatusChange}
                                    disabled={updatingStatus}
                                >
                                    <option value="" disabled>
                                        Select next status
                                    </option>

                                    {nextStatuses.map(status => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>

                                {updatingStatus && (
                                    <p>Updating status...</p>
                                )}
                            </div>
                        )}

                        <div className="details-actions">
                            {!["Completed", "Cancelled"].includes(task.status) && (
                                <Link
                                    className="primary-btn"
                                    to={`/tasks/${task._id}/edit`}
                                >
                                    Edit Task
                                </Link>
                            )}

                            <Link to="/tasks">Back to Tasks</Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default TaskView;
