import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchProducts from "./tools/search-products";
import getProduct from "./tools/get-product";
import listCategories from "./tools/list-categories";
import listMyOrders from "./tools/list-my-orders";
import getOrder from "./tools/get-order";

const tools = [
  listCategories,
  searchProducts,
  getProduct,
  listMyOrders,
  getOrder,
] as unknown as Parameters<typeof defineMcp>[0]["tools"];


const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "urban-print-platform",
  title: "Urban Print Platform",
  version: "0.1.0",
  instructions:
    "Herramientas de Urban Print (imprenta y personalización en Orihuela). Consulta el catálogo público con `list_categories`, `search_products` y `get_product`. Con la sesión del usuario, consulta sus pedidos con `list_my_orders` y `get_order`.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools,
});
