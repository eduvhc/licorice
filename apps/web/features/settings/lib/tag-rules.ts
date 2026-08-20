export type CategoryName =
  | "Bebida alcoólica"
  | "Outra bebida"
  | "Adoçante"
  | "Laticínio"
  | "Fruta"
  | "Especiaria"
  | "Café/Chá"
  | "Acessório"
  | "Outro"

export const ALL_CATEGORIES = [
  "Bebida alcoólica",
  "Outra bebida",
  "Adoçante",
  "Laticínio",
  "Fruta",
  "Especiaria",
  "Café/Chá",
  "Acessório",
  "Outro",
] as const satisfies readonly CategoryName[]

const ALCOHOL = [
  "vodka",
  "whiskey",
  "whisky",
  "aguardente",
  "cachaça",
  "cachaca",
  "gin",
  "rum",
  "tequila",
  "conhaque",
  "brandy",
  "vinho",
  "vermouth",
  "licor",
  "tiquira",
  "cointreau",
  "campari",
  "bourbon",
  "espumante",
  "champagne",
  "martini",
  "absinto",
  "anis",
  "cognac",
]

const OTHER_BEVERAGE = ["água", "agua", "sumo", "suco", "caldo"]

const SWEETENER = [
  "açúcar",
  "acucar",
  "açúcar mascavado",
  "açúcar branco",
  "mel",
  "geleia",
  "leite condensado",
  "calda",
  "golden syrup",
  "maple syrup",
]

const DAIRY = [
  "leite",
  "natas",
  "creme de leite",
  "iogurte",
  "leite de coco",
  "manteiga",
  "queijo",
]

const FRUIT = [
  "limão",
  "limao",
  "laranja",
  "maracujá",
  "maracuja",
  "abacaxi",
  "morango",
  "morango",
  "amora",
  "framboesa",
  "figo",
  "manga",
  "pêssego",
  "cereja",
  "uva",
  "maçã",
  "maca",
  "fruta",
]

const SPICE = [
  "canela",
  "baunilha",
  "erva doce",
  "erva-doce",
  "cacau",
  "cacau em pó",
  "cravo",
  "açafrão",
  "acafrao",
  "pimenta",
  "gengibre",
  "noz moscada",
  "anis estrelado",
  "louro",
  "hortelã",
  "menta",
  "sal",
]

const COFFEE_TEA = [
  "café",
  "cafe",
  "café espresso",
  "café moído",
  "cafe moido",
  "chá preto",
  "chá verde",
  "cha preto",
  "cha verde",
]

const ACCESSORY = ["garrafa", "tampa", "rótulo", "rotulo", "selo"]

function normalize(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

function matchesAny(name: string, needles: readonly string[]) {
  for (const needle of needles) {
    if (name.includes(needle)) {
      return true
    }
  }
  return false
}

export function categoryForItemName(name: string): CategoryName {
  const normalized = normalize(name)

  if (matchesAny(normalized, ALCOHOL)) return "Bebida alcoólica"
  if (matchesAny(normalized, FRUIT)) return "Fruta"
  if (matchesAny(normalized, SPICE)) return "Especiaria"
  if (matchesAny(normalized, COFFEE_TEA)) return "Café/Chá"
  if (matchesAny(normalized, SWEETENER)) return "Adoçante"
  if (matchesAny(normalized, DAIRY)) return "Laticínio"
  if (matchesAny(normalized, OTHER_BEVERAGE)) return "Outra bebida"
  if (matchesAny(normalized, ACCESSORY)) return "Acessório"

  return "Outro"
}

export function isCategoryName(value: string): value is CategoryName {
  return (ALL_CATEGORIES as readonly string[]).includes(value)
}
