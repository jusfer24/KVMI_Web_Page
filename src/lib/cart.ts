/*
  Store del carrito basado en localStorage.
  El estado sobrevive a la navegacion entre paginas Astro y se sincroniza
  entre islas React mediante el evento "kvmi:cart".
*/

export interface Personalization {
  message: string;
  wrap: string;
  ribbon: string;
}

export interface CartItem {
  slug: string;
  name: string;
  collection: string;
  price: number;
  image: string;
  quantity: number;
  personalization: Personalization;
}

const STORAGE_KEY = "kvmi_cart";
export const CART_EVENT = "kvmi:cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function persist(items: CartItem[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

export function addToCart(item: CartItem): void {
  const items = getCart();
  const existing = items.find(
    (i) =>
      i.slug === item.slug &&
      i.personalization.message === item.personalization.message &&
      i.personalization.wrap === item.personalization.wrap &&
      i.personalization.ribbon === item.personalization.ribbon,
  );
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    items.push(item);
  }
  persist(items);
}

export function removeFromCart(index: number): void {
  const items = getCart();
  items.splice(index, 1);
  persist(items);
}

export function clearCart(): void {
  persist([]);
}

export function cartCount(): number {
  return getCart().reduce((sum, i) => sum + i.quantity, 0);
}

export function cartTotal(): number {
  return getCart().reduce((sum, i) => sum + i.price * i.quantity, 0);
}
