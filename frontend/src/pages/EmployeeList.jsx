import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function EmployeeList() {

  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    async function fetchEmployees() {
      try {

        const response = await api.get("/employee");
        console.log(response.data);
        setEmployees(response.data);
      }
      catch (err) {
        setError("could not load Employees. check the server.");
      }
      finally {
        setLoading(false);
      }
    }
    fetchEmployees();
  }, [])
  async function handleDelete(id, fullname) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${fullname}?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/employee/${id}`);

      setEmployees((prevEmployees) =>
        prevEmployees.filter((employee) => employee._id !== id)
      );

      alert("Employee deleted successfully!");
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Failed to delete employee!"
      );
    }
  }

  return (
    <div>
      <div>
        <h1>Employee Management</h1>
        <Link to="/employees/new" className="primary-btn">
          + Add Employee
        </Link>
        {loading && <p>Loading Employees...</p>}
        {error && <p>{error}</p>}

        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((employee) => (
                <tr key={employee.employeeId}>
                  <td>{employee.employeeId}</td>
                  <td>{employee.fullname}</td>
                  <td>{employee.department}</td>
                  <td>{employee.role}</td>
                  <td>{employee.status}</td>
                  <td>
                    <details>
                      <summary style={{ cursor: "pointer" }}>⋮</summary>
                      <div>
                        <Link to={`/employees/${employee._id}`}>View</Link>
                        <br />
                        <Link to={`/employees/${employee._id}/edit`}>Edit</Link>
                        <br />
                        <button
                          onClick={() => handleDelete(employee._id, employee.fullname)}
                          type="button"
                        >
                          Delete Employee
                        </button>
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td>No Employee found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default EmployeeList;