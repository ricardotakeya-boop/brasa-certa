import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { calculateFamilyRate } from "../app/family-rate.ts";

test("groups adults and children by family and keeps unnamed guests visible", () => {
  const result = calculateFamilyRate({
    adults: 4,
    children: 2,
    perAdult: 25,
    perChild: 12.5,
    guests: [
      { id: "1", name: "Mari", family: "Família Mari", type: "adult" },
      { id: "2", name: "André", family: "Família Mari", type: "adult" },
      { id: "3", name: "Hully", family: "Família Mari", type: "child" },
      { id: "4", name: "Rosa", family: "Família Rosa", type: "adult" },
    ],
  });

  assert.equal(result.familyCharges.length, 3);
  assert.deepEqual(result.familyCharges[0], {
    family: "Família Mari",
    members: ["Mari", "André", "Hully"],
    total: 62.5,
  });
  assert.deepEqual(result.familyCharges[1], {
    family: "Família Rosa",
    members: ["Rosa"],
    total: 25,
  });
  assert.deepEqual(result.familyCharges[2], {
    family: "Convidados ainda não nomeados",
    members: ["1 adulto(s)", "1 criança(s)"],
    total: 37.5,
  });
});

test("does not charge children when the child rate is disabled", () => {
  const result = calculateFamilyRate({
    adults: 1,
    children: 1,
    perAdult: 80,
    perChild: 0,
    guests: [
      { id: "1", name: "Arthur", family: "Família Arthur", type: "adult" },
      { id: "2", name: "Bia", family: "Família Arthur", type: "child" },
    ],
  });

  assert.equal(result.familyCharges[0].total, 80);
  assert.equal(result.guestCharges[1].amount, 0);
});

test("builds the public GitHub Pages version with the guest list feature", async () => {
  const [html, page, css] = await Promise.all([
    readFile(new URL("../dist-pages/index.html", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(html, /<title>Brasa Certa — Calculadora de Churrasco<\/title>/);
  assert.match(html, /\/brasa-certa\/assets\/index-/);
  assert.match(page, /Nomear convidados e famílias/);
  assert.match(page, /RATEIO POR FAMÍLIA/);
  assert.match(page, /section\("CONVIDADOS"\)/);
  assert.match(page, /<h2>Quanto ficou por pessoa<\/h2>/);
  assert.match(page, /PDF pré-evento/);
  assert.match(page, /PDF prestação de contas/);
  assert.match(page, /Cada família deve levar sua própria bebida/);
  assert.match(page, /O que será comprado/);
  assert.match(page, /Quanto ficou por pessoa/);
  assert.match(page, /Quanto ficou por família ou grupo/);
  assert.match(css, /\.guest-add-grid/);
  assert.match(css, /\.family-breakdown/);
  assert.match(css, /\.print-report\.active-print/);
});
