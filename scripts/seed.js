/**
 * Seed Script
 * ───────────
 * Generates 1000+ realistic electronics products and inserts them
 * into MongoDB (or in-memory store if DB is unavailable).
 *
 * Run: node scripts/seed.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

// ─────────────────────────────────────────────────────────
// DATA TEMPLATES
// ─────────────────────────────────────────────────────────

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};
const randFloat = (min, max, dp = 1) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(dp));

// ──────────────────────────────────────────────
// IPHONES
// ──────────────────────────────────────────────
const iphoneColors = ["Midnight Black", "Starlight White", "Blue", "Red", "Purple", "Yellow", "Green", "Gold", "Silver", "Pink", "Titanium", "Natural Titanium", "Desert Titanium", "White Titanium"];
const iphoneModels = [
  { model: "iPhone 13", year: 2021, basePrice: 52999, storage: ["128GB", "256GB", "512GB"], ram: "4GB", display: "6.1 inches" },
  { model: "iPhone 13 Mini", year: 2021, basePrice: 47999, storage: ["128GB", "256GB", "512GB"], ram: "4GB", display: "5.4 inches" },
  { model: "iPhone 13 Pro", year: 2021, basePrice: 89999, storage: ["128GB", "256GB", "512GB", "1TB"], ram: "6GB", display: "6.1 inches" },
  { model: "iPhone 13 Pro Max", year: 2021, basePrice: 99999, storage: ["128GB", "256GB", "512GB", "1TB"], ram: "6GB", display: "6.7 inches" },
  { model: "iPhone 14", year: 2022, basePrice: 62999, storage: ["128GB", "256GB", "512GB"], ram: "6GB", display: "6.1 inches" },
  { model: "iPhone 14 Plus", year: 2022, basePrice: 72999, storage: ["128GB", "256GB", "512GB"], ram: "6GB", display: "6.7 inches" },
  { model: "iPhone 14 Pro", year: 2022, basePrice: 99999, storage: ["128GB", "256GB", "512GB", "1TB"], ram: "6GB", display: "6.1 inches" },
  { model: "iPhone 14 Pro Max", year: 2022, basePrice: 109999, storage: ["128GB", "256GB", "512GB", "1TB"], ram: "6GB", display: "6.7 inches" },
  { model: "iPhone 15", year: 2023, basePrice: 69999, storage: ["128GB", "256GB", "512GB"], ram: "6GB", display: "6.1 inches" },
  { model: "iPhone 15 Plus", year: 2023, basePrice: 79999, storage: ["128GB", "256GB", "512GB"], ram: "6GB", display: "6.7 inches" },
  { model: "iPhone 15 Pro", year: 2023, basePrice: 109999, storage: ["256GB", "512GB", "1TB"], ram: "8GB", display: "6.1 inches" },
  { model: "iPhone 15 Pro Max", year: 2023, basePrice: 129999, storage: ["256GB", "512GB", "1TB"], ram: "8GB", display: "6.7 inches" },
  { model: "iPhone 16", year: 2024, basePrice: 74999, storage: ["128GB", "256GB", "512GB"], ram: "8GB", display: "6.1 inches" },
  { model: "iPhone 16 Plus", year: 2024, basePrice: 84999, storage: ["128GB", "256GB", "512GB"], ram: "8GB", display: "6.7 inches" },
  { model: "iPhone 16 Pro", year: 2024, basePrice: 114999, storage: ["256GB", "512GB", "1TB"], ram: "8GB", display: "6.3 inches" },
  { model: "iPhone 16 Pro Max", year: 2024, basePrice: 134999, storage: ["256GB", "512GB", "1TB"], ram: "8GB", display: "6.9 inches" },
];

function generateIphones() {
  const products = [];
  for (const iphone of iphoneModels) {
    // Pick 3-4 random colors and all storages
    const selectedColors = pickN(iphoneColors, rand(3, 5));
    for (const storage of iphone.storage) {
      for (const color of selectedColors) {
        const storageMB = storage.includes("TB")
          ? parseInt(storage) * 1024
          : parseInt(storage);
        const priceAdder = storageMB >= 512 ? 15000 : storageMB >= 256 ? 8000 : 0;
        const price = iphone.basePrice + priceAdder + rand(-1000, 1000);
        const mrp = price + rand(1000, 5000);
        products.push({
          title: `${iphone.model} ${storage} ${color}`,
          description: `${iphone.model} with ${storage} storage in ${color}. Features ${iphone.display} Super Retina XDR display, ${iphone.ram} RAM, powered by the latest Apple chip. 5G enabled with advanced camera system.`,
          brand: "Apple",
          category: "Mobile Phones",
          model: iphone.model,
          price: Math.round(price / 100) * 100,
          mrp: Math.round(mrp / 100) * 100,
          currency: "INR",
          stock: rand(0, 200),
          fulfillmentType: pick(["express", "standard", "standard", "standard"]),
          rating: randFloat(3.8, 4.9),
          reviewCount: rand(50, 25000),
          returnRate: randFloat(1, 5),
          complaintRate: randFloat(0.5, 3),
          unitsSold: rand(500, 80000),
          salesVelocity: rand(50, 3000),
          viewCount: rand(5000, 500000),
          color: color.toLowerCase(),
          searchTags: ["iphone", "apple", "smartphone", iphone.model.toLowerCase(), storage.toLowerCase(), color.toLowerCase(), "ios"],
          launchYear: iphone.year,
          metadata: {
            ram: iphone.ram,
            storage: storage,
            screenSize: iphone.display,
            os: "iOS",
            processor: "Apple A-series Bionic",
            battery: `${rand(3000, 4500)}mAh`,
            camera: `${rand(12, 48)}MP`,
            connectivity: "5G, WiFi 6E, Bluetooth 5.3",
            displayType: "OLED Super Retina XDR",
            color: color,
            warranty: "1 Year Apple India Warranty",
            boxContents: "iPhone, USB-C Cable, Documentation",
          },
        });
      }
    }
  }
  return products;
}

// ──────────────────────────────────────────────
// SAMSUNG
// ──────────────────────────────────────────────
const samsungModels = [
  { model: "Galaxy A14", year: 2023, basePrice: 12999, storage: ["64GB", "128GB"], ram: ["4GB", "6GB"], display: "6.6 inches" },
  { model: "Galaxy A15", year: 2024, basePrice: 15999, storage: ["128GB"], ram: ["4GB", "6GB", "8GB"], display: "6.5 inches" },
  { model: "Galaxy A25 5G", year: 2024, basePrice: 19999, storage: ["128GB", "256GB"], ram: ["6GB", "8GB"], display: "6.5 inches" },
  { model: "Galaxy A35 5G", year: 2024, basePrice: 26999, storage: ["128GB", "256GB"], ram: ["6GB", "8GB"], display: "6.6 inches" },
  { model: "Galaxy A54 5G", year: 2023, basePrice: 31999, storage: ["128GB", "256GB"], ram: ["8GB"], display: "6.4 inches" },
  { model: "Galaxy A55 5G", year: 2024, basePrice: 34999, storage: ["128GB", "256GB"], ram: ["8GB", "12GB"], display: "6.6 inches" },
  { model: "Galaxy S23", year: 2023, basePrice: 59999, storage: ["128GB", "256GB"], ram: ["8GB"], display: "6.1 inches" },
  { model: "Galaxy S23+", year: 2023, basePrice: 74999, storage: ["256GB", "512GB"], ram: ["8GB"], display: "6.6 inches" },
  { model: "Galaxy S23 Ultra", year: 2023, basePrice: 99999, storage: ["256GB", "512GB", "1TB"], ram: ["8GB", "12GB"], display: "6.8 inches" },
  { model: "Galaxy S24", year: 2024, basePrice: 64999, storage: ["128GB", "256GB"], ram: ["8GB"], display: "6.2 inches" },
  { model: "Galaxy S24+", year: 2024, basePrice: 79999, storage: ["256GB", "512GB"], ram: ["12GB"], display: "6.7 inches" },
  { model: "Galaxy S24 Ultra", year: 2024, basePrice: 109999, storage: ["256GB", "512GB", "1TB"], ram: ["12GB"], display: "6.8 inches" },
  { model: "Galaxy Z Fold 5", year: 2023, basePrice: 149999, storage: ["256GB", "512GB", "1TB"], ram: ["12GB"], display: "7.6 inches Foldable" },
  { model: "Galaxy Z Flip 5", year: 2023, basePrice: 99999, storage: ["256GB", "512GB"], ram: ["8GB"], display: "6.7 inches Foldable" },
];

const samsungColors = ["Phantom Black", "Phantom White", "Cream", "Lavender", "Green", "Blue", "Graphite", "Gold", "Violet", "Yellow"];

function generateSamsung() {
  const products = [];
  for (const phone of samsungModels) {
    const selectedColors = pickN(samsungColors, rand(2, 4));
    for (const storage of phone.storage) {
      for (const ram of phone.ram) {
        const color = pick(selectedColors);
        const price = phone.basePrice + rand(-2000, 3000);
        const mrp = price + rand(2000, 8000);
        products.push({
          title: `Samsung ${phone.model} ${ram} RAM ${storage} ${color}`,
          description: `Samsung ${phone.model} featuring ${phone.display} display, ${ram} RAM and ${storage} storage. Equipped with advanced AI features, enhanced camera system, and long battery life.`,
          brand: "Samsung",
          category: "Mobile Phones",
          model: phone.model,
          price: Math.round(price / 100) * 100,
          mrp: Math.round(mrp / 100) * 100,
          currency: "INR",
          stock: rand(0, 300),
          fulfillmentType: pick(["express", "standard"]),
          rating: randFloat(3.7, 4.8),
          reviewCount: rand(100, 30000),
          returnRate: randFloat(1.5, 6),
          complaintRate: randFloat(0.5, 3.5),
          unitsSold: rand(1000, 100000),
          salesVelocity: rand(100, 5000),
          viewCount: rand(10000, 600000),
          color: color.toLowerCase(),
          searchTags: ["samsung", "galaxy", "smartphone", phone.model.toLowerCase(), storage.toLowerCase(), ram.toLowerCase(), "android", "5g"],
          launchYear: phone.year,
          metadata: {
            ram: ram,
            storage: storage,
            screenSize: phone.display,
            os: "Android 14",
            processor: "Snapdragon 8 Gen 3 / Exynos",
            battery: `${rand(3500, 5000)}mAh`,
            camera: `${rand(50, 200)}MP`,
            color: color,
            warranty: "1 Year Samsung India Warranty",
            displayType: "Dynamic AMOLED 2X",
          },
        });
      }
    }
  }
  return products;
}

// ──────────────────────────────────────────────
// ONEPLUS
// ──────────────────────────────────────────────
const oneplusModels = [
  { model: "OnePlus Nord CE 3 Lite", year: 2023, basePrice: 19999, storage: ["128GB"], ram: ["8GB"], display: "6.7 inches" },
  { model: "OnePlus Nord CE 4", year: 2024, basePrice: 24999, storage: ["128GB", "256GB"], ram: ["8GB", "12GB"], display: "6.7 inches" },
  { model: "OnePlus Nord 4", year: 2024, basePrice: 29999, storage: ["128GB", "256GB"], ram: ["8GB", "12GB"], display: "6.74 inches" },
  { model: "OnePlus 12R", year: 2024, basePrice: 39999, storage: ["128GB", "256GB"], ram: ["8GB", "16GB"], display: "6.78 inches" },
  { model: "OnePlus 12", year: 2024, basePrice: 64999, storage: ["256GB", "512GB"], ram: ["12GB", "16GB"], display: "6.82 inches" },
];

function generateOneplus() {
  const colors = ["Flowy Emerald", "Silky Black", "Cool Blue", "Midnight Jade", "Iron Gray", "Pacific Blue"];
  return oneplusModels.flatMap((phone) =>
    phone.storage.flatMap((storage) =>
      phone.ram.slice(0, rand(1, 2)).map((ram) => {
        const color = pick(colors);
        const price = phone.basePrice + rand(-1000, 2000);
        const mrp = price + rand(1500, 5000);
        return {
          title: `${phone.model} ${ram} RAM ${storage} ${color}`,
          description: `${phone.model} with ${ram} RAM, ${storage} storage, ${phone.display} AMOLED display, 100W SuperVOOC fast charging.`,
          brand: "OnePlus",
          category: "Mobile Phones",
          model: phone.model,
          price: Math.round(price / 100) * 100,
          mrp: Math.round(mrp / 100) * 100,
          currency: "INR",
          stock: rand(10, 200),
          fulfillmentType: pick(["express", "standard"]),
          rating: randFloat(3.9, 4.7),
          reviewCount: rand(200, 15000),
          returnRate: randFloat(1, 4),
          complaintRate: randFloat(0.5, 2.5),
          unitsSold: rand(2000, 50000),
          salesVelocity: rand(100, 2000),
          viewCount: rand(20000, 300000),
          color: color.toLowerCase(),
          searchTags: ["oneplus", "smartphone", phone.model.toLowerCase(), "android", "fast charging"],
          launchYear: phone.year,
          metadata: { ram, storage, screenSize: phone.display, os: "OxygenOS", battery: "5400mAh", displayType: "AMOLED 120Hz", color },
        };
      })
    )
  );
}

// ──────────────────────────────────────────────
// REALME / REDMI / POCO / VIVO / OPPO
// ──────────────────────────────────────────────
function generateBudgetPhones() {
  const brands = [
    { name: "Realme", models: ["Realme C67", "Realme 12 Pro+", "Realme Narzo 70 Pro", "Realme GT 6T", "Realme C55", "Realme 12+"], range: [10000, 40000] },
    { name: "Redmi", models: ["Redmi 13C", "Redmi 13", "Redmi Note 13", "Redmi Note 13 Pro", "Redmi Note 13 Pro+", "Redmi A3", "Redmi 12 5G"], range: [8000, 35000] },
    { name: "Poco", models: ["Poco M6 Pro", "Poco X6 Pro", "Poco F6", "Poco C75", "Poco X6", "Poco M6 5G"], range: [9000, 35000] },
    { name: "Vivo", models: ["Vivo Y200", "Vivo V30", "Vivo V30 Pro", "Vivo T3x", "Vivo Y100"], range: [12000, 45000] },
    { name: "Oppo", models: ["Oppo A78", "Oppo Reno 11", "Oppo Reno 12 Pro", "Oppo F25 Pro", "Oppo Find X7"], range: [15000, 60000] },
    { name: "Motorola", models: ["Moto G85", "Moto G64", "Moto G35", "Moto Edge 50 Pro", "Moto Edge 50 Fusion"], range: [12000, 35000] },
    { name: "Nokia", models: ["Nokia G42 5G", "Nokia C32", "Nokia G310 5G", "Nokia 105 4G", "Nokia 150 2G"], range: [3000, 18000] },
  ];

  const colors = ["Black", "Blue", "Green", "Gold", "Purple", "White", "Grey", "Orange"];
  const storages = ["64GB", "128GB", "256GB"];
  const rams = ["4GB", "6GB", "8GB", "12GB"];
  const products = [];

  for (const brand of brands) {
    for (const model of brand.models) {
      const numVariants = rand(2, 4);
      for (let v = 0; v < numVariants; v++) {
        const storage = pick(storages);
        const ram = pick(rams);
        const color = pick(colors);
        const price = rand(brand.range[0], brand.range[1]);
        const mrp = price + rand(1000, 6000);
        products.push({
          title: `${brand.name} ${model} ${ram} RAM ${storage} ${color}`,
          description: `${model} by ${brand.name} - ${rand(6, 7)}.${rand(1, 9)} inch display, ${ram} RAM, ${storage} storage, ${rand(5000, 6000)}mAh battery. Great value for money smartphone.`,
          brand: brand.name,
          category: "Mobile Phones",
          model: model,
          price: Math.round(price / 100) * 100,
          mrp: Math.round(mrp / 100) * 100,
          currency: "INR",
          stock: rand(5, 500),
          fulfillmentType: "standard",
          rating: randFloat(3.5, 4.5),
          reviewCount: rand(50, 20000),
          returnRate: randFloat(2, 8),
          complaintRate: randFloat(1, 5),
          unitsSold: rand(500, 60000),
          salesVelocity: rand(50, 2000),
          viewCount: rand(5000, 200000),
          color: color.toLowerCase(),
          searchTags: [brand.name.toLowerCase(), model.toLowerCase(), "smartphone", "android", storage.toLowerCase(), ram.toLowerCase()],
          launchYear: rand(2022, 2024),
          metadata: { ram, storage, screenSize: `${rand(6, 7)}.${rand(1, 9)} inches`, os: "Android", battery: `${rand(4500, 6000)}mAh`, color },
        });
      }
    }
  }
  return products;
}

// ──────────────────────────────────────────────
// LAPTOPS
// ──────────────────────────────────────────────
function generateLaptops() {
  const laptops = [
    // Apple MacBooks
    { brand: "Apple", series: "MacBook Air M1", year: 2020, basePrice: 72900, storage: ["256GB", "512GB", "1TB"], ram: ["8GB", "16GB"], display: "13.3 inches", displayType: "Retina IPS" },
    { brand: "Apple", series: "MacBook Air M2", year: 2022, basePrice: 99900, storage: ["256GB", "512GB", "1TB"], ram: ["8GB", "16GB", "24GB"], display: "13.6 inches", displayType: "Liquid Retina" },
    { brand: "Apple", series: "MacBook Air M3", year: 2024, basePrice: 109900, storage: ["256GB", "512GB", "1TB"], ram: ["8GB", "16GB", "24GB"], display: "13.6 inches", displayType: "Liquid Retina" },
    { brand: "Apple", series: "MacBook Pro 14 M3", year: 2023, basePrice: 168900, storage: ["512GB", "1TB", "2TB"], ram: ["8GB", "18GB", "36GB"], display: "14.2 inches", displayType: "Liquid Retina XDR" },
    // Dell
    { brand: "Dell", series: "Inspiron 15 3520", year: 2023, basePrice: 42999, storage: ["256GB", "512GB", "1TB"], ram: ["8GB", "16GB"], display: "15.6 inches", displayType: "FHD IPS" },
    { brand: "Dell", series: "XPS 13 Plus", year: 2023, basePrice: 139999, storage: ["512GB", "1TB"], ram: ["16GB", "32GB"], display: "13.4 inches", displayType: "OLED Touch" },
    { brand: "Dell", series: "Vostro 14 3440", year: 2024, basePrice: 52999, storage: ["512GB"], ram: ["8GB", "16GB"], display: "14 inches", displayType: "FHD IPS" },
    // HP
    { brand: "HP", series: "15s-fq5007TU", year: 2023, basePrice: 47999, storage: ["512GB"], ram: ["8GB", "16GB"], display: "15.6 inches", displayType: "FHD IPS" },
    { brand: "HP", series: "Pavilion x360", year: 2023, basePrice: 65999, storage: ["512GB", "1TB"], ram: ["8GB", "16GB"], display: "14 inches", displayType: "FHD Touch 360" },
    { brand: "HP", series: "Omen 16", year: 2024, basePrice: 129999, storage: ["1TB", "2TB"], ram: ["16GB", "32GB"], display: "16.1 inches", displayType: "QHD 165Hz" },
    // Lenovo
    { brand: "Lenovo", series: "IdeaPad Slim 3", year: 2023, basePrice: 37999, storage: ["256GB", "512GB"], ram: ["8GB"], display: "15.6 inches", displayType: "FHD IPS" },
    { brand: "Lenovo", series: "ThinkPad E14 Gen 5", year: 2023, basePrice: 69999, storage: ["512GB", "1TB"], ram: ["16GB", "32GB"], display: "14 inches", displayType: "FHD IPS" },
    { brand: "Lenovo", series: "Legion 5 Pro", year: 2024, basePrice: 94999, storage: ["512GB", "1TB"], ram: ["16GB", "32GB"], display: "16 inches", displayType: "WQXGA 165Hz" },
    // Asus
    { brand: "Asus", series: "VivoBook 15", year: 2023, basePrice: 39999, storage: ["512GB"], ram: ["8GB", "16GB"], display: "15.6 inches", displayType: "FHD IPS" },
    { brand: "Asus", series: "ROG Strix G16", year: 2024, basePrice: 139999, storage: ["1TB"], ram: ["16GB", "32GB"], display: "16 inches", displayType: "QHD 240Hz" },
  ];

  const colors = ["Silver", "Space Grey", "Black", "Blue", "White", "Midnight", "Starlight"];
  const products = [];

  for (const laptop of laptops) {
    for (const storage of laptop.storage.slice(0, rand(2, 3))) {
      for (const ram of laptop.ram.slice(0, rand(1, 2))) {
        const color = pick(colors);
        const storageAdder = storage.includes("2TB") ? 20000 : storage.includes("1TB") ? 10000 : storage.includes("512GB") ? 5000 : 0;
        const ramAdder = parseInt(ram) >= 32 ? 15000 : parseInt(ram) >= 16 ? 7000 : 0;
        const price = laptop.basePrice + storageAdder + ramAdder + rand(-2000, 3000);
        const mrp = price + rand(3000, 15000);
        products.push({
          title: `${laptop.brand} ${laptop.series} ${ram} RAM ${storage} SSD`,
          description: `${laptop.brand} ${laptop.series} laptop with ${ram} RAM and ${storage} SSD. Features ${laptop.display} ${laptop.displayType} display, long battery life, ideal for work and study.`,
          brand: laptop.brand,
          category: "Laptops",
          model: laptop.series,
          price: Math.round(price / 100) * 100,
          mrp: Math.round(mrp / 100) * 100,
          currency: "INR",
          stock: rand(5, 100),
          fulfillmentType: pick(["standard", "express"]),
          rating: randFloat(3.8, 4.8),
          reviewCount: rand(100, 8000),
          returnRate: randFloat(1, 4),
          complaintRate: randFloat(0.5, 2.5),
          unitsSold: rand(500, 30000),
          salesVelocity: rand(30, 800),
          viewCount: rand(5000, 200000),
          color: color.toLowerCase(),
          searchTags: [laptop.brand.toLowerCase(), "laptop", laptop.series.toLowerCase(), ram.toLowerCase(), storage.toLowerCase(), "notebook"],
          launchYear: laptop.year,
          metadata: {
            ram, storage, screenSize: laptop.display, displayType: laptop.displayType,
            os: laptop.brand === "Apple" ? "macOS Sonoma" : "Windows 11",
            processor: laptop.brand === "Apple" ? "Apple M-series" : pick(["Intel Core i5", "Intel Core i7", "AMD Ryzen 5", "AMD Ryzen 7", "Intel Core Ultra 5"]),
            battery: `${rand(40, 100)}Whr`,
            weight: `${randFloat(1.2, 2.5)} kg`,
            warranty: "1 Year Manufacturer Warranty",
          },
        });
      }
    }
  }
  return products;
}

// ──────────────────────────────────────────────
// HEADPHONES / EARPHONES
// ──────────────────────────────────────────────
function generateAudio() {
  const products = [];

  const headphones = [
    { brand: "Sony", model: "WH-1000XM5", type: "Headphones", basePrice: 24990, year: 2022 },
    { brand: "Sony", model: "WH-1000XM4", type: "Headphones", basePrice: 19990, year: 2020 },
    { brand: "Sony", model: "WH-CH720N", type: "Headphones", basePrice: 9990, year: 2023 },
    { brand: "Bose", model: "QuietComfort 45", type: "Headphones", basePrice: 27990, year: 2021 },
    { brand: "Bose", model: "QuietComfort Ultra", type: "Headphones", basePrice: 34990, year: 2023 },
    { brand: "JBL", model: "Tour One M2", type: "Headphones", basePrice: 13999, year: 2023 },
    { brand: "JBL", model: "Tune 770NC", type: "Headphones", basePrice: 7999, year: 2023 },
    { brand: "boAt", model: "Rockerz 450", type: "Headphones", basePrice: 1499, year: 2022 },
    { brand: "boAt", model: "Nirvana Ion", type: "Headphones", basePrice: 4999, year: 2023 },
    { brand: "Noise", model: "Noise One", type: "Headphones", basePrice: 3999, year: 2023 },
    { brand: "Sennheiser", model: "HD 450BT", type: "Headphones", basePrice: 8990, year: 2020 },
    { brand: "Audio-Technica", model: "ATH-M50xBT2", type: "Headphones", basePrice: 15990, year: 2022 },
    // TWS Earbuds
    { brand: "Apple", model: "AirPods Pro 2nd Gen", type: "Earphones", basePrice: 24900, year: 2022 },
    { brand: "Apple", model: "AirPods 3rd Gen", type: "Earphones", basePrice: 19900, year: 2021 },
    { brand: "Samsung", model: "Galaxy Buds3 Pro", type: "Earphones", basePrice: 17999, year: 2024 },
    { brand: "Samsung", model: "Galaxy Buds FE", type: "Earphones", basePrice: 8999, year: 2023 },
    { brand: "Sony", model: "WF-1000XM5", type: "Earphones", basePrice: 19990, year: 2023 },
    { brand: "JBL", model: "Live Pro 2 TWS", type: "Earphones", basePrice: 7999, year: 2023 },
    { brand: "JBL", model: "Tune Flex", type: "Earphones", basePrice: 4999, year: 2023 },
    { brand: "boAt", model: "Airdopes 141", type: "Earphones", basePrice: 1299, year: 2022 },
    { brand: "boAt", model: "Airdopes 411 ANC", type: "Earphones", basePrice: 2999, year: 2023 },
    { brand: "Noise", model: "Buds VS104", type: "Earphones", basePrice: 1799, year: 2023 },
    { brand: "OnePlus", model: "Buds Pro 2", type: "Earphones", basePrice: 7999, year: 2023 },
    { brand: "Realme", model: "Buds T300", type: "Earphones", basePrice: 2499, year: 2023 },
    { brand: "Redmi", model: "Buds 5 Pro", type: "Earphones", basePrice: 3999, year: 2024 },
    // Wired earphones
    { brand: "boAt", model: "BassHeads 242", type: "Earphones", basePrice: 499, year: 2022 },
    { brand: "JBL", model: "Tune 110", type: "Earphones", basePrice: 799, year: 2021 },
    { brand: "Sony", model: "MDR-EX155AP", type: "Earphones", basePrice: 1190, year: 2021 },
    { brand: "Sennheiser", model: "CX 80S", type: "Earphones", basePrice: 1990, year: 2020 },
  ];

  const colors = ["Black", "White", "Blue", "Silver", "Midnight Blue", "Beige", "Green", "Pink", "Red"];

  for (const item of headphones) {
    const numVariants = rand(1, 3);
    const selectedColors = pickN(colors, numVariants);
    for (const color of selectedColors) {
      const price = item.basePrice + rand(-300, 1000);
      const mrp = price + rand(500, 5000);
      products.push({
        title: `${item.brand} ${item.model} ${item.type === "Headphones" ? "Over-Ear Headphones" : "TWS Earbuds"} - ${color}`,
        description: `${item.brand} ${item.model} - Premium ${item.type} with ANC, ${rand(20, 40)} hours battery life, Bluetooth ${rand(5, 6)}.${rand(0, 3)}, and high-fidelity audio. Perfect for music lovers.`,
        brand: item.brand,
        category: item.type === "Headphones" ? "Headphones" : "Earphones",
        model: item.model,
        price: Math.round(price / 100) * 100,
        mrp: Math.round(mrp / 100) * 100,
        currency: "INR",
        stock: rand(20, 500),
        fulfillmentType: pick(["express", "standard"]),
        rating: randFloat(3.7, 4.9),
        reviewCount: rand(100, 50000),
        returnRate: randFloat(1, 5),
        complaintRate: randFloat(0.5, 3),
        unitsSold: rand(1000, 200000),
        salesVelocity: rand(200, 8000),
        viewCount: rand(10000, 1000000),
        color: color.toLowerCase(),
        searchTags: [item.brand.toLowerCase(), item.model.toLowerCase(), "headphones", "earphones", "earbuds", "audio", color.toLowerCase()],
        launchYear: item.year,
        metadata: {
          type: item.type,
          connectivity: item.basePrice > 1000 ? "Bluetooth 5.3" : "Wired 3.5mm",
          battery: `${rand(6, 40)} hours`,
          anc: item.basePrice > 3000 ? "Yes" : "No",
          color,
          warranty: "1 Year Brand Warranty",
          soundOutput: `${rand(10, 40)}mm Driver`,
          waterResistance: pick(["IPX4", "IPX5", "IP54", "Not Rated"]),
        },
      });
    }
  }
  return products;
}

// ──────────────────────────────────────────────
// SMARTWATCHES
// ──────────────────────────────────────────────
function generateSmartWatches() {
  const watches = [
    { brand: "Apple", model: "Apple Watch Series 9 41mm", basePrice: 39900, year: 2023 },
    { brand: "Apple", model: "Apple Watch Series 9 45mm", basePrice: 44900, year: 2023 },
    { brand: "Apple", model: "Apple Watch SE 2nd Gen", basePrice: 29900, year: 2022 },
    { brand: "Samsung", model: "Galaxy Watch 6 40mm", basePrice: 22999, year: 2023 },
    { brand: "Samsung", model: "Galaxy Watch 7 44mm", basePrice: 29999, year: 2024 },
    { brand: "Garmin", model: "Garmin Venu 3", basePrice: 49990, year: 2023 },
    { brand: "Noise", model: "Noise ColorFit Pulse 4", basePrice: 2499, year: 2024 },
    { brand: "boAt", model: "boAt Wave Neo", basePrice: 1999, year: 2023 },
    { brand: "Realme", model: "Realme Watch 3 Pro", basePrice: 4999, year: 2022 },
    { brand: "OnePlus", model: "OnePlus Watch 2", basePrice: 17999, year: 2024 },
    { brand: "Fire-Boltt", model: "Fire-Boltt Phoenix Pro", basePrice: 2999, year: 2024 },
    { brand: "Amazfit", model: "Amazfit GTR 4", basePrice: 14999, year: 2022 },
    { brand: "Fitbit", model: "Fitbit Versa 4", basePrice: 16999, year: 2022 },
  ];
  const straps = ["Midnight", "Starlight", "Product RED", "Storm Blue", "Black Silicon", "Blue Nylon"];
  const products = [];
  for (const w of watches) {
    for (let i = 0; i < rand(2, 4); i++) {
      const strap = pick(straps);
      const price = w.basePrice + rand(-500, 2000);
      const mrp = price + rand(1000, 5000);
      products.push({
        title: `${w.brand} ${w.model} Smartwatch - ${strap}`,
        description: `${w.brand} ${w.model} featuring health tracking, GPS, ${rand(10, 21)} day battery life, and 100+ workout modes. Water resistant with sleep tracking.`,
        brand: w.brand,
        category: "Smartwatches",
        model: w.model,
        price: Math.round(price / 100) * 100,
        mrp: Math.round(mrp / 100) * 100,
        currency: "INR",
        stock: rand(10, 200),
        fulfillmentType: pick(["express", "standard"]),
        rating: randFloat(3.6, 4.8),
        reviewCount: rand(50, 20000),
        returnRate: randFloat(1, 5),
        complaintRate: randFloat(0.5, 3),
        unitsSold: rand(500, 50000),
        salesVelocity: rand(50, 2000),
        viewCount: rand(5000, 300000),
        color: strap.toLowerCase(),
        searchTags: [w.brand.toLowerCase(), "smartwatch", "watch", "fitness tracker", "health watch", w.model.toLowerCase()],
        launchYear: w.year,
        metadata: { displaySize: `${randFloat(1.5, 2.0)} inches`, battery: `${rand(300, 600)}mAh`, waterResistance: "5ATM", sensors: "Heart Rate, SpO2, GPS", color: strap },
      });
    }
  }
  return products;
}

// ──────────────────────────────────────────────
// PHONE ACCESSORIES
// ──────────────────────────────────────────────
function generateAccessories() {
  const products = [];
  const coverTypes = ["Transparent Back Cover", "Leather Flip Cover", "Silicone Case", "Tempered Glass + Cover Combo", "Shockproof Rugged Case", "Wallet Flip Case", "Clear TPU Case", "Military Grade Tough Cover"];
  const phonesForCovers = [
    "iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16", "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15", "iPhone 14 Pro Max", "iPhone 14", "iPhone 13",
    "Samsung Galaxy S24 Ultra", "Samsung Galaxy S24", "Samsung Galaxy A55", "Samsung Galaxy A35",
    "OnePlus 12", "Realme GT 6T", "Redmi Note 13 Pro+", "Poco X6 Pro", "Vivo V30 Pro"
  ];
  const brands = ["Spigen", "OtterBox", "Ringke", "Caseology", "boAt", "FlipKover", "GeneriX", "Stuffcool", "Mivi"];
  const colors = ["Black", "Blue", "Clear", "Red", "Green", "Lavender", "Military Green", "Navy"];

  for (const phone of phonesForCovers) {
    for (let i = 0; i < rand(3, 6); i++) {
      const coverType = pick(coverTypes);
      const brand = pick(brands);
      const color = pick(colors);
      const price = rand(199, 2499);
      const mrp = price + rand(200, 1500);
      const strong = coverType.includes("Rugged") || coverType.includes("Tough") || coverType.includes("Military");
      products.push({
        title: `${brand} ${coverType} for ${phone} - ${color}`,
        description: `${coverType} for ${phone} by ${brand}. ${strong ? "Military grade drop protection, " : ""}Precise cutouts, raised edges for camera protection. Available in ${color}.`,
        brand: brand,
        category: "Phone Accessories",
        model: `${coverType} for ${phone}`,
        price: Math.round(price / 100) * 100 || price,
        mrp: Math.round(mrp / 100) * 100 || mrp,
        currency: "INR",
        stock: rand(50, 1000),
        fulfillmentType: "standard",
        rating: randFloat(3.5, 4.7),
        reviewCount: rand(10, 10000),
        returnRate: randFloat(2, 8),
        complaintRate: randFloat(1, 5),
        unitsSold: rand(200, 50000),
        salesVelocity: rand(100, 5000),
        viewCount: rand(1000, 100000),
        color: color.toLowerCase(),
        searchTags: ["cover", "case", "phone cover", phone.toLowerCase().split(" ").join(""), "protect", strong ? "strong" : "slim", "mobile cover"],
        launchYear: 2023,
        metadata: { compatiblePhone: phone, material: pick(["TPU", "Polycarbonate", "Leather", "Silicone"]), protection: strong ? "Military Grade" : "Standard", color },
      });
    }
  }
  return products;
}

// ──────────────────────────────────────────────
// CHARGERS & CABLES
// ──────────────────────────────────────────────
function generateChargersAndCables() {
  const products = [];
  const items = [
    { title: "65W USB-C PD Fast Charger", brand: "Anker", basePrice: 1999, category: "Chargers & Cables" },
    { title: "Apple 20W USB-C Power Adapter", brand: "Apple", basePrice: 1900, category: "Chargers & Cables" },
    { title: "Samsung 45W Super Fast Charging Adapter", brand: "Samsung", basePrice: 2499, category: "Chargers & Cables" },
    { title: "OnePlus 100W SUPERVOOC Flash Charger", brand: "OnePlus", basePrice: 1499, category: "Chargers & Cables" },
    { title: "boAt 65W Dual Port Charger", brand: "boAt", basePrice: 1299, category: "Chargers & Cables" },
    { title: "Anchor USB-C to Lightning Cable 1m", brand: "Anker", basePrice: 999, category: "Chargers & Cables" },
    { title: "Apple USB-C to Lightning Cable 1m", brand: "Apple", basePrice: 1900, category: "Chargers & Cables" },
    { title: "Belkin USB-C to USB-C Cable 2m", brand: "Belkin", basePrice: 1299, category: "Chargers & Cables" },
    { title: "Mivi 3-in-1 Charging Cable", brand: "Mivi", basePrice: 499, category: "Chargers & Cables" },
    { title: "Mi 67W GaN Charger", brand: "Xiaomi", basePrice: 1799, category: "Chargers & Cables" },
    { title: "Powerbank 20000mAh 22.5W Fast Charge", brand: "Redmi", basePrice: 1999, category: "Power Banks" },
    { title: "Powerbank 10000mAh 20W PD", brand: "boAt", basePrice: 1299, category: "Power Banks" },
    { title: "Apple MagSafe Charger 15W", brand: "Apple", basePrice: 3900, category: "Chargers & Cables" },
  ];

  for (const item of items) {
    for (let v = 0; v < rand(2, 4); v++) {
      const price = item.basePrice + rand(-200, 500);
      const mrp = price + rand(300, 1500);
      products.push({
        title: item.title + (v > 0 ? ` (Pack of ${v + 1})` : ""),
        description: `${item.title} from ${item.brand}. Fast, safe, and reliable charging solution for your devices.`,
        brand: item.brand,
        category: item.category,
        model: item.title,
        price: Math.round(price),
        mrp: Math.round(mrp),
        currency: "INR",
        stock: rand(50, 2000),
        fulfillmentType: "standard",
        rating: randFloat(3.6, 4.8),
        reviewCount: rand(50, 20000),
        returnRate: randFloat(1, 5),
        complaintRate: randFloat(0.5, 3),
        unitsSold: rand(1000, 100000),
        salesVelocity: rand(200, 5000),
        viewCount: rand(5000, 200000),
        color: "white",
        searchTags: ["charger", "cable", "fast charging", item.brand.toLowerCase(), "power bank", "usb", "type c"],
        launchYear: rand(2022, 2024),
        metadata: { wattage: `${pick([20, 30, 45, 65, 100])}W`, connector: pick(["USB-C", "Lightning", "Micro USB", "Multi"]) },
      });
    }
  }
  return products;
}

// ──────────────────────────────────────────────
// TABLETS
// ──────────────────────────────────────────────
function generateTablets() {
  const tablets = [
    { brand: "Apple", model: "iPad 10th Gen", basePrice: 34900, storage: ["64GB", "256GB"], year: 2022 },
    { brand: "Apple", model: "iPad Air M2", basePrice: 59900, storage: ["128GB", "256GB"], year: 2024 },
    { brand: "Apple", model: "iPad Pro M4 11-inch", basePrice: 99900, storage: ["256GB", "512GB", "1TB"], year: 2024 },
    { brand: "Samsung", model: "Galaxy Tab A9+", basePrice: 22999, storage: ["64GB", "128GB"], year: 2023 },
    { brand: "Samsung", model: "Galaxy Tab S9 FE", basePrice: 36999, storage: ["128GB", "256GB"], year: 2023 },
    { brand: "Samsung", model: "Galaxy Tab S9 Ultra", basePrice: 109999, storage: ["256GB", "512GB", "1TB"], year: 2023 },
    { brand: "Realme", model: "Realme Pad 2", basePrice: 14999, storage: ["64GB", "128GB"], year: 2023 },
    { brand: "Lenovo", model: "Tab P12 Pro", basePrice: 51999, storage: ["128GB", "256GB"], year: 2023 },
  ];

  const colors = ["Space Grey", "Silver", "Starlight", "Pink", "Blue", "Black", "Graphite"];
  const products = [];

  for (const t of tablets) {
    for (const storage of t.storage) {
      const color = pick(colors);
      const price = t.basePrice + (parseInt(storage) >= 256 ? 7000 : 0) + rand(-1000, 2000);
      const mrp = price + rand(3000, 10000);
      products.push({
        title: `${t.brand} ${t.model} ${storage} ${color}`,
        description: `${t.brand} ${t.model} tablet with ${storage} storage, featuring stunning display, all-day battery life and premium build quality.`,
        brand: t.brand,
        category: "Tablets",
        model: t.model,
        price: Math.round(price / 100) * 100,
        mrp: Math.round(mrp / 100) * 100,
        currency: "INR",
        stock: rand(5, 100),
        fulfillmentType: pick(["express", "standard"]),
        rating: randFloat(3.9, 4.8),
        reviewCount: rand(100, 5000),
        returnRate: randFloat(1, 4),
        complaintRate: randFloat(0.5, 2.5),
        unitsSold: rand(500, 20000),
        salesVelocity: rand(30, 500),
        viewCount: rand(5000, 150000),
        color: color.toLowerCase(),
        searchTags: [t.brand.toLowerCase(), "tablet", "ipad", t.model.toLowerCase(), storage.toLowerCase(), color.toLowerCase()],
        launchYear: t.year,
        metadata: { storage, screenSize: `${randFloat(10, 13, 1)} inches`, os: t.brand === "Apple" ? "iPadOS 17" : "Android 13", color },
      });
    }
  }
  return products;
}

// ──────────────────────────────────────────────
// MAIN SEED FUNCTION
// ──────────────────────────────────────────────
async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce_search";
  let useDB = true;

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    console.log("✅  Connected to MongoDB");
  } catch (err) {
    console.warn("⚠️   MongoDB unavailable. Seeding into in-memory store...");
    useDB = false;
    process.env.USE_IN_MEMORY = "true";
  }

  // Generate all products
  console.log("🔄  Generating products...");
  const allProducts = [
    ...generateIphones(),
    ...generateSamsung(),
    ...generateOneplus(),
    ...generateBudgetPhones(),
    ...generateLaptops(),
    ...generateAudio(),
    ...generateSmartWatches(),
    ...generateAccessories(),
    ...generateChargersAndCables(),
    ...generateTablets(),
  ];

  console.log(`📦  Total products generated: ${allProducts.length}`);

  if (useDB) {
    const Product = require("../models/Product");
    // Clear existing data
    await Product.deleteMany({});
    console.log("🗑️   Cleared existing products");

    // Batch insert
    const BATCH = 100;
    let inserted = 0;
    for (let i = 0; i < allProducts.length; i += BATCH) {
      const batch = allProducts.slice(i, i + BATCH);
      await Product.insertMany(batch, { ordered: false });
      inserted += batch.length;
      process.stdout.write(`\r   Inserted ${inserted}/${allProducts.length} products...`);
    }
    console.log(`\n✅  Seeded ${inserted} products into MongoDB`);
    await mongoose.disconnect();
  } else {
    const store = require("../store/inMemoryStore");
    store.bulkInsert(allProducts);
    console.log(`✅  Seeded ${store.count} products into in-memory store`);
    console.log("   (Note: in-memory store is not persistent across restarts)");
  }

  console.log("\n🎉  Seed complete! You can now start the server with: npm start\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});