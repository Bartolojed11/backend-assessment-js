import { Hono } from "hono";
const product = require("./../modules/products");

// Product routes
const productRoutes = new Hono();
productRoutes.get("/", product.insertVariants);
productRoutes.post("/", product.insertProducts);
productRoutes.delete("/:id", product.deleteProduct);
productRoutes.put("/", product.updateProduct);

// Create new Hono instance
const app = new Hono();
// Bind routes
app.route("/api/product", productRoutes);

module.exports = { app };
