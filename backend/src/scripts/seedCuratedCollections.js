import { connectDatabase } from "../config/database.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

const toSlug = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const collections = [
  {
    type: "product",
    name: "Lumiere Diamond Ring",
    price: 350000,
    category: "Rings",
    material: "Platinum",
    featured: true,
    description: "An exquisite platinum ring featuring a brilliant-cut diamond.",
  },
  {
    type: "product",
    name: "Heritage Gold Pendant",
    price: 125000,
    category: "Pendants",
    material: "Gold",
    featured: true,
    description: "A timeless gold pendant crafted with heritage detailing.",
  },
  {
    type: "product",
    name: "Etoile Drop Earrings",
    price: 210000,
    category: "Earrings",
    material: "White Gold",
    featured: true,
    description: "Refined drop earrings crafted in luminous white gold.",
  },
  {
    type: "product",
    name: "Royale Pearl Bracelet",
    price: 85000,
    category: "Bracelets",
    material: "Rose Gold",
    featured: false,
    description: "Elegant pearl bracelet set in rose gold.",
  },
  {
    type: "product",
    name: "Vintage Solitaire Ring",
    price: 420000,
    category: "Rings",
    material: "Gold",
    featured: false,
    description: "A classic solitaire ring in polished gold.",
  },
  {
    type: "product",
    name: "Sapphire Halo Necklace",
    price: 540000,
    category: "Necklaces",
    material: "Platinum",
    featured: true,
    description: "A sapphire centerpiece surrounded by a radiant diamond halo.",
  },
  {
    type: "product",
    name: "Aurora Diamond Studs",
    price: 185000,
    category: "Earrings",
    material: "Diamond",
    featured: true,
    description: "Classic diamond studs crafted for timeless brilliance and everyday sophistication.",
  },
  {
    type: "product",
    name: "Regal Ruby Pendant",
    price: 295000,
    category: "Pendants",
    material: "Gold",
    featured: false,
    description: "A vivid Burmese ruby set in rich 18k gold with intricate detailing.",
  },
  {
    type: "product",
    name: "Serenity Diamond Bracelet",
    price: 375000,
    category: "Bracelets",
    material: "White Gold",
    featured: true,
    description: "Delicate white gold bracelet adorned with precision-set diamonds.",
  },
  {
    type: "product",
    name: "Eternal Promise Ring",
    price: 260000,
    category: "Rings",
    material: "Platinum",
    featured: false,
    description: "A refined platinum band symbolizing everlasting commitment.",
  },
  {
    type: "product",
    name: "Velvet Emerald Drops",
    price: 430000,
    category: "Earrings",
    material: "Gold",
    featured: true,
    description: "Emerald drop earrings radiating royal charm and sophistication.",
  },
  {
    type: "product",
    name: "Noir Onyx Necklace",
    price: 190000,
    category: "Necklaces",
    material: "Silver",
    featured: false,
    description: "A bold black onyx pendant suspended from a sleek silver chain.",
  },
  {
    type: "prestige",
    name: "Crown of Versailles",
    price: 18500000,
    category: "High Jewelry",
    material: "Diamond",
    featured: false,
    description: "A regal tiara composed of 60 carats of flawless diamonds in platinum latticework.",
  },
  {
    type: "prestige",
    name: "Scarlet Majesty Necklace",
    price: 14200000,
    category: "High Jewelry",
    material: "Gold",
    featured: false,
    description: "An extraordinary ruby necklace inspired by royal European courts.",
  },
  {
    type: "prestige",
    name: "Ocean Whisper Sapphire Set",
    price: 16800000,
    category: "High Jewelry",
    material: "White Gold",
    featured: false,
    description: "A majestic sapphire necklace and earrings set reminiscent of deep ocean hues.",
  },
  {
    type: "prestige",
    name: "Golden Dynasty Cuff",
    price: 9800000,
    category: "High Jewelry",
    material: "Gold",
    featured: false,
    description: "A handcrafted gold cuff inspired by ancient imperial artistry.",
  },
  {
    type: "prestige",
    name: "Eclipse Black Diamond Ring",
    price: 11200000,
    category: "High Jewelry",
    material: "Platinum",
    featured: false,
    description: "A rare black diamond centerpiece radiating celestial mystery.",
  },
  {
    type: "prestige",
    name: "The Imperial Emerald",
    price: 8500000,
    category: "High Jewelry",
    material: "Platinum",
    featured: false,
    description: "Museum-quality emerald masterpiece set in flawless platinum.",
  },
  {
    type: "prestige",
    name: "Celestial Diamond Choker",
    price: 12500000,
    category: "High Jewelry",
    material: "Diamond",
    featured: false,
    description: "Over 40 carats of internally flawless diamonds.",
  },
  {
    type: "prestige",
    name: "Midnight Sapphire Tiara",
    price: 6800000,
    category: "High Jewelry",
    material: "White Gold",
    featured: false,
    description: "A royal tiara crowned with a breathtaking Kashmir sapphire.",
  },
  {
    type: "prestige",
    name: "Opaline Dream Ring",
    price: 4200000,
    category: "High Jewelry",
    material: "Platinum",
    featured: false,
    description: "A rare black Australian opal surrounded by a diamond halo.",
  },
];

const buildSku = (entry, index) => `${entry.type === "prestige" ? "TJB-HJ" : "TJB-PR"}-${String(index + 1).padStart(3, "0")}`;

const ensureCategory = async (name) => {
  const slug = toSlug(name);
  let category = await Category.findOne({
    $or: [{ slug }, { name }],
  });

  if (!category) {
    category = await Category.create({
      name,
      slug,
    });
  }

  return category;
};

const upsertCollectionProduct = async (entry, index) => {
  const category = await ensureCategory(entry.category);
  const sku = buildSku(entry, index);
  const slug = toSlug(entry.name);
  const stock = entry.type === "prestige" ? 1 : 10;
  const existingProduct = await Product.findOne({ sku });

  const payload = {
    name: entry.name,
    slug,
    description: entry.description,
    category: category._id,
    metalType: String(entry.material || "gold").trim().toLowerCase(),
    price: entry.price,
    discountPrice: null,
    stock,
    sku,
    featured: Boolean(entry.featured),
  };

  if (existingProduct) {
    existingProduct.name = payload.name;
    existingProduct.slug = payload.slug;
    existingProduct.description = payload.description;
    existingProduct.category = payload.category;
    existingProduct.metalType = payload.metalType;
    existingProduct.price = payload.price;
    existingProduct.discountPrice = payload.discountPrice;
    existingProduct.stock = payload.stock;
    existingProduct.featured = payload.featured;
    await existingProduct.save();

    return { action: "updated", name: existingProduct.name, sku };
  }

  await Product.create({
    ...payload,
    images: [],
  });

  return { action: "created", name: entry.name, sku };
};

const run = async () => {
  await connectDatabase();

  const results = [];
  for (const [index, entry] of collections.entries()) {
    results.push(await upsertCollectionProduct(entry, index));
  }

  const created = results.filter((item) => item.action === "created").length;
  const updated = results.filter((item) => item.action === "updated").length;

  console.log(`Seed complete. Created ${created} products and updated ${updated} products.`);
  results.forEach((item) => {
    console.log(`${item.action.toUpperCase()}: ${item.name} (${item.sku})`);
  });
};

run()
  .catch((error) => {
    console.error("Failed to seed curated collections", error);
    process.exit(1);
  })
  .finally(async () => {
    await Product.db.close();
  });
