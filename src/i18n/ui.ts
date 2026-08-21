/*
  Sistema de internacionalizacion KVMI.
  Ingles es el idioma principal (rutas sin prefijo); Espanol vive bajo /es/.
  Este diccionario cubre el chrome compartido (nav, footer, carrito).
  Los componentes de pagina y las islas React mantienen sus propios
  bloques de copy bilingue para textos largos.
*/

export const languages = {
  en: "EN",
  es: "ES",
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = "en";

export const ui = {
  en: {
    "nav.origin": "The Origin",
    "nav.collections": "Collections",
    "nav.ritual": "El Ritual KVMI",
    "nav.handicrafts": "Exclusive Handicrafts",
    "nav.contact": "Contact",
    "nav.account": "Account",
    "footer.tagline":
      "A digital gallery of fine aroma cacao experiences. Single origin. Limited series. Ecuador.",
    "footer.gallery": "Gallery",
    "footer.concierge": "Concierge",
    "footer.hotelDelivery": "Hotel Delivery",
    "footer.rights": "KVMI. All rights reserved.",
    "footer.location": "Quito, Ecuador",
    "brand.claim": "This is not a shop. It is an art gallery.",
  },
  es: {
    "nav.origin": "The Origin",
    "nav.collections": "Collections",
    "nav.ritual": "El Ritual KVMI",
    "nav.handicrafts": "Exclusive Handicrafts",
    "nav.contact": "Contact",
    "nav.account": "Cuenta",
    "footer.tagline":
      "Galeria digital de experiencias de cacao fino de aroma. Origen unico. Series limitadas. Ecuador.",
    "footer.gallery": "Galeria",
    "footer.concierge": "Concierge",
    "footer.hotelDelivery": "Entrega en hotel",
    "footer.rights": "KVMI. Todos los derechos reservados.",
    "footer.location": "Quito, Ecuador",
    "brand.claim": "No es un shop, es una galeria de arte.",
  },
} as const;

export function getLangFromUrl(url: URL): Lang {
  const [, first] = url.pathname.split("/");
  return first === "es" ? "es" : "en";
}

export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)["en"]): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

/* Prefija la ruta segun el idioma. EN es raiz; ES vive bajo /es. */
export function localizePath(lang: Lang, path: string): string {
  if (lang === "en") return path;
  return path === "/" ? "/es/" : `/es${path}`;
}

/* Devuelve la misma ruta en el otro idioma, para el conmutador EN/ES. */
export function switchLangPath(currentPath: string, target: Lang): string {
  const base = currentPath.replace(/^\/es(\/|$)/, "/");
  return localizePath(target, base === "" ? "/" : base);
}
