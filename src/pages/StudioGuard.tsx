import { Navigate } from "react-router-dom";
import { hasStudioAccess } from "./LeadGate";
import Studio from "./Studio";

type Props = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

/** /app chỉ mở khi đã điền lead form */
export default function StudioGuard({ theme, onToggleTheme }: Props) {
  if (!hasStudioAccess()) {
    return <Navigate to="/bat-dau" replace />;
  }
  return <Studio theme={theme} onToggleTheme={onToggleTheme} />;
}
