import { Route, Routes } from "react-router-dom";
import VisitTracker from "./components/VisitTracker";
import Admin from "./pages/Admin";
import Landing from "./pages/Landing";
import LeadGate from "./pages/LeadGate";
import StudioGuard from "./pages/StudioGuard";

type AppProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

export default function App({ theme, onToggleTheme }: AppProps) {
  return (
    <>
      <VisitTracker />
      <Routes>
        <Route
          path="/"
          element={<Landing theme={theme} onToggleTheme={onToggleTheme} />}
        />
        <Route
          path="/bat-dau"
          element={<LeadGate theme={theme} onToggleTheme={onToggleTheme} />}
        />
        <Route
          path="/app"
          element={<StudioGuard theme={theme} onToggleTheme={onToggleTheme} />}
        />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  );
}
