# 🛒 Product Search & Ranking Microservice

A Node.js + Express microservice that bootstraps product data (scraped from Amazon), stores it in-memory, enriches products with metadata, and provides ranked search results based on relevance, pricing, ratings, and availability.

---

## 📌 Problem Overview

The goal of this project is to build a backend microservice that:

- Bootstraps **1000+ products** from the web (Amazon scraping)
- Stores product data **in-memory**
- Allows enriching products with metadata
- Supports a **search API with intelligent ranking**
- Demonstrates real-world backend design & search logic

---

## 🏗 Architecture Overview


- **Data Source**: Amazon (scraped)
- **Storage**: In-memory (array-based)
- **Search**: Token-based relevance + weighted ranking
- **Persistence**: Not used (as per requirement)

---

## 📁 Project Structure

src/
│
├── bootstrap/
│ ├── scrapeAmazon.js # Scrapes product listings from Amazon
│ ├── generateMetrics.js # Generates synthetic metrics
│
├── models/
│ └── Product.js # Product entity model
│
├── store/
│ └── productStore.js # In-memory product store
│
├── services/
│ └── rankingServices.js # Ranking & scoring logic
│
├── routes/
│ ├── productRoutes.js # Product create & update APIs
│ └── searchRoutes.js # Search API
│
├── app.js # App initialization & bootstrapping
└── server.js # Server entry point

## 🚀 Bootstrapping Products

On server startup:

1. Amazon product listings are scraped
2. Products are normalized into a `Product` model
3. Synthetic metrics are generated:
   - Rating
   - Review count
   - Sales
   - Return rate
   - Complaints
4. Products are stored in-memory

```js
scrapeAmazon() → Product[] → productStore

## 🚀 API ENDPOINTS

POST /api/v1/product

PUT /api/v1/product/meta-data

GET /api/v1/search/product?query=sasta iphone

## Library Used - 

| Library | Purpose                    |
| ------- | -------------------------- |
| express | Web framework              |
| axios   | HTTP requests              |
| cheerio | HTML parsing for scraping  |
| uuid    | Unique product identifiers |
| nodemon | Development auto-reload    |

