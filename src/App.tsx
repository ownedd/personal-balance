import { RouterProvider } from "@tanstack/react-router";
import { useAuth } from "@/contexts/auth-context.tsx";
import { router } from "@/router.tsx";
import { Loader2 } from "lucide-react";

export default function App() {
  const auth = useAuth();

  if (auth.loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-background)",
        }}
      >
        <div className="animate-fade-in" style={{ textAlign: "center" }}>
          <Loader2
            className="animate-spin"
            style={{
              width: 32,
              height: 32,
              color: "var(--color-accent)",
              display: "block",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} context={{ auth }} />;
}
