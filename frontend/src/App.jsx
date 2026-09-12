import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UploadMaterial from "./pages/UploadMaterial";
import Materials from "./pages/Materials";
import PrepareMaterial from "./pages/PrepareMaterial";
import PreparationResult from "./pages/PreparationResult";
import MCQPreparation from "./pages/MCQPreparation";
import QuestionAnswerPreparation from "./pages/QuestionAnswerPreparation";
import InterviewPreparation from "./pages/InterviewPreparation";
import History from "./pages/History";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AdminRoute from "./components/AdminRoute";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminMaterials from "./pages/AdminMaterials";
import AdminGenerations from "./pages/AdminGenerations";
import AdminSettings from "./pages/AdminSettings";

const App = () => {
  return (
    <Routes>
      <Route element={<AdminRoute />}>
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/users"
          element={<AdminUsers />}
        />

        <Route
          path="/admin/materials"
          element={<AdminMaterials />}
        />

        <Route
          path="/admin/generations"
          element={<AdminGenerations />}
        />

        <Route
          path="/admin/settings"
          element={<AdminSettings />}
        />
      </Route>
      
      <Route
        path="/"
        element={<LandingPage />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/upload"
          element={<UploadMaterial />}
        />

        <Route
          path="/materials"
          element={<Materials />}
        />

        <Route
          path="/prepare/:materialId"
          element={<PrepareMaterial />}
        />

        <Route
          path="/history/:preparationId"
          element={<PreparationResult />}
        />

        <Route
          path="/prepare/:materialId/mcq"
          element={<MCQPreparation />}
        />

        <Route
          path="/prepare/:materialId/question-answer"
          element={
            <QuestionAnswerPreparation />
          }
        />

        <Route
          path="/prepare/:materialId/interview"
          element={
            <InterviewPreparation />
          }
        />

        <Route
          path="/history"
          element={<History />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />
      </Route>



      <Route
  path="*"
  element={<NotFound />}
/>
        
    </Routes>
  );
};

export default App;