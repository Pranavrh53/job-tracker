import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Analytics from "./pages/Analytics";
import Reminders from "./pages/Reminders";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import JobTable from "./pages/JobTable";
import JobForm from "./pages/JobForm";
import JobEdit from "./pages/JobEdit";
import Insights from "./pages/Insights";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './index.css';

function App() {
  return (
    <Router>
      <div>
        <h1 className="text-3xl font-bold text-center my-4">Job Tracker</h1>
        <Navbar />

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/jobtable" element={<JobTable />} />
          <Route path="/jobform" element={<JobForm />} />
          <Route path="/jobedit" element={<JobEdit />} />
          <Route path="/insights" element={<Insights />} />
        </Routes>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
