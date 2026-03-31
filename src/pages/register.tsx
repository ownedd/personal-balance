import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/auth-context.tsx";
import { UserPlus, Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle2 } from "lucide-react";

const linkStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--color-accent)",
  fontWeight: 500,
  fontSize: "14px",
  fontFamily: "inherit",
  padding: 0,
  textDecoration: "underline",
  textUnderlineOffset: "3px",
  textDecorationColor: "transparent",
  transition: "text-decoration-color 0.2s",
};

export function RegisterPage() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await signUp(email, password, fullName);
    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "14px 16px 14px 46px",
    background: "var(--color-surface)", border: "1px solid var(--color-border)",
    borderRadius: "10px", color: "var(--color-text-primary)",
    fontSize: "14px", outline: "none", transition: "border-color 0.2s",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "11px", fontWeight: 500, color: "var(--color-text-muted)",
    textTransform: "uppercase", letterSpacing: "0.15em", display: "block",
    marginBottom: "8px",
  };

  const iconStyle: React.CSSProperties = {
    position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
    width: 16, height: 16, color: "var(--color-text-muted)", pointerEvents: "none",
  };

  if (success) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px", position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, rgba(74,222,128,0.06) 0%, transparent 50%)"
        }} />
        <div className="animate-fade-in" style={{ width: "100%", maxWidth: "480px", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "88px", height: "88px", borderRadius: "24px",
            background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.15)",
            marginBottom: "32px", position: "relative"
          }}>
            <CheckCircle2 style={{ width: 42, height: 42, color: "var(--color-success)" }} />
          </div>
          <h2 style={{
            fontFamily: "var(--font-display)", fontSize: "42px",
            color: "var(--color-text-primary)", marginBottom: "16px"
          }}>
            Revisa tu email
          </h2>
          <p style={{
            color: "var(--color-text-secondary)", fontSize: "15px",
            marginBottom: "40px", lineHeight: 1.6
          }}>
            Te enviamos un enlace de confirmación a<br />
            <span style={{ color: "var(--color-accent)", fontWeight: 500 }}>{email}</span>
          </p>
          <Link
            to="/login"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-accent)",
              fontWeight: 500,
              fontSize: "15px",
              fontFamily: "inherit",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              textDecorationColor: "transparent",
              transition: "text-decoration-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecorationColor = "var(--color-accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecorationColor = "transparent";
            }}
          >
            Volver al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", position: "relative", overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at top, var(--color-accent-glow) 0%, transparent 50%)"
      }} />
      <div className="dot-pattern" style={{ position: "absolute", inset: 0, opacity: 0.3 }} />
      <div className="animate-float" style={{
        position: "absolute", bottom: "30%", right: "-200px",
        width: "400px", height: "400px", borderRadius: "50%",
        background: "rgba(201,168,76,0.04)", filter: "blur(80px)"
      }} />

      <div className="animate-fade-in" style={{ width: "100%", maxWidth: "480px", position: "relative" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "68px", height: "68px", borderRadius: "20px",
            background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)",
            marginBottom: "20px", position: "relative"
          }}>
            <UserPlus style={{ width: 30, height: 30, color: "var(--color-accent)" }} />
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "40px",
            color: "var(--color-text-primary)", letterSpacing: "-0.02em", lineHeight: 1
          }}>
            Crear
          </h1>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "40px",
            color: "var(--color-accent)", letterSpacing: "-0.02em",
            lineHeight: 1, marginTop: "2px"
          }}>
            Cuenta
          </h1>
          <p style={{
            marginTop: "10px", color: "var(--color-text-secondary)",
            fontSize: "14px", letterSpacing: "0.02em"
          }}>
            Empieza a controlar tus finanzas
          </p>
        </div>

        {/* Form card */}
        <div className="glass card-premium" style={{ borderRadius: "16px", padding: "28px" }}>
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Nombre completo</label>
              <div style={{ position: "relative" }}>
                <User style={iconStyle} />
                <input
                  type="text" value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required placeholder="Tu nombre"
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "var(--color-border)"}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Email</label>
              <div style={{ position: "relative" }}>
                <Mail style={iconStyle} />
                <input
                  type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required placeholder="tu@email.com"
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "var(--color-border)"}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: "22px" }}>
              <label style={labelStyle}>Contraseña</label>
              <div style={{ position: "relative" }}>
                <Lock style={iconStyle} />
                <input
                  type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required minLength={6} placeholder="Mínimo 6 caracteres"
                  style={{ ...inputStyle, paddingRight: "52px" }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "var(--color-border)"}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: "absolute", right: "18px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--color-text-muted)", padding: 0, transition: "color 0.2s"
                }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-accent)"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-muted)"}
                >
                  {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="animate-scale-in" style={{
                padding: "12px 16px", borderRadius: "10px", marginBottom: "20px",
                background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)",
                color: "var(--color-danger)", fontSize: "14px"
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "14px 24px",
              background: "var(--color-accent)", color: "var(--color-background)",
              fontWeight: 600, borderRadius: "12px", border: "none", cursor: "pointer",
              fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center",
              gap: "10px", transition: "all 0.3s", fontFamily: "inherit",
              opacity: loading ? 0.5 : 1,
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-accent-hover)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(201,168,76,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--color-accent)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {loading ? (
                <div style={{
                  width: 20, height: 20, border: "2px solid rgba(15,17,23,0.3)",
                  borderTop: "2px solid var(--color-background)",
                  borderRadius: "50%", animation: "spin 0.8s linear infinite"
                }} />
              ) : (
                <>
                  Crear Cuenta
                  <ArrowRight style={{ width: 18, height: 18 }} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", marginTop: "28px", color: "var(--color-text-secondary)", fontSize: "14px" }}>
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            style={linkStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecorationColor = "var(--color-accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecorationColor = "transparent";
            }}
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
