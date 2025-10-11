import { Routes, Route, Navigate } from "react-router-dom";
import { RegisterPage } from "./pages/RegisterPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<div>Login Page (Coming Soon)</div>} />
      <Route path="/dashboard" element={<div>Dashboard (Coming Soon)</div>} />
    </Routes>
  );
}

export default App;
