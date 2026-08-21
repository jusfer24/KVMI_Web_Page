import { useEffect, useRef, useState } from "react";
import {
  CART_EVENT,
  cartTotal,
  getCart,
  removeFromCart,
  type CartItem,
} from "../../lib/cart";

/*
  Vista rapida del carrito: al presionar el icono de la barra superior se
  despliega inmediatamente un panel con la seleccion actual, sin abandonar
  la pagina.
*/

interface Props {
  lang: "en" | "es";
}

const copy = {
  en: {
    bag: "Bag",
    empty: "Your selection is empty.",
    explore: "Explore the gallery",
    total: "Total",
    checkout: "Proceed to checkout",
    remove: "Remove",
    title: "Your selection",
  },
  es: {
    bag: "Bolsa",
    empty: "Su seleccion esta vacia.",
    explore: "Explorar la galeria",
    total: "Total",
    checkout: "Ir al checkout",
    remove: "Retirar",
    title: "Su seleccion",
  },
};

export default function QuickCart({ lang }: Props) {
  const t = copy[lang];
  const prefix = lang === "es" ? "/es" : "";
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => {
      setItems(getCart());
      setTotal(cartTotal());
    };
    sync();
    window.addEventListener(CART_EVENT, sync);
    document.addEventListener("astro:page-load", sync);
    return () => {
      window.removeEventListener(CART_EVENT, sync);
      document.removeEventListener("astro:page-load", sync);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.title}
        aria-expanded={open}
        className="group flex h-11 w-11 items-center justify-center rounded-full border border-stone/40 transition-colors duration-300 hover:border-gold-deep"
      >
        {/* Icono de bolsa, sin texto ni contador */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          className="h-4 w-4 text-mist group-hover:text-gold"
          aria-hidden="true"
        >
          <path d="M5 8h14l-1.2 12H6.2L5 8Z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 w-[calc(100vw-3rem)] max-w-sm border border-gold-deep/40 bg-night/95 shadow-2xl shadow-black/60 backdrop-blur-xl">
          <div className="border-b border-white/10 px-5 py-3">
            <p className="text-[0.6rem] uppercase tracking-luxe text-gold-deep">{t.title}</p>
          </div>

          {items.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-stone">{t.empty}</p>
              <a
                href={`${prefix}/collections`}
                className="mt-6 inline-block border border-stone/40 px-6 py-2.5 text-[0.6rem] uppercase tracking-wide-luxe text-mist transition-colors hover:border-gold-deep hover:text-gold"
              >
                {t.explore}
              </a>
            </div>
          ) : (
            <>
              <ul className="max-h-72 space-y-3 overflow-y-auto px-5 py-4">
                {items.map((item, index) => (
                  <li key={`${item.slug}-${index}`} className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-14 w-14 shrink-0 object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-mist">{item.name}</p>
                      <p className="text-xs text-stone">
                        {item.quantity} x ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(index)}
                      className="shrink-0 text-[0.55rem] uppercase tracking-wide-luxe text-stone transition-colors hover:text-wine"
                    >
                      {t.remove}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="border-t border-white/10 px-5 py-4">
                <p className="flex justify-between text-sm text-mist">
                  <span>{t.total}</span>
                  <span className="font-semibold text-gold">${total.toFixed(2)} USD</span>
                </p>
                <a
                  href={`${prefix}/checkout`}
                  className="bg-gold-gradient mt-4 block px-6 py-3 text-center text-[0.6rem] font-semibold uppercase tracking-wide-luxe text-night transition-opacity hover:opacity-90"
                >
                  {t.checkout}
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
