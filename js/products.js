/* ==========================================================================
   PENGUIN'S FRAGRANCE — PRODUCTS.JS
   Centralized product data (single source of truth). Every page that
   displays products — home, shop, product details, search, wishlist,
   cart, quick view — reads from this file instead of hardcoding product
   info in markup.

   Pricing is in INR. Image paths point to assets/images/products/ —
   replace with your real product photography before final submission;
   placeholder filenames are provided so pages don't break.
   ========================================================================== */

const PF_PRODUCTS = [
  {
    id: "noir-elan",
    name: "Noir Élan",
    brand: "Penguin's Fragrance",
    category: "woody",
    gender: "unisex",
    price: 3999,
    originalPrice: 4499,
    discount: 11,
    rating: 4.5,
    reviewCount: 128,
    sizes: ["30ml", "50ml", "100ml"],
    defaultSize: "50ml",
    images: [
      "assets/products/PRODUCT 1/frontpage.png",
      "assets/products/PRODUCT 1/back profile.png",
      "assets/products/PRODUCT 1/infopage.png",
    ],
    thumbnail: "assets/products/PRODUCT 1/frontpage.png",
    description:
      "Noir Élan is an enigmatic composition that bridges the gap between light and shadow. A complex architectural fragrance that opens with crisp, bracing citrus before descending into a rich, resinous depth.",
    topNotes: ["Italian Bergamot", "Pink Pepper"],
    heartNotes: ["Damascus Rose", "Black Tea"],
    baseNotes: ["Smoked Oud", "Vetiver", "Sandalwood"],
    ingredients:
      "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Citronellol, Geraniol, Coumarin, Citral, Farnesol, Benzyl Benzoate, Eugenol.",
    stock: 42,
    badge: "Bestseller",
  },
  {
    id: "blanc-pure",
    name: "Blanc Pure",
    brand: "Penguin's Fragrance",
    category: "fresh",
    gender: "unisex",
    price: 3499,
    originalPrice: null,
    discount: 0,
    rating: 4.3,
    reviewCount: 76,
    sizes: ["30ml", "50ml", "100ml"],
    defaultSize: "50ml",
    images: [
      "assets/products/PRODUCT 2/frontpage.png",
      "assets/products/PRODUCT 2/back profile.png",
    ],
    thumbnail: "assets/products/PRODUCT 2/frontpage.png",
    description:
      "A luminous, airy composition built around clean woods and soft musk. Blanc Pure captures the feeling of sun-bleached linen and quiet mornings.",
    topNotes: ["Bergamot", "White Tea"],
    heartNotes: ["Fig", "Lily of the Valley"],
    baseNotes: ["Santal", "Cedar", "White Musk"],
    ingredients:
      "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Hexyl Cinnamal.",
    stock: 30,
    badge: "",
  },
  {
    id: "ambre-dore",
    name: "Ambre Dor",
    brand: "Penguin's Fragrance",
    category: "amber",
    gender: "women",
    price: 4299,
    originalPrice: 4799,
    discount: 10,
    rating: 4.7,
    reviewCount: 94,
    sizes: ["30ml", "50ml", "100ml"],
    defaultSize: "50ml",
    images: [
      "assets/products/PRODUCT 3/frontpage.jpg",
      "assets/products/PRODUCT 3/back profile.jpg",
    ],
    thumbnail: "assets/products/PRODUCT 3/back profile.jpg",
    description:
      "A golden, resinous amber wrapped in warm vanilla and soft musk. Ambre Doré is opulent without being heavy — a fragrance for long evenings.",
    topNotes: ["Mandarin", "Cardamom"],
    heartNotes: ["Amber", "Jasmine"],
    baseNotes: ["Vanilla", "Musk", "Tonka Bean"],
    ingredients:
      "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Coumarin, Benzyl Benzoate, Vanillin.",
    stock: 18,
    badge: "New",
  },
  {
    id: "Sel de'argent",
    name: "Sel de'argent",
    brand: "Penguin's Fragrance",
    category: "fresh",
    gender: "men",
    price: 3799,
    originalPrice: null,
    discount: 0,
    rating: 4.2,
    reviewCount: 51,
    sizes: ["30ml", "50ml", "100ml"],
    defaultSize: "50ml",
    images: [
      "assets/products/PRODUCT 4/frontpage.jpg",
      "assets/products/PRODUCT 4/back profile.jpg",
    ],
    thumbnail: "assets/products/PRODUCT 4/back profile.jpg",
    description:
      "Cool, mineral, and precise. Glace Argent evokes frosted glass and winter air — an aromatic composition anchored in juniper and birch.",
    topNotes: ["Iris", "Juniper"],
    heartNotes: ["Birch", "Sea Salt"],
    baseNotes: ["Vetiver", "Ambroxan"],
    ingredients:
      "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Linalool, Citronellol.",
    stock: 25,
    badge: "",
  },
  {
    id: "velvet-oud",
    name: "Velvet Oud",
    brand: "Penguin's Fragrance",
    category: "woody",
    gender: "men",
    price: 5495,
    originalPrice: 5995,
    discount: 8,
    rating: 4.8,
    reviewCount: 112,
    sizes: ["30ml", "50ml", "100ml"],
    defaultSize: "50ml",
    images: [
      "assets/products/PRODUCT 5/frontpage.jpg",
      "assets/products/PRODUCT 5/back profile.jpg",
    ],
    thumbnail: "assets/products/PRODUCT 5/frontpage.jpg",
    description:
      "A deep, textured oud softened with leather and smoked woods. Velvet Oud is rich and enveloping — a signature scent built for cold nights.",
    topNotes: ["Saffron", "Pink Pepper"],
    heartNotes: ["Leather", "Rose"],
    baseNotes: ["Oud", "Smoked Woods", "Amber"],
    ingredients:
      "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Eugenol, Farnesol, Benzyl Benzoate.",
    stock: 15,
    badge: "Bestseller",
  },
  {
    id: "midnight-essence",
    name: "Midnight Essence",
    brand: "Penguin's Fragrance",
    category: "woody",
    gender: "unisex",
    price: 4850,
    originalPrice: null,
    discount: 0,
    rating: 4.4,
    reviewCount: 63,
    sizes: ["30ml", "50ml", "100ml"],
    defaultSize: "50ml",
    images: [
      "assets/products/PRODUCT 6/frontprofile.jpg",
      "assets/products/PRODUCT 6/back profile.jpg",
    ],
    thumbnail: "assets/products/PRODUCT 6/frontprofile.jpg",
    description:
      "Dark and enigmatic, Midnight Essence blends smoked woods with a whisper of black tea for a fragrance that lingers long after the room empties.",
    topNotes: ["Black Pepper", "Bergamot"],
    heartNotes: ["Black Tea", "Violet"],
    baseNotes: ["Smoked Woods", "Patchouli"],
    ingredients:
      "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Coumarin.",
    stock: 22,
    badge: "",
  },
  {
    id: "pure-elegance",
    name: "Pure Élégance",
    brand: "Penguin's Fragrance",
    category: "floral",
    gender: "women",
    price: 3999,
    originalPrice: 4399,
    discount: 9,
    rating: 4.6,
    reviewCount: 88,
    sizes: ["30ml", "50ml", "100ml"],
    defaultSize: "50ml",
    images: [
      "assets/products/PRODUCT 7/frontpage.jpg",
      "assets/products/PRODUCT 7/back profile.jpg",
    ],
    thumbnail: "assets/products/PRODUCT 7/frontpage.jpg",
    description:
      "A refined floral bouquet led by jasmine and peony, softened with a base of clean musk. Pure Élégance is timeless, understated luxury.",
    topNotes: ["Peony", "Pear"],
    heartNotes: ["Jasmine", "Rose"],
    baseNotes: ["White Musk", "Cedar"],
    ingredients:
      "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Linalool, Geraniol, Citronellol.",
    stock: 34,
    badge: "",
  },
  {
    id: "THE MAN NOIR",
    name: "THE MAN NOIR",
    brand: "Penguin's Fragrance",
    category: "woody",
    gender: "men",
    price: 4199,
    originalPrice: null,
    discount: 0,
    rating: 4.1,
    reviewCount: 47,
    sizes: ["30ml", "50ml", "100ml"],
    defaultSize: "50ml",
    images: [
      "assets/products/PRODUCT 8/frontpage.jpg",
      "assets/products/PRODUCT 8/back profile.jpg",
    ],
    thumbnail: "assets/products/PRODUCT 8/frontpage.jpg",
    description:
      "A sharp, contemporary composition built for the city — leather, smoke, and cool citrus meet in an assertive but wearable structure.",
    topNotes: ["Grapefruit", "Elemi"],
    heartNotes: ["Leather", "Nutmeg"],
    baseNotes: ["Smoke", "Vetiver"],
    ingredients:
      "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Citral, Eugenol.",
    stock: 27,
    badge: "",
  },
  {
    id: "imperial-mist",
    name: "Imperial Mist",
    brand: "Penguin's Fragrance",
    category: "amber",
    gender: "unisex",
    price: 5299,
    originalPrice: 5799,
    discount: 9,
    rating: 4.6,
    reviewCount: 59,
    sizes: ["30ml", "50ml", "100ml"],
    defaultSize: "50ml",
    images: [
      "assets/products/PRODUCT 9/frontpage.jpg",
      "assets/products/PRODUCT 9/back profile.jpg",
    ],
    thumbnail: "assets/products/PRODUCT 9/frontpage.jpg",
    description:
      "Regal and diffusive, Imperial Mist wraps warm spice around a soft amber heart, finished with a trail of vanilla and soft musk.",
    topNotes: ["Cardamom", "Orange Blossom"],
    heartNotes: ["Amber", "Saffron"],
    baseNotes: ["Vanilla", "Musk"],
    ingredients:
      "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Coumarin, Vanillin, Benzyl Benzoate.",
    stock: 12,
    badge: "New",
  },
  {
    id: "lessence",
    name: "L'Essence",
    brand: "Penguin's Fragrance",
    category: "floral",
    gender: "women",
    price: 3699,
    originalPrice: null,
    discount: 0,
    rating: 4.0,
    reviewCount: 39,
    sizes: ["30ml", "50ml", "100ml"],
    defaultSize: "50ml",
    images: [
      "assets/products/PODUCT 10/frontpage.jpg",
      "assets/products/PODUCT 10/back profile.jpg",
    ],
    thumbnail: "assets/products/PODUCT 10/frontpage.jpg",
    description:
      "A minimalist floral built on white flowers and soft green stems — light, clean, and quietly confident.",
    topNotes: ["Green Leaves", "Neroli"],
    heartNotes: ["Jasmine", "Muguet"],
    baseNotes: ["White Musk", "Ambrette"],
    ingredients:
      "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Linalool, Hexyl Cinnamal.",
    stock: 40,
    badge: "Most Selling",
  },
  {
  id: "jadore",
  name: "J'adore Eau de Parfum",
  brand: "Dior",
  category: "floral",
  gender: "women",
  price: 14500,
  originalPrice: null,
  discount: 0,
  rating: 4.7,
  reviewCount: 128,
  sizes: ["30ml", "50ml", "100ml"],
  defaultSize: "50ml",
  images: [
    "assets/products/PRODUCT 11/frontpage.jpg",
    "assets/products/PRODUCT 11/back profile.jpg",
  ],
  thumbnail: "assets/products/PRODUCT 11/frontpage.jpg",
  description:
    "An iconic floral fragrance with a luminous bouquet of ylang-ylang, Damascus rose, and elegant jasmine. Sophisticated, feminine, and effortlessly luxurious.",
  topNotes: ["Ylang-Ylang"],
  heartNotes: ["Damascus Rose"],
  baseNotes: ["Jasmine Grandiflorum", "Jasmine Sambac"],
  ingredients:
    "Alcohol, Parfum (Fragrance), Aqua (Water), Hexyl Cinnamal, Benzyl Salicylate, Citronellol, Hydroxycitronellal, Linalool, Geraniol, Benzyl Benzoate, Limonene.",
  stock: 25,
  badge: "Bestseller",
},
{
  id: "coco-mademoiselle",
  name: "Coco Mademoiselle",
  brand: "Chanel",
  category: "floral",
  gender: "women",
  price: 16750,
  originalPrice: null,
  discount: 0,
  rating: 4.8,
  reviewCount: 161,
  sizes: ["35ml", "50ml", "100ml"],
  defaultSize: "50ml",
  images: [
    "assets/products/PRODUCT 12/frontpage.jpg",
    "assets/products/PRODUCT 12/back profile.jpg",
  ],
  thumbnail: "assets/products/PRODUCT 12/frontpage.jpg",
  description:
    "A bold and sophisticated ambery fragrance combining sparkling orange with a sensual heart of jasmine and rose, finished with refined accents of patchouli and vetiver.",
  topNotes: ["Orange", "Bergamot"],
  heartNotes: ["Jasmine", "Rose"],
  baseNotes: ["Patchouli", "Vetiver"],
  ingredients:
    "Alcohol, Parfum (Fragrance), Aqua (Water), Linalool, Pogostemon Cablin Oil, Linalyl Acetate, Limonene, Citrus Aurantium Bergamia Peel Oil, Citrus Aurantium Peel Oil, Benzyl Salicylate, Citronellol, Geraniol, Hexyl Cinnamal, Coumarin, Vanillin, Rose Ketones, Santalol, Jasmine Oil/Extract, Benzyl Benzoate.",
  stock: 18,
  badge: "Bestseller",
},
{
  id: "fogg-xpressio",
  name: "Scent Xpressio",
  brand: "Fogg",
  category: "fresh",
  gender: "men",
  price: 399,
  originalPrice: 499,
  discount: 20,
  rating: 4.3,
  reviewCount: 19259,
  sizes: ["50ml", "75ml", "100ml"],
  defaultSize: "100ml",
  images: [
    "assets/products/PRODUCT 13/frontpage.jpg",
    "assets/products/PRODUCT 13/back profile.jpg",
  ],
  thumbnail: "assets/products/PRODUCT 13/frontpage.jpg",
  description:
    "A fresh and captivating men's fragrance blending zesty bitter orange and ginger with a floral heart of rose and jasmine, followed by a warm honey-amber accord and smooth sandalwood base.",
  topNotes: ["Ginger", "Bitter Orange"],
  heartNotes: ["Rose", "Jasmine"],
  baseNotes: ["Honey-Amber Accord", "Sandalwood"],
  ingredients:
    "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Fragrance Ingredients.",
  stock: 35,
  badge: "Popular",
},
];

/* ==========================================================================
   QUERY HELPERS
   Other scripts (main.js, products page renderer, search.js, cart.js,
   product-details.js) should always go through these functions rather
   than reading PF_PRODUCTS directly, so filtering logic stays in one place.
   ========================================================================== */

/** Returns the full catalog. */
function pfGetAllProducts() {
  return PF_PRODUCTS;
}

/** Finds a single product by its id. Returns null if not found. */
function pfGetProductById(id) {
  return PF_PRODUCTS.find((p) => p.id === id) || null;
}

/** Filters products by category, gender, and/or size. Any filter left
 * undefined/null/"all" is ignored. */
function pfFilterProducts({ category, gender, size, maxPrice } = {}) {
  return PF_PRODUCTS.filter((p) => {
    if (category && category !== "all" && p.category !== category) return false;
    if (gender && gender !== "all" && p.gender !== gender && p.gender !== "unisex")
      return false;
    if (size && !p.sizes.includes(size)) return false;
    if (maxPrice && p.price > maxPrice) return false;
    return true;
  });
}

/** Returns up to `limit` products related to the given product
 * (same category, excluding itself). Falls back to bestsellers if the
 * category has too few matches. */
function pfGetRelatedProducts(productId, limit = 3) {
  const product = pfGetProductById(productId);
  if (!product) return [];

  let related = PF_PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  );

  if (related.length < limit) {
    const fillers = PF_PRODUCTS.filter(
      (p) => p.id !== product.id && !related.includes(p)
    );
    related = related.concat(fillers);
  }

  return related.slice(0, limit);
}

/** Simple case-insensitive search across name, category, gender, brand,
 * and fragrance notes. Used by search.js and the header search overlay. */
function pfSearchProducts(query) {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();

  return PF_PRODUCTS.filter((p) => {
    const haystack = [
      p.name,
      p.brand,
      p.category,
      p.gender,
      ...p.topNotes,
      ...p.heartNotes,
      ...p.baseNotes,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}

/** Formats a number as Indian Rupees, e.g. 3999 -> "₹3,999". */
function pfFormatPrice(amount) {
  if (typeof amount !== "number") return "";
  return "₹" + amount.toLocaleString("en-IN");
}

/** Returns a 0-5 star rating rounded to the nearest half star, as an
 * array of "full" | "half" | "empty" for easy rendering. */
function pfGetStarPattern(rating) {
  const stars = [];
  const rounded = Math.round(rating * 2) / 2;

  for (let i = 1; i <= 5; i++) {
    if (rounded >= i) stars.push("full");
    else if (rounded >= i - 0.5) stars.push("half");
    else stars.push("empty");
  }
  return stars;
}
