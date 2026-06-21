import { BrowserRouter, Routes, Route } from "react-router-dom";
import OtpLogin from "./components/Login";
import Home from "./components/Home";
import ProtectedRoute from "./ProtectedRoute";
import ComplaintForm from "./components/ComplaintForm";
import { AuthProvider } from "./components/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<OtpLogin />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/drug-complaint"
            element={
              <ProtectedRoute>
                <ComplaintForm />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
