"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
type StoredCustomAccompaniment = Omit<Accompaniment, "quantity"> & { baseQty: number };
type SavedBarbecue = {
  id: string;
  name: string;
  eventDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  adults: number;
  children: number;
  period: "almoco" | "jantar" | "inteiro";
  reserve: boolean;
  selected: string[];
  selectedAccompaniments: string[];
  customMeats: Meat[];
  customAccompaniments: StoredCustomAccompaniment[];
  meatEdits: Record<string, ItemEdit>;
  accompanimentEdits: Record<string, ItemEdit>;
  summary: { guests: number; grandTotal: number; perPerson: number };
};
type MeatCategory = "Bovinos" | "Suínos" | "Frangos";

const STORAGE_KEY = "brasa-certa:churrascos:v1";

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
  { id: "pao-alho", name: "Pão de alho", category: "Tradicionais", icon: "🥖", note: "1 a 2 por pessoa", unit: "un.", price: 1.98, quantity: (g) => Math.ceil(g * 1.5) },
  { id: "arroz", name: "Arroz", category: "Tradicionais", icon: "🍚", note: "60 g por pessoa", unit: "kg", price: 8.5, quantity: (g) => g * .06 },
  { id: "farofa", name: "Farofa", category: "Tradicionais", icon: "🥣", note: "40 g por pessoa", unit: "kg", price: 21.9, quantity: (g) => g * .04 },
  { id: "queijo", name: "Queijo coalho", category: "Tradicionais", icon: "🧀", note: "2 espetos por pessoa", unit: "kg", price: 54.9, quantity: (g) => g * .08 },
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
const formatQty = (qty: number, unit: string) => `${unit === "un." || unit === "pct." ? Math.ceil(qty) : number.format(qty)} ${unit}`;

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
  const [newMeat, setNewMeat] = useState({ name: "", category: "Bovinos" as MeatCategory, qty: "", price: "" });
  const [newAccompaniment, setNewAccompaniment] = useState({ name: "", category: "Tradicionais" as Accompaniment["category"], unit: "kg", qty: "", price: "" });
  const [reserve, setReserve] = useState(true);
  const [eventName, setEventName] = useState("Churrasco em família");
  const [eventDate, setEventDate] = useState("");
  const [eventNotes, setEventNotes] = useState("");
  const [savedBarbecues, setSavedBarbecues] = useState<SavedBarbecue[]>([]);
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null);
  const [storageStatus, setStorageStatus] = useState("");
  const backupInputRef = useRef<HTMLInputElement>(null);
  const allMeats = useMemo(() => [...meats, ...customMeats], [customMeats]);
  const allAccompaniments = useMemo(() => [...accompaniments, ...customAccompaniments], [customAccompaniments]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) setSavedBarbecues(JSON.parse(stored));
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
    const guests = adults + children;
    const extras = allAccompaniments
      .filter((item) => selectedAccompaniments.includes(item.id))
      .map((item) => {
        const suggestedQty = item.quantity(guests, period === "inteiro", total);
        const qty = accompanimentEdits[item.id]?.qty ?? suggestedQty;
        const price = accompanimentEdits[item.id]?.price ?? item.price;
        return { ...item, qty, price, cost: qty * price };
      });
    const extrasCost = extras.reduce((sum, item) => sum + item.cost, 0);
    const grandTotal = cost + extrasCost;
    const actualMeatKg = rows.reduce((sum, row) => sum + row.kg, 0);
    return { total: actualMeatKg, suggestedTotal: total, rows, cost, guests, extras, extrasCost, grandTotal, perPerson: guests ? grandTotal / guests : 0 };
  }, [adults, children, period, reserve, selected, selectedAccompaniments, allMeats, allAccompaniments, meatEdits, accompanimentEdits]);

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
      id,
      name: eventName.trim() || fallbackName,
      eventDate,
      notes: eventNotes.trim(),
      createdAt,
      updatedAt: new Date().toISOString(),
      adults,
      children,
      period,
      reserve,
      selected: [...selected],
      selectedAccompaniments: [...selectedAccompaniments],
      customMeats,
      customAccompaniments: storedCustomAccompaniments,
      meatEdits,
      accompanimentEdits,
      summary: { guests: result.guests, grandTotal: result.grandTotal, perPerson: result.perPerson },
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
    }
  }

  function openBarbecue(record: SavedBarbecue) {
    setEventName(record.name);
    setEventDate(record.eventDate);
    setEventNotes(record.notes);
    setAdults(record.adults);
    setChildren(record.children);
    setPeriod(record.period);
    setReserve(record.reserve);
    setSelected(record.selected);
    setSelectedAccompaniments(record.selectedAccompaniments);
    setCustomMeats(record.customMeats);
    setCustomAccompaniments(record.customAccompaniments.map(({ baseQty, ...item }) => ({
      ...item,
      quantity: () => baseQty,
    })));
    setMeatEdits(record.meatEdits);
    setAccompanimentEdits(record.accompanimentEdits);
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
      const imported = data.churrascos as SavedBarbecue[];
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

  function exportExcel() {
    const decimal = (value: number) => value.toFixed(2).replace(".", ",");
    const rows: Array<Array<string | number>> = [
      ["BRASA CERTA — PLANO DE CHURRASCO"],
      ["Convidados", result.guests],
      ["Período", periods[period].label],
      ["Margem de segurança", reserve ? "10%" : "Sem margem"],
      [],
      ["PROTEÍNAS"],
      ["Item", "Categoria", "Quantidade (kg)", "Valor por kg", "Subtotal"],
      ...result.rows.map((item) => [item.name, meatCategory(item.id), decimal(item.kg), decimal(item.price), decimal(item.cost)]),
      [],
      ["ACOMPANHAMENTOS"],
      ["Item", "Categoria", "Quantidade", "Unidade", "Valor unitário", "Subtotal"],
      ...result.extras.map((item) => [item.name, item.category, decimal(item.qty), item.unit, decimal(item.price), decimal(item.cost)]),
      [],
      ["RESUMO"],
      ["Total de proteínas", decimal(result.cost)],
      ["Total de acompanhamentos", decimal(result.extrasCost)],
      ["Total estimado", decimal(result.grandTotal)],
      ["Valor estimado por pessoa", decimal(result.perPerson)],
    ];
    const csv = "\uFEFFsep=;\r\n" + rows.map((row) =>
      row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(";")
    ).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "brasa-certa-plano.csv";
    link.click();
    URL.revokeObjectURL(url);
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
          <img src="/mestre-da-brasa.png" alt="Mestre churrasqueiro do Brasa Certa" />
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
                <span className="step-label">IDENTIFICAÇÃO</span>
                <h3>Dê um nome ao seu churrasco</h3>
                <p>Essas informações ajudam a encontrar o planejamento depois.</p>
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
            </div>
            <fieldset>
              <legend><span>1</span> Quantas pessoas?</legend>
              <div className="people-grid">
                <Counter label="Adultos" hint="A partir de 13 anos" value={adults} setValue={setAdults} icon="♟" />
                <Counter label="Crianças" hint="De 5 a 12 anos" value={children} setValue={setChildren} icon="♟" />
              </div>
              <p className="tiny-note">Crianças de até 4 anos não entram no cálculo.</p>
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
                <div className="editable-head"><span>Acompanhamento</span><span>Quantidade</span><span>Valor unitário</span><span /></div>
                {result.extras.map((item) => (
                  <div className="editable-row" key={item.id}>
                    <div className="editable-name"><span className="companion-icon">{item.icon}</span><span><b>{item.name}</b><small>{item.category}</small></span></div>
                    <label><small>Qtd. ({item.unit})</small><input type="number" min="0" step=".1" value={Number(item.qty.toFixed(2))} onChange={(e) => updateAccompaniment(item.id, "qty", Number(e.target.value))} /></label>
                    <label><small>R$ por {item.unit}</small><input type="number" min="0" step=".01" value={item.price} onChange={(e) => updateAccompaniment(item.id, "price", Number(e.target.value))} /></label>
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
                  <p><b>{item.name}</b><small>{formatQty(item.qty, item.unit)} × {money.format(item.price)}</small></p>
                  <strong>{money.format(item.cost)}</strong>
                </div>
              ))}
            </div>
            <div className="cost-box">
              <p className="cost-line"><span>Carnes</span><b>{money.format(result.cost)}</b></p>
              <p className="cost-line"><span>Outros itens</span><b>{money.format(result.extrasCost)}</b></p>
              <div><span>Total estimado</span><strong>{money.format(result.grandTotal)}</strong></div>
            </div>
            <div className="per-person-total">
              <span>VALOR ESTIMADO POR PESSOA</span>
              <strong>{money.format(result.perPerson)}</strong>
              <small>Rateio entre {result.guests || 0} convidados</small>
            </div>
            <button className="save-plan-button" onClick={saveBarbecue}>
              <span>＋</span> {activeSavedId ? "Salvar alterações" : "Salvar churrasco"}
            </button>
            {storageStatus && <p className="storage-status" role="status">{storageStatus}</p>}
            <div className="export-actions">
              <button onClick={() => window.print()}><span>▣</span> Salvar em PDF</button>
              <button onClick={exportExcel}><span>▦</span> Baixar Excel</button>
            </div>
            <a className="swift-link" href="https://www.swift.com.br/swift-legado" target="_blank" rel="noreferrer">
              Conferir linha Legado <span>↗</span>
            </a>
            <p className="price-note">Preços de referência consultados em 28/07/2026. Podem variar por CEP, estoque e promoções.</p>
          </aside>
          <section className="print-report">
            <header>
              <span>BRASA CERTA</span>
              <h1>Plano de churrasco</h1>
              <p>{result.guests} convidados · {periods[period].label} · {reserve ? "com 10% de margem" : "sem margem"}</p>
            </header>
            <h2>Proteínas</h2>
            <table>
              <thead><tr><th>Item</th><th>Categoria</th><th>Quantidade</th><th>R$/kg</th><th>Subtotal</th></tr></thead>
              <tbody>{result.rows.map((item) => <tr key={item.id}><td>{item.name}</td><td>{meatCategory(item.id)}</td><td>{number.format(item.kg)} kg</td><td>{money.format(item.price)}</td><td>{money.format(item.cost)}</td></tr>)}</tbody>
            </table>
            <h2>Acompanhamentos</h2>
            <table>
              <thead><tr><th>Item</th><th>Categoria</th><th>Quantidade</th><th>Valor unitário</th><th>Subtotal</th></tr></thead>
              <tbody>{result.extras.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.category}</td><td>{formatQty(item.qty, item.unit)}</td><td>{money.format(item.price)}</td><td>{money.format(item.cost)}</td></tr>)}</tbody>
            </table>
            <div className="print-totals">
              <p><span>Proteínas</span><b>{money.format(result.cost)}</b></p>
              <p><span>Acompanhamentos</span><b>{money.format(result.extrasCost)}</b></p>
              <p><span>Total estimado</span><b>{money.format(result.grandTotal)}</b></p>
              <strong><span>Valor por pessoa</span>{money.format(result.perPerson)}</strong>
            </div>
            <footer>Estimativa para planejamento. Preços e quantidades podem ser ajustados na calculadora.</footer>
          </section>
        </div>
      </section>

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
                    <span><small>Por pessoa</small><strong>{money.format(record.summary.perPerson)}</strong></span>
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
              <Extra key={item.id} icon={item.icon} title={item.name} value={formatQty(item.qty, item.unit)} note={item.note} />
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

function Counter({ label, hint, value, setValue, icon }: { label: string; hint: string; value: number; setValue: (n: number) => void; icon: string }) {
  return (
    <div className="counter-card">
      <div className="counter-label"><span>{icon}</span><div><b>{label}</b><small>{hint}</small></div></div>
      <div className="counter">
        <button aria-label={`Diminuir ${label}`} onClick={() => setValue(Math.max(0, value - 1))}>−</button>
        <input aria-label={label} type="number" min="0" max="500" value={value} onChange={(e) => setValue(Math.max(0, Math.min(500, Number(e.target.value))))} />
        <button aria-label={`Aumentar ${label}`} onClick={() => setValue(Math.min(500, value + 1))}>+</button>
      </div>
    </div>
  );
}

function Extra({ icon, title, value, note }: { icon: string; title: string; value: string; note: string }) {
  return <article className="extra-card"><span>{icon}</span><div><small>{title}</small><b>{value}</b><p>{note}</p></div></article>;
}
