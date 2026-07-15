import { Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Studio from "./pages/Studio";

type AppProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

export default function App({ theme, onToggleTheme }: AppProps) {
  return (
    <Routes>
      <Route
        path="/"
        element={<Landing theme={theme} onToggleTheme={onToggleTheme} />}
      />
      <Route
        path="/app"
        element={<Studio theme={theme} onToggleTheme={onToggleTheme} />}
      />
    </Routes>
  );
}
