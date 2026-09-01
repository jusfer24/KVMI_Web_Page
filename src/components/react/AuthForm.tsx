import { useState } from "react";

/*
  Acceso y registro KVMI.
  MVP de interfaz: valida y simula el flujo. En integracion, el submit
  llama a los endpoints de autenticacion de Django (sesiones sobre SQL
  Server) y el boton de Google inicia el flujo OAuth 2.0 / OpenID Connect
  del proveedor.
*/

interface Props {
  lang: "en" | "es";
}

const copy = {
  en: {
    login: "Sign in",
    register: "Create account",
    email: "Email address",
    password: "Password",
    confirm: "Confirm password",
    name: "Full name",
    submitLogin: "Sign in",
    submitRegister: "Create my account",
    divider: "or",
    google: "Continue with Google",
    successLogin: "Welcome back to the gallery.",
    successRegister: "Your account has been created. Welcome to KVMI.",
    errorRequired: "Please complete every field.",
    errorPassword: "Passwords do not match.",
    googleNote: "Secure single sign-on.",
  },
  es: {
    login: "Iniciar sesion",
    register: "Crear cuenta",
    email: "Correo electronico",
    password: "Contrasena",
    confirm: "Confirmar contrasena",
    name: "Nombre completo",
    submitLogin: "Iniciar sesion",
    submitRegister: "Crear mi cuenta",
    divider: "o",
    google: "Continuar con Google",
    successLogin: "Bienvenido de vuelta a la galeria.",
    successRegister: "Su cuenta ha sido creada. Bienvenido a KVMI.",
    errorRequired: "Complete todos los campos.",
    errorPassword: "Las contrasenas no coinciden.",
    googleNote: "Inicio de sesion unico y seguro.",
  },
};

const inputClass =
  "mt-2 w-full border border-white/10 bg-transparent px-4 py-3 text-sm text-mist placeholder:text-stone/50 focus:border-gold-deep focus:outline-none";

export default function AuthForm({ lang }: Props) {
  const t = copy[lang];
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!email.trim() || !password.trim() || (mode === "register" && !name.trim())) {
      setMessage({ text: t.errorRequired, error: true });
      return;
    }
    if (mode === "register" && password !== confirm) {
      setMessage({ text: t.errorPassword, error: true });
      return;
    }
    /* Aqui se llamara a POST /api/auth/ del backend Django */
    setMessage({
      text: mode === "login" ? t.successLogin : t.successRegister,
      error: false,
    });
  }

  return (
    <div className="border border-white/10 bg-cacao/20 p-8 md:p-10">
      <div className="flex overflow-hidden rounded-full border border-white/10">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setMessage(null);
            }}
            className={
              "flex-1 px-4 py-3 text-[0.6rem] uppercase tracking-wide-luxe transition-colors " +
              (mode === m
                ? "bg-gold-gradient font-semibold text-night"
                : "text-stone hover:text-gold")
            }
          >
            {m === "login" ? t.login : t.register}
          </button>
        ))}
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        {mode === "register" && (
          <div>
            <label htmlFor="auth-name" className="text-[0.6rem] uppercase tracking-wide-luxe text-stone">
              {t.name}
            </label>
            <input
              id="auth-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label htmlFor="auth-email" className="text-[0.6rem] uppercase tracking-wide-luxe text-stone">
            {t.email}
          </label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@email.com"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="auth-password" className="text-[0.6rem] uppercase tracking-wide-luxe text-stone">
            {t.password}
          </label>
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        {mode === "register" && (
          <div>
            <label htmlFor="auth-confirm" className="text-[0.6rem] uppercase tracking-wide-luxe text-stone">
              {t.confirm}
            </label>
            <input
              id="auth-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputClass}
            />
          </div>
        )}

        {message && (
          <p className={"text-sm " + (message.error ? "text-wine" : "text-gold")}>
            {message.text}
          </p>
        )}

        <button
          type="submit"
          className="rounded-full bg-gold-gradient w-full px-8 py-4 text-[0.65rem] font-semibold uppercase tracking-luxe text-night transition-opacity hover:opacity-90"
        >
          {mode === "login" ? t.submitLogin : t.submitRegister}
        </button>
      </form>

      <div className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-white/10"></div>
        <span className="text-[0.6rem] uppercase tracking-wide-luxe text-stone">{t.divider}</span>
        <div className="h-px flex-1 bg-white/10"></div>
      </div>

      <button
        type="button"
        data-sso-provider="google"
        onClick={() => setMessage({ text: t.googleNote, error: false })}
        className="flex w-full items-center justify-center gap-3 rounded-full border border-stone/40 px-8 py-4 text-[0.65rem] uppercase tracking-wide-luxe text-mist transition-colors hover:border-gold-deep hover:text-gold"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.46a5.53 5.53 0 0 1-2.4 3.62v3h3.87c2.27-2.09 3.57-5.17 3.57-8.81Z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A12 12 0 0 0 12 24Z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28V6.63H1.29a12 12 0 0 0 0 10.74l3.98-3.09Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.98 11.98 0 0 0 1.29 6.63l3.98 3.09C6.22 6.88 8.87 4.77 12 4.77Z"
          />
        </svg>
        {t.google}
      </button>
    </div>
  );
}
