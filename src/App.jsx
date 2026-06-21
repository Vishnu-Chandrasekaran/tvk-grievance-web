import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import OtpLogin from "./components/Login";
import Header from "./components/Header";
import Home from "./components/Home";
import ProtectedRoute from "./ProtectedRoute";
import ComplaintForm from "./components/ComplaintForm";

export default function App() {
  const [user, setUser] = useState(null);

  // if (!user) {
  //   return <OtpLogin setUser={setUser} />;
  // }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OtpLogin setUser={setUser} />} />
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
  );
}
