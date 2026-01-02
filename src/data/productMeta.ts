export type ProductMeta = {
  name: string
  ingredients: string
  allergens: string
  caloriesPerServing?: number
  servingSize?: string
  storage?: string
  shelfLife?: string
  servingSuggestion?: string
  halal?: boolean
}

/** Data ringkas untuk bahan & nilai gizi per produk.
 *  Catatan: angka kalori/nilai gizi bersifat perkiraan untuk 1 porsi standar.
 */
export const productMeta: Record<string, ProductMeta> = {
  'Dimsum Ayam Udang': {
    name: 'Dimsum Ayam Udang',
    ingredients: 'Daging ayam, udang, kulit pangsit, wortel, bawang putih, tofu, kecap asin, wijen, saus cocol homemade.',
    allergens: 'Udang, gluten, kedelai',
    caloriesPerServing: 220,
    servingSize: '5 pcs',
    storage: 'Simpan beku (-18°C), kukus dalam keadaan beku 8–10 menit',
    shelfLife: '3 bulan (frozen)',
    servingSuggestion: 'Sajikan hangat dengan saus cocol',
    halal: true,
  },
  'Nastar Klasik': {
    name: 'Nastar Klasik',
    ingredients: 'Tepung terigu, butter premium, telur, gula, selai nanas homemade.',
    allergens: 'Gluten, telur, dairy',
    caloriesPerServing: 150,
    servingSize: '2 pcs',
    storage: 'Simpan di suhu ruang sejuk, wadah kedap',
    shelfLife: '3–4 minggu (belum dibuka)',
    servingSuggestion: 'Siap santap; cocok ditemani teh/kopi',
    halal: true,
  },
  'Miles Crepes Red Velvet': {
    name: 'Miles Crepes Red Velvet',
    ingredients: 'Lapis crepes, krim keju, whipping cream, gula, cocoa powder, vanilla.',
    allergens: 'Gluten, dairy, telur',
    caloriesPerServing: 320,
    servingSize: '1 slice (16 cm)',
    storage: 'Chiller 0–4°C',
    shelfLife: '2–3 hari di chiller',
    servingSuggestion: 'Dinginkan 10–15 menit sebelum disajikan',
    halal: true,
  },
  'Miles Crepes Matcha': {
    name: 'Miles Crepes Matcha',
    ingredients: 'Lapis crepes, krim matcha, whipped cream, gula, butter.',
    allergens: 'Gluten, dairy, telur',
    caloriesPerServing: 300,
    servingSize: '1 slice (16 cm)',
    storage: 'Chiller 0–4°C',
    shelfLife: '2–3 hari di chiller',
    servingSuggestion: 'Sajikan dingin, cocok dengan teh hijau',
    halal: true,
  },
  'Miles Crepes Coklat': {
    name: 'Miles Crepes Coklat',
    ingredients: 'Lapis crepes, krim cokelat, dark chocolate, whipping cream.',
    allergens: 'Gluten, dairy, telur',
    caloriesPerServing: 310,
    servingSize: '1 slice (16 cm)',
    storage: 'Chiller 0–4°C',
    shelfLife: '2–3 hari di chiller',
    servingSuggestion: 'Sajikan dingin, ideal dengan kopi',
    halal: true,
  },
  'Miles Crepes Tiramisu': {
    name: 'Miles Crepes Tiramisu',
    ingredients: 'Lapis crepes, krim mascarpone, kopi, cocoa powder, vanilla.',
    allergens: 'Gluten, dairy, telur',
    caloriesPerServing: 315,
    servingSize: '1 slice (16 cm)',
    storage: 'Chiller 0–4°C',
    shelfLife: '2–3 hari di chiller',
    servingSuggestion: 'Sajikan dingin, taburi cacao powder jika suka',
    halal: true,
  },
  'Brownies Fudge Classic': {
    name: 'Brownies Fudge Classic',
    ingredients: 'Coklat, butter, gula, telur, terigu, coklat chips.',
    allergens: 'Gluten, telur, dairy',
    caloriesPerServing: 260,
    servingSize: '1 slice',
    storage: 'Suhu ruang sejuk; bisa chiller untuk tekstur fudgy',
    shelfLife: '5–7 hari (segel rapat)',
    servingSuggestion: 'Hangatkan sebentar atau nikmati dengan es krim',
    halal: true,
  },
  'Donut Classic Glaze': {
    name: 'Donut Classic Glaze',
    ingredients: 'Tepung, kentang, telur, susu bubuk, butter, gula, ragi, glaze vanilla.',
    allergens: 'Gluten, dairy, telur',
    caloriesPerServing: 210,
    servingSize: '1 pcs',
    storage: 'Suhu ruang sejuk, konsumsi dalam 1–2 hari',
    shelfLife: '2 hari terbaik',
    servingSuggestion: 'Hangatkan 10–15 detik untuk tekstur empuk',
    halal: true,
  },
  'Soft Baked Cookies': {
    name: 'Soft Baked Cookies',
    ingredients: 'Tepung, butter, telur, brown sugar, dark chocolate chunk, sea salt.',
    allergens: 'Gluten, telur, dairy',
    caloriesPerServing: 180,
    servingSize: '1 pcs',
    storage: 'Suhu ruang sejuk, kedap udara',
    shelfLife: '7–10 hari (segel rapat)',
    servingSuggestion: 'Lebih nikmat dihangatkan singkat (5–8 detik microwave)',
    halal: true,
  },
  'Pizza Mini Delight': {
    name: 'Pizza Mini Delight',
    ingredients: 'Tepung, saus tomat homemade, pepperoni ayam, keju mozzarella, oregano.',
    allergens: 'Gluten, dairy',
    caloriesPerServing: 240,
    servingSize: '1 mini pizza',
    storage: 'Chiller 0–4°C; bisa frozen',
    shelfLife: 'Chiller 2 hari, frozen 30 hari',
    servingSuggestion: 'Panggang 10–12 menit 180°C sampai keju meleleh',
    halal: true,
  },
}

export const productMetaLines = () =>
  Object.values(productMeta).map((meta) => {
    const cal = meta.caloriesPerServing ? `, ~${meta.caloriesPerServing} kkal/${meta.servingSize ?? 'porsi'}` : ''
    const storage = meta.storage ? ` | Simpan: ${meta.storage}` : ''
    const shelf = meta.shelfLife ? ` | Tahan: ${meta.shelfLife}` : ''
    const serve = meta.servingSuggestion ? ` | Saran saji: ${meta.servingSuggestion}` : ''
    const halal = meta.halal ? ' | Halal' : ''
    return `• ${meta.name}: ${meta.ingredients}. Alergen: ${meta.allergens}${cal}${storage}${shelf}${serve}${halal}`
  })
