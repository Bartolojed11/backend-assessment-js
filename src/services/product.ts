import { neon, NeonQueryFunction } from "@neondatabase/serverless";
// Types
import { parsedProducts } from "./../types/product";

class ProductService {
  sql: NeonQueryFunction<false, false>;

  constructor() {
    // TODO: Not sure yet about kvs, env in wrangler, research ways how to do it
    const password = "xxxxxxx";
    const host = "xxxxxxx";
    const dbName = "xxxxxxx";
    this.sql = neon(
      `postgresql://inventory_db_owner:${password}@${host}/${dbName}?sslmode=require`
    );
  }

  async bulkInsert(data: parsedProducts[]): Promise<boolean> {
    const query = `
    INSERT INTO products (variant_id, main_product_id, title, tags, created_at, updated_at, sku) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
    try {
      for (const product of data) {
        await this.sql(query, [
          product.variant_id,
          product.main_product_id,
          product.title,
          product.tags,
          product.created_at,
          product.updated_at,
          product.sku,
        ]);
      }

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async products() {
    try {
      const products = await this.sql("SELECT * FROM products");
      return {
        data: products,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        success: false,
      };
    }
  }

  async product(productId: number) {
    try {
      const query = "SELECT * FROM products WHERE id = $1";
      return await this.sql(query, [productId]);
    } catch (error) {
      return null;
    }
  }

  async updateAllProducts() {
    const products = await this.products();
    const query = `UPDATE products SET title = $1, updated_at = $2 WHERE id = $3`;
    try {
      if (!products.data) {
        throw new Error("There are no products in the database");
      }
      for (const product of products.data) {
        await this.sql(query, [
          `${product.title} ${product.sku}`,
          new Date(),
          product.id,
        ]);
      }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async deleteProduct(productId: number) {
    const product = await this.product(productId);
    const query = `DELETE FROM products WHERE id = $1`;
    try {
      if (!product) {
        throw new Error("Product ID not found");
      }
      await this.sql(query, [productId]);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default ProductService;
