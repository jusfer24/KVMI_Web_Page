import { useEffect, useMemo, useState } from "react";
import {
  CART_EVENT,
  clearCart,
  getCart,
  removeFromCart,
  type CartItem,
} from "../../lib/cart";
import type { Lang } from "../../i18n/ui";

/*
  Checkout KVMI - Recorrido vertical completo:
  SELECCION -> HOTEL DELIVERY -> PAGO -> CONFIRMACION.
  En produccion, el paso final envia la orden a POST /api/orders/ (Django +
  SQL Server); aqui el MVP simula la confirmacion en el cliente.
*/

type Step = "bag" | "delivery" | "payment" | "confirmation";

interface HotelDelivery {
  guestName: string;
  hotel: string;
  city: string;
  arrivalDate: string;
  departureDate: string;
  phone: string;
  instructions: string;
}

interface Props {
  lang: Lang;
}

const emptyDelivery: HotelDelivery = {
  guestName: "",
  hotel: "",
  city: "Quito",
  arrivalDate: "",
  departureDate: "",
  phone: "",
  instructions: "",
};

const copy = {
  en: {
    steps: ["Selection", "Hotel Delivery", "Payment", "Confirmation"],
    cities: ["Quito", "Guayaquil", "Cuenca", "Galapagos", "Other city"],
    empty: "Your selection is empty.",
    explore: "Explore the gallery",
    presentation: "Presentation",
    finish: "Finish",
    engraved: "Engraving",
    remove: "Remove",
    total: "Total",
    continueDelivery: "Continue to Hotel Delivery",
    deliverTitle: "Deliver to my hotel",
    deliverHeading: "Your piece awaits you at the front desk.",
    deliverIntro:
      "We coordinate the delivery directly with your hotel concierge within your stay dates.",
    guestName: "Guest name",
    guestPlaceholder: "Name as it appears on your reservation",
    hotel: "Hotel",
    hotelPlaceholder: "e.g. Sofitel Quito",
    city: "City",
    phone: "Contact phone",
    arrival: "Arrival date",
    departure: "Departure date",
    departureError: "The departure date must be after the arrival date.",
    instructions: "Instructions for the concierge desk (optional)",
    instructionsPlaceholder:
      "e.g. Deliver to the suite after 6 pm, it is an anniversary surprise.",
    missingFields: "Complete the highlighted fields to coordinate your delivery.",
    backToBag: "Back to my selection",
    continuePayment: "Continue to payment",
    summary: "Summary",
    freeDelivery: "Hotel delivery within Quito has no additional cost.",
    securePayment: "Secure payment",
    paymentHeading: "Complete the acquisition.",
    paymentIntro:
      "Demo environment: do not enter real card details. In production this step is processed by a PCI-DSS certified payment gateway.",
    cardName: "Name on card",
    cardNamePlaceholder: "Cardholder name",
    cardNumber: "Card number (demo)",
    backToDelivery: "Back to delivery",
    confirmOrder: "Confirm order",
    coordinated: "Coordinated delivery",
    guest: "Guest",
    stay: "Stay",
    to: "to",
    confirmedTitle: "Order confirmed",
    reference: "Reference",
    confirmationText: (d: HotelDelivery) =>
      `Your selection will be delivered to the concierge desk of ${d.hotel}, ${d.city}, in the name of ${d.guestName}, within your stay from ${d.arrivalDate} to ${d.departureDate}. You will receive the delivery coordination at the phone number provided.`,
    yourSelection: "Your selection",
    backToGallery: "Back to the gallery",
  },
  es: {
    steps: ["Seleccion", "Hotel Delivery", "Pago", "Confirmacion"],
    cities: ["Quito", "Guayaquil", "Cuenca", "Galapagos", "Otra ciudad"],
    empty: "Su seleccion esta vacia.",
    explore: "Explorar la galeria",
    presentation: "Presentacion",
    finish: "Acabado",
    engraved: "Grabado",
    remove: "Retirar",
    total: "Total",
    continueDelivery: "Continuar a Hotel Delivery",
    deliverTitle: "Deliver to my hotel",
    deliverHeading: "Su pieza le espera en recepcion.",
    deliverIntro:
      "Coordinamos la entrega directamente con la conserjeria de su hotel dentro de sus fechas de estadia.",
    guestName: "Nombre del huesped",
    guestPlaceholder: "Nombre tal como figura en su reserva",
    hotel: "Hotel",
    hotelPlaceholder: "Ej. Sofitel Quito",
    city: "Ciudad",
    phone: "Telefono de contacto",
    arrival: "Fecha de llegada",
    departure: "Fecha de salida",
    departureError: "La fecha de salida debe ser posterior a la llegada.",
    instructions: "Instrucciones para la conserjeria (opcional)",
    instructionsPlaceholder:
      "Ej. Entregar en la suite despues de las 18h00, es una sorpresa de aniversario.",
    missingFields: "Complete los campos marcados para coordinar su entrega.",
    backToBag: "Volver a mi seleccion",
    continuePayment: "Continuar al pago",
    summary: "Resumen",
    freeDelivery: "La entrega en hotel dentro de Quito no tiene costo adicional.",
    securePayment: "Pago seguro",
    paymentHeading: "Finalizar la adquisicion.",
    paymentIntro:
      "Entorno de demostracion: no ingrese datos reales de tarjeta. En produccion este paso se procesa mediante una pasarela certificada PCI-DSS.",
    cardName: "Nombre en la tarjeta",
    cardNamePlaceholder: "Nombre del titular",
    cardNumber: "Numero de tarjeta (demo)",
    backToDelivery: "Volver a delivery",
    confirmOrder: "Confirmar pedido",
    coordinated: "Entrega coordinada",
    guest: "Huesped",
    stay: "Estadia",
    to: "a",
    confirmedTitle: "Pedido confirmado",
    reference: "Referencia",
    confirmationText: (d: HotelDelivery) =>
      `Su seleccion sera entregada a la conserjeria de ${d.hotel}, ${d.city}, a nombre de ${d.guestName}, dentro de su estadia del ${d.arrivalDate} al ${d.departureDate}. Recibira la coordinacion de entrega en el telefono indicado.`,
    yourSelection: "Su seleccion",
    backToGallery: "Volver a la galeria",
  },
};

function fieldClass(hasError: boolean): string {
  return (
    "mt-2 w-full border bg-transparent px-4 py-3 text-sm text-mist placeholder:text-stone/50 focus:outline-none transition-colors " +
    (hasError
      ? "border-wine focus:border-wine"
      : "border-white/10 focus:border-gold-deep")
  );
}

export default function CheckoutFlow({ lang }: Props) {
  const t = copy[lang];
  const prefix = lang === "es" ? "/es" : "";
  const [step, setStep] = useState<Step>("bag");
  const [items, setItems] = useState<CartItem[]>([]);
  const [delivery, setDelivery] = useState<HotelDelivery>(emptyDelivery);
  const [deliveryErrors, setDeliveryErrors] = useState<Set<string>>(new Set());
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [confirmedItems, setConfirmedItems] = useState<CartItem[]>([]);

  const stepIds: Step[] = ["bag", "delivery", "payment", "confirmation"];

  useEffect(() => {
    const sync = () => setItems(getCart());
    sync();
    window.addEventListener(CART_EVENT, sync);
    return () => window.removeEventListener(CART_EVENT, sync);
  }, []);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );
  const confirmedTotal = useMemo(
    () => confirmedItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [confirmedItems],
  );

  function updateDelivery(field: keyof HotelDelivery, value: string) {
    setDelivery((prev) => ({ ...prev, [field]: value }));
    setDeliveryErrors((prev) => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  }

  function validateDelivery(): boolean {
    const required: (keyof HotelDelivery)[] = [
      "guestName",
      "hotel",
      "city",
      "arrivalDate",
      "departureDate",
      "phone",
    ];
    const errors = new Set<string>(
      required.filter((f) => delivery[f].trim() === ""),
    );
    if (
      delivery.arrivalDate &&
      delivery.departureDate &&
      delivery.departureDate < delivery.arrivalDate
    ) {
      errors.add("departureDate");
    }
    setDeliveryErrors(errors);
    return errors.size === 0;
  }

  function confirmOrder() {
    if (!cardName.trim() || cardNumber.replace(/\s/g, "").length < 12) return;
    const ref = "KVMI-" + Date.now().toString(36).toUpperCase().slice(-6);
    setOrderRef(ref);
    setConfirmedItems(items);
    clearCart();
    setStep("confirmation");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const stepIndex = stepIds.indexOf(step);

  return (
    <div>
      {/* Indicador de pasos */}
      <ol className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {t.steps.map((label, i) => (
          <li key={label} className="flex items-center gap-4">
            <span
              className={
                "text-[0.6rem] uppercase tracking-wide-luxe transition-colors " +
                (i === stepIndex
                  ? "text-gold"
                  : i < stepIndex
                    ? "text-gold-deep"
                    : "text-stone/60")
              }
            >
              {String(i + 1).padStart(2, "0")} {label}
            </span>
            {i < t.steps.length - 1 && (
              <span className="hidden h-px w-8 bg-white/10 sm:block"></span>
            )}
          </li>
        ))}
      </ol>

      <div className="gold-rule mt-6"></div>

      {/* PASO 1: SELECCION */}
      {step === "bag" && (
        <div className="mt-12">
          {items.length === 0 ? (
            <div className="border border-dashed border-white/10 px-8 py-20 text-center">
              <p className="text-sm text-stone">{t.empty}</p>
              <a
                href={`${prefix}/collections`}
                className="rounded-full bg-gold-gradient mt-8 inline-block px-8 py-3.5 text-[0.65rem] font-semibold uppercase tracking-luxe text-night transition-opacity hover:opacity-90"
              >
                {t.explore}
              </a>
            </div>
          ) : (
            <>
              <ul className="space-y-6">
                {items.map((item, index) => (
                  <li
                    key={`${item.slug}-${index}`}
                    className="flex flex-col gap-6 border border-white/10 bg-cacao/20 p-6 sm:flex-row"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-28 w-28 shrink-0 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.6rem] uppercase tracking-wide-luxe text-gold-deep">
                        {item.collection}
                      </p>
                      <p className="mt-1 font-display text-2xl text-mist">{item.name}</p>
                      <dl className="mt-3 space-y-1 text-xs text-stone">
                        <div>
                          <dt className="inline text-mist/50">{t.presentation}: </dt>
                          <dd className="inline">{item.personalization.wrap}</dd>
                        </div>
                        <div>
                          <dt className="inline text-mist/50">{t.finish}: </dt>
                          <dd className="inline">{item.personalization.ribbon}</dd>
                        </div>
                        {item.personalization.message && (
                          <div>
                            <dt className="inline text-mist/50">{t.engraved}: </dt>
                            <dd className="inline italic">
                              &ldquo;{item.personalization.message}&rdquo;
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                    <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <p className="text-sm text-mist">
                        {item.quantity} x ${item.price.toFixed(2)}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeFromCart(index)}
                        className="text-[0.6rem] uppercase tracking-wide-luxe text-stone transition-colors hover:text-wine"
                      >
                        {t.remove}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-col items-end gap-6">
                <p className="font-display text-3xl text-mist">
                  {t.total}:{" "}
                  <span className="text-gold-gradient">${total.toFixed(2)} USD</span>
                </p>
                <button
                  type="button"
                  onClick={() => setStep("delivery")}
                  className="rounded-full bg-gold-gradient px-10 py-4 text-[0.65rem] font-semibold uppercase tracking-luxe text-night transition-opacity hover:opacity-90"
                >
                  {t.continueDelivery}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* PASO 2: HOTEL DELIVERY */}
      {step === "delivery" && (
        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_20rem]">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (validateDelivery()) {
                setStep("payment");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            noValidate
          >
            <div>
              <p className="text-[0.65rem] uppercase tracking-luxe text-gold-deep">
                {t.deliverTitle}
              </p>
              <h2 className="mt-3 font-display text-3xl text-mist">{t.deliverHeading}</h2>
              <p className="mt-3 max-w-lg text-sm text-mist/60">{t.deliverIntro}</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="guestName" className="text-[0.6rem] uppercase tracking-wide-luxe text-stone">
                  {t.guestName}
                </label>
                <input
                  id="guestName"
                  type="text"
                  value={delivery.guestName}
                  onChange={(e) => updateDelivery("guestName", e.target.value)}
                  placeholder={t.guestPlaceholder}
                  className={fieldClass(deliveryErrors.has("guestName"))}
                />
              </div>
              <div>
                <label htmlFor="hotel" className="text-[0.6rem] uppercase tracking-wide-luxe text-stone">
                  {t.hotel}
                </label>
                <input
                  id="hotel"
                  type="text"
                  value={delivery.hotel}
                  onChange={(e) => updateDelivery("hotel", e.target.value)}
                  placeholder={t.hotelPlaceholder}
                  className={fieldClass(deliveryErrors.has("hotel"))}
                />
              </div>
              <div>
                <label htmlFor="city" className="text-[0.6rem] uppercase tracking-wide-luxe text-stone">
                  {t.city}
                </label>
                <select
                  id="city"
                  value={delivery.city}
                  onChange={(e) => updateDelivery("city", e.target.value)}
                  className={fieldClass(deliveryErrors.has("city")) + " bg-night"}
                >
                  {t.cities.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="phone" className="text-[0.6rem] uppercase tracking-wide-luxe text-stone">
                  {t.phone}
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={delivery.phone}
                  onChange={(e) => updateDelivery("phone", e.target.value)}
                  placeholder="+593 ..."
                  className={fieldClass(deliveryErrors.has("phone"))}
                />
              </div>
              <div>
                <label htmlFor="arrivalDate" className="text-[0.6rem] uppercase tracking-wide-luxe text-stone">
                  {t.arrival}
                </label>
                <input
                  id="arrivalDate"
                  type="date"
                  value={delivery.arrivalDate}
                  onChange={(e) => updateDelivery("arrivalDate", e.target.value)}
                  className={fieldClass(deliveryErrors.has("arrivalDate")) + " [color-scheme:dark]"}
                />
              </div>
              <div>
                <label htmlFor="departureDate" className="text-[0.6rem] uppercase tracking-wide-luxe text-stone">
                  {t.departure}
                </label>
                <input
                  id="departureDate"
                  type="date"
                  value={delivery.departureDate}
                  onChange={(e) => updateDelivery("departureDate", e.target.value)}
                  className={fieldClass(deliveryErrors.has("departureDate")) + " [color-scheme:dark]"}
                />
                {deliveryErrors.has("departureDate") && delivery.departureDate !== "" && (
                  <p className="mt-2 text-xs text-wine">{t.departureError}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="instructions" className="text-[0.6rem] uppercase tracking-wide-luxe text-stone">
                {t.instructions}
              </label>
              <textarea
                id="instructions"
                rows={4}
                value={delivery.instructions}
                onChange={(e) => updateDelivery("instructions", e.target.value)}
                placeholder={t.instructionsPlaceholder}
                className={fieldClass(false) + " resize-none"}
              />
            </div>

            {deliveryErrors.size > 0 && <p className="text-sm text-wine">{t.missingFields}</p>}

            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => setStep("bag")}
                className="rounded-full border border-stone/40 px-8 py-4 text-[0.65rem] uppercase tracking-luxe text-mist transition-colors hover:border-gold-deep hover:text-gold"
              >
                {t.backToBag}
              </button>
              <button
                type="submit"
                className="rounded-full bg-gold-gradient flex-1 px-8 py-4 text-[0.65rem] font-semibold uppercase tracking-luxe text-night transition-opacity hover:opacity-90"
              >
                {t.continuePayment}
              </button>
            </div>
          </form>

          <aside className="h-fit border border-white/10 bg-cacao/20 p-6">
            <p className="text-[0.6rem] uppercase tracking-wide-luxe text-gold-deep">{t.summary}</p>
            <ul className="mt-4 space-y-3 text-sm text-mist/80">
              {items.map((item, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span className="truncate">{item.name}</span>
                  <span className="shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="gold-rule my-4"></div>
            <p className="flex justify-between text-sm text-mist">
              <span>{t.total}</span>
              <span className="font-semibold text-gold">${total.toFixed(2)} USD</span>
            </p>
            <p className="mt-4 text-xs leading-relaxed text-stone">{t.freeDelivery}</p>
          </aside>
        </div>
      )}

      {/* PASO 3: PAGO */}
      {step === "payment" && (
        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_20rem]">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              confirmOrder();
            }}
          >
            <div>
              <p className="text-[0.65rem] uppercase tracking-luxe text-gold-deep">
                {t.securePayment}
              </p>
              <h2 className="mt-3 font-display text-3xl text-mist">{t.paymentHeading}</h2>
              <p className="mt-3 max-w-lg text-sm text-mist/60">{t.paymentIntro}</p>
            </div>

            <div>
              <label htmlFor="cardName" className="text-[0.6rem] uppercase tracking-wide-luxe text-stone">
                {t.cardName}
              </label>
              <input
                id="cardName"
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder={t.cardNamePlaceholder}
                className={fieldClass(false)}
              />
            </div>
            <div>
              <label htmlFor="cardNumber" className="text-[0.6rem] uppercase tracking-wide-luxe text-stone">
                {t.cardNumber}
              </label>
              <input
                id="cardNumber"
                type="text"
                inputMode="numeric"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4111 1111 1111 1111"
                className={fieldClass(false)}
              />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => setStep("delivery")}
                className="rounded-full border border-stone/40 px-8 py-4 text-[0.65rem] uppercase tracking-luxe text-mist transition-colors hover:border-gold-deep hover:text-gold"
              >
                {t.backToDelivery}
              </button>
              <button
                type="submit"
                disabled={!cardName.trim() || cardNumber.replace(/\s/g, "").length < 12}
                className="rounded-full bg-gold-gradient flex-1 px-8 py-4 text-[0.65rem] font-semibold uppercase tracking-luxe text-night transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t.confirmOrder}
              </button>
            </div>
          </form>

          <aside className="h-fit border border-white/10 bg-cacao/20 p-6">
            <p className="text-[0.6rem] uppercase tracking-wide-luxe text-gold-deep">
              {t.coordinated}
            </p>
            <dl className="mt-4 space-y-2 text-sm text-mist/80">
              <div className="flex justify-between gap-4">
                <dt className="text-stone">{t.guest}</dt>
                <dd className="text-right">{delivery.guestName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-stone">{t.hotel}</dt>
                <dd className="text-right">{delivery.hotel}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-stone">{t.city}</dt>
                <dd className="text-right">{delivery.city}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-stone">{t.stay}</dt>
                <dd className="text-right">
                  {delivery.arrivalDate} {t.to} {delivery.departureDate}
                </dd>
              </div>
            </dl>
            <div className="gold-rule my-4"></div>
            <p className="flex justify-between text-sm text-mist">
              <span>{t.total}</span>
              <span className="font-semibold text-gold">${total.toFixed(2)} USD</span>
            </p>
          </aside>
        </div>
      )}

      {/* PASO 4: CONFIRMACION */}
      {step === "confirmation" && (
        <div className="mt-16 text-center">
          <p className="text-[0.65rem] uppercase tracking-luxe text-gold-deep">
            {t.confirmedTitle}
          </p>
          <h2 className="mt-6 font-display text-4xl font-medium md:text-5xl">
            <span className="text-gold-gradient">
              {t.reference} {orderRef}
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-mist/70">
            {t.confirmationText(delivery)}
          </p>

          <div className="mx-auto mt-12 max-w-md border border-white/10 bg-cacao/20 p-6 text-left">
            <p className="text-[0.6rem] uppercase tracking-wide-luxe text-gold-deep">
              {t.yourSelection}
            </p>
            <ul className="mt-4 space-y-3 text-sm text-mist/80">
              {confirmedItems.map((item, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span>
                    {item.quantity} x {item.name}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="gold-rule my-4"></div>
            <p className="flex justify-between text-sm text-mist">
              <span>{t.total}</span>
              <span className="font-semibold text-gold">${confirmedTotal.toFixed(2)} USD</span>
            </p>
          </div>

          <a
            href={`${prefix}/`}
            className="mt-12 inline-block rounded-full border border-stone/40 px-10 py-4 text-[0.65rem] uppercase tracking-luxe text-mist transition-colors hover:border-gold-deep hover:text-gold"
          >
            {t.backToGallery}
          </a>
        </div>
      )}
    </div>
  );
}
