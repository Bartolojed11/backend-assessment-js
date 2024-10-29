import { Context } from "hono";
const { format } = require("date-fns");
import { env } from "hono/adapter";
// Services
import HTTPproduct from "./../../services/HTTPproduct";
import ProductService from "./../../services/product";
// Types
import { parsedProducts } from "./../../types/product";

const insertVariants = async (c: Context) => {
  const productHTTPservice = new HTTPproduct();
  const productService = new ProductService();
  const products = await productHTTPservice.get("/get");
  if (!products?.success) {
    return c.json({
      success: false,
      message: "Failed to get products from the external api.",
      data: null,
    });
  }

  const parsedProducts: parsedProducts[] = products.data.products.flatMap(
    (product) => {
      return product.variants.map((variant) => {
        return {
          variant_id: variant.id,
          main_product_id: product.id,
          title: `${product.title} ${variant.title}`,
          tags: product.tags,
          created_at: new Date(),
          updated_at: new Date(),
          sku: variant.sku,
        };
      });
    }
  );

  const bulkInsertStatus: boolean = await productService.bulkInsert(
    parsedProducts
  );

  return c.json({
    success: bulkInsertStatus,
    message: bulkInsertStatus
      ? "Records successfully inserted."
      : "Failed to insert records",
    data: bulkInsertStatus ? parsedProducts : null,
  });
};

const insertProducts = async (c: Context) => {
  const productHTTPservice = new HTTPproduct();
  const products = await productHTTPservice.get("getProducts");
  const productService = new ProductService();

  if (!products?.success) {
    return c.json({
      success: false,
      message: "Failed to get products from the external api.",
      data: null,
    });
  }

  const parsedProducts: parsedProducts[] = products.data.products.flatMap(
    (product) => {
      return {
        variant_id: null,
        main_product_id: product.id,
        title: `${product.title} ${product.title}`,
        tags: product.tags,
        created_at: new Date(),
        updated_at: new Date(),
        sku: "",
      };
    }
  );

  const bulkInsertStatus: boolean = await productService.bulkInsert(
    parsedProducts
  );
  const allProducts = await productService.products();
  let formattedProducts = {};

  if (bulkInsertStatus && allProducts.data) {
    formattedProducts = allProducts.data.map((data: any) => {
      const createdAt = new Date(data.created_at);
      const updatedAt = new Date(data.updated_at);
      return {
        productID: data.id,
        title: data.title,
        tags: data.tags,
        created_at: format(createdAt, "MMMM d, yyyy h:mma"),
        updated_at: format(updatedAt, "MMMM d, yyyy h:mma"),
        product_code: null,
      };
    });
  }

  return c.json({
    success: bulkInsertStatus,
    message: bulkInsertStatus
      ? "Records successfully inserted."
      : "Failed to insert records",
    data: bulkInsertStatus ? formattedProducts : null,
  });
};

const deleteProduct = async (c: Context) => {
  const productService = new ProductService();
  const deleteStatus = await productService.deleteProduct(
    Number(c.req.param("id"))
  );
  return c.json({
    success: deleteStatus,
    message: deleteStatus
      ? "Product successfully deleted."
      : "Failed to delete Product",
  });
};

const updateProduct = async (c: Context) => {
  const productService = new ProductService();
  const udpateProductStatus = await productService.updateAllProducts();
  return c.json({
    success: udpateProductStatus,
    message: udpateProductStatus
      ? "Product successfully updated."
      : "Failed to update products",
  });
};

module.exports = {
  insertVariants,
  insertProducts,
  deleteProduct,
  updateProduct,
};
