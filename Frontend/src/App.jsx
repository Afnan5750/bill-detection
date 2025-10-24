import { Routes, Route, Navigate } from "react-router-dom";
import DetectionForm from "./components/screens/DetectionForm";
import Signin from "./components/screens/signin.jsx";
import "./App.css";
import DetectionList from "./components/screens/DetectionList.jsx";

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  return isLoggedIn ? children : <Navigate to="/signin" replace />;
};

const App = () => {
  return (
    <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
      <div className="w-100">
        <Routes>
          <Route path="/" element={<Signin />} />
          <Route path="/signin" element={<Signin />} />

          <Route
            path="/detection"
            element={
              <ProtectedRoute>
                <DetectionForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/detection-list"
            element={
              <ProtectedRoute>
                <DetectionList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/detection/:id"
            element={
              <ProtectedRoute>
                <DetectionForm />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
