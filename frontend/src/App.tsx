import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import NewIdeaPage from "./pages/NewIdeaPage";
import IdeaDetailPage from "./pages/IdeaDetailPage";
import ComparePage from "./pages/ComparePage";
import { lazy, Suspense } from "react";

// The landing page carries Remotion + Three.js: load it only when it is visited.
const LandingPage = lazy(() => import("./pages/LandingPage"));
import AnalysisPage from "./pages/AnalysisPage";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center">Chargement…</div>;
  return token ? <>{children}</> : <Navigate to="/bienvenue" />;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/bienvenue"
        element={
          <Suspense fallback={<div className="min-h-screen bg-[#121836]" />}>
            <LandingPage />
          </Suspense>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="ideas/new" element={<NewIdeaPage />} />
        <Route path="ideas/:id" element={<IdeaDetailPage />} />
        <Route path="ideas/:id/edit" element={<NewIdeaPage />} />
        <Route path="analyses/:id" element={<AnalysisPage />} />
        <Route path="compare" element={<ComparePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
