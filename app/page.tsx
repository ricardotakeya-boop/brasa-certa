"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Cell, SheetData } from "write-excel-file/universal";
import { calculateFamilyRate } from "./family-rate";
import type { FamilyRateGuest as Guest } from "./family-rate";

type Meat = {
  id: string;
  name: string;
  note: string;
  price: number;
  share: number;
  color: string;
  source: string;
};

type Accompaniment = {
  id: string;
  name: string;
  category: "Tradicionais" | "Saladas e legumes" | "Bebidas" | "Apoio";
  icon: string;
  note: string;
  unit: string;
  price: number;
  quantity: (guests: number, allDay: boolean, meatKg: number) => number;
};

type ItemEdit = { qty?: number; price?: number };
type AccompanimentContribution = { provided: boolean; responsible: string };
type StoredCustomAccompaniment = Omit<Accompaniment, "quantity"> & { baseQty: number };
type SavedBarbecue = {
  dataVersion?: number;
  id: string;
  name: string;
  eventDate: string;
  notes: string;
  eventLocation?: string;
  eventContact?: string;
  createdAt: string;
  updatedAt: string;
  adults: number;
  children: number;
  period: "almoco" | "jantar" | "inteiro";
  reserve: boolean;
  chargeChildren?: boolean;
  familyOwnDrinks?: boolean;
  selected: string[];
  selectedAccompaniments: string[];
  customMeats: Meat[];
  customAccompaniments: StoredCustomAccompaniment[];
  meatEdits: Record<string, ItemEdit>;
  accompanimentEdits: Record<string, ItemEdit>;
  accompanimentContributions?: Record<string, AccompanimentContribution>;
  guests?: Guest[];
  summary: { guests: number; grandTotal: number; perPerson: number; perAdult?: number; perChild?: number };
};
type MeatCategory = "Bovinos" | "Suínos" | "Frangos";

const STORAGE_KEY = "brasa-certa:churrascos:v1";
const CURRENT_DATA_VERSION = 4;

const meats: Meat[] = [
  { id: "picanha-legado", name: "Picanha", note: "Legado 1855", price: 89.9, share: 1.15, color: "#8e261c", source: "https://www.swift.com.br/legado" },
  { id: "medalhao-legado", name: "Medalhão de picanha", note: "Legado 1855", price: 59.9, share: 1.08, color: "#ad3827", source: "https://www.swift.com.br/swift-legado" },
  { id: "chorizo-legado", name: "Bife de chorizo", note: "Legado 1855", price: 65.9, share: 1.05, color: "#bf4931", source: "https://www.swift.com.br/swift-legado" },
  { id: "ancho-legado", name: "Bife ancho", note: "Legado 1855", price: 59.9, share: 1.05, color: "#d45b36", source: "https://www.swift.com.br/swift-legado" },
  { id: "fraldinha-legado", name: "Fraldinha", note: "Legado 1855", price: 69.9, share: 1.08, color: "#c35431", source: "https://www.swift.com.br/fraldinha-swift-legado-1855-kg/p" },
  { id: "maminha-legado", name: "Maminha", note: "Legado 1855", price: 65.9, share: 1, color: "#e17d3f", source: "https://www.swift.com.br/legado" },
  { id: "bombom-legado", name: "Bombom de alcatra", note: "Legado 1855", price: 69.9, share: 1, color: "#cc673c", source: "https://www.swift.com.br/swift-legado" },
  { id: "assado-legado", name: "Assado de tiras", note: "Legado 1855", price: 57.9, share: 1.08, color: "#9f422c", source: "https://www.swift.com.br/legado" },
  { id: "cupim-legado", name: "Cupim", note: "Legado 1855", price: 59.9, share: 1.05, color: "#b45a38", source: "https://www.swift.com.br/legado" },
  { id: "entrana-legado", name: "Entraña", note: "Legado 1855", price: 59.9, share: 1, color: "#7f3024", source: "https://www.swift.com.br/legado" },
  { id: "picanha-gran", name: "Picanha", note: "Gran Reserva", price: 195.9, share: 1.15, color: "#702118", source: "https://loja.swift.com.br/cortes-especiais/gran%20reserva" },
  { id: "ancho-gran", name: "Bife ancho", note: "Gran Reserva", price: 139.9, share: 1.05, color: "#952f20", source: "https://www.swift.com.br/festival-gran-reserva" },
  { id: "fraldinha-gran", name: "Fraldinha Red", note: "Gran Reserva", price: 149.9, share: 1.08, color: "#b13b29", source: "https://loja.swift.com.br/cortes-especiais/gran%20reserva" },
  { id: "maminha-gran", name: "Maminha", note: "Gran Reserva", price: 75.9, share: 1, color: "#c55b36", source: "https://loja.swift.com.br/cortes-especiais/gran%20reserva" },
  { id: "assado-gran", name: "Assado de tiras", note: "Gran Reserva", price: 75.9, share: 1.08, color: "#93442e", source: "https://www.swift.com.br/festival-gran-reserva" },
  { id: "short-rib-gran", name: "Short rib", note: "Gran Reserva", price: 89.9, share: 1.08, color: "#803629", source: "https://loja.swift.com.br/cortes-especiais/gran-reserva/carnes" },
  { id: "tomahawk-gran", name: "Tomahawk", note: "Gran Reserva", price: 154.9, share: 1.12, color: "#5e251e", source: "https://loja.swift.com.br/cortes-especiais/gran-reserva/carnes" },
  { id: "costela-bafo-gran", name: "Costela bafo", note: "Gran Reserva", price: 36.9, share: 1.25, color: "#6f3529", source: "https://loja.swift.com.br/cortes-especiais/gran%20reserva" },
  { id: "costelinha-suina", name: "Costelinha suína", note: "Swift Premium", price: 38.9, share: 1.15, color: "#bd6656", source: "https://www.swift.com.br/detail/costelinha-suina-premium-swift-kg" },
  { id: "picanha-suina", name: "Picanha suína", note: "Swift Grill", price: 29.9, share: .95, color: "#ce7968", source: "https://www.swift.com.br/detail/picanha-suina-grill-swift-kg" },
  { id: "ancho-suino", name: "Ancho suíno", note: "Swift Grill chimichurri", price: 29.9, share: .95, color: "#ba624d", source: "https://loja.swift.com.br/churrasco/swift/su%C3%ADnos" },
  { id: "lombo-suino", name: "Lombo suíno", note: "Swift Linha Mais", price: 24.9, share: .9, color: "#d07b64", source: "https://www.swift.com.br/detail/lombo-suino-swift-mais-kg" },
  { id: "costela-alecrim", name: "Costela suína com alecrim", note: "Swift Grill", price: 35.9, share: 1.12, color: "#a85243", source: "https://loja.swift.com.br/churrasco/swift/su%C3%ADnos" },
  { id: "espetinho-suino", name: "Espetinho suíno", note: "Swift 900 g", price: 31, share: .88, color: "#c8745e", source: "https://loja.swift.com.br/churrasco/swift/su%C3%ADnos" },
  { id: "linguica", name: "Linguiça toscana", note: "Swift 700 g", price: 27, share: .88, color: "#d79550", source: "https://www.swift.com.br/churrasco-swift" },
  { id: "coracao", name: "Coração de frango", note: "Swift 1 kg", price: 32.9, share: .76, color: "#6c3029", source: "https://www.swift.com.br/coracao%20de%20frango%20pre%C3%A7o" },
  { id: "panceta", name: "Panceta em espetinho", note: "Swift 500 g", price: 39.8, share: .82, color: "#d8896d", source: "https://www.swift.com.br/costelinha%20su%C3%ADna" },
  { id: "file-coxa", name: "Filé de coxa e sobrecoxa", note: "Swift temperado 1 kg", price: 22.9, share: .9, color: "#d8a05f", source: "https://www.swift.com.br/asa" },
  { id: "tulipa", name: "Meio da asa (tulipa)", note: "Swift 1 kg", price: 24.9, share: .86, color: "#c98b4e", source: "https://www.swift.com.br/asa" },
  { id: "coxinha-asa", name: "Coxinha da asa", note: "Swift temperada 1 kg", price: 16.9, share: .88, color: "#e0a969", source: "https://www.swift.com.br/asa" },
  { id: "asa-frango", name: "Asa de frango", note: "Swift 1 kg", price: 16.5, share: .88, color: "#b9834c", source: "https://www.swift.com.br/asa" },
];

const meatGroups = [
  { label: "Bovinos" as MeatCategory, icon: "●" },
  { label: "Suínos" as MeatCategory, icon: "◆" },
  { label: "Frangos" as MeatCategory, icon: "▲" },
];

const porkIds = ["costelinha-suina", "picanha-suina", "ancho-suino", "lombo-suino", "costela-alecrim", "espetinho-suino", "linguica", "panceta"];
const chickenIds = ["coracao", "file-coxa", "tulipa", "coxinha-asa", "asa-frango"];
const meatCategory = (id: string): MeatCategory =>
  id.startsWith("custom-suinos") || porkIds.includes(id) ? "Suínos"
    : id.startsWith("custom-frangos") || chickenIds.includes(id) ? "Frangos"
      : "Bovinos";

const accompaniments: Accompaniment[] = [
  { id: "pao-alho", name: "Pão de alho", category: "Tradicionais", icon: "🥖", note: "1 pacote = 6 pães de alho", unit: "pacote", price: 11.88, quantity: (g) => Math.ceil((g * 1.5) / 6) },
  { id: "arroz", name: "Arroz", category: "Tradicionais", icon: "🍚", note: "60 g por pessoa", unit: "kg", price: 8.5, quantity: (g) => g * .06 },
  { id: "farofa", name: "Farofa", category: "Tradicionais", icon: "🥣", note: "40 g por pessoa", unit: "kg", price: 21.9, quantity: (g) => g * .04 },
  { id: "queijo", name: "Queijo coalho", category: "Tradicionais", icon: "🧀", note: "1 pacote = 7 espetos · 2 por pessoa", unit: "pacote", price: 29.9, quantity: (g) => Math.ceil((g * 2) / 7) },
  { id: "vinagrete", name: "Vinagrete", category: "Saladas e legumes", icon: "🍅", note: "80 g por pessoa", unit: "kg", price: 13.9, quantity: (g) => g * .08 },
  { id: "legumes", name: "Legumes na brasa", category: "Saladas e legumes", icon: "🥕", note: "Abobrinha, cebola e pimentão", unit: "kg", price: 14.9, quantity: (g) => g * .1 },
  { id: "maionese", name: "Salada de maionese", category: "Saladas e legumes", icon: "🥔", note: "100 g por pessoa", unit: "kg", price: 24.9, quantity: (g) => g * .1 },
  { id: "salada", name: "Salada verde", category: "Saladas e legumes", icon: "🥬", note: "50 g por pessoa", unit: "kg", price: 19.9, quantity: (g) => g * .05 },
  { id: "agua-refri", name: "Água e refrigerante", category: "Bebidas", icon: "🥤", note: "1,2 L por pessoa", unit: "L", price: 7.5, quantity: (g, day) => g * (day ? 1.8 : 1.2) },
  { id: "cerveja", name: "Cerveja", category: "Bebidas", icon: "🍺", note: "Ajuste conforme o perfil da turma", unit: "L", price: 14.5, quantity: (g, day) => g * (day ? 2 : 1.2) },
  { id: "carvao", name: "Carvão", category: "Apoio", icon: "🔥", note: "Pacotes de 4 kg", unit: "pct.", price: 34.9, quantity: (g) => Math.max(1, Math.ceil(g / 10)) },
  { id: "gelo", name: "Gelo", category: "Apoio", icon: "🧊", note: "Consumo e conservação", unit: "kg", price: 4.5, quantity: (g) => Math.ceil(g / 5) * 5 },
  { id: "sal", name: "Sal grosso", category: "Apoio", icon: "🧂", note: "Pacotes de 1 kg", unit: "pct.", price: 7.9, quantity: (_g, _day, kg) => Math.max(1, Math.ceil(kg / 8)) },
];

const periods = {
  almoco: { label: "Só almoço", sub: "3–4 horas", adult: .4, child: .22 },
  jantar: { label: "Só jantar", sub: "3–4 horas", adult: .38, child: .21 },
  inteiro: { label: "Dia inteiro", sub: "6–8 horas", adult: .65, child: .35 },
};

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const number = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const formatQty = (qty: number, unit: string) => {
  if (unit === "pacote") {
    const packages = Math.ceil(qty);
    return `${packages} ${packages === 1 ? "pacote" : "pacotes"}`;
  }
  return `${unit === "un." || unit === "pct." ? Math.ceil(qty) : number.format(qty)} ${unit}`;
};

function migrateSavedBarbecue(record: SavedBarbecue): SavedBarbecue {
  if ((record.dataVersion ?? 1) >= CURRENT_DATA_VERSION) return record;
  const previousVersion = record.dataVersion ?? 1;
  const breadEdits = previousVersion < 2 ? record.accompanimentEdits?.["pao-alho"] : undefined;
  const cheeseEdits = previousVersion < 3 ? record.accompanimentEdits?.["queijo"] : undefined;
  return {
    ...record,
    dataVersion: CURRENT_DATA_VERSION,
    accompanimentEdits: {
      ...(record.accompanimentEdits ?? {}),
      ...(breadEdits
        ? {
            "pao-alho": {
              ...breadEdits,
              qty: breadEdits.qty === undefined ? undefined : Math.ceil(breadEdits.qty / 6),
              price: breadEdits.price === undefined ? undefined : breadEdits.price * 6,
            },
          }
        : {}),
      ...(cheeseEdits
        ? {
            queijo: {
              ...cheeseEdits,
              qty: cheeseEdits.qty === undefined ? undefined : Math.ceil(cheeseEdits.qty / .385),
              price: cheeseEdits.price === undefined ? undefined : cheeseEdits.price * .385,
            },
          }
        : {}),
    },
  };
}

export default function Home() {
  const [adults, setAdults] = useState(12);
  const [children, setChildren] = useState(4);
  const [period, setPeriod] = useState<keyof typeof periods>("almoco");
  const [selected, setSelected] = useState<string[]>([]);
  const [meatMenuOpen, setMeatMenuOpen] = useState(false);
  const [meatSearch, setMeatSearch] = useState("");
  const [selectedAccompaniments, setSelectedAccompaniments] = useState<string[]>([]);
  const [accompanimentMenuOpen, setAccompanimentMenuOpen] = useState(false);
  const [customMeats, setCustomMeats] = useState<Meat[]>([]);
  const [customAccompaniments, setCustomAccompaniments] = useState<Accompaniment[]>([]);
  const [meatEdits, setMeatEdits] = useState<Record<string, ItemEdit>>({});
  const [accompanimentEdits, setAccompanimentEdits] = useState<Record<string, ItemEdit>>({});
  const [accompanimentContributions, setAccompanimentContributions] = useState<Record<string, AccompanimentContribution>>({});
  const [newMeat, setNewMeat] = useState({ name: "", category: "Bovinos" as MeatCategory, qty: "", price: "" });
  const [newAccompaniment, setNewAccompaniment] = useState({ name: "", category: "Tradicionais" as Accompaniment["category"], unit: "kg", qty: "", price: "" });
  const [reserve, setReserve] = useState(true);
  const [chargeChildren, setChargeChildren] = useState(true);
  const [familyOwnDrinks, setFamilyOwnDrinks] = useState(false);
  const [printMode, setPrintMode] = useState<"pre" | "post" | "gate">("post");
  const [mobileReportOpen, setMobileReportOpen] = useState(false);
  const [mobileReportMode, setMobileReportMode] = useState<"pre" | "post">("pre");
  const [shareStatus, setShareStatus] = useState("");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestListOpen, setGuestListOpen] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: "", family: "", type: "adult" as Guest["type"], invitedBy: "", vehiclePlate: "", accessNote: "" });
  const [eventName, setEventName] = useState("Churrasco em família");
  const [eventDate, setEventDate] = useState("");
  const [eventNotes, setEventNotes] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventContact, setEventContact] = useState("");
  const [savedBarbecues, setSavedBarbecues] = useState<SavedBarbecue[]>([]);
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null);
  const [storageStatus, setStorageStatus] = useState("");
  const [newPlanPromptOpen, setNewPlanPromptOpen] = useState(false);
  const backupInputRef = useRef<HTMLInputElement>(null);
  const allMeats = useMemo(() => [...meats, ...customMeats], [customMeats]);
  const allAccompaniments = useMemo(() => [...accompaniments, ...customAccompaniments], [customAccompaniments]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) setSavedBarbecues((JSON.parse(stored) as SavedBarbecue[]).map(migrateSavedBarbecue));
      } catch {
        setStorageStatus("Não foi possível ler os churrascos salvos neste aparelho.");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const result = useMemo(() => {
    const p = periods[period];
    const base = adults * p.adult + children * p.child;
    const total = base * (reserve ? 1.1 : 1);
    const chosen = allMeats.filter((m) => selected.includes(m.id));
    const automaticShares = chosen
      .filter((m) => !m.id.startsWith("custom-"))
      .reduce((sum, m) => sum + m.share, 0);
    const rows = chosen.map((m) => {
      const isCustom = m.id.startsWith("custom-");
      const suggestedKg = !isCustom && automaticShares ? total * (m.share / automaticShares) : 0;
      const kg = meatEdits[m.id]?.qty ?? suggestedKg;
      const price = meatEdits[m.id]?.price ?? m.price;
      return { ...m, kg, price, cost: kg * price };
    });
    const cost = rows.reduce((sum, row) => sum + row.cost, 0);
    const guestCount = adults + children;
    const extras = allAccompaniments
      .filter((item) => selectedAccompaniments.includes(item.id))
      .map((item) => {
        const suggestedQty = item.quantity(guestCount, period === "inteiro", total);
        const qty = accompanimentEdits[item.id]?.qty ?? suggestedQty;
        const price = accompanimentEdits[item.id]?.price ?? item.price;
        const contribution = accompanimentContributions[item.id] ?? { provided: false, responsible: "" };
        return {
          ...item,
          qty,
          price,
          provided: contribution.provided,
          responsible: contribution.responsible.trim(),
          cost: contribution.provided ? 0 : qty * price,
        };
      });
    const extrasCost = extras.reduce((sum, item) => sum + item.cost, 0);
    const grandTotal = cost + extrasCost;
    const actualMeatKg = rows.reduce((sum, row) => sum + row.kg, 0);
    const rateUnits = adults + (chargeChildren ? children * .5 : 0);
    const perAdult = rateUnits ? grandTotal / rateUnits : 0;
    const perChild = chargeChildren ? perAdult * .5 : 0;
    const familyRate = calculateFamilyRate({ guests, adults, children, perAdult, perChild });
    return {
      total: actualMeatKg,
      suggestedTotal: total,
      rows,
      cost,
      guests: guestCount,
      extras,
      extrasCost,
      grandTotal,
      rateUnits,
      perAdult,
      perChild,
      perPerson: perAdult,
      ...familyRate,
    };
  }, [adults, children, period, reserve, chargeChildren, selected, selectedAccompaniments, allMeats, allAccompaniments, meatEdits, accompanimentEdits, accompanimentContributions, guests]);

  function toggleMeat(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleAccompaniment(id: string) {
    setSelectedAccompaniments((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function updateMeat(id: string, field: keyof ItemEdit, value: number) {
    setMeatEdits((current) => ({ ...current, [id]: { ...current[id], [field]: Math.max(0, value || 0) } }));
  }

  function updateAccompaniment(id: string, field: keyof ItemEdit, value: number) {
    setAccompanimentEdits((current) => ({ ...current, [id]: { ...current[id], [field]: Math.max(0, value || 0) } }));
  }

  function updateContribution(id: string, changes: Partial<AccompanimentContribution>) {
    setAccompanimentContributions((current) => {
      const existing = current[id] ?? { provided: false, responsible: "" };
      return { ...current, [id]: { ...existing, ...changes } };
    });
  }

  function addGuest() {
    const name = newGuest.name.trim();
    const family = newGuest.family.trim();
    if (!name || !family) return;
    const guest: Guest = {
      id: `guest-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      family,
      type: newGuest.type,
      invitedBy: newGuest.invitedBy.trim(),
      vehiclePlate: newGuest.vehiclePlate.trim().toUpperCase(),
      accessNote: newGuest.accessNote.trim(),
    };
    setGuests((current) => [...current, guest]);
    if (guest.type === "adult" && result.namedAdults >= adults) setAdults((current) => Math.min(500, current + 1));
    if (guest.type === "child" && result.namedChildren >= children) setChildren((current) => Math.min(500, current + 1));
    setNewGuest((current) => ({ ...current, name: "", vehiclePlate: "", accessNote: "" }));
  }

  function updateGuest(id: string, changes: Partial<Guest>) {
    const next = guests.map((guest) => guest.id === id ? { ...guest, ...changes } : guest);
    setGuests(next);
    const namedAdults = next.filter((guest) => guest.type === "adult").length;
    const namedChildren = next.filter((guest) => guest.type === "child").length;
    setAdults((current) => Math.max(current, namedAdults));
    setChildren((current) => Math.max(current, namedChildren));
  }

  function removeGuest(id: string) {
    setGuests((current) => current.filter((guest) => guest.id !== id));
  }

  function addCustomMeat() {
    const name = newMeat.name.trim();
    const qty = Number(newMeat.qty);
    const price = Number(newMeat.price);
    if (!name || qty <= 0) return;
    const id = `custom-${newMeat.category === "Suínos" ? "suinos" : newMeat.category === "Frangos" ? "frangos" : "bovinos"}-${Date.now()}`;
    const item: Meat = { id, name, note: "Item personalizado", price: Math.max(0, price), share: 1, color: "#8f5745", source: "" };
    setCustomMeats((current) => [...current, item]);
    setSelected((current) => [...current, id]);
    setMeatEdits((current) => ({ ...current, [id]: { qty, price: Math.max(0, price) } }));
    setNewMeat({ name: "", category: newMeat.category, qty: "", price: "" });
  }

  function addCustomAccompaniment() {
    const name = newAccompaniment.name.trim();
    const qty = Number(newAccompaniment.qty);
    const price = Number(newAccompaniment.price);
    if (!name || qty <= 0) return;
    const id = `custom-accompaniment-${Date.now()}`;
    const item: Accompaniment = {
      id, name, category: newAccompaniment.category, icon: "＋", note: "Item personalizado",
      unit: newAccompaniment.unit, price: Math.max(0, price), quantity: () => qty,
    };
    setCustomAccompaniments((current) => [...current, item]);
    setSelectedAccompaniments((current) => [...current, id]);
    setAccompanimentEdits((current) => ({ ...current, [id]: { qty, price: Math.max(0, price) } }));
    setNewAccompaniment({ name: "", category: newAccompaniment.category, unit: newAccompaniment.unit, qty: "", price: "" });
  }

  function persistBarbecues(items: SavedBarbecue[]) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      setSavedBarbecues(items);
      return true;
    } catch {
      setStorageStatus("O navegador não permitiu gravar. Verifique o espaço disponível e as permissões.");
      return false;
    }
  }

  function createSavedRecord(id: string, createdAt: string): SavedBarbecue {
    const storedCustomAccompaniments = customAccompaniments.map((item) => {
      const { quantity, ...plainItem } = item;
      const baseQty = accompanimentEdits[item.id]?.qty ?? quantity(result.guests, period === "inteiro", result.total);
      return { ...plainItem, baseQty };
    });
    const fallbackName = eventDate
      ? `Churrasco de ${new Date(`${eventDate}T12:00:00`).toLocaleDateString("pt-BR")}`
      : "Meu churrasco";
    return {
      dataVersion: CURRENT_DATA_VERSION,
      id,
      name: eventName.trim() || fallbackName,
      eventDate,
      notes: eventNotes.trim(),
      eventLocation: eventLocation.trim(),
      eventContact: eventContact.trim(),
      createdAt,
      updatedAt: new Date().toISOString(),
      adults,
      children,
      period,
      reserve,
      chargeChildren,
      familyOwnDrinks,
      selected: [...selected],
      selectedAccompaniments: [...selectedAccompaniments],
      customMeats,
      customAccompaniments: storedCustomAccompaniments,
      meatEdits,
      accompanimentEdits,
      accompanimentContributions,
      guests,
      summary: {
        guests: result.guests,
        grandTotal: result.grandTotal,
        perPerson: result.perAdult,
        perAdult: result.perAdult,
        perChild: result.perChild,
      },
    };
  }

  function saveBarbecue() {
    const now = new Date().toISOString();
    const id = activeSavedId ?? `churrasco-${Date.now()}`;
    const existing = savedBarbecues.find((item) => item.id === id);
    const record = createSavedRecord(id, existing?.createdAt ?? now);
    const next = existing
      ? savedBarbecues.map((item) => item.id === id ? record : item)
      : [record, ...savedBarbecues];
    if (persistBarbecues(next)) {
      setActiveSavedId(id);
      setEventName(record.name);
      setStorageStatus(existing ? "Alterações salvas neste aparelho." : "Churrasco salvo neste aparelho.");
      return true;
    }
    return false;
  }

  function resetPlan() {
    setAdults(0);
    setChildren(0);
    setPeriod("almoco");
    setSelected([]);
    setSelectedAccompaniments([]);
    setCustomMeats([]);
    setCustomAccompaniments([]);
    setMeatEdits({});
    setAccompanimentEdits({});
    setAccompanimentContributions({});
    setNewMeat({ name: "", category: "Bovinos", qty: "", price: "" });
    setNewAccompaniment({ name: "", category: "Tradicionais", unit: "kg", qty: "", price: "" });
    setReserve(true);
    setChargeChildren(true);
    setFamilyOwnDrinks(false);
    setGuests([]);
    setGuestListOpen(false);
    setNewGuest({ name: "", family: "", type: "adult", invitedBy: "", vehiclePlate: "", accessNote: "" });
    setEventName("");
    setEventDate("");
    setEventNotes("");
    setEventLocation("");
    setEventContact("");
    setActiveSavedId(null);
    setMeatMenuOpen(false);
    setAccompanimentMenuOpen(false);
    setMeatSearch("");
    setNewPlanPromptOpen(false);
    setStorageStatus("Novo planejamento iniciado.");
    document.getElementById("calculadora")?.scrollIntoView({ behavior: "smooth" });
  }

  function saveAndResetPlan() {
    if (saveBarbecue()) resetPlan();
  }

  function openBarbecue(record: SavedBarbecue) {
    record = migrateSavedBarbecue(record);
    setEventName(record.name);
    setEventDate(record.eventDate);
    setEventNotes(record.notes);
    setEventLocation(record.eventLocation ?? "");
    setEventContact(record.eventContact ?? "");
    setAdults(record.adults);
    setChildren(record.children);
    setPeriod(record.period);
    setReserve(record.reserve);
    setChargeChildren(record.chargeChildren ?? true);
    setFamilyOwnDrinks(record.familyOwnDrinks ?? false);
    setGuests(record.guests ?? []);
    setGuestListOpen(Boolean(record.guests?.length));
    setSelected(record.selected);
    setSelectedAccompaniments(record.selectedAccompaniments);
    setCustomMeats(record.customMeats);
    setCustomAccompaniments(record.customAccompaniments.map(({ baseQty, ...item }) => ({
      ...item,
      quantity: () => baseQty,
    })));
    setMeatEdits(record.meatEdits);
    setAccompanimentEdits(record.accompanimentEdits);
    setAccompanimentContributions(record.accompanimentContributions ?? {});
    setActiveSavedId(record.id);
    setMeatMenuOpen(false);
    setAccompanimentMenuOpen(false);
    setStorageStatus(`"${record.name}" aberto para consulta e edição.`);
    document.getElementById("calculadora")?.scrollIntoView({ behavior: "smooth" });
  }

  function duplicateBarbecue(record: SavedBarbecue) {
    const now = new Date().toISOString();
    const copy: SavedBarbecue = {
      ...record,
      id: `churrasco-${Date.now()}`,
      name: `${record.name} — cópia`,
      createdAt: now,
      updatedAt: now,
    };
    if (persistBarbecues([copy, ...savedBarbecues])) {
      setStorageStatus("Uma cópia foi criada. Abra-a para fazer alterações.");
    }
  }

  function deleteBarbecue(record: SavedBarbecue) {
    if (!window.confirm(`Excluir "${record.name}" deste aparelho?`)) return;
    const next = savedBarbecues.filter((item) => item.id !== record.id);
    if (persistBarbecues(next)) {
      if (activeSavedId === record.id) setActiveSavedId(null);
      setStorageStatus("Churrasco excluído deste aparelho.");
    }
  }

  function exportBackup() {
    const backup = {
      app: "Brasa Certa",
      version: 1,
      exportedAt: new Date().toISOString(),
      churrascos: savedBarbecues,
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `brasa-certa-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStorageStatus("Backup baixado. Guarde o arquivo em um local seguro.");
  }

  async function importBackup(file?: File) {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (data?.app !== "Brasa Certa" || !Array.isArray(data.churrascos)) throw new Error("invalid");
      const imported = (data.churrascos as SavedBarbecue[]).map(migrateSavedBarbecue);
      if (imported.some((item) => !item.id || !item.name || !item.summary)) throw new Error("invalid");
      const merged = new Map(savedBarbecues.map((item) => [item.id, item]));
      imported.forEach((item) => merged.set(item.id, item));
      const next = [...merged.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      if (persistBarbecues(next)) setStorageStatus(`${imported.length} churrasco(s) importado(s) com sucesso.`);
    } catch {
      setStorageStatus("Esse arquivo não é um backup válido do Brasa Certa.");
    } finally {
      if (backupInputRef.current) backupInputRef.current.value = "";
    }
  }

  async function exportExcel() {
    const title = (value: string): Cell => ({
      value,
      columnSpan: 8,
      fontWeight: "bold",
      fontSize: 16,
      textColor: "#FFFFFF",
      backgroundColor: "#B53B28",
      height: 30,
      align: "center",
      alignVertical: "center",
    });
    const section = (value: string): Cell => ({
      value,
      columnSpan: 8,
      fontWeight: "bold",
      textColor: "#FFFFFF",
      backgroundColor: "#17201C",
      height: 22,
      alignVertical: "center",
    });
    const header = (value: string): Cell => ({
      value,
      fontWeight: "bold",
      backgroundColor: "#F1EDE5",
      borderColor: "#D3C9BC",
    });
    const quantity = (value: number): Cell => ({ value, type: Number, format: "0.00", align: "right" });
    const currency = (value: number): Cell => ({ value, type: Number, format: '"R$" #,##0.00', align: "right" });
    const summary = (label: string, value: number): Cell[] => [
      { value: label, columnSpan: 7, fontWeight: "bold", backgroundColor: "#F4F0E7" },
      null, null, null, null, null, null,
      { ...currency(value) as object, fontWeight: "bold", backgroundColor: "#F4F0E7" } as Cell,
    ];

    const rows: SheetData = [
      [title("BRASA CERTA — PLANO DE CHURRASCO"), null, null, null, null, null, null, null],
      [{ value: "Nome", fontWeight: "bold" }, eventName.trim() || "Meu churrasco", null, null, null, null, null, null],
      [{ value: "Data", fontWeight: "bold" }, eventDate ? new Date(`${eventDate}T12:00:00`).toLocaleDateString("pt-BR") : "A definir", null, null, null, null, null, null],
      [{ value: "Convidados", fontWeight: "bold" }, result.guests, null, null, null, null, null, null],
      [{ value: "Período", fontWeight: "bold" }, periods[period].label, null, null, null, null, null, null],
      [{ value: "Margem de segurança", fontWeight: "bold" }, reserve ? "10%" : "Sem margem", null, null, null, null, null, null],
      [{ value: "Rateio infantil", fontWeight: "bold" }, chargeChildren ? "Meia cota por criança" : "Crianças não cobradas", null, null, null, null, null, null],
      [],
      [section("PROTEÍNAS"), null, null, null, null, null, null, null],
      [header("Item"), header("Categoria"), header("Quantidade"), header("Unidade"), header("Valor por kg"), header("Responsável"), header("Forma"), header("Subtotal")],
      ...result.rows.map((item): Cell[] => [
        item.name,
        meatCategory(item.id),
        quantity(item.kg),
        "kg",
        currency(item.price),
        "—",
        "Compra",
        currency(item.cost),
      ]),
      [],
      [section("ACOMPANHAMENTOS"), null, null, null, null, null, null, null],
      [header("Item"), header("Categoria"), header("Quantidade"), header("Unidade"), header("Valor unitário"), header("Responsável"), header("Forma"), header("Subtotal")],
      ...result.extras.map((item): Cell[] => [
        item.name,
        item.category,
        quantity(item.qty),
        item.unit,
        currency(item.price),
        item.provided ? item.responsible || "A definir" : "—",
        item.provided ? "Família traz" : "Compra",
        item.provided ? "Não cobrar" : currency(item.cost),
      ]),
      ...(guests.length ? [
        [],
        [section("CONVIDADOS"), null, null, null, null, null, null, null],
        [header("Nome"), header("Família"), header("Tipo"), header("Cota"), header("Valor"), null, null, null],
        ...result.guestCharges.map((guest): Cell[] => [
          guest.name,
          guest.family,
          guest.type === "adult" ? "Adulto" : "Criança",
          guest.type === "adult" ? "1 cota" : chargeChildren ? "Meia cota" : "Não cobrada",
          currency(guest.amount),
          null,
          null,
          null,
        ]),
        [],
        [section("RATEIO POR FAMÍLIA"), null, null, null, null, null, null, null],
        [header("Família"), header("Convidados"), header("Quantidade"), null, null, null, null, header("Total")],
        ...result.familyCharges.map((family): Cell[] => [
          family.family,
          family.members.join(", "),
          family.members.length,
          null,
          null,
          null,
          null,
          currency(family.total),
        ]),
      ] as SheetData : []),
      [],
      [section("RESUMO"), null, null, null, null, null, null, null],
      summary("Total de proteínas", result.cost),
      summary("Total de acompanhamentos", result.extrasCost),
      summary("Total estimado", result.grandTotal),
      summary("Valor estimado por adulto", result.perAdult),
      summary("Valor estimado por criança", result.perChild),
    ];

    try {
      const { default: writeExcelFile } = await import("write-excel-file/universal");
      const blob = await writeExcelFile(rows, {
        sheet: "Plano do churrasco",
        columns: [
          { width: 28 }, { width: 22 }, { width: 14 }, { width: 12 },
          { width: 17 }, { width: 24 }, { width: 16 }, { width: 17 },
        ],
      }).toBlob();
      const safeName = (eventName.trim() || "plano").replace(/[<>:"/\\|?*]+/g, "-").slice(0, 60);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `brasa-certa-${safeName}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
      setStorageStatus("Planilha Excel baixada com acentos e valores formatados.");
    } catch {
      setStorageStatus("Não foi possível gerar a planilha Excel. Tente novamente.");
    }
  }

  function printReport(mode: "pre" | "post" | "gate") {
    setPrintMode(mode);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => window.print());
    });
  }

  function openMobileReport(mode: "pre" | "post" = "pre") {
    setMobileReportMode(mode);
    setShareStatus("");
    setMobileReportOpen(true);
  }

  function buildReportText(mode: "pre" | "post") {
    const name = eventName.trim() || "Meu churrasco";
    const date = eventDate ? new Date(`${eventDate}T12:00:00`).toLocaleDateString("pt-BR") : "data a definir";
    if (mode === "pre") {
      const purchases = [
        ...result.rows.map((item) => `• ${item.name}: ${number.format(item.kg)} kg`),
        ...result.extras
          .filter((item) => !item.provided && !(familyOwnDrinks && item.category === "Bebidas"))
          .map((item) => `• ${item.name}: ${formatQty(item.qty, item.unit)}`),
      ];
      const contributions = result.extras
        .filter((item) => item.provided)
        .map((item) => `• ${item.name}: ${formatQty(item.qty, item.unit)} — ${item.responsible || "responsável a definir"}`);
      if (familyOwnDrinks) contributions.push("• Bebidas de consumo próprio — cada família leva a sua");
      return [
        `🔥 *${name}*`,
        `📅 ${date} · ${result.guests} convidados · ${periods[period].label}`,
        "",
        "*PRÉ-EVENTO · LISTA DE ORGANIZAÇÃO*",
        "",
        "*Comprar*",
        ...(purchases.length ? purchases : ["• Nenhum item definido"]),
        "",
        "*Pessoas ou famílias levam*",
        ...(contributions.length ? contributions : ["• Nenhum item atribuído até o momento"]),
        ...(familyOwnDrinks ? ["", "🥤 Cada família deve levar sua própria bebida, conforme sua preferência e consumo."] : []),
      ].join("\n");
    }

    return [
      `🔥 *${name}*`,
      `👥 ${result.guests} convidados · ${periods[period].label}`,
      "",
      "*PRESTAÇÃO DE CONTAS*",
      `Total: *${money.format(result.grandTotal)}*`,
      `Por adulto: ${money.format(result.perAdult)}`,
      `Por criança: ${money.format(result.perChild)}`,
      "",
      "*Por família ou grupo*",
      ...result.familyCharges.map((family) => `• ${family.family}: *${money.format(family.total)}* — ${family.members.join(", ")}`),
    ].join("\n");
  }

  async function copyMobileReport() {
    const text = buildReportText(mobileReportMode);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const field = document.createElement("textarea");
        field.value = text;
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        document.execCommand("copy");
        field.remove();
      }
      setShareStatus("Texto copiado. Agora é só colar no WhatsApp.");
    } catch {
      setShareStatus("Não foi possível copiar automaticamente. Tente usar Compartilhar.");
    }
  }

  async function shareMobileReport() {
    const text = buildReportText(mobileReportMode);
    if (!navigator.share) {
      await copyMobileReport();
      return;
    }
    try {
      await navigator.share({
        title: `${eventName.trim() || "Meu churrasco"} — ${mobileReportMode === "pre" ? "pré-evento" : "prestação de contas"}`,
        text,
      });
      setShareStatus("Relatório compartilhado.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareStatus("O compartilhamento não abriu. Você ainda pode copiar o texto.");
    }
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Brasa Certa — início">
          <span className="brand-mark">BC</span>
          <span>BRASA<br /><b>CERTA</b></span>
        </a>
        <nav aria-label="Navegação principal">
          <a href="#calculadora">Calculadora</a>
          <a href="#meus-churrascos">Meus churrascos</a>
          <a href="#dicas">Dicas</a>
        </nav>
        <a className="outline-button" href="#calculadora">Calcular agora <span>↓</span></a>
      </header>

      {newPlanPromptOpen && (
        <div className="dialog-backdrop">
          <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="new-plan-title">
            <span className="step-label">NOVO PLANEJAMENTO</span>
            <h2 id="new-plan-title">Salvar antes de começar outro?</h2>
            <p>
              Você está fechando {eventName.trim() ? <strong>“{eventName.trim()}”</strong> : "o planejamento atual"}.
              Escolha se deseja guardá-lo em “Meus churrascos”.
            </p>
            <div className="dialog-actions">
              <button className="dialog-primary" autoFocus onClick={saveAndResetPlan}>Salvar e começar novo</button>
              <button onClick={resetPlan}>Começar sem salvar</button>
              <button className="dialog-cancel" onClick={() => setNewPlanPromptOpen(false)}>Cancelar</button>
            </div>
          </section>
        </div>
      )}

      <section className="hero" id="inicio">
        <div className="eyebrow"><span>•</span> Planeje sem desperdício</div>
        <h1>Churrasco bom<br />começa na <em>conta.</em></h1>
        <p>Descubra quanto comprar, quanto vai custar e aproveite o encontro sem faltar — nem sobrar demais.</p>
        <div className="hero-pills">
          <span>🔥 Cálculo em segundos</span>
          <span>✓ Preços de referência Swift</span>
          <span>◷ Ajustado pela duração</span>
        </div>
        <figure className="hero-portrait">
          <img src="mestre-da-brasa.png" alt="Mestre churrasqueiro do Brasa Certa" />
          <figcaption><span>●</span> Da conta à grelha</figcaption>
        </figure>
      </section>

      <section className="calculator-section" id="calculadora">
        <div className="section-intro">
          <span className="step-label">01 — MONTE SEU CHURRASCO</span>
          <h2>Conte pra gente<br />como vai ser.</h2>
        </div>

        <div className="calculator-grid">
          <div className="form-panel">
            <div className="event-details">
              <div>
                <div className="event-details-copy">
                  <span className="step-label">IDENTIFICAÇÃO</span>
                  <h3>Dê um nome ao seu churrasco</h3>
                  <p>Essas informações ajudam a encontrar o planejamento depois.</p>
                </div>
                <button className="new-plan-button" onClick={() => setNewPlanPromptOpen(true)}>
                  ＋ Novo churrasco
                </button>
              </div>
              <label>
                <span>Nome do churrasco</span>
                <input value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Ex.: Dia dos Pais" maxLength={80} />
              </label>
              <label>
                <span>Data do evento</span>
                <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              </label>
              <label className="event-notes">
                <span>Observações</span>
                <input value={eventNotes} onChange={(e) => setEventNotes(e.target.value)} placeholder="Ex.: levar caixa térmica" maxLength={160} />
              </label>
              <label>
                <span>Local do evento</span>
                <input value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} placeholder="Ex.: Salão de festas, bloco B" maxLength={100} />
              </label>
              <label>
                <span>Contato responsável</span>
                <input value={eventContact} onChange={(e) => setEventContact(e.target.value)} placeholder="Ex.: Ricardo · (11) 99999-9999" maxLength={100} />
              </label>
            </div>
            <fieldset>
              <legend><span>1</span> Quantas pessoas?</legend>
              <div className="people-grid">
                <Counter label="Adultos" hint="A partir de 13 anos" value={adults} minValue={result.namedAdults} setValue={setAdults} icon="♟" />
                <Counter label="Crianças" hint="De 5 a 12 anos" value={children} minValue={result.namedChildren} setValue={setChildren} icon="♟" />
              </div>
              <p className="tiny-note">Crianças de até 4 anos não entram no cálculo.</p>
              <div className={`guest-manager ${guestListOpen ? "open" : ""}`}>
                <button
                  className="guest-manager-trigger"
                  onClick={() => setGuestListOpen((open) => !open)}
                  aria-expanded={guestListOpen}
                >
                  <span>
                    <b>Nomear convidados e famílias</b>
                    <small>{guests.length ? `${guests.length} convidado(s) nomeado(s)` : "Opcional · organize o rateio por família"}</small>
                  </span>
                  <i>{guestListOpen ? "−" : "+"}</i>
                </button>
                {guestListOpen && (
                  <div className="guest-manager-body">
                    <p>Cadastre quem vai participar. Se a lista ultrapassar a quantidade acima, o total de pessoas será atualizado automaticamente.</p>
                    <div className="guest-add-grid">
                      <label>
                        <span>Nome</span>
                        <input value={newGuest.name} onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })} placeholder="Ex.: Mari" maxLength={60} />
                      </label>
                      <label>
                        <span>Família</span>
                        <input value={newGuest.family} onChange={(e) => setNewGuest({ ...newGuest, family: e.target.value })} placeholder="Ex.: Família Mari" maxLength={60} />
                      </label>
                      <label>
                        <span>Tipo</span>
                        <select value={newGuest.type} onChange={(e) => setNewGuest({ ...newGuest, type: e.target.value as Guest["type"] })}>
                          <option value="adult">Adulto</option>
                          <option value="child">Criança</option>
                        </select>
                      </label>
                      <label>
                        <span>Convidado por</span>
                        <input value={newGuest.invitedBy} onChange={(e) => setNewGuest({ ...newGuest, invitedBy: e.target.value })} placeholder="Ex.: Ricardo" maxLength={60} />
                      </label>
                      <label>
                        <span>Placa (opcional)</span>
                        <input value={newGuest.vehiclePlate} onChange={(e) => setNewGuest({ ...newGuest, vehiclePlate: e.target.value.toUpperCase() })} placeholder="ABC1D23" maxLength={8} />
                      </label>
                      <label>
                        <span>Observação da portaria</span>
                        <input value={newGuest.accessNote} onChange={(e) => setNewGuest({ ...newGuest, accessNote: e.target.value })} placeholder="Ex.: prestador ou acessibilidade" maxLength={100} />
                      </label>
                      <button onClick={addGuest} disabled={!newGuest.name.trim() || !newGuest.family.trim()}>Adicionar convidado</button>
                    </div>
                    {guests.length > 0 ? (
                      <div className="guest-list">
                        <div className="guest-list-head"><span>Nome</span><span>Família</span><span>Tipo</span><span>Cota</span><span /></div>
                        {guests.map((guest) => (
                          <div className="guest-entry" key={guest.id}>
                          <div className="guest-row">
                            <input aria-label={`Nome de ${guest.name}`} value={guest.name} onChange={(e) => updateGuest(guest.id, { name: e.target.value })} maxLength={60} />
                            <input aria-label={`Família de ${guest.name}`} value={guest.family} onChange={(e) => updateGuest(guest.id, { family: e.target.value })} maxLength={60} />
                            <select aria-label={`Tipo de ${guest.name}`} value={guest.type} onChange={(e) => updateGuest(guest.id, { type: e.target.value as Guest["type"] })}>
                              <option value="adult">Adulto</option>
                              <option value="child">Criança</option>
                            </select>
                            <output>{money.format(guest.type === "child" ? result.perChild : result.perAdult)}</output>
                            <button aria-label={`Remover ${guest.name}`} onClick={() => removeGuest(guest.id)}>×</button>
                          </div>
                          <div className="guest-access-fields">
                            <input aria-label={`Convidado por, ${guest.name}`} value={guest.invitedBy ?? ""} onChange={(e) => updateGuest(guest.id, { invitedBy: e.target.value })} placeholder="Convidado por" maxLength={60} />
                            <input aria-label={`Placa de ${guest.name}`} value={guest.vehiclePlate ?? ""} onChange={(e) => updateGuest(guest.id, { vehiclePlate: e.target.value.toUpperCase() })} placeholder="Placa do veículo" maxLength={8} />
                            <input aria-label={`Observação da portaria para ${guest.name}`} value={guest.accessNote ?? ""} onChange={(e) => updateGuest(guest.id, { accessNote: e.target.value })} placeholder="Observação da portaria" maxLength={100} />
                          </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="guest-empty">Nenhum convidado nomeado ainda.</div>
                    )}
                    {(result.unassignedAdults > 0 || result.unassignedChildren > 0) && (
                      <p className="guest-balance">
                        Ainda sem nome: {result.unassignedAdults} adulto(s) e {result.unassignedChildren} criança(s).
                      </p>
                    )}
                  </div>
                )}
              </div>
            </fieldset>

            <fieldset>
              <legend><span>2</span> Quanto tempo vai durar?</legend>
              <div className="period-grid">
                {Object.entries(periods).map(([id, data]) => (
                  <button key={id} className={`period-card ${period === id ? "active" : ""}`} onClick={() => setPeriod(id as keyof typeof periods)}>
                    <b>{data.label}</b><small>{data.sub}</small>
                    <i>{period === id ? "✓" : ""}</i>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend><span>3</span> Escolha as carnes</legend>
              <p className="field-help">Abra o combo e escolha quantas quiser. A proporção é equilibrada automaticamente.</p>
              <div className="meat-combo">
                <button className="combo-trigger" onClick={() => setMeatMenuOpen((open) => !open)} aria-expanded={meatMenuOpen}>
                  <span><b>{selected.length ? `${selected.length} carne(s) selecionada(s)` : "Nenhuma carne selecionada"}</b><small>Legado, Gran Reserva, suínos, aves e linguiças</small></span>
                  <i>{meatMenuOpen ? "−" : "+"}</i>
                </button>
                {meatMenuOpen && (
                  <div className="combo-menu">
                    <input autoFocus type="search" value={meatSearch} onChange={(e) => setMeatSearch(e.target.value)} placeholder="Buscar carne ou linha..." aria-label="Buscar carne" />
                    <div className="combo-options">
                      {meatGroups.map((group) => {
                        const options = allMeats.filter((meat) =>
                          meatCategory(meat.id) === group.label && `${meat.name} ${meat.note}`.toLowerCase().includes(meatSearch.toLowerCase())
                        );
                        if (!options.length) return null;
                        return (
                          <section className="option-group" key={group.label}>
                            <h3><span>{group.icon}</span>{group.label}<small>{options.length} opções</small></h3>
                            {options.map((meat) => {
                              const active = selected.includes(meat.id);
                              return (
                                <button key={meat.id} onClick={() => toggleMeat(meat.id)} className={active ? "active" : ""}>
                                  <span className="meat-swatch" style={{ background: meat.color }} aria-hidden="true" />
                                  <span><b>{meat.name}</b><small>{meat.note} · {money.format(meat.price)}/kg</small></span>
                                  <i>{active ? "✓" : "+"}</i>
                                </button>
                              );
                            })}
                          </section>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="editable-items">
                <div className="editable-head"><span>Proteína</span><span>Quantidade (kg)</span><span>Valor por kg</span><span /></div>
                {result.rows.map((meat) => (
                  <div className="editable-row" key={meat.id}>
                    <div className="editable-name">
                      <span className="dot" style={{ background: meat.color }} />
                      <span><b>{meat.name}</b><small>{meat.note}</small></span>
                    </div>
                    <label><small>Quantidade (kg)</small><input type="number" min="0" step=".1" value={Number(meat.kg.toFixed(2))} onChange={(e) => updateMeat(meat.id, "qty", Number(e.target.value))} /></label>
                    <label><small>R$ por kg</small><input type="number" min="0" step=".01" value={meat.price} onChange={(e) => updateMeat(meat.id, "price", Number(e.target.value))} /></label>
                    <button className="remove-item" onClick={() => toggleMeat(meat.id)} aria-label={`Remover ${meat.name}`}>×</button>
                  </div>
                ))}
              </div>
              <div className="custom-item">
                <h3>Adicionar outra proteína ou marca</h3>
                <p className="custom-item-note">A quantidade informada será somada ao total, sem reduzir as outras carnes.</p>
                <div className="custom-item-grid protein">
                  <label><span>Nome da carne</span><input value={newMeat.name} onChange={(e) => setNewMeat({ ...newMeat, name: e.target.value })} placeholder="Ex.: Costela de outra marca" /></label>
                  <label><span>Categoria</span><select value={newMeat.category} onChange={(e) => setNewMeat({ ...newMeat, category: e.target.value as MeatCategory })}><option>Bovinos</option><option>Suínos</option><option>Frangos</option></select></label>
                  <label><span>Quantidade (kg)</span><input type="number" min="0" step=".1" value={newMeat.qty} onChange={(e) => setNewMeat({ ...newMeat, qty: e.target.value })} placeholder="0,0" /></label>
                  <label><span>Valor por kg</span><input type="number" min="0" step=".01" value={newMeat.price} onChange={(e) => setNewMeat({ ...newMeat, price: e.target.value })} placeholder="R$ 0,00" /></label>
                  <button onClick={addCustomMeat}>Adicionar</button>
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend><span>4</span> Escolha os acompanhamentos</legend>
              <p className="field-help">Selecione os itens que deseja incluir na lista e no orçamento.</p>
              <div className="meat-combo">
                <button className="combo-trigger" onClick={() => setAccompanimentMenuOpen((open) => !open)} aria-expanded={accompanimentMenuOpen}>
                  <span><b>{selectedAccompaniments.length ? `${selectedAccompaniments.length} acompanhamento(s) selecionado(s)` : "Nenhum acompanhamento selecionado"}</b><small>Tradicionais, saladas, bebidas e apoio</small></span>
                  <i>{accompanimentMenuOpen ? "−" : "+"}</i>
                </button>
                {accompanimentMenuOpen && (
                  <div className="combo-menu companion-menu">
                    <div className="combo-options">
                      {(["Tradicionais", "Saladas e legumes", "Bebidas", "Apoio"] as const).map((category) => (
                        <section className="option-group" key={category}>
                          <h3>{category}<small>{allAccompaniments.filter((item) => item.category === category).length} opções</small></h3>
                          {allAccompaniments.filter((item) => item.category === category).map((item) => {
                            const active = selectedAccompaniments.includes(item.id);
                            return (
                              <button key={item.id} onClick={() => toggleAccompaniment(item.id)} className={active ? "active" : ""}>
                                <span className="companion-icon">{item.icon}</span>
                                <span><b>{item.name}</b><small>{item.note}</small></span>
                                <i>{active ? "✓" : "+"}</i>
                              </button>
                            );
                          })}
                        </section>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="editable-items companions">
                <div className="editable-head companion-head"><span>Acompanhamento</span><span>Quantidade</span><span>Valor unitário</span><span>Família traz?</span><span>Responsável</span><span /></div>
                {result.extras.map((item) => (
                  <div className="editable-row companion-editable-row" key={item.id}>
                    <div className="editable-name"><span className="companion-icon">{item.icon}</span><span><b>{item.name}</b><small>{item.category}</small></span></div>
                    <label><small>Qtd. ({item.unit === "pacote" ? "pacotes" : item.unit})</small><input type="number" min="0" step={item.unit === "pacote" || item.unit === "pct." || item.unit === "un." ? "1" : ".1"} value={Number(item.qty.toFixed(2))} onChange={(e) => updateAccompaniment(item.id, "qty", Number(e.target.value))} /></label>
                    <label><small>R$ por {item.unit}</small><input type="number" min="0" step=".01" value={item.price} onChange={(e) => updateAccompaniment(item.id, "price", Number(e.target.value))} /></label>
                    <label className={`compact-contribution-toggle ${item.provided ? "active" : ""}`} title="Quando marcado, o item não entra no rateio.">
                      <input
                        type="checkbox"
                        checked={item.provided}
                        onChange={(e) => updateContribution(item.id, { provided: e.target.checked })}
                        aria-label={`Uma família traz ${item.name}`}
                      />
                      <span>Família traz</span>
                    </label>
                    <label className="responsible-input compact-responsible">
                      <span>Responsável</span>
                      <input
                        value={item.responsible}
                        disabled={!item.provided}
                        onChange={(e) => updateContribution(item.id, { responsible: e.target.value })}
                        placeholder={item.provided ? "Ex.: Família Takeya" : "—"}
                        aria-label={`Família ou responsável por ${item.name}`}
                        maxLength={80}
                      />
                    </label>
                    <button className="remove-item" onClick={() => toggleAccompaniment(item.id)} aria-label={`Remover ${item.name}`}>×</button>
                  </div>
                ))}
              </div>
              <div className="custom-item">
                <h3>Adicionar outro acompanhamento</h3>
                <div className="custom-item-grid">
                  <label><span>Nome do item</span><input value={newAccompaniment.name} onChange={(e) => setNewAccompaniment({ ...newAccompaniment, name: e.target.value })} placeholder="Ex.: Mandioca cozida" /></label>
                  <label><span>Categoria</span><select value={newAccompaniment.category} onChange={(e) => setNewAccompaniment({ ...newAccompaniment, category: e.target.value as Accompaniment["category"] })}><option>Tradicionais</option><option>Saladas e legumes</option><option>Bebidas</option><option>Apoio</option></select></label>
                  <label><span>Unidade</span><select value={newAccompaniment.unit} onChange={(e) => setNewAccompaniment({ ...newAccompaniment, unit: e.target.value })}><option value="kg">kg</option><option value="L">litros</option><option value="un.">unidades</option><option value="pct.">pacotes</option></select></label>
                  <label><span>Quantidade</span><input type="number" min="0" step=".1" value={newAccompaniment.qty} onChange={(e) => setNewAccompaniment({ ...newAccompaniment, qty: e.target.value })} placeholder="0,0" /></label>
                  <label><span>Valor por unidade</span><input type="number" min="0" step=".01" value={newAccompaniment.price} onChange={(e) => setNewAccompaniment({ ...newAccompaniment, price: e.target.value })} placeholder="R$ 0,00" /></label>
                  <button onClick={addCustomAccompaniment}>Adicionar</button>
                </div>
              </div>
            </fieldset>

            <label className="reserve-row">
              <input type="checkbox" checked={reserve} onChange={(e) => setReserve(e.target.checked)} />
              <span><b>Adicionar 10% de margem de segurança</b><small>Boa ideia para turmas que comem bem.</small></span>
            </label>
            <label className="reserve-row child-charge-row">
              <input type="checkbox" checked={chargeChildren} onChange={(e) => setChargeChildren(e.target.checked)} />
              <span>
                <b>Cobrar crianças no rateio</b>
                <small>{chargeChildren ? "Cada criança paga meia cota de adulto." : "Crianças não pagam; o total fica somente com os adultos."}</small>
              </span>
            </label>
            <label className="reserve-row family-drinks-row">
              <input type="checkbox" checked={familyOwnDrinks} onChange={(e) => setFamilyOwnDrinks(e.target.checked)} />
              <span>
                <b>Cada família leva sua própria bebida</b>
                <small>{familyOwnDrinks ? "A orientação será destacada no relatório pré-evento." : "Ative para incluir essa mensagem na organização do churrasco."}</small>
              </span>
            </label>
          </div>

          <aside className="result-card" aria-live="polite">
            <div className="result-head">
              <span>SEU PLANO DE CHURRASCO</span>
              <b>{result.guests} convidados</b>
              <small>{periods[period].label} · {reserve ? "com" : "sem"} margem</small>
            </div>
            <div className="total-meat">
              <span>Total de carnes</span>
              <strong>{number.format(result.total)} <small>kg</small></strong>
              <p>≈ {Math.round(result.total * 1000 / Math.max(result.guests, 1))} g por pessoa</p>
            </div>
            <div className="result-list">
              {result.rows.map((row) => (
                <div className="result-row" key={row.id}>
                  <span className="dot" style={{ background: row.color }} />
                  <span><b>{row.name}</b><small>{money.format(row.price)}/kg</small></span>
                  <strong>{number.format(row.kg)} kg</strong>
                </div>
              ))}
            </div>
            <div className="other-items">
              <span>OUTROS ITENS</span>
              {result.extras.map((item) => (
                <div key={item.name}>
                  <p>
                    <b>{item.name}</b>
                    <small>
                      {item.provided
                        ? `${formatQty(item.qty, item.unit)} · trazido por ${item.responsible || "responsável a definir"}`
                        : `${formatQty(item.qty, item.unit)} × ${money.format(item.price)}`}
                    </small>
                  </p>
                  <strong>{item.provided ? "Não cobrar" : money.format(item.cost)}</strong>
                </div>
              ))}
            </div>
            <div className="cost-box">
              <p className="cost-line"><span>Carnes</span><b>{money.format(result.cost)}</b></p>
              <p className="cost-line"><span>Outros itens</span><b>{money.format(result.extrasCost)}</b></p>
              <div><span>Total estimado</span><strong>{money.format(result.grandTotal)}</strong></div>
            </div>
            <div className="per-person-total">
              <span>RATEIO ESTIMADO</span>
              <div className="rate-values">
                <div><small>POR ADULTO</small><strong>{money.format(result.perAdult)}</strong></div>
                <div><small>POR CRIANÇA</small><strong>{money.format(result.perChild)}</strong></div>
              </div>
              <small>
                {chargeChildren
                  ? `${adults} cota(s) adulta(s) + ${children} meia(s) cota(s) infantil(is)`
                  : `Crianças não cobradas · rateio entre ${adults} adulto(s)`}
              </small>
              {!result.rateUnits && result.grandTotal > 0 && <small className="rate-warning">Inclua ao menos um adulto para calcular o rateio.</small>}
            </div>
            {guests.length > 0 && (
              <div className="family-breakdown">
                <div className="family-breakdown-title">
                  <span>RATEIO POR FAMÍLIA</span>
                  <small>{result.familyCharges.length} grupo(s)</small>
                </div>
                {result.familyCharges.map((family) => (
                  <div className="family-charge" key={family.family}>
                    <span><b>{family.family}</b><small>{family.members.join(", ")}</small></span>
                    <strong>{money.format(family.total)}</strong>
                  </div>
                ))}
              </div>
            )}
            <button className="save-plan-button" onClick={saveBarbecue}>
              <span>＋</span> {activeSavedId ? "Salvar alterações" : "Salvar churrasco"}
            </button>
            {storageStatus && <p className="storage-status" role="status">{storageStatus}</p>}
            <div className="export-actions">
              <button onClick={() => printReport("pre")}><span>☑</span> PDF pré-evento</button>
              <button onClick={() => printReport("post")}><span>▣</span> PDF prestação de contas</button>
              <button onClick={() => printReport("gate")} disabled={!guests.length}><span>⌂</span> PDF para portaria</button>
              <button className="mobile-report-button" onClick={() => openMobileReport("pre")}><span>▤</span> Ver no celular</button>
              <button onClick={exportExcel}><span>▦</span> Excel completo</button>
            </div>
            <a className="swift-link" href="https://www.swift.com.br/swift-legado" target="_blank" rel="noreferrer">
              Conferir linha Legado <span>↗</span>
            </a>
            <p className="price-note">Preços de referência consultados em 28/07/2026. Podem variar por CEP, estoque e promoções.</p>
          </aside>
          <section className={`print-report pre-event-report ${printMode === "pre" ? "active-print" : ""}`}>
            <header>
              <img className="print-photo" src="mestre-da-brasa.png" alt="Mestre churrasqueiro do Brasa Certa" />
              <span>BRASA CERTA · PRÉ-EVENTO</span>
              <h1>Lista de organização</h1>
              <p>
                {eventName.trim() || "Meu churrasco"} · {eventDate ? new Date(`${eventDate}T12:00:00`).toLocaleDateString("pt-BR") : "data a definir"} · {result.guests} convidados · {periods[period].label}
              </p>
              <div className="pre-event-header-details">
                <p><b>Local do evento</b><span>{eventLocation.trim() || "Não informado"}</span></p>
                <p><b>Contato</b><span>{eventContact.trim() || "Não informado"}</span></p>
              </div>
            </header>
            {familyOwnDrinks && (
              <div className="pre-event-message">
                <b>Mensagem para as famílias</b>
                <p>Cada família deve levar sua própria bebida, de acordo com sua preferência e consumo.</p>
              </div>
            )}
            <h2>O que será comprado</h2>
            <table>
              <thead><tr><th>Item</th><th>Categoria</th><th>Quantidade</th><th>Organização</th></tr></thead>
              <tbody>
                {result.rows.map((item) => (
                  <tr key={item.id}><td>{item.name}</td><td>{meatCategory(item.id)}</td><td>{number.format(item.kg)} kg</td><td>Comprar</td></tr>
                ))}
                {result.extras
                  .filter((item) => !item.provided && !(familyOwnDrinks && item.category === "Bebidas"))
                  .map((item) => (
                    <tr key={item.id}><td>{item.name}</td><td>{item.category}</td><td>{formatQty(item.qty, item.unit)}</td><td>Comprar</td></tr>
                  ))}
              </tbody>
            </table>
            <h2>O que as pessoas ou famílias levarão</h2>
            <table>
              <thead><tr><th>Item</th><th>Quantidade</th><th>Responsável</th><th>Situação</th></tr></thead>
              <tbody>
                {result.extras.filter((item) => item.provided).map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td><td>{formatQty(item.qty, item.unit)}</td><td>{item.responsible || "A definir"}</td><td>{item.responsible ? "Combinado" : "A combinar"}</td>
                  </tr>
                ))}
                {familyOwnDrinks && <tr><td>Bebidas de consumo próprio</td><td>Conforme preferência</td><td>Cada família</td><td>Combinado</td></tr>}
                {!result.extras.some((item) => item.provided) && !familyOwnDrinks && (
                  <tr><td colSpan={4}>Nenhum item atribuído a uma família até o momento.</td></tr>
                )}
              </tbody>
            </table>
            {guests.length > 0 && (
              <>
                <h2>Famílias participantes</h2>
                <table>
                  <thead><tr><th>Família ou grupo</th><th>Convidados</th></tr></thead>
                  <tbody>{result.familyCharges.map((family) => (
                    <tr key={family.family}><td>{family.family}</td><td>{family.members.join(", ")}</td></tr>
                  ))}</tbody>
                </table>
              </>
            )}
            <footer>Lista para alinhamento antes do evento. Este relatório não apresenta preços.</footer>
          </section>
          <section className={`print-report gate-report ${printMode === "gate" ? "active-print" : ""}`}>
            <header>
              <img className="print-photo" src="mestre-da-brasa.png" alt="Mestre churrasqueiro do Brasa Certa" />
              <span>BRASA CERTA · CONTROLE DE ACESSO</span>
              <h1>Lista para portaria</h1>
              <p>{eventName.trim() || "Meu churrasco"} · {eventDate ? new Date(`${eventDate}T12:00:00`).toLocaleDateString("pt-BR") : "data a definir"}</p>
            </header>
            <div className="gate-event-details">
              <p><b>Local</b><span>{eventLocation.trim() || "Não informado"}</span></p>
              <p><b>Responsável</b><span>{eventContact.trim() || "Não informado"}</span></p>
              <p><b>Total autorizado</b><span>{guests.length} pessoa(s)</span></p>
            </div>
            <h2>Convidados autorizados</h2>
            <table>
              <thead><tr><th>Entrada</th><th>Nome</th><th>Família ou grupo</th><th>Tipo</th><th>Convidado por</th><th>Placa</th><th>Observação</th></tr></thead>
              <tbody>
                {[...guests].sort((a, b) =>
                  a.family.localeCompare(b.family, "pt-BR", { sensitivity: "base" })
                  || a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" })
                ).map((guest) => (
                  <tr key={guest.id}>
                    <td className="gate-check">□</td>
                    <td><b>{guest.name}</b></td>
                    <td>{guest.family}</td>
                    <td>{guest.type === "adult" ? "Adulto" : "Criança"}</td>
                    <td>{guest.invitedBy || "—"}</td>
                    <td>{guest.vehiclePlate || "—"}</td>
                    <td>{guest.accessNote || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="gate-summary">
              <span>{guests.filter((guest) => guest.type === "adult").length} adulto(s)</span>
              <span>{guests.filter((guest) => guest.type === "child").length} criança(s)</span>
              <span>{guests.filter((guest) => guest.vehiclePlate?.trim()).length} veículo(s)</span>
            </div>
            <footer>Documento destinado exclusivamente ao controle de acesso do evento. Dados armazenados localmente neste aparelho.</footer>
          </section>
          <section className={`print-report post-event-report ${printMode === "post" ? "active-print" : ""}`}>
            <header>
              <img className="print-photo" src="mestre-da-brasa.png" alt="Mestre churrasqueiro do Brasa Certa" />
              <span>BRASA CERTA · PÓS-EVENTO</span>
              <h1>Prestação de contas</h1>
              <p>
                {eventName.trim() || "Meu churrasco"} · {result.guests} convidados · {periods[period].label} · {reserve ? "com 10% de margem" : "sem margem"} ·
                {chargeChildren ? " crianças com meia cota" : " crianças não cobradas"}
              </p>
            </header>
            <h2>Proteínas</h2>
            <table>
              <thead><tr><th>Item</th><th>Categoria</th><th>Quantidade</th><th>R$/kg</th><th>Subtotal</th></tr></thead>
              <tbody>{result.rows.map((item) => <tr key={item.id}><td>{item.name}</td><td>{meatCategory(item.id)}</td><td>{number.format(item.kg)} kg</td><td>{money.format(item.price)}</td><td>{money.format(item.cost)}</td></tr>)}</tbody>
            </table>
            <h2>Acompanhamentos</h2>
            <table>
              <thead><tr><th>Item</th><th>Categoria</th><th>Quantidade</th><th>Responsável</th><th>Forma</th><th>Valor unitário</th><th>Subtotal</th></tr></thead>
              <tbody>{result.extras.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{formatQty(item.qty, item.unit)}</td>
                  <td>{item.provided ? item.responsible || "A definir" : "—"}</td>
                  <td>{item.provided ? "Família traz" : "Compra"}</td>
                  <td>{money.format(item.price)}</td>
                  <td>{item.provided ? "Não cobrar" : money.format(item.cost)}</td>
                </tr>
              ))}</tbody>
            </table>
            <h2>Quanto ficou por pessoa</h2>
            <table>
              <thead><tr><th>Nome</th><th>Família</th><th>Tipo</th><th>Quantidade</th><th>Valor por pessoa</th></tr></thead>
              <tbody>
                {result.guestCharges.map((guest) => (
                    <tr key={guest.id}>
                      <td>{guest.name}</td>
                      <td>{guest.family}</td>
                      <td>{guest.type === "adult" ? "Adulto" : "Criança"}</td>
                      <td>1</td>
                      <td>{money.format(guest.amount)}</td>
                    </tr>
                ))}
                {result.unassignedAdults > 0 && (
                  <tr><td>Adultos ainda não nomeados</td><td>Sem grupo definido</td><td>Adulto</td><td>{result.unassignedAdults}</td><td>{money.format(result.perAdult)}</td></tr>
                )}
                {result.unassignedChildren > 0 && (
                  <tr><td>Crianças ainda não nomeadas</td><td>Sem grupo definido</td><td>Criança</td><td>{result.unassignedChildren}</td><td>{money.format(result.perChild)}</td></tr>
                )}
              </tbody>
            </table>
            <h2>Quanto ficou por família ou grupo</h2>
            <table>
              <thead><tr><th>Família ou grupo</th><th>Convidados</th><th>Total</th></tr></thead>
              <tbody>{result.familyCharges.map((family) => (
                <tr key={family.family}>
                  <td>{family.family}</td>
                  <td>{family.members.join(", ")}</td>
                  <td>{money.format(family.total)}</td>
                </tr>
              ))}</tbody>
            </table>
            <div className="print-totals">
              <p><span>Proteínas</span><b>{money.format(result.cost)}</b></p>
              <p><span>Acompanhamentos</span><b>{money.format(result.extrasCost)}</b></p>
              <p><span>Total estimado</span><b>{money.format(result.grandTotal)}</b></p>
              <strong><span>Valor por adulto</span>{money.format(result.perAdult)}</strong>
              <strong><span>Valor por criança</span>{money.format(result.perChild)}</strong>
            </div>
            <footer>Prestação de contas. Atualize na calculadora as quantidades e os valores efetivamente pagos antes de gerar este relatório.</footer>
          </section>
        </div>
      </section>

      {mobileReportOpen && (
        <div className="mobile-report-backdrop" role="presentation" onClick={() => setMobileReportOpen(false)}>
          <section className="mobile-report-dialog" role="dialog" aria-modal="true" aria-labelledby="mobile-report-title" onClick={(event) => event.stopPropagation()}>
            <header className="mobile-report-header">
              <div>
                <span>RELATÓRIO PARA CELULAR</span>
                <h2 id="mobile-report-title">{eventName.trim() || "Meu churrasco"}</h2>
                <p>{result.guests} convidados · {periods[period].label}</p>
              </div>
              <button onClick={() => setMobileReportOpen(false)} aria-label="Fechar relatório para celular">×</button>
            </header>
            <div className="mobile-report-tabs" role="tablist" aria-label="Tipo de relatório">
              <button className={mobileReportMode === "pre" ? "active" : ""} aria-pressed={mobileReportMode === "pre"} onClick={() => { setMobileReportMode("pre"); setShareStatus(""); }}>Pré-evento</button>
              <button className={mobileReportMode === "post" ? "active" : ""} aria-pressed={mobileReportMode === "post"} onClick={() => { setMobileReportMode("post"); setShareStatus(""); }}>Prestação de contas</button>
            </div>
            <div className="mobile-report-body">
              {mobileReportMode === "pre" ? (
                <>
                  {familyOwnDrinks && <div className="mobile-report-callout"><b>🥤 Bebidas por família</b><p>Cada família leva sua própria bebida, conforme sua preferência e consumo.</p></div>}
                  <section className="mobile-report-section">
                    <h3>Comprar</h3>
                    <div className="mobile-checklist">
                      {result.rows.map((item) => <div key={item.id}><span>{item.name}<small>{meatCategory(item.id)}</small></span><b>{number.format(item.kg)} kg</b></div>)}
                      {result.extras.filter((item) => !item.provided && !(familyOwnDrinks && item.category === "Bebidas")).map((item) => <div key={item.id}><span>{item.name}<small>{item.category}</small></span><b>{formatQty(item.qty, item.unit)}</b></div>)}
                      {!result.rows.length && !result.extras.some((item) => !item.provided && !(familyOwnDrinks && item.category === "Bebidas")) && <p className="mobile-report-empty">Nenhum item definido.</p>}
                    </div>
                  </section>
                  <section className="mobile-report-section">
                    <h3>Pessoas ou famílias levam</h3>
                    <div className="mobile-checklist responsibilities">
                      {result.extras.filter((item) => item.provided).map((item) => <div key={item.id}><span>{item.name}<small>{item.responsible || "Responsável a definir"}</small></span><b>{formatQty(item.qty, item.unit)}</b></div>)}
                      {familyOwnDrinks && <div><span>Bebidas de consumo próprio<small>Cada família</small></span><b>Combinado</b></div>}
                      {!result.extras.some((item) => item.provided) && !familyOwnDrinks && <p className="mobile-report-empty">Nenhum item atribuído até o momento.</p>}
                    </div>
                  </section>
                </>
              ) : (
                <>
                  <div className="mobile-total-card"><span>Total do churrasco</span><strong>{money.format(result.grandTotal)}</strong><small>{money.format(result.cost)} em proteínas · {money.format(result.extrasCost)} em acompanhamentos</small></div>
                  <div className="mobile-rate-cards">
                    <div><span>Por adulto</span><strong>{money.format(result.perAdult)}</strong></div>
                    <div><span>Por criança</span><strong>{money.format(result.perChild)}</strong></div>
                  </div>
                  <section className="mobile-report-section">
                    <h3>Por família ou grupo</h3>
                    <div className="mobile-family-list">
                      {result.familyCharges.map((family) => <div key={family.family}><span><b>{family.family}</b><small>{family.members.join(", ")}</small></span><strong>{money.format(family.total)}</strong></div>)}
                    </div>
                  </section>
                </>
              )}
            </div>
            <div className="mobile-report-actions">
              <button className="primary" onClick={shareMobileReport}>Compartilhar</button>
              <button onClick={copyMobileReport}>Copiar para WhatsApp</button>
            </div>
            {shareStatus && <p className="mobile-share-status" role="status">{shareStatus}</p>}
          </section>
        </div>
      )}

      <section className="saved-section" id="meus-churrascos">
        <div className="saved-shell">
          <div className="saved-header">
            <div>
              <span className="step-label">02 — SEU HISTÓRICO</span>
              <h2>Meus churrascos</h2>
              <p>Salvos somente neste aparelho. Use o backup para levar seus planejamentos para outro celular ou computador.</p>
            </div>
            <div className="backup-actions">
              <button onClick={exportBackup} disabled={!savedBarbecues.length}>Baixar backup</button>
              <button onClick={() => backupInputRef.current?.click()}>Importar backup</button>
              <input
                ref={backupInputRef}
                type="file"
                accept="application/json,.json"
                hidden
                onChange={(e) => importBackup(e.target.files?.[0])}
              />
            </div>
          </div>

          {savedBarbecues.length ? (
            <div className="saved-grid">
              {savedBarbecues.map((record) => (
                <article className={`saved-card ${activeSavedId === record.id ? "active" : ""}`} key={record.id}>
                  <div className="saved-card-top">
                    <span>{record.eventDate ? new Date(`${record.eventDate}T12:00:00`).toLocaleDateString("pt-BR") : "Data a definir"}</span>
                    {activeSavedId === record.id && <b>ABERTO</b>}
                  </div>
                  <h3>{record.name}</h3>
                  <p>{record.summary.guests} convidados · {periods[record.period].label}</p>
                  {record.notes && <small>{record.notes}</small>}
                  <div className="saved-summary">
                    <span><small>Total estimado</small><strong>{money.format(record.summary.grandTotal)}</strong></span>
                    <span><small>Por adulto</small><strong>{money.format(record.summary.perAdult ?? record.summary.perPerson)}</strong></span>
                    <span>
                      <small>Por criança</small>
                      <strong>{money.format(record.summary.perChild ?? ((record.chargeChildren ?? true) ? record.summary.perPerson / 2 : 0))}</strong>
                    </span>
                  </div>
                  <div className="saved-actions">
                    <button className="primary" onClick={() => openBarbecue(record)}>Abrir</button>
                    <button onClick={() => duplicateBarbecue(record)}>Duplicar</button>
                    <button className="danger" onClick={() => deleteBarbecue(record)}>Excluir</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="saved-empty">
              <span>BC</span>
              <h3>Nenhum churrasco salvo ainda</h3>
              <p>Monte o planejamento acima e toque em “Salvar churrasco”.</p>
              <a href="#calculadora">Voltar à calculadora</a>
            </div>
          )}
        </div>
      </section>

      <section className="extras" id="dicas">
        <div>
          <span className="step-label light">03 — ACOMPANHAMENTOS</span>
          <h2>Complete a mesa,<br /><em>na medida.</em></h2>
        </div>
        {result.extras.length ? (
          <div className="extra-grid">
            {result.extras.map((item) => (
              <Extra
                key={item.id}
                icon={item.icon}
                title={item.name}
                value={formatQty(item.qty, item.unit)}
                note={item.provided ? `${item.responsible || "Responsável a definir"} traz — não entra no rateio` : item.note}
              />
            ))}
          </div>
        ) : <p className="empty-extras">Nenhum acompanhamento selecionado. Volte à calculadora para montar sua mesa.</p>}
        <p className="tip">Dica da casa: compre as bebidas por último e confirme quantas pessoas realmente bebem álcool.</p>
      </section>

      <footer>
        <div className="brand footer-brand"><span className="brand-mark">BC</span><span>BRASA<br /><b>CERTA</b></span></div>
        <p>Feito para juntar gente.<br />Calculado para não desperdiçar.</p>
        <span>Estimativas para planejamento • 2026</span>
      </footer>
    </main>
  );
}

function Counter({ label, hint, value, minValue = 0, setValue, icon }: { label: string; hint: string; value: number; minValue?: number; setValue: (n: number) => void; icon: string }) {
  return (
    <div className="counter-card">
      <div className="counter-label"><span>{icon}</span><div><b>{label}</b><small>{hint}</small></div></div>
      <div className="counter">
        <button aria-label={`Diminuir ${label}`} onClick={() => setValue(Math.max(minValue, value - 1))}>−</button>
        <input aria-label={label} type="number" min={minValue} max="500" value={value} onChange={(e) => setValue(Math.max(minValue, Math.min(500, Number(e.target.value))))} />
        <button aria-label={`Aumentar ${label}`} onClick={() => setValue(Math.min(500, value + 1))}>+</button>
      </div>
    </div>
  );
}

function Extra({ icon, title, value, note }: { icon: string; title: string; value: string; note: string }) {
  return <article className="extra-card"><span>{icon}</span><div><small>{title}</small><b>{value}</b><p>{note}</p></div></article>;
}
