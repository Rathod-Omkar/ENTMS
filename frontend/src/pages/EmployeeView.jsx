import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/details.css";


function EmployeeView() {
    const { id } = useParams();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchEmployee() {
            try {
                const response = await api.get(`/employee/${id}`);
                setEmployee(response.data);
            } catch (err) {
                setError(err.response?.data?.message || "could not find employee!");
            }
            finally {
                setLoading(false);
            }
        }
        fetchEmployee();
    }, [id]);

    async function handleDelete() {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${employee.fullname}?`
        );

        if (!confirmed) return;

        try {
            await api.delete(`/employee/${id}`);
            alert("Employee deleted successfully!");
            navigate("/employees");
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to delete employee!"
            );
        }
    }
    return (

        <div className="details-page">
            {loading && <p>Loading employee details...</p>}

            {error && <p className="error-message">{error}</p>}

            {!loading && !error && employee && (
                <>
                    <div className="details-header">
                        <h1>Employee Details</h1>
                    </div>

                    <div className="details-card">
                        <div className="details-grid">
                            <div className="detail-item">
                                <span className="detail-label">Employee ID</span>
                                <div className="detail-value">{employee.employeeId}</div>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Full Name</span>
                                <div className="detail-value">{employee.fullname}</div>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Email</span>
                                <div className="detail-value">{employee.email}</div>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Phone</span>
                                <div className="detail-value">{employee.phone}</div>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Department</span>
                                <div className="detail-value">{employee.department}</div>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Role</span>
                                <div className="detail-value">{employee.role}</div>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Status</span>
                                <div className="detail-value">
                                    <span className={`details-status ${employee.status.toLowerCase().replace(" ", "-")}`}>
                                        {employee.status}
                                    </span>
                                </div>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Joining Date</span>
                                <div className="detail-value">
                                    {employee.joining_date?.slice(0, 10) || "—"}
                                </div>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Skills</span>
                                <div className="detail-value">
                                    {employee.skills?.length
                                        ? employee.skills.join(", ")
                                        : "—"}
                                </div>
                            </div>

                            {employee.status === "On Leave" && (
                                <>
                                    <div className="detail-item">
                                        <span className="detail-label">Leave Start</span>
                                        <div className="detail-value">
                                            {employee.leave_start?.slice(0, 10) || "—"}
                                        </div>
                                    </div>

                                    <div className="detail-item">
                                        <span className="detail-label">Leave End</span>
                                        <div className="detail-value">
                                            {employee.leave_end?.slice(0, 10) || "—"}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="details-actions">
                            <Link
                                className="primary-btn"
                                to={`/employees/${employee._id}/edit`}
                            >
                                Edit Employee
                            </Link>

                            <button type="button" onClick={handleDelete}>
                                Delete Employee
                            </button>

                            <Link to="/employees">
                                Back to Employees
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );

}

export default EmployeeView;