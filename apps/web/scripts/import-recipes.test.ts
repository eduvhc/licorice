import { describe, expect, it } from "vitest"

import {
  parseIngredient,
  parseIngredientGroup,
  type ParsedIngredient,
} from "./import-recipes"

type SingleExpectation = {
  raw: string
  quantity: number
  unit: "ml" | "g" | "un"
  name: string
}

type GroupExpectation = {
  raw: string
  primary: SingleExpectation
  alternatives: SingleExpectation[]
}

const SINGLE_CASES: SingleExpectation[] = [
  // Licor Baileys Caseiro
  {
    raw: "1 lata de leite condensado",
    quantity: 395,
    unit: "g",
    name: "Leite Condensado",
  },
  { raw: "200 ml de natas", quantity: 200, unit: "ml", name: "Natas" },
  { raw: "100 ml de leite", quantity: 100, unit: "ml", name: "Leite" },
  {
    raw: "30 ml de café espresso",
    quantity: 30,
    unit: "ml",
    name: "Café Espresso",
  },
  {
    raw: "2 colh. sopa de cacau em pó",
    quantity: 30,
    unit: "g",
    name: "Cacau em Pó",
  },
  { raw: "1 colh. chá de baunilha", quantity: 5, unit: "ml", name: "Baunilha" },
  { raw: "250 ml de whiskey", quantity: 250, unit: "ml", name: "Whiskey" },

  // Licor Amaretto
  {
    raw: "200 gr de açúcar branco",
    quantity: 200,
    unit: "g",
    name: "Açúcar Branco",
  },
  {
    raw: "100 gr de açúcar mascavado",
    quantity: 100,
    unit: "g",
    name: "Açúcar Mascavado",
  },
  { raw: "250 ml de água", quantity: 250, unit: "ml", name: "Água" },
  { raw: "500 ml de vodka", quantity: 500, unit: "ml", name: "Vodka" },
  {
    raw: "1 col. de sopa de essência de baunilha",
    quantity: 15,
    unit: "ml",
    name: "Essência de Baunilha",
  },
  {
    raw: "1 col. de chá de essência concentrada de amêndoa",
    quantity: 5,
    unit: "ml",
    name: "Essência Concentrada de Amêndoa",
  },

  // Licor Baileys de Morango
  {
    raw: "1 lata de leite condensado",
    quantity: 395,
    unit: "g",
    name: "Leite Condensado",
  },
  { raw: "200 ml de natas", quantity: 200, unit: "ml", name: "Natas" },
  { raw: "200 ml de leite", quantity: 200, unit: "ml", name: "Leite" },
  { raw: "1 colh. chá de baunilha", quantity: 5, unit: "ml", name: "Baunilha" },
  {
    raw: "250 a 300 ml de whiskey",
    quantity: 250,
    unit: "ml",
    name: "Whiskey",
  },

  // Licor de Caramelo Salgado
  {
    raw: "1 lata de leite condensado cozido",
    quantity: 395,
    unit: "g",
    name: "Leite Condensado Cozido",
  },
  {
    raw: "1/2 col. chá de sal grosso",
    quantity: 2.5,
    unit: "g",
    name: "Sal Grosso",
  },
  { raw: "200 ml de leite", quantity: 200, unit: "ml", name: "Leite" },
  { raw: "200 ml de natas", quantity: 200, unit: "ml", name: "Natas" },
  {
    raw: "1 col. de chá de essência de baunilha",
    quantity: 5,
    unit: "ml",
    name: "Essência de Baunilha",
  },
  { raw: "300 ml de whiskey", quantity: 300, unit: "ml", name: "Whiskey" },

  // Licor de Café
  {
    raw: "200 gr de café moído (intensidade entre 8 e 12)",
    quantity: 200,
    unit: "g",
    name: "Café Moído (intensidade entre 8 e 12)",
  },
  {
    raw: "200 ml de água quente",
    quantity: 200,
    unit: "ml",
    name: "Água Quente",
  },
  { raw: "300 ml de vodka", quantity: 300, unit: "ml", name: "Vodka" },

  // Licor de Coco
  {
    raw: "400 ml de leite de coco",
    quantity: 400,
    unit: "ml",
    name: "Leite de Coco",
  },
  {
    raw: "1 lata de leite condensado",
    quantity: 395,
    unit: "g",
    name: "Leite Condensado",
  },
  { raw: "250 ml de vodka", quantity: 250, unit: "ml", name: "Vodka" },

  // Licor de Figo
  { raw: "500 gr de figos", quantity: 500, unit: "g", name: "Figos" },
  {
    raw: "150 gr de açúcar mascavado",
    quantity: 150,
    unit: "g",
    name: "Açúcar Mascavado",
  },
  { raw: "1 pau de canela", quantity: 1, unit: "un", name: "Canela" },
  {
    raw: "1 col. de sopa de aroma de baunilha",
    quantity: 15,
    unit: "ml",
    name: "Aroma de Baunilha",
  },
  { raw: "500 ml de vodka", quantity: 500, unit: "ml", name: "Vodka" },

  // Licor de Laranja
  {
    raw: "Cerca de 6 a 7 laranjas, só as cascas",
    quantity: 6,
    unit: "un",
    name: "Laranja",
  },
  { raw: "750 ml de vodka", quantity: 750, unit: "ml", name: "Vodka" },
  { raw: "400 gr de açúcar", quantity: 400, unit: "g", name: "Açúcar" },
  { raw: "400 ml de água", quantity: 400, unit: "ml", name: "Água" },

  // Licor de Lotus Biscoff
  { raw: "250 ml de leite", quantity: 250, unit: "ml", name: "Leite" },
  {
    raw: "200 gr de Lotus Biscoff creme",
    quantity: 200,
    unit: "g",
    name: "Lotus Biscoff Creme",
  },
  { raw: "200 ml de natas", quantity: 200, unit: "ml", name: "Natas" },
  {
    raw: "1 lata de leite condensado",
    quantity: 395,
    unit: "g",
    name: "Leite Condensado",
  },
  { raw: "250 a 300 ml de vodka", quantity: 250, unit: "ml", name: "Vodka" },

  // Licor de Limão (Limoncello)
  { raw: "Cascas de 5 limões", quantity: 5, unit: "un", name: "Limão" },
  { raw: "500 ml de vodka", quantity: 500, unit: "ml", name: "Vodka" },
  { raw: "500 ml de água", quantity: 500, unit: "ml", name: "Água" },
  { raw: "400 gr de açúcar", quantity: 400, unit: "g", name: "Açúcar" },

  // Licor de Morango
  { raw: "250 gr de morangos", quantity: 250, unit: "g", name: "Morangos" },
  { raw: "400 ml de vodka", quantity: 400, unit: "ml", name: "Vodka" },
  { raw: "200 gr de açúcar", quantity: 200, unit: "g", name: "Açúcar" },
  { raw: "250 gr de água", quantity: 250, unit: "ml", name: "Água" },

  // Licor de Menta
  {
    raw: "100 gr de folhas de menta fresca",
    quantity: 100,
    unit: "g",
    name: "Folhas de Menta Fresca",
  },
  {
    raw: "3 estrelas de anis (opcional)",
    quantity: 3,
    unit: "un",
    name: "Anis",
  },
  { raw: "500 ml de vodka", quantity: 500, unit: "ml", name: "Vodka" },
  { raw: "250 gr de açúcar", quantity: 250, unit: "g", name: "Açúcar" },
  { raw: "250 gr de água", quantity: 250, unit: "ml", name: "Água" },
  {
    raw: "Corante alimentar verde (opcional)",
    quantity: 1,
    unit: "un",
    name: "Corante Alimentar Verde",
  },

  // Licor de Mel
  { raw: "200 ml de mel", quantity: 200, unit: "ml", name: "Mel" },
  { raw: "200 ml de água", quantity: 200, unit: "ml", name: "Água" },
  { raw: "3 paus de canela", quantity: 3, unit: "un", name: "Canela" },
  {
    raw: "1 col. de sopa de erva doce",
    quantity: 15,
    unit: "g",
    name: "Erva Doce",
  },
  { raw: "400 ml de whiskey", quantity: 400, unit: "ml", name: "Whiskey" },

  // Licor de Nutella
  { raw: "300 ml de leite", quantity: 300, unit: "ml", name: "Leite" },
  { raw: "280 gr de nutella", quantity: 280, unit: "g", name: "Nutella" },
  { raw: "200 gr de natas", quantity: 200, unit: "ml", name: "Natas" },
  { raw: "50 gr de açúcar", quantity: 50, unit: "g", name: "Açúcar" },
  { raw: "120 ml de vodka", quantity: 120, unit: "ml", name: "Vodka" },

  // Licor de Pastel de Nata
  {
    raw: "2 colheres de açúcar mascavado",
    quantity: 30,
    unit: "g",
    name: "Açúcar Mascavado",
  },
  { raw: "2 paus de canela", quantity: 2, unit: "un", name: "Canela" },
  { raw: "Casca de 1 limão", quantity: 1, unit: "un", name: "Limão" },
  { raw: "Casca de 1 laranja", quantity: 1, unit: "un", name: "Laranja" },
  { raw: "120 ml de água", quantity: 120, unit: "ml", name: "Água" },
  {
    raw: "1 lata de leite condensado",
    quantity: 395,
    unit: "g",
    name: "Leite Condensado",
  },
  {
    raw: "1 medida da lata de leite",
    quantity: 400,
    unit: "ml",
    name: "Leite",
  },
  {
    raw: "1 colher de chá de extrato de baunilha",
    quantity: 5,
    unit: "ml",
    name: "Extrato de Baunilha",
  },
]

const GROUP_CASES: GroupExpectation[] = [
  {
    raw: "200 gr de açúcar (branco ou mascavado)",
    primary: { raw: "", quantity: 200, unit: "g", name: "Açúcar Branco" },
    alternatives: [
      { raw: "", quantity: 200, unit: "g", name: "Açúcar Mascavado" },
    ],
  },
  {
    raw: "250 ml de vodka ou aguardente",
    primary: { raw: "", quantity: 250, unit: "ml", name: "Vodka" },
    alternatives: [{ raw: "", quantity: 250, unit: "ml", name: "Aguardente" }],
  },
  {
    raw: "1 e meia chávena de morangos frescos ou 80 a 100 ml de geleia, topping ou doce de morango",
    primary: { raw: "", quantity: 270, unit: "g", name: "Morangos Frescos" },
    alternatives: [
      { raw: "", quantity: 80, unit: "ml", name: "Geleia" },
      { raw: "", quantity: 80, unit: "ml", name: "Topping" },
      { raw: "", quantity: 80, unit: "ml", name: "Doce de Morango" },
    ],
  },
]

function expectStrict(ing: ParsedIngredient, expected: SingleExpectation) {
  expect(ing.quantity).toBe(expected.quantity)
  expect(ing.unit).toBe(expected.unit)
  expect(ing.name).toBe(expected.name)
}

describe("parseIngredient", () => {
  it.each(SINGLE_CASES)(
    "parses single ingredient: $raw → $quantity $unit $name",
    (expected) => {
      const parsed = parseIngredient(expected.raw)
      expectStrict(parsed, expected)
    }
  )
})

describe("parseIngredientGroup", () => {
  it.each(GROUP_CASES)("parses group: $raw", (expected) => {
    const parsed = parseIngredientGroup(expected.raw)

    expectStrict(parsed.primary, expected.primary)

    expect(parsed.alternatives).toHaveLength(expected.alternatives.length)
    for (const [index, alternative] of expected.alternatives.entries()) {
      expectStrict(parsed.alternatives[index]!, alternative)
    }
  })

  it("single-line ingredients have no alternatives", () => {
    const parsed = parseIngredientGroup("250 ml de vodka")
    expect(parsed.primary).toEqual({ quantity: 250, unit: "ml", name: "Vodka" })
    expect(parsed.alternatives).toEqual([])
  })
})
