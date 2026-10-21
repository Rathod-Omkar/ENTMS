
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";

import EmployeeAdd from "./pages/EmployeeAdd.jsx";
import EmployeeList from "./pages/EmployeeList.jsx";
import EmployeeView from "./pages/EmployeeView";
import EmployeeEdit from "./pages/EmployeeEdit.jsx";

import TaskList from "./pages/TaskList.jsx";
import TaskView from "./pages/TaskView";
import TaskAdd from "./pages/TaskAdd";
import TaskEdit from "./pages/TaskEdit";

import Dashboard from "./pages/Dashboard";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route
                        path="/"
                        element={<Navigate to="/dashboard" replace />}
                    />

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/employees"
                        element={<EmployeeList />}
                    />

                    <Route
                        path="/employees/new"
                        element={<EmployeeAdd />}
                    />

                    <Route
                        path="/employees/:id"
                        element={<EmployeeView />}
                    />

                    <Route
                        path="/employees/:id/edit"
                        element={<EmployeeEdit />}
                    />

                    <Route
                        path="/tasks"
                        element={<TaskList />}
                    />

                    <Route
                        path="/tasks/new"
                        element={<TaskAdd />}
                    />

                    <Route
                        path="/tasks/:id"
                        element={<TaskView />}
                    />

                    <Route
                        path="/tasks/:id/edit"
                        element={<TaskEdit />}
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
