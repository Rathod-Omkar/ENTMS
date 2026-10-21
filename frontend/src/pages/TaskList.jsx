
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";

function TaskList() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialize state from URL parameters
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [page, setPage] = useState(() => {
        const value = Number(searchParams.get("page"));
        return Number.isInteger(value) && value > 0 ? value : 1;
    });

    const [totalPages, setTotalPages] = useState(1);

    const [search, setSearch] = useState(
        searchParams.get("search") || ""
    );
    const [department, setDepartment] = useState(
        searchParams.get("department") || ""
    );
    const [priority, setPriority] = useState(
        searchParams.get("priority") || ""
    );
    const [status, setStatus] = useState(
        searchParams.get("status") || ""
    );
    const [dueFrom, setDueFrom] = useState(
        searchParams.get("dueFrom") || ""
    );
    const [dueTo, setDueTo] = useState(
        searchParams.get("dueTo") || ""
    );
    const [sort, setSort] = useState(
        searchParams.get("sort") || "createdAt"
    );

    // Keep URL synchronized with filters, sorting and pagination
    useEffect(() => {
        const params = {};

        if (page > 1) params.page = String(page);
        if (search) params.search = search;
        if (department) params.department = department;
        if (priority) params.priority = priority;
        if (status) params.status = status;
        if (dueFrom) params.dueFrom = dueFrom;
        if (dueTo) params.dueTo = dueTo;
        if (sort !== "createdAt") params.sort = sort;

        setSearchParams(params, { replace: true });
    }, [
        page,
        search,
        department,
        priority,
        status,
        dueFrom,
        dueTo,
        sort,
        setSearchParams
    ]);

    // Fetch tasks using backend filtering, sorting and pagination
    useEffect(() => {
        let cancelled = false;

        async function fetchTasks() {
            setLoading(true);
            setError("");

            try {
                const response = await api.get("/tasks", {
                    params: {
                        page,
                        search: search || undefined,
                        department: department || undefined,
                        priority: priority || undefined,
                        status: status || undefined,
                        dueFrom: dueFrom || undefined,
                        dueTo: dueTo || undefined,
                        sort
                    }
                });

                if (cancelled) return;

                setTasks(response.data.tasks);
                setTotalPages(Math.max(1, response.data.totalPages));
            } catch (err) {
                if (cancelled) return;

                setError(
                    err.response?.data?.message ||
                    "Could not load tasks. Check the server."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchTasks();

        return () => {
            cancelled = true;
        };
    }, [
        page,
        search,
        department,
        priority,
        status,
        dueFrom,
        dueTo,
        sort
    ]);

    async function handleDelete(id, title) {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${title}"?`
        );

        if (!confirmed) return;

        try {
            await api.delete(`/tasks/${id}`);

            setTasks(prevTasks =>
                prevTasks.filter(task => task._id !== id)
            );

            alert("Task deleted successfully!");
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to delete task!"
            );
        }
    }

    async function handleStatusChange(task, newStatus) {
        const confirmed = window.confirm(
            `Change task "${task.title}" from ${task.status} to ${newStatus}?`
        );

        if (!confirmed) return;

        try {
            const response = await api.put(
                `/tasks/${task._id}/status`,
                { status: newStatus }
            );

            const updatedTask = response.data.task;

            setTasks(prevTasks =>
                prevTasks.map(item =>
                    item._id === task._id
                        ? { ...item, ...updatedTask }
                        : item
                )
            );

            alert("Task status updated successfully!");
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to update task status."
            );
        }
    }


    function clearFilters() {
        setSearch("");
        setDepartment("");
        setPriority("");
        setStatus("");
        setDueFrom("");
        setDueTo("");
        setSort("createdAt");
        setPage(1);
    }

    const invalidDateRange = dueFrom && dueTo && dueFrom > dueTo;

    function getNextStatuses(status) {
        const transitions = {
            Todo: ["In Progress", "Cancelled"],
            "In Progress": ["Completed", "Cancelled"],
            Completed: [],
            Cancelled: []
        };

        return transitions[status] || [];
    }

    return (
        <div>
            <h1>Task Management</h1>

            <Link to="/tasks/new" className="primary-btn">
                + Add Task
            </Link>

            <div className="task-filters">
                <input
                    type="text"
                    placeholder="Search task or employee..."
                    value={search}
                    onChange={e => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                />

                <select
                    value={department}
                    onChange={e => {
                        setDepartment(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="">All Departments</option>
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="QA">QA</option>
                    <option value="HR">HR</option>
                    <option value="Sales">Sales</option>
                </select>

                <select
                    value={priority}
                    onChange={e => {
                        setPriority(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="">All Priorities</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                </select>

                <select
                    value={status}
                    onChange={e => {
                        setStatus(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="">All Statuses</option>
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>

                <label>
                    Due from:
                    <input
                        type="date"
                        value={dueFrom}
                        max={dueTo || undefined}
                        onChange={e => {
                            setDueFrom(e.target.value);
                            setPage(1);
                        }}
                    />
                </label>

                <label>
                    Due to:
                    <input
                        type="date"
                        value={dueTo}
                        min={dueFrom || undefined}
                        onChange={e => {
                            setDueTo(e.target.value);
                            setPage(1);
                        }}
                    />
                </label>

                <label>
                    Sort by:
                    <select
                        value={sort}
                        onChange={e => {
                            setSort(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="createdAt">Newest First</option>
                        <option value="dueDate">Due Date</option>
                        <option value="priority">Priority</option>
                        <option value="title">Title</option>
                    </select>
                </label>

                <button type="button" onClick={clearFilters}>
                    Clear Filters
                </button>
            </div>

            {invalidDateRange && (
                <p>Due-from date cannot be later than due-to date.</p>
            )}

            {loading && <p>Loading tasks...</p>}
            {error && <p>{error}</p>}

            {!loading && !error && !invalidDateRange && (
                <>
                    <p>
                        Showing {tasks.length} tasks on this page
                        {` (page ${page} of ${totalPages})`}
                    </p>

                    <table>
                        <thead>
                            <tr>
                                <th>Task ID</th>
                                <th>Title</th>
                                <th>Assigned Employee</th>
                                <th>Department</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Due Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {tasks.map(task => (
                                <tr key={task._id}>
                                    <td>{task.taskId}</td>
                                    <td>{task.title}</td>
                                    <td>
                                        {task.employee?.fullname ||
                                            task.employeeSnapshot?.fullname ||
                                            task.assignedEmployee?.fullname ||
                                            "Unknown"}
                                    </td>
                                    <td>{task.department}</td>
                                    <td>{task.priority}</td>

                                    <td>
                                        <span>{task.status}</span>

                                        {getNextStatuses(task.status).length > 0 && (
                                            <select
                                                value=""
                                                onChange={e => {
                                                    const newStatus = e.target.value;

                                                    if (newStatus) {
                                                        handleStatusChange(task, newStatus);
                                                    }
                                                }}
                                            >
                                                <option value="" disabled>
                                                    Change status
                                                </option>

                                                {getNextStatuses(task.status).map(nextStatus => (
                                                    <option key={nextStatus} value={nextStatus}>
                                                        {nextStatus}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </td>

                                    <td>
                                        {task.dueDate
                                            ? task.dueDate.slice(0, 10)
                                            : "—"}
                                    </td>
                                    <td>
                                        <details>
                                            <summary style={{ cursor: "pointer" }}>
                                                ⋮
                                            </summary>

                                            <div>
                                                <Link to={`/tasks/${task._id}`}>
                                                    View
                                                </Link>
                                                <br />

                                                {!["Completed", "Cancelled"].includes(task.status) && (
                                                    <Link to={`/tasks/${task._id}/edit`}>
                                                        Edit
                                                    </Link>
                                                )}
                                                <br />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(task._id, task.title)
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </details>
                                    </td>
                                </tr>
                            ))}

                            {tasks.length === 0 && (
                                <tr>
                                    <td colSpan="8">No tasks found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div>
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            Previous
                        </button>

                        <span> Page {page} of {totalPages} </span>

                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default TaskList;