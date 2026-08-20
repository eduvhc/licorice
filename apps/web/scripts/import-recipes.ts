export type ParsedIngredient = {
  quantity: number
  unit: "ml" | "g" | "un"
  name: string
}

export type ParsedIngredientGroup = {
  primary: ParsedIngredient
  alternatives: ParsedIngredient[]
}

type KitchenToken = {
  re: RegExp
  gFactor: number
  mlFactor?: number
  discrete?: boolean
}

type VolumeWeightToken = {
  re: RegExp
  base: "ml" | "g"
  factor: number
}

const KITCHEN_TOKENS: KitchenToken[] = [
  { re: /^medida\s+da\s+lata\b/i, gFactor: 400, mlFactor: 400 },
  { re: /^medida\b/i, gFactor: 400, mlFactor: 400 },
  { re: /^colh[.\s]*(?:de\s+)?sopa\b/i, gFactor: 15, mlFactor: 15 },
  { re: /^colh[.\s]*(?:de\s+)?ch[áa]/i, gFactor: 5, mlFactor: 5 },
  { re: /^col\.?\s+ch[áa]/i, gFactor: 5, mlFactor: 5 },
  { re: /^col\.?\s+de\s+sopa\b/i, gFactor: 15, mlFactor: 15 },
  { re: /^col\.?\s+de\s+ch[áa]/i, gFactor: 5, mlFactor: 5 },
  { re: /^colher(?:es)?\s+de\s+sopa\b/i, gFactor: 15, mlFactor: 15 },
  { re: /^colher(?:es)?\s+de\s+ch[áa]/i, gFactor: 5, mlFactor: 5 },
  { re: /^colher(?:es)?\b/i, gFactor: 15, mlFactor: 15 },
  { re: /^ch[áa]vena(?:s)?\b/i, gFactor: 180, mlFactor: 250 },
  { re: /^lata(?:s)?\b/i, gFactor: 395 },
  { re: /^pau(?:s)?\b/i, gFactor: 1, discrete: true },
  { re: /^estrela(?:s)?\b/i, gFactor: 1, discrete: true },
  { re: /^unidade(?:s)?\b/i, gFactor: 1, discrete: true },
  { re: /^un\b/i, gFactor: 1, discrete: true },
]

const VOLUME_WEIGHT_TOKENS: VolumeWeightToken[] = [
  { re: /^ml\b/i, base: "ml", factor: 1 },
  { re: /^cl\b/i, base: "ml", factor: 10 },
  { re: /^litro(?:s)?\b/i, base: "ml", factor: 1000 },
  { re: /^l\b/i, base: "ml", factor: 1000 },
  { re: /^kg\b/i, base: "g", factor: 1000 },
  { re: /^grama(?:s)?\b/i, base: "g", factor: 1 },
  { re: /^gr\b/i, base: "g", factor: 1 },
  { re: /^g\b/i, base: "g", factor: 1 },
]

const LIQUID_WORDS = new Set([
  "essência",
  "essencia",
  "aroma",
  "extrato",
  "baunilha",
  "amêndoa",
  "amendoa",
  "leite",
  "natas",
  "água",
  "agua",
  "mel",
  "sumo",
  "calda",
  "café",
  "cafe",
  "corante",
  "óleo",
  "oleo",
])

const WEIGHT_AS_VOLUME_WORDS = new Set([
  "natas",
  "leite",
  "água",
  "agua",
  "mel",
  "sumo",
])

const SMALL_WORDS = new Set([
  "de",
  "em",
  "ou",
  "e",
  "a",
  "o",
  "do",
  "da",
  "dos",
  "das",
  "com",
  "por",
  "para",
  "entre",
])

const SINGULARIZE: Record<string, string> = {
  laranjas: "Laranja",
  limões: "Limão",
  limoes: "Limão",
  limão: "Limão",
  limao: "Limão",
  laranja: "Laranja",
}

function titleCase(text: string) {
  return text
    .split(/\s+/)
    .map((word) => {
      const lower = word.toLowerCase()
      return SMALL_WORDS.has(lower)
        ? lower
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(" ")
}

function firstWord(text: string) {
  return text.toLowerCase().split(/\s+/)[0] ?? ""
}

function stripLeadingDe(text: string) {
  return text
    .trim()
    .replace(/^de\s+/i, "")
    .trim()
}

function cleanName(raw: string, singularize = false) {
  let name = raw
    .replace(/^,?\s*s[oó]\s+as\s+cascas\s*,?$/i, "")
    .replace(/,\s*s[oó]\s+as\s+cascas$/i, "")
    .trim()

  name = titleCase(name)

  if (singularize && SINGULARIZE[name.toLowerCase()]) {
    name = SINGULARIZE[name.toLowerCase()]!
  }

  return name
}

function splitOnAlternatives(text: string): string[] | null {
  // 1. Parenthetical "base (qual1 ou qual2, qual3)" form. Each qualifier is
  //    combined with the base; the bare base alone is intentionally not part of
  //    the alt group — it is informational, not a usable substitution.
  const paren = text.match(/^(.+?)\s*\(([^()]*?\bou\b[^()]*)\)\s*$/i)
  if (paren) {
    const base = paren[1]!.trim()
    const inner = paren[2]!.trim()
    const qualifiers = inner
      .split(/\s+ou\s+|\s*,\s+/i)
      .map((segment) => segment.trim())
      .filter(Boolean)
    return qualifiers.map((qualifier) => `${base} ${qualifier}`)
  }

  // 2. Top-level "X ou Y [ou Z,...]" → split on " ou " or comma-chain. Each
  //    segment is parsed individually; bare-name segments inherit quantity
  //    from the previous quantified segment in the group.
  if (/\s+ou\s+/i.test(text) || /,\s+\S+/i.test(text)) {
    return text
      .split(/\s+ou\s+|\s*,\s+/i)
      .map((segment) => segment.trim())
      .filter(Boolean)
  }

  return null
}

function parseQuantity(text: string): { quantity: number; rest: string } {
  if (/^meia\b/i.test(text)) {
    return { quantity: 0.5, rest: text.replace(/^meia\b/i, "").trim() }
  }

  const eMeia = text.match(/^(\d+(?:[.,]\d+)?)\s*e\s+meia\b/i)
  if (eMeia) {
    return {
      quantity: Number(eMeia[1]!.replace(",", ".")) + 0.5,
      rest: text.slice(eMeia[0].length).trim(),
    }
  }

  const fraction = text.match(/^(\d+)\s*\/\s*(\d+)\b/i)
  if (fraction) {
    return {
      quantity: Number(fraction[1]) / Number(fraction[2]),
      rest: text.slice(fraction[0].length).trim(),
    }
  }

  const number = text.match(/^(\d+(?:[.,]\d+)?)/)
  if (number) {
    let rest = text.slice(number[0].length).trim()
    const range = rest.match(/^a\s+\d+(?:[.,]\d+)?/i)
    if (range) {
      rest = rest.slice(range[0].length).trim()
    }
    return { quantity: Number(number[1]!.replace(",", ".")), rest }
  }

  return { quantity: 1, rest: text.trim() }
}

function parseSingleIngredient(raw: string): ParsedIngredient {
  const text = raw
    .trim()
    .replace(/\s*\(opcional\)\s*$/i, "")
    .replace(/^cerca\s+de\s*/i, "")
    .trim()

  const peel = text.match(
    /^cascas?\s+de\s+(\d+)(?:\s*a\s+\d+)?\s*(lim[aãõo]es?|lim[aã]o|limao|laranjas?)\b/i
  )
  if (peel) {
    return {
      quantity: Number(peel[1]),
      unit: "un",
      name: /^lim/i.test(peel[2]!) ? "Limão" : "Laranja",
    }
  }

  const { quantity, rest } = parseQuantity(text)

  for (const token of KITCHEN_TOKENS) {
    const match = token.re.exec(rest)
    if (!match) continue

    const name = stripLeadingDe(rest.slice(match[0].length))

    if (token.discrete) {
      return { quantity, unit: "un", name: cleanName(name, true) }
    }

    const liquid = LIQUID_WORDS.has(firstWord(name))
    if (liquid && token.mlFactor !== undefined) {
      return {
        quantity: quantity * token.mlFactor,
        unit: "ml",
        name: cleanName(name),
      }
    }

    return {
      quantity: quantity * token.gFactor,
      unit: "g",
      name: cleanName(name),
    }
  }

  for (const token of VOLUME_WEIGHT_TOKENS) {
    const match = token.re.exec(rest)
    if (!match) continue

    const name = stripLeadingDe(rest.slice(match[0].length))
    const scaled = quantity * token.factor

    if (token.base === "ml") {
      return { quantity: scaled, unit: "ml", name: cleanName(name) }
    }

    if (WEIGHT_AS_VOLUME_WORDS.has(firstWord(name))) {
      return { quantity: scaled, unit: "ml", name: cleanName(name) }
    }

    return { quantity: scaled, unit: "g", name: cleanName(name) }
  }

  return { quantity, unit: "un", name: cleanName(rest, true) }
}

export function parseIngredient(raw: string): ParsedIngredient {
  return parseSingleIngredient(raw)
}

export function parseIngredientGroup(raw: string): ParsedIngredientGroup {
  const normalized = raw
    .trim()
    .replace(/\s*\(opcional\)\s*$/i, "")
    .replace(/^cerca\s+de\s*/i, "")
    .replace(/,\s*s[oó]\s+as\s+cascas\s*,?$/i, "")
    .trim()

  const segments = splitOnAlternatives(normalized)
  if (!segments) {
    return { primary: parseSingleIngredient(raw), alternatives: [] }
  }

  const alts: ParsedIngredient[] = []
  let primary: ParsedIngredient | null = null
  let lastQuantified: ParsedIngredient | null = null

  for (const [index, segment] of segments.entries()) {
    const parsed = parseSingleIngredient(segment)

    if (!parsed.name) continue

    if (index === 0) {
      primary = parsed
      lastQuantified =
        parsed.unit === "un" && parsed.quantity === 1 ? null : parsed
      continue
    }

    if (
      parsed.unit === "un" &&
      parsed.quantity === 1 &&
      lastQuantified !== null &&
      lastQuantified.unit !== "un"
    ) {
      alts.push({
        ...parsed,
        quantity: lastQuantified.quantity,
        unit: lastQuantified.unit,
      })
      continue
    }

    alts.push(parsed)
    if (parsed.unit !== "un" || parsed.quantity !== 1) {
      lastQuantified = parsed
    }
  }

  if (!primary) {
    return {
      primary: { quantity: 1, unit: "un", name: raw.trim() },
      alternatives: [],
    }
  }

  return { primary, alternatives: alts }
}

export function guessTag(name: string): string {
  const lower = name.toLowerCase()
  if (
    /vodka|whiskey|whisky|aguardente|rum|gin|licor|brandy|conhaque/i.test(lower)
  ) {
    return "Bebida base"
  }
  if (
    /morango|morang|figo|laranja|lim[oõ]|limao|coco|framb|manga|banana/i.test(
      lower
    )
  ) {
    return "Fruta"
  }
  return "Outro"
}

export function normalizeName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export const RECIPES = [
  {
    nome: "Licor Baileys Caseiro",
    ingredientes: [
      "1 lata de leite condensado",
      "200 ml de natas",
      "100 ml de leite",
      "30 ml de café espresso",
      "2 colh. sopa de cacau em pó",
      "1 colh. chá de baunilha",
      "250 ml de whiskey",
    ],
  },
  {
    nome: "Licor Amaretto",
    ingredientes: [
      "200 gr de açúcar branco",
      "100 gr de açúcar mascavado",
      "250 ml de água",
      "500 ml de vodka",
      "1 col. de sopa de essência de baunilha",
      "1 col. de chá de essência concentrada de amêndoa",
    ],
  },
  {
    nome: "Licor Baileys de Morango",
    ingredientes: [
      "1 lata de leite condensado",
      "200 ml de natas",
      "200 ml de leite",
      "1 e meia chávena de morangos frescos ou 80 a 100 ml de geleia, topping ou doce de morango",
      "1 colh. chá de baunilha",
      "250 a 300 ml de whiskey",
    ],
  },
  {
    nome: "Licor de Caramelo Salgado",
    ingredientes: [
      "1 lata de leite condensado cozido",
      "1/2 col. chá de sal grosso",
      "200 ml de leite",
      "200 ml de natas",
      "1 col. de chá de essência de baunilha",
      "300 ml de whiskey",
    ],
  },
  {
    nome: "Licor de Café",
    ingredientes: [
      "200 gr de café moído (intensidade entre 8 e 12)",
      "200 gr de açúcar (branco ou mascavado)",
      "200 ml de água quente",
      "300 ml de vodka",
    ],
  },
  {
    nome: "Licor de Coco",
    ingredientes: [
      "400 ml de leite de coco",
      "1 lata de leite condensado",
      "250 ml de vodka",
    ],
  },
  {
    nome: "Licor de Figo",
    ingredientes: [
      "500 gr de figos",
      "150 gr de açúcar mascavado",
      "1 pau de canela",
      "1 col. de sopa de aroma de baunilha",
      "500 ml de vodka",
    ],
  },
  {
    nome: "Licor de Laranja",
    ingredientes: [
      "Cerca de 6 a 7 laranjas, só as cascas",
      "750 ml de vodka",
      "400 gr de açúcar",
      "400 ml de água",
    ],
  },
  {
    nome: "Licor de Lotus Biscoff",
    ingredientes: [
      "250 ml de leite",
      "200 gr de Lotus Biscoff creme",
      "200 ml de natas",
      "1 lata de leite condensado",
      "250 a 300 ml de vodka",
    ],
  },
  {
    nome: "Licor de Limão (Limoncello)",
    ingredientes: [
      "Cascas de 5 limões",
      "500 ml de vodka",
      "500 ml de água",
      "400 gr de açúcar",
    ],
  },
  {
    nome: "Licor de Morango",
    ingredientes: [
      "250 gr de morangos",
      "400 ml de vodka",
      "200 gr de açúcar",
      "250 gr de água",
    ],
  },
  {
    nome: "Licor de Menta",
    ingredientes: [
      "100 gr de folhas de menta fresca",
      "3 estrelas de anis (opcional)",
      "500 ml de vodka",
      "250 gr de açúcar",
      "250 gr de água",
      "Corante alimentar verde (opcional)",
    ],
  },
  {
    nome: "Licor de Mel",
    ingredientes: [
      "200 ml de mel",
      "200 ml de água",
      "3 paus de canela",
      "1 col. de sopa de erva doce",
      "400 ml de whiskey",
    ],
  },
  {
    nome: "Licor de Nutella",
    ingredientes: [
      "300 ml de leite",
      "280 gr de nutella",
      "200 gr de natas",
      "50 gr de açúcar",
      "120 ml de vodka",
    ],
  },
  {
    nome: "Licor de Pastel de Nata",
    ingredientes: [
      "2 colheres de açúcar mascavado",
      "2 paus de canela",
      "Casca de 1 limão",
      "Casca de 1 laranja",
      "120 ml de água",
      "1 lata de leite condensado",
      "1 medida da lata de leite",
      "250 ml de vodka ou aguardente",
      "1 colher de chá de extrato de baunilha",
    ],
  },
]

export const UNIT_NAMES = ["ml", "g", "un"] as const
