"use client";

import { useMemo, useState } from "react";

type Meat = {
  id: string;
  name: string;
  note: string;
  price: number;
  share: number;
  color: string;
  source: string;
};

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
  { id: "linguica", name: "Linguiça toscana", note: "Swift 700 g", price: 27, share: .88, color: "#d79550", source: "https://www.swift.com.br/churrasco-swift" },
  { id: "coracao", name: "Coração de frango", note: "Swift 1 kg", price: 32.9, share: .76, color: "#6c3029", source: "https://www.swift.com.br/coracao%20de%20frango%20pre%C3%A7o" },
  { id: "panceta", name: "Panceta em espetinho", note: "Swift 500 g", price: 39.8, share: .82, color: "#d8896d", source: "https://www.swift.com.br/costelinha%20su%C3%ADna" },
  { id: "frango", name: "Coxa e sobrecoxa", note: "Swift temperada", price: 22.9, share: .9, color: "#d8a05f", source: "https://www.swift.com.br/churrasco-swift" },
];

const periods = {
  almoco: { label: "Só almoço", sub: "3–4 horas", adult: .4, child: .22 },
  jantar: { label: "Só jantar", sub: "3–4 horas", adult: .38, child: .21 },
  inteiro: { label: "Dia inteiro", sub: "6–8 horas", adult: .65, child: .35 },
};

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const number = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 });

export default function Home() {
  const [adults, setAdults] = useState(12);
  const [children, setChildren] = useState(4);
  const [period, setPeriod] = useState<keyof typeof periods>("almoco");
  const [selected, setSelected] = useState(["picanha-legado", "fraldinha-legado", "linguica", "costelinha-suina"]);
  const [meatMenuOpen, setMeatMenuOpen] = useState(false);
  const [meatSearch, setMeatSearch] = useState("");
  const [reserve, setReserve] = useState(true);

  const result = useMemo(() => {
    const p = periods[period];
    const base = adults * p.adult + children * p.child;
    const total = base * (reserve ? 1.1 : 1);
    const chosen = meats.filter((m) => selected.includes(m.id));
    const shares = chosen.reduce((sum, m) => sum + m.share, 0);
    const rows = chosen.map((m) => {
      const kg = total * (m.share / shares);
      return { ...m, kg, cost: kg * m.price };
    });
    const cost = rows.reduce((sum, row) => sum + row.cost, 0);
    const guests = adults + children;
    const extras = [
      { name: "Pão de alho", qty: Math.max(1, Math.ceil(guests * 1.5 / 6)), unit: "pct. 300 g", price: 11.9 },
      { name: "Queijo coalho", qty: Math.max(1, Math.ceil(guests / 8)), unit: "pct.", price: 28.9 },
      { name: "Carvão", qty: Math.max(1, Math.ceil(guests / 10)), unit: "pct. 4 kg", price: 34.9 },
      { name: "Panceta", qty: Math.max(1, Math.ceil(guests / 10)), unit: "pct. 500 g", price: 19.9 },
    ].map((item) => ({ ...item, cost: item.qty * item.price }));
    const extrasCost = extras.reduce((sum, item) => sum + item.cost, 0);
    const grandTotal = cost + extrasCost;
    return { total, rows, cost, guests, extras, extrasCost, grandTotal, perPerson: guests ? grandTotal / guests : 0 };
  }, [adults, children, period, reserve, selected]);

  function toggleMeat(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.length === 1 ? current : current.filter((item) => item !== id)
        : [...current, id]
    );
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
      </section>

      <section className="calculator-section" id="calculadora">
        <div className="section-intro">
          <span className="step-label">01 — MONTE SEU CHURRASCO</span>
          <h2>Conte pra gente<br />como vai ser.</h2>
        </div>

        <div className="calculator-grid">
          <div className="form-panel">
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
                  <span><b>{selected.length} carnes selecionadas</b><small>Legado, Gran Reserva, suínos, aves e linguiças</small></span>
                  <i>{meatMenuOpen ? "−" : "+"}</i>
                </button>
                {meatMenuOpen && (
                  <div className="combo-menu">
                    <input autoFocus type="search" value={meatSearch} onChange={(e) => setMeatSearch(e.target.value)} placeholder="Buscar carne ou linha..." aria-label="Buscar carne" />
                    <div className="combo-options">
                      {meats.filter((meat) => `${meat.name} ${meat.note}`.toLowerCase().includes(meatSearch.toLowerCase())).map((meat) => {
                        const active = selected.includes(meat.id);
                        return (
                          <button key={meat.id} onClick={() => toggleMeat(meat.id)} className={active ? "active" : ""}>
                            <span className="meat-swatch" style={{ background: meat.color }} aria-hidden="true" />
                            <span><b>{meat.name}</b><small>{meat.note} · {money.format(meat.price)}/kg</small></span>
                            <i>{active ? "✓" : "+"}</i>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="selected-meats">
                {meats.filter((meat) => selected.includes(meat.id)).map((meat) => {
                  const active = selected.includes(meat.id);
                  return (
                    <button key={meat.id} onClick={() => toggleMeat(meat.id)} className={`meat-card ${active ? "active" : ""}`}>
                      <span className="meat-swatch" style={{ background: meat.color }} aria-hidden="true" />
                      <span><b>{meat.name}</b><small>{meat.note}</small></span>
                      <i>{active ? "✓" : "+"}</i>
                    </button>
                  );
                })}
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
                  <p><b>{item.name}</b><small>{item.qty} {item.unit} × {money.format(item.price)}</small></p>
                  <strong>{money.format(item.cost)}</strong>
                </div>
              ))}
            </div>
            <div className="cost-box">
              <p className="cost-line"><span>Carnes</span><b>{money.format(result.cost)}</b></p>
              <p className="cost-line"><span>Outros itens</span><b>{money.format(result.extrasCost)}</b></p>
              <div><span>Total estimado</span><strong>{money.format(result.grandTotal)}</strong></div>
              <p>{money.format(result.perPerson)} por convidado no rateio</p>
            </div>
            <a className="swift-link" href="https://www.swift.com.br/swift-legado" target="_blank" rel="noreferrer">
              Conferir linha Legado <span>↗</span>
            </a>
            <p className="price-note">Preços de referência consultados em 28/07/2026. Podem variar por CEP, estoque e promoções.</p>
          </aside>
        </div>
      </section>

      <section className="extras" id="dicas">
        <div>
          <span className="step-label light">02 — ACOMPANHAMENTOS</span>
          <h2>Complete a mesa,<br /><em>na medida.</em></h2>
        </div>
        <div className="extra-grid">
          <Extra icon="🥖" title="Pão de alho" value={`${Math.ceil(result.guests * 1.5)} unidades`} note="1 a 2 por pessoa" />
          <Extra icon="🍚" title="Arroz cru" value={`${number.format(result.guests * .06)} kg`} note="Cerca de 60 g por pessoa" />
          <Extra icon="🍅" title="Vinagrete" value={`${number.format(result.guests * .08)} kg`} note="Cerca de 80 g por pessoa" />
          <Extra icon="🥕" title="Legumes na brasa" value={`${number.format(result.guests * .1)} kg`} note="Abobrinha, cebola e pimentão" />
          <Extra icon="🥣" title="Farofa" value={`${number.format(result.guests * .04)} kg`} note="Cerca de 40 g por pessoa" />
          <Extra icon="🥤" title="Bebidas" value={`${number.format(result.guests * (period === "inteiro" ? 1.8 : 1.2))} litros`} note="Água e refrigerante" />
          <Extra icon="🧊" title="Gelo" value={`${Math.ceil(result.guests / 5) * 5} kg`} note="Consumo + conservação" />
          <Extra icon="🧂" title="Sal grosso" value={`${Math.max(1, Math.ceil(result.total / 8))} pacote(s)`} note="Pacotes de 1 kg" />
        </div>
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
