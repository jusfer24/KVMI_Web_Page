import type { ImageMetadata } from "astro";
import type { Lang } from "../i18n/ui";

/* Chocolate Bars */
import chili1 from "../assets/images/Products/Chili_Bar_KVMI_1.jpeg";
import chili2 from "../assets/images/Products/Chili_Bar_KVMI_2.png";
import chili3 from "../assets/images/Products/Chili_Bar_KVMI_3.png";
import coffee1 from "../assets/images/Products/Coffee_Bar_KVMI_1.png";
import coffee2 from "../assets/images/Products/Coffee_Bar_KVMI_2.jpeg";
import dark1 from "../assets/images/Products/Dark_Bar_KVMI.jpeg";
import bars1 from "../assets/images/Products/Bars_KVMI_1.png";
import salt1 from "../assets/images/Products/Salt_Bar_KVMI.png";
import salt2 from "../assets/images/Products/Salt_Bar_KVMI_2.png";

/* Corporate Gifts */
import corporate1 from "../assets/images/Products/Product_Gift_KVMI_1.png";
import corporate2 from "../assets/images/Products/Product_Gift_KVMI_2.png";
import corporate3 from "../assets/images/Products/Collection_Gifts_KVMI.png";

/* Romantic Gifts */
import rose1 from "../assets/images/Products/Rose/Rose_KVMI_1.png";
import rose2 from "../assets/images/Products/Rose/Rose_KVMI_2.png";
import rose3 from "../assets/images/Products/Rose/Rose_KVMI_3.png";
import roseBox from "../assets/images/Products/Rose/Box_Rose_KVMI_White.png";

/* Premium Gifts */
import treasureBrown from "../assets/images/Products/Treasure/Treasure_KVMI_Brown Box.png";
import treasureWhite from "../assets/images/Products/Treasure/Treasure_KVMI_White Box.png";
import treasurePres1 from "../assets/images/Products/Treasure/Presentation_KVMI Box_1.jpg";
import treasurePres3 from "../assets/images/Products/Treasure/Presentation_KVMI Box_3.png";
import charm1 from "../assets/images/Products/Charm/Charm_KVMI_1.jpg";
import charm2 from "../assets/images/Products/Charm/Charm_KVMI_2.jpg";
import charmGold1 from "../assets/images/Products/Charm/Gold_KVMI_1.jpg";
import charmGold2 from "../assets/images/Products/Charm/Gold_KVMI_2.jpg";

/* Limited Edition */
import legend1 from "../assets/images/Products/Legend/KVMI_Legend Box_1.png";
import legend2 from "../assets/images/Products/Legend/KVMI_Legend Box_2.png";
import legend3 from "../assets/images/Products/Legend/KVMI_Legend Box_3.png";

export interface Localized {
  en: string;
  es: string;
}

export interface LocalizedList {
  en: string[];
  es: string[];
}

export interface CollectionDef {
  slug: string;
  name: string;
  description: Localized;
}

export interface Product {
  slug: string;
  name: string;
  collectionSlug: string;
  tagline: Localized;
  description: Localized;
  features?: LocalizedList;
  cacao?: string;
  /* null = precio bajo consulta (piezas de lujo o protocolo corporativo) */
  price: number | null;
  currency: string;
  hasAR: boolean;
  serialized?: boolean;
  images: ImageMetadata[];
  intents: string[];
  personalization: {
    engraving: boolean;
    wraps: LocalizedList;
    ribbons: LocalizedList;
  };
}

export const collections: CollectionDef[] = [
  {
    slug: "chocolate-bars",
    name: "Chocolate Bars",
    description: {
      en: "Four profiles of fine Amazonian cacao, perfect for pairing with other fine products.",
      es: "Cuatro perfiles de cacao fino amazonico, perfectos para maridar con otros productos finos.",
    },
  },
  {
    slug: "corporate-gifts",
    name: "Corporate Gifts",
    description: {
      en: "Highlight your brand with the best chocolate.",
      es: "Destaque su marca con el mejor chocolate.",
    },
  },
  {
    slug: "romantic-gifts",
    name: "Romantic Gifts",
    description: {
      en: "The perfect gift for your loved ones.",
      es: "El regalo perfecto para sus seres queridos.",
    },
  },
  {
    slug: "premium-gifts",
    name: "Premium Gifts",
    description: {
      en: "Ritual coffers and luxury pieces that turn a gift into a ceremony.",
      es: "Cofres rituales y piezas de lujo que convierten un obsequio en una ceremonia.",
    },
  },
  {
    slug: "limited-edition",
    name: "Limited Edition",
    description: {
      en: "Numbered, serialized editions. When they are gone, they are gone.",
      es: "Ediciones numeradas y serializadas. Cuando se agotan, no vuelven.",
    },
  },
];

/* Precio de las barras individuales: valor referencial del MVP,
   pendiente de confirmacion comercial. */
const BAR_PRICE = 12;

const barPersonalization = {
  engraving: false,
  wraps: {
    en: ["Signature sleeve"],
    es: ["Estuche de la casa"],
  },
  ribbons: {
    en: ["Gold ribbon", "No ribbon"],
    es: ["Cinta dorada", "Sin cinta"],
  },
};

export const products: Product[] = [
  {
    slug: "kvmi-chili-milk",
    name: "KVMI Chili & Milk",
    collectionSlug: "chocolate-bars",
    tagline: {
      en: "Exotic Taste, 55% Cocoa.",
      es: "Sabor exotico, 55% cacao.",
    },
    description: {
      en: "KVMI Chili chocolate is extra creamy and sweet with the unique touch of Ecuadorian chili flavors.",
      es: "El chocolate KVMI Chili es extra cremoso y dulce, con el toque unico de los ajies ecuatorianos.",
    },
    features: {
      en: ["Hand selected fine cacao from the Amazonas jungle", "Milk and chili powder"],
      es: ["Cacao fino seleccionado a mano de la selva amazonica", "Leche y aji en polvo"],
    },
    cacao: "55% cocoa",
    price: BAR_PRICE,
    currency: "USD",
    hasAR: false,
    images: [chili1, chili2, chili3],
    intents: ["exotic", "exotico", "chili", "aji", "picante", "spicy", "bar", "barra"],
    personalization: barPersonalization,
  },
  {
    slug: "kvmi-coffee",
    name: "KVMI Coffee",
    collectionSlug: "chocolate-bars",
    tagline: {
      en: "Coffee Taste, 70% Cocoa.",
      es: "Sabor a cafe, 70% cacao.",
    },
    description: {
      en: "KVMI Coffee chocolate is crunchy, creamy and sweet with the unique touch of Ecuadorian arabica coffee flavors.",
      es: "El chocolate KVMI Coffee es crujiente, cremoso y dulce, con el toque unico del cafe arabica ecuatoriano.",
    },
    features: {
      en: [
        "Hand selected fine cacao from the Amazonas jungle",
        "Premium medium roasted coffee beans from the humid jungle",
      ],
      es: [
        "Cacao fino seleccionado a mano de la selva amazonica",
        "Granos de cafe premium de tueste medio de la selva humeda",
      ],
    },
    cacao: "70% cocoa",
    price: BAR_PRICE,
    currency: "USD",
    hasAR: false,
    images: [coffee1, coffee2],
    intents: ["coffee", "cafe", "energy", "energia", "bar", "barra"],
    personalization: barPersonalization,
  },
  {
    slug: "kvmi-dark",
    name: "KVMI Dark",
    collectionSlug: "chocolate-bars",
    tagline: {
      en: "Pure Intense Flavor, 70% Cocoa.",
      es: "Sabor puro e intenso, 70% cacao.",
    },
    description: {
      en: "KVMI Dark chocolate is crunchy, with pure intense flavour.",
      es: "El chocolate KVMI Dark es crujiente, de sabor puro e intenso.",
    },
    features: {
      en: [
        "Hand selected fine cacao from the Amazonas jungle",
        "Premium quinoa beans from the Andean highland",
      ],
      es: [
        "Cacao fino seleccionado a mano de la selva amazonica",
        "Quinua premium del altiplano andino",
      ],
    },
    cacao: "70% cocoa",
    price: BAR_PRICE,
    currency: "USD",
    hasAR: false,
    images: [dark1, bars1],
    intents: ["dark", "oscuro", "intenso", "intense", "puro", "pure", "visit", "visita", "bar", "barra", "first", "primera"],
    personalization: barPersonalization,
  },
  {
    slug: "kvmi-salt",
    name: "KVMI Salt",
    collectionSlug: "chocolate-bars",
    tagline: {
      en: "Sophisticated Taste, 70% Cocoa.",
      es: "Sabor sofisticado, 70% cacao.",
    },
    description: {
      en: "KVMI Salt chocolate is extra creamy, sweet, and crunchy with the unique touch of Ecuadorian flavors.",
      es: "El chocolate KVMI Salt es extra cremoso, dulce y crujiente, con el toque unico de los sabores ecuatorianos.",
    },
    features: {
      en: [
        "Hand selected fine cacao from the Amazonas jungle",
        "A small amount of salt from the mines of Salinas",
      ],
      es: [
        "Cacao fino seleccionado a mano de la selva amazonica",
        "Un toque de sal de las minas de Salinas",
      ],
    },
    cacao: "70% cocoa",
    price: BAR_PRICE,
    currency: "USD",
    hasAR: false,
    images: [salt1, salt2],
    intents: ["salt", "sal", "sofisticado", "sophisticated", "bar", "barra"],
    personalization: barPersonalization,
  },
  {
    slug: "kvmi-corporate",
    name: "KVMI Corporate",
    collectionSlug: "corporate-gifts",
    tagline: {
      en: "Highlight your brand with the best chocolate.",
      es: "Destaque su marca con el mejor chocolate.",
    },
    description: {
      en: "Corporate protocol pieces personalized with your brand: boxes, ribbons and cards composed for the occasions that matter.",
      es: "Piezas de protocolo corporativo personalizadas con su marca: cajas, cintas y tarjetas compuestas para las ocasiones que importan.",
    },
    features: {
      en: [
        "Brand personalization on box and card",
        "Curated chocolate selection",
        "Volume programs for corporate gifting",
      ],
      es: [
        "Personalizacion de marca en caja y tarjeta",
        "Seleccion curada de chocolates",
        "Programas por volumen para regalo corporativo",
      ],
    },
    price: null,
    currency: "USD",
    hasAR: false,
    images: [corporate1, corporate2, corporate3],
    intents: ["corporate", "corporativo", "empresa", "cliente", "negocio", "brand", "marca", "ejecutivo", "socio"],
    personalization: {
      engraving: true,
      wraps: {
        en: ["Branded box"],
        es: ["Caja con su marca"],
      },
      ribbons: {
        en: ["Gold ribbon", "Corporate ribbon"],
        es: ["Cinta dorada", "Cinta corporativa"],
      },
    },
  },
  {
    slug: "kvmi-rose",
    name: "KVMI Rose",
    collectionSlug: "romantic-gifts",
    tagline: {
      en: "Perfect gift for your loved ones.",
      es: "El regalo perfecto para sus seres queridos.",
    },
    description: {
      en: "A declaration in cacao and gold: an eternalized rose resting over four exclusive chocolate bars, in a unique high quality box.",
      es: "Una declaracion en cacao y oro: una rosa eternizada sobre cuatro barras exclusivas de chocolate, en una caja unica de alta calidad.",
    },
    features: {
      en: [
        "Unique high quality wooden or cardboard box",
        "4 exclusive chocolate bars",
        "1 eternalized rose",
        "Certificate of authenticity",
        "Augmented Reality experience",
      ],
      es: [
        "Caja unica de madera o carton de alta calidad",
        "4 barras exclusivas de chocolate",
        "1 rosa eternizada",
        "Certificado de autenticidad",
        "Experiencia de Realidad Aumentada",
      ],
    },
    price: 40,
    currency: "USD",
    hasAR: true,
    images: [rose1, rose2, rose3, roseBox],
    intents: ["romantic", "romantico", "amor", "love", "pareja", "aniversario", "novia", "novio", "esposa", "esposo", "rosa", "rose"],
    personalization: {
      engraving: true,
      wraps: {
        en: ["Wooden box", "Cardboard box"],
        es: ["Caja de madera", "Caja de carton"],
      },
      ribbons: {
        en: ["Red rose", "Yellow rose"],
        es: ["Rosa roja", "Rosa amarilla"],
      },
    },
  },
  {
    slug: "kvmi-treasures",
    name: "KVMI Treasures",
    collectionSlug: "premium-gifts",
    tagline: {
      en: "A coffer, four origins, one ceremony.",
      es: "Un cofre, cuatro origenes, una ceremonia.",
    },
    description: {
      en: "The KVMI tasting coffer: four exclusive bars arranged in tasting order, with guide and certificate.",
      es: "El cofre de degustacion KVMI: cuatro barras exclusivas dispuestas en orden de cata, con guia y certificado.",
    },
    features: {
      en: [
        "Elegant cardboard box",
        "4 exclusive chocolate bars",
        "Tasting guide",
        "Certificate of authenticity",
        "Augmented Reality experience",
      ],
      es: [
        "Elegante caja de carton",
        "4 barras exclusivas de chocolate",
        "Guia de degustacion",
        "Certificado de autenticidad",
        "Experiencia de Realidad Aumentada",
      ],
    },
    price: 30,
    currency: "USD",
    hasAR: true,
    images: [treasureBrown, treasureWhite, treasurePres1, treasurePres3],
    intents: ["premium", "gift", "regalo", "lujo", "luxury", "hotel", "treasure", "cofre", "degustacion", "tasting"],
    personalization: {
      engraving: true,
      wraps: {
        en: ["Chocolate lacquer box", "Ivory lacquer box"],
        es: ["Caja laca chocolate", "Caja laca marfil"],
      },
      ribbons: {
        en: ["Gold ribbon", "Wine silk bow", "No ribbon"],
        es: ["Cinta dorada", "Lazo de seda vino", "Sin cinta"],
      },
    },
  },
  {
    slug: "kvmi-charm",
    name: "KVMI Charm",
    collectionSlug: "premium-gifts",
    tagline: {
      en: "A tribute to the golden seed.",
      es: "Un tributo a la semilla dorada.",
    },
    description: {
      en: "A luxury product: bit size dark chocolates dressed in 24K edible gold, crowned by a handcrafted cacao almond gold charm.",
      es: "Un producto de lujo: chocolates oscuros tipo bocado vestidos de oro comestible de 24 quilates, coronados por un dije artesanal de almendra de cacao en oro.",
    },
    features: {
      en: [
        "A tribute to the golden seed",
        "27 bit size dark chocolates with 24K edible gold",
        "Handcrafted cacao almond gold charm",
        "24K gold",
      ],
      es: [
        "Un tributo a la semilla dorada",
        "27 chocolates oscuros tipo bocado con oro comestible de 24K",
        "Dije artesanal de almendra de cacao en oro",
        "Oro de 24 quilates",
      ],
    },
    price: null,
    currency: "USD",
    hasAR: false,
    images: [charm1, charmGold1, charmGold2, charm2],
    intents: ["charm", "dije", "oro", "gold", "luxury", "lujo", "exclusivo", "exclusive", "premium"],
    personalization: {
      engraving: false,
      wraps: {
        en: ["Ivory collection box"],
        es: ["Caja de coleccion marfil"],
      },
      ribbons: {
        en: ["KVMI wax seal", "No seal"],
        es: ["Sello lacrado KVMI", "Sin sello"],
      },
    },
  },
  {
    slug: "kvmi-legend",
    name: "KVMI Legend",
    collectionSlug: "limited-edition",
    tagline: {
      en: "The Ultimate Chocolate Experience.",
      es: "La experiencia definitiva del chocolate.",
    },
    description: {
      en: "A serialized wooden box for those who want to become connoisseurs: bars, pairing tablets, nibs and the complete tasting instruments.",
      es: "Una caja de madera serializada para quienes desean volverse connoisseurs: barras, tabletas de maridaje, nibs y los instrumentos completos de cata.",
    },
    features: {
      en: [
        "Unique high quality wooden box (serialized)",
        "4 exclusive chocolate bars",
        "18 mini chocolate tablets for pairing purposes",
        "Chocolate tweezers",
        "Chocolate nibs",
        "Tasting guide",
        "Certificate of authenticity",
        "Augmented Reality experience: Become a Connoisseur",
      ],
      es: [
        "Caja unica de madera de alta calidad (serializada)",
        "4 barras exclusivas de chocolate",
        "18 mini tabletas de chocolate para maridaje",
        "Pinzas para chocolate",
        "Nibs de cacao",
        "Guia de degustacion",
        "Certificado de autenticidad",
        "Experiencia de Realidad Aumentada: Become a Connoisseur",
      ],
    },
    price: null,
    currency: "USD",
    hasAR: true,
    serialized: true,
    images: [legend1, legend2, legend3],
    intents: ["limited", "limitada", "legend", "coleccion", "collector", "numerada", "serializada", "connoisseur", "unica", "exclusive"],
    personalization: {
      engraving: false,
      wraps: {
        en: ["Serialized wooden box"],
        es: ["Caja de madera serializada"],
      },
      ribbons: {
        en: ["KVMI wax seal"],
        es: ["Sello lacrado KVMI"],
      },
    },
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getCollection(slug: string): CollectionDef | undefined {
  return collections.find((c) => c.slug === slug);
}

export function formatPrice(product: Pick<Product, "price" | "currency">, lang: Lang): string {
  if (product.price === null) {
    return lang === "en" ? "Price on request" : "Precio bajo consulta";
  }
  return `$${product.price.toFixed(2)} ${product.currency}`;
}

/* Piezas destacadas del home */
export const featuredSlugs = ["kvmi-dark", "kvmi-rose", "kvmi-treasures", "kvmi-legend"];
