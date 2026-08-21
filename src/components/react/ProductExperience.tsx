import { useState } from "react";
import { addToCart } from "../../lib/cart";
import type { Lang } from "../../i18n/ui";

/*
  Experiencia de producto: galeria + personalizacion + seleccion.
  Recibe el producto serializado desde la pagina Astro (las imagenes llegan
  como URLs ya optimizadas por el pipeline de assets de Astro).
*/

export interface SerializedProduct {
  slug: string;
  name: string;
  collection: string;
  price: number | null;
  currency: string;
  images: string[];
  personalization: {
    engraving: boolean;
    wraps: string[];
    ribbons: string[];
  };
}

interface Props {
  product: SerializedProduct;
  lang: Lang;
}

const copy = {
  en: {
    title: "Personalization",
    intro:
      "Every KVMI piece is prepared by hand for its recipient. Compose your version before continuing.",
    engraving: "Engraved message (optional, 60 characters)",
    engravingPlaceholder: "For those who know how to wait...",
    presentation: "Presentation",
    finish: "Finish",
    hotelAvailable: "Hotel delivery available",
    add: "Add to my selection",
    added: "Added to your selection",
    checkout: "Go to checkout",
    addedNote: "Your piece was added. You may continue exploring or proceed to checkout.",
    onRequest: "Price on request",
    requestCta: "Request through the concierge",
    requestNote:
      "This piece is reserved through our concierge team. Contact us and we will compose it for you.",
    viewImage: "View image",
  },
  es: {
    title: "Personalizacion",
    intro:
      "Cada pieza KVMI se prepara a mano para su destinatario. Componga su version antes de continuar.",
    engraving: "Mensaje grabado (opcional, 60 caracteres)",
    engravingPlaceholder: "Para quien sabe esperar...",
    presentation: "Presentacion",
    finish: "Acabado",
    hotelAvailable: "Entrega en hotel disponible",
    add: "Anadir a mi seleccion",
    added: "Anadido a su seleccion",
    checkout: "Ir al checkout",
    addedNote: "Su pieza fue anadida. Puede continuar explorando o proceder al checkout.",
    onRequest: "Precio bajo consulta",
    requestCta: "Solicitar a traves del concierge",
    requestNote:
      "Esta pieza se reserva a traves de nuestro equipo concierge. Contactenos y la componemos para usted.",
    viewImage: "Ver imagen",
  },
};

export default function ProductExperience({ product, lang }: Props) {
  const t = copy[lang];
  const prefix = lang === "es" ? "/es" : "";
  const [activeImage, setActiveImage] = useState(0);
  const [message, setMessage] = useState("");
  const [wrap, setWrap] = useState(product.personalization.wraps[0]);
  const [ribbon, setRibbon] = useState(product.personalization.ribbons[0]);
  const [added, setAdded] = useState(false);

  const purchasable = product.price !== null;

  function handleAdd() {
    if (product.price === null) return;
    addToCart({
      slug: product.slug,
      name: product.name,
      collection: product.collection,
      price: product.price,
      image: product.images[0],
      quantity: 1,
      personalization: { message: message.trim(), wrap, ribbon },
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
      {/* Galeria */}
      <div>
        <div className="relative overflow-hidden bg-cacao/30">
          <img
            key={activeImage}
            src={product.images[activeImage]}
            alt={product.name}
            className={
              "aspect-square w-full object-cover transition-opacity duration-500" +
              (product.images.length > 1
                ? activeImage % 2 === 0
                  ? " kvmi-pan-a"
                  : " kvmi-pan-b"
                : "")
            }
          />
          <div className="pointer-events-none absolute inset-0 border border-gold-deep/20"></div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4">
          {product.images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveImage(i)}
              aria-label={`${t.viewImage} ${i + 1}`}
              className={
                "overflow-hidden border transition-colors duration-300 " +
                (i === activeImage
                  ? "border-gold-deep"
                  : "border-white/10 hover:border-stone/50")
              }
            >
              <img src={src} alt="" className="aspect-square w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      </div>

      {/* Personalizacion */}
      <div>
        <h2 className="text-[0.65rem] uppercase tracking-luxe text-gold-deep">{t.title}</h2>
        <p className="mt-4 text-sm leading-relaxed text-mist/70">{t.intro}</p>

        {product.personalization.engraving && (
          <div className="mt-10">
            <label
              htmlFor="kvmi-engraving"
              className="text-[0.6rem] uppercase tracking-wide-luxe text-stone"
            >
              {t.engraving}
            </label>
            <input
              id="kvmi-engraving"
              type="text"
              maxLength={60}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.engravingPlaceholder}
              className="mt-3 w-full border border-white/10 bg-transparent px-4 py-3 text-sm text-mist placeholder:text-stone/50 focus:border-gold-deep focus:outline-none"
            />
          </div>
        )}

        <div className="mt-8">
          <p className="text-[0.6rem] uppercase tracking-wide-luxe text-stone">{t.presentation}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {product.personalization.wraps.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setWrap(option)}
                className={
                  "border px-5 py-2.5 text-xs transition-colors duration-300 " +
                  (wrap === option
                    ? "border-gold-deep text-gold"
                    : "border-white/10 text-stone hover:border-stone/50")
                }
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <p className="text-[0.6rem] uppercase tracking-wide-luxe text-stone">{t.finish}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {product.personalization.ribbons.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRibbon(option)}
                className={
                  "border px-5 py-2.5 text-xs transition-colors duration-300 " +
                  (ribbon === option
                    ? "border-gold-deep text-gold"
                    : "border-white/10 text-stone hover:border-stone/50")
                }
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="gold-rule mt-12"></div>

        <div className="mt-8 flex items-center justify-between">
          <p className="font-display text-3xl text-mist">
            {purchasable ? (
              <>
                ${product.price?.toFixed(2)}
                <span className="ml-2 text-sm text-stone">{product.currency}</span>
              </>
            ) : (
              <span className="text-gold-gradient text-2xl">{t.onRequest}</span>
            )}
          </p>
          <p className="text-[0.6rem] uppercase tracking-wide-luxe text-stone">
            {t.hotelAvailable}
          </p>
        </div>

        {purchasable ? (
          <>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={handleAdd}
                className="bg-gold-gradient flex-1 px-8 py-4 text-[0.65rem] font-semibold uppercase tracking-luxe text-night transition-opacity hover:opacity-90"
              >
                {added ? t.added : t.add}
              </button>
              <a
                href={`${prefix}/checkout`}
                className="flex-1 border border-stone/40 px-8 py-4 text-center text-[0.65rem] uppercase tracking-luxe text-mist transition-colors hover:border-gold-deep hover:text-gold"
              >
                {t.checkout}
              </a>
            </div>
            {added && <p className="mt-4 text-sm text-gold">{t.addedNote}</p>}
          </>
        ) : (
          <div className="mt-8">
            <p className="text-sm leading-relaxed text-mist/70">{t.requestNote}</p>
            <a
              href={`${prefix}/contact`}
              className="bg-gold-gradient mt-6 inline-block px-8 py-4 text-[0.65rem] font-semibold uppercase tracking-luxe text-night transition-opacity hover:opacity-90"
            >
              {t.requestCta}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
