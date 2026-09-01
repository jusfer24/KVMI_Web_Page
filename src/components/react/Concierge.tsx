import { useEffect, useRef, useState } from "react";
import { formatPrice, products, type Product } from "../../lib/catalog";
import type { Lang } from "../../i18n/ui";

/*
  KVMI AI CONCIERGE - Prototipo funcional bilingue.
  Consume POST /api/concierge/ (Django), que orquesta Gemini (modelo flash) sobre
  un catalogo cerrado de 3 piezas. Flujo: consulta -> recomendacion exacta ->
  seleccion -> conversion. Ver docs/ARCHITECTURE.md.
*/

const API_BASE = import.meta.env.PUBLIC_API_BASE_URL ?? "http://localhost:8000";

interface Props {
  lang: Lang;
}

interface Message {
  role: "concierge" | "guest";
  text: string;
  recommendation?: Product;
  actionLabel?: string;
}

interface ConciergeApiResponse {
  message: string;
  recommended_product_id: string | null;
  action_label: string;
}

const copy = {
  en: {
    welcome:
      "Welcome to KVMI. I am your personal concierge. Tell me what you are looking for and I will guide you to the exact piece.",
    fallback:
      "I am here to guide you to the exact piece. Tell me the occasion: a romantic gift, a corporate gesture, a collector piece, or delivery to your hotel.",
    thinking: "The concierge is composing your recommendation...",
    placeholder: "Describe the occasion...",
    send: "Send",
    view: "View piece",
    open: "AI Concierge",
    close: "Close concierge",
    suggestions: [
      "I am visiting Ecuador, which chocolate do you recommend?",
      "I want a romantic gift.",
      "I want something premium.",
      "Which product can be delivered to my hotel?",
    ],
  },
  es: {
    welcome:
      "Bienvenido a KVMI. Soy su concierge personal. Digame que busca y lo llevare a la pieza exacta.",
    fallback:
      "Estoy aqui para guiarle hacia la pieza exacta. Puede contarme la ocasion: un regalo romantico, un gesto corporativo, una pieza de coleccion, o entrega en su hotel.",
    thinking: "El concierge esta componiendo su recomendacion...",
    placeholder: "Describa la ocasion...",
    send: "Enviar",
    view: "Ver pieza",
    open: "AI Concierge",
    close: "Cerrar concierge",
    suggestions: [
      "Estoy visitando Ecuador, que chocolate me recomiendas?",
      "Quiero un regalo romantico.",
      "Quiero algo premium.",
      "Que producto puedo entregar en mi hotel?",
    ],
  },
};

export default function Concierge({ lang: initialLang }: Props) {
  /*
    Este widget se persiste entre navegaciones (transition:persist) para
    conservar la conversacion. Como el prop inicial solo se recibe en el
    primer montaje, el idioma se resincroniza leyendo <html lang> despues
    de cada cambio de pagina, para no quedar congelado en el idioma con el
    que se abrio la sesion.
  */
  const [lang, setLang] = useState<Lang>(initialLang);
  const t = copy[lang];
  const prefix = lang === "es" ? "/es" : "";
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "concierge", text: t.welcome },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function syncLang() {
      const htmlLang = document.documentElement.lang;
      if (htmlLang === "en" || htmlLang === "es") {
        setLang((prev) => (prev === htmlLang ? prev : htmlLang));
      }
    }
    document.addEventListener("astro:after-swap", syncLang);
    return () => document.removeEventListener("astro:after-swap", syncLang);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking, open]);

  async function send(text: string) {
    const query = text.trim();
    if (!query || thinking) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "guest", text: query }]);
    setThinking(true);
    try {
      const res = await fetch(`${API_BASE}/api/concierge/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, lang }),
      });
      if (!res.ok) throw new Error("concierge request failed");
      const data: ConciergeApiResponse = await res.json();
      const recommendation = data.recommended_product_id
        ? products.find((p) => p.slug === data.recommended_product_id)
        : undefined;
      setMessages((prev) => [
        ...prev,
        {
          role: "concierge",
          text: data.message,
          recommendation,
          actionLabel: data.action_label,
        },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: "concierge", text: t.fallback }]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {open && (
        <div className="flex h-[32rem] w-[calc(100vw-3rem)] max-w-md flex-col overflow-hidden border border-gold-deep/40 bg-night/95 shadow-2xl shadow-black/60 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <p className="text-[0.6rem] uppercase tracking-luxe text-gold-deep">KVMI</p>
              <p className="text-sm font-medium text-mist">AI Concierge</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.close}
              className="text-stone transition-colors hover:text-gold"
            >
              <span className="text-lg leading-none">&times;</span>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {messages.map((msg, i) => (
              <div key={i}>
                <div
                  className={
                    msg.role === "guest"
                      ? "ml-8 border border-white/10 bg-white/5 px-4 py-3 text-sm text-mist"
                      : "mr-4 border-l-2 border-gold-deep bg-cacao/40 px-4 py-3 text-sm leading-relaxed text-mist/90"
                  }
                >
                  {msg.text}
                </div>

                {msg.recommendation && (
                  <div className="mt-3 space-y-3">
                    <a
                      href={`${prefix}/products/${msg.recommendation.slug}`}
                      className="group flex items-center gap-4 border border-white/10 bg-white/[0.03] p-3 transition-colors duration-300 hover:border-gold-deep"
                    >
                      <img
                        src={msg.recommendation.images[0].src}
                        alt={msg.recommendation.name}
                        className="h-16 w-16 shrink-0 object-cover"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <p className="text-[0.6rem] uppercase tracking-wide-luxe text-gold-deep">
                          {msg.recommendation.tagline[lang]}
                        </p>
                        <p className="truncate text-sm text-mist group-hover:text-gold">
                          {msg.recommendation.name}
                        </p>
                        <p className="text-xs text-stone">{formatPrice(msg.recommendation, lang)}</p>
                      </div>
                      <span className="ml-auto shrink-0 text-[0.6rem] uppercase tracking-wide-luxe text-gold-deep">
                        {msg.actionLabel ?? t.view}
                      </span>
                    </a>
                  </div>
                )}
              </div>
            ))}

            {thinking && (
              <div className="mr-4 border-l-2 border-gold-deep bg-cacao/40 px-4 py-3 text-sm text-stone">
                {t.thinking}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 px-5 py-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {t.suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-[0.6rem] text-stone transition-colors hover:border-gold-deep hover:text-gold"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.placeholder}
                className="min-w-0 flex-1 border border-white/10 bg-transparent px-4 py-2.5 text-sm text-mist placeholder:text-stone/60 focus:border-gold-deep focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-gold-gradient px-4 py-2.5 text-[0.6rem] font-semibold uppercase tracking-wide-luxe text-night transition-opacity hover:opacity-90"
              >
                {t.send}
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.open}
        className="group flex items-center gap-3 rounded-full border border-gold-deep/60 bg-night/90 px-5 py-3 backdrop-blur-md transition-colors duration-300 hover:border-gold"
      >
        <span className="bg-gold-gradient h-2 w-2 rounded-full"></span>
        <span className="text-[0.6rem] uppercase tracking-luxe text-mist group-hover:text-gold">
          {t.open}
        </span>
      </button>
    </div>
  );
}
