# 🔍 AUDITORÍA FASE 2: Migración Catálogo a WooCommerce

**Fecha:** 2026-08-28  
**Estado:** AUDITORÍA (sin cambios)  
**Objetivo:** Documentar exactamente qué espera el frontend para definir el adaptador WooCommerce

---

## 1️⃣ TIPOS/INTERFACES ACTUALES

### Tipos Definidos en `src/lib/catalog.functions.ts`:

```typescript
export type Producto = {
  id: string;           // UUID de Supabase
  slug: string;         // Identificador de URL (único)
  name: string;         // Nombre del producto
  price: number;        // Precio en euros (numérico)
  description: string | null;  // Descripción opcional
  featured: boolean;    // Producto destacado (para homepage)
  category_id: string;  // FK a categories.id (UUID)
};

export type Categoria = {
  id: string;           // UUID de Supabase
  slug: string;         // Identificador de URL
  name: string;         // Nombre de categoría
  description: string | null;  // Descripción opcional
  parent_id: string | null;     // FK para subcategorías (jerárquico)
  position: number;     // Orden de visualización
};
```

**CRÍTICO:** `price` es `number`, no `string`. Actualmente Supabase lo devuelve así.

---

## 2️⃣ FLUJO DE DATOS ACTUAL

### Fuente: `src/lib/catalog.functions.ts`

```typescript
export const getCatalogo = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicSupabase();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select(...).order("position"),
    supabase.from("products").select(...).order("position"),
  ]);
  return {
    categories: (categories ?? []) as Categoria[],
    products: (products ?? []) as Producto[],
  };
});
```

**Retorna:**
```json
{
  "categories": [...],
  "products": [...]
}
```

**Consumidores:**
- `src/routes/index.tsx` — Home page (queryCatalog)
- `src/routes/producto.$slug.tsx` — Detalle de producto
- `src/routes/categoria.$slug.tsx` — Página de categoría

---

## 3️⃣ CÓMO USA EL FRONTEND LOS DATOS

### ✅ HomePage (`index.tsx`)

```typescript
const { data } = useSuspenseQuery(catalogoQuery);
const destacados = data.products.filter((p) => p.featured).slice(0, 8);
const novedades = data.products.slice(0, 8);

// Usa en FeaturedCarousel
<FeaturedCarousel products={destacados} />
<FeaturedCarousel products={novedades} />
```

**Requerimientos:**
- ✅ `product.featured` — booleano (true/false)
- ✅ `product.id` — para keys de lista
- ✅ Máximo 8 productos principales

### ✅ ProductCard (`ProductCard.tsx`)

```typescript
type Producto {  // importado de catalog.functions
  slug: string;
  name: string;
  price: number;
  description: string | null;
  featured?: boolean;
}

// Uso:
<Link to="/producto/$slug" params={{ slug: product.slug }}>
<ProductThumb name={product.name} />
<h3>{product.name}</h3>
<p>{product.description}</p>
<span>{eur(Number(product.price))}</span>  // Convierte a euros
<button onClick={() => add({ 
  slug: product.slug, 
  name: product.name, 
  price: Number(product.price)  // Convertido a number
})}>Añadir al carrito</button>
```

**Requerimientos:**
- ✅ `slug` — **OBLIGATORIO** (URL param)
- ✅ `name` — string
- ✅ `price` — number (o convertible a number)
- ✅ `description` — opcional
- ✅ `id` — para keys de lista

### ✅ ProductThumb (`ProductThumb.tsx`)

```typescript
<ProductThumb 
  name={product.name}      // Solo usa el nombre
  ratio="square"           // UI component, no toca producto
/>
```

**⚠️ HALLAZGO IMPORTANTE:**
- **NO usa imágenes reales** 
- Solo recibe `name` y genera placeholder genérico
- Es totalmente agnóstico a dónde vengan los datos
- **Puede sustituirse por imagen real sin cambios en el componente**

### ✅ Detalle de Producto (`producto.$slug.tsx`)

```typescript
const { slug } = Route.useParams();
const { data } = useSuspenseQuery(catalogoQuery);

const producto = data.products.find((p) => p.slug === slug);
if (!producto) throw notFound();

const categoria = data.categories.find((c) => c.id === producto.category_id);
const relacionados = data.products
  .filter((p) => p.category_id === producto.category_id && p.id !== producto.id)
  .slice(0, 4);
```

**Requerimientos:**
- ✅ `slug` — debe matchear URL param
- ✅ `category_id` — para relacionados
- ✅ `id` — para comparación de productos
- ✅ `name`, `description`, `price` — para renderizado

### ✅ Página de Categoría (`categoria.$slug.tsx`)

```typescript
const categoria = data.categories.find((c) => c.slug === slug);
const hijas = data.categories.filter((c) => c.parent_id === categoria.id);
const ids = new Set([categoria.id, ...hijas.map((c) => c.id)]);
const productos = data.products.filter((p) => ids.has(p.category_id));
```

**Requerimientos:**
- ✅ `slug` — debe matchear URL param
- ✅ `parent_id` — para subcategorías jerárquicas
- ✅ `id` — para relación con productos

---

## 4️⃣ DATOS QUE ACTUALMENTE EL FRONTEND REQUIERE

### Productos (MÍNIMO indispensable):

| Campo | Tipo | Obligatorio | Usado en | Notas |
|-------|------|-------------|----------|-------|
| `id` | string | ✅ SÍ | Keys de lista, comparación | UUID o número WooCommerce |
| `slug` | string | ✅ SÍ | URL `/producto/$slug` | **CRÍTICO**: debe ser único |
| `name` | string | ✅ SÍ | Renderizado, carrito | Nombre del producto |
| `price` | number | ✅ SÍ | Renderizado, carrito | Euros, numérico |
| `description` | string\|null | ❌ NO | Renderizado, SEO | Opcional |
| `featured` | boolean | ✅ SÍ | Home (destacados) | true/false |
| `category_id` | string | ✅ SÍ | Relacionados, categoría | FK a categories |

### Categorías (MÍNIMO indispensable):

| Campo | Tipo | Obligatorio | Usado en | Notas |
|-------|------|-------------|----------|-------|
| `id` | string | ✅ SÍ | Relación FK products | UUID o número WooCommerce |
| `slug` | string | ✅ SÍ | URL `/categoria/$slug` | **CRÍTICO**: debe ser único |
| `name` | string | ✅ SÍ | Renderizado, navegación | Nombre categoría |
| `description` | string\|null | ❌ NO | Renderizado, SEO | Opcional |
| `parent_id` | string\|null | ✅ SÍ | Jerarquía subcategorías | null si es raíz |
| `position` | number | ❌ NO | Orden en listados | Actualmente no usado en vistas |

---

## 5️⃣ CAMPOS ADICIONALES QUE EL FRONTEND NO NECESITA (TODAVÍA)

- `regular_price` — WooCommerce tiene, frontend no usa
- `sale_price` — WooCommerce tiene, frontend no usa  
- `images` — WooCommerce tiene, ProductThumb no renderiza aún
- `sku` — WooCommerce tiene, frontend no usa
- `stock_quantity` — Será necesario en FASE X (carrito/checkout)
- `attributes` — Será necesario en FASE X (variaciones)
- `categories[]` — WooCommerce devuelve array, frontend espera category_id

---

## 6️⃣ DATOS ALMACENADOS EN SUPABASE (que SEGUIRÁN ahí):

```sql
-- PRODUCTOS (actualmente en Supabase)
id | slug | name | category_id | price | description | position | featured | created_at

-- CATEGORÍAS (actualmente en Supabase)
id | slug | name | parent_id | description | position | created_at

-- NO MIGRAR TODAVÍA:
reviews (tabla completa)
orders (tabla completa)
order_items (tabla completa)
profiles (tabla completa)
addresses (tabla completa)
downloads (tabla completa)
contact_messages (tabla completa)
auth.users (Supabase Auth)
```

---

## 7️⃣ ANÁLISIS: FEATURED (Productos Destacados)

**Problema detectado:**
- Frontend filtra: `data.products.filter((p) => p.featured)`
- Supabase tiene: `featured: boolean`
- WooCommerce NO tiene campo "featured" en REST API v3 estándar

**Soluciones posibles:**

### Opción A: Usar `featured` de Supabase (fallback)
```typescript
// En el adaptador WooCommerce → Frontend
const adaptarProducto = (wooProd: WooProduct, supabaseData?: Producto) => {
  return {
    ...adaptar(wooProd),
    featured: supabaseData?.featured ?? false,  // Usa Supabase si existe
  };
};
```
❌ Requiere mantener dos fuentes de verdad para este campo

### Opción B: Marcar un set de IDs como featured en código
```typescript
const FEATURED_PRODUCT_IDS = [123, 456, 789]; // IDs de WooCommerce
const featured = FEATURED_PRODUCT_IDS.includes(wooProd.id);
```
❌ No escala

### Opción C: Usar atributo custom de WooCommerce
```
GET /wp-json/wc/v3/products?meta_key=featured&meta_value=true
```
❌ Requiere verificar si está disponible en urbanprint.es

### Opción D: Usar categoría especial como "Destacados"
```
featured_category_id = [123]
const featured = wooProd.categories.some(c => c.id === 123)
```
⚠️ Requiere config en WooCommerce

**RECOMENDACIÓN TEMPORAL:**
Por ahora, deja `featured: false` para todos los productos de WooCommerce.
Cuando se migre la lógica de destacados, lo definimos entonces.

---

## 8️⃣ ANÁLISIS: IMÁGENES

**Situación actual:**
- `ProductThumb` NO usa imágenes reales, solo genera placeholder
- `product.images[]` no existe en Supabase
- WooCommerce DEVUELVE: `images[].src`, `images[].alt`, etc.

**Frontend ready?**
- ✅ ProductThumb NO necesita cambios para aceptar images
- ✅ Todos los componentes son agnósticos a imágenes
- ✅ Cuando quieras usar imágenes reales, solo modifica ProductThumb

**Para esta fase:**
- NO necesitas hacer nada con imágenes
- Dejalas en el adaptador pero no las uses en el frontend todavía

---

## 9️⃣ ANÁLISIS: CATEGORÍAS JERÁRQUICAS

**Actual:** `parent_id` (null | uuid)
- Soporta subcategorías ilimitadas
- Actualmente se usa en `categoria.$slug.tsx` para mostrar hijas

**WooCommerce:** `parent` (int, ID de categoría padre)
- Misma lógica
- Solo cambio: tipo de dato (número en lugar de UUID)

**Riesgo:** NINGUNO
- La lógica ya existe y funciona
- Solo necesitas mapear: `parent` (int) → `parent_id` (string)

---

## 🔟 MAPEO WOOCOMMERCE → FRONTEND

### Estructura del adaptador necesario:

```typescript
// WooCommerce API devuelve:
type WooCommerceProduct = {
  id: number;              // Número
  name: string;
  slug: string;
  description: string;
  price: string;           // STRING, no número!
  regular_price: string;
  sale_price: string;
  sku: string;
  featured: boolean;       // ✅ SÍ LO TIENE
  images: Array<{ src, alt, id }>;
  categories: Array<{ id, name, slug }>;
  stock_quantity: number | null;
  stock_status: string;
  // ... más campos
};

// Frontend espera (Producto type):
type Producto = {
  id: string;              // Convertir: number → string
  slug: string;            // ✅ Directo
  name: string;            // ✅ Directo
  price: number;           // Convertir: string → number
  description: string | null;  // ✅ Directo (puede ser null)
  featured: boolean;       // ✅ Directo (WooCommerce lo tiene)
  category_id: string;     // Convertir: categories[0].id → string
};
```

**ISSUE:** WooCommerce devuelve `categories[]` (array), frontend espera `category_id` (singular)

**Solución:** Usar primera categoría o permitir múltiples (a definir)

---

## 1️⃣1️⃣ REQUERIMIENTOS DEFINITIVOS PARA EL ADAPTADOR

**Debe convertir WooCommerce → Producto:**

```typescript
✅ id: number → string
✅ slug: string (directo)
✅ name: string (directo)
✅ price: string → number (parsear "10.50" → 10.50)
✅ description: string (directo, puede ser null)
✅ featured: boolean (directo, WooCommerce lo tiene)
✅ category_id: string (tomar categories[0].id, convertir a string)

❌ NO convertir:
  - sale_price, regular_price (no se usan todavía)
  - images (preparar pero no usar)
  - sku, stock_quantity (para fases posteriores)
  - attributes, variations (para fases posteriores)
```

---

## 1️⃣2️⃣ PROBLEMAS DETECTADOS

### 🔴 CRÍTICO:

1. **WooCommerce `featured`:** ¿Está activo en urbanprint.es?
   - Necesito verificar que WooCommerce devuelve este campo
   - Si no está, usar solución alternativa (categoría, atributo, etc.)

2. **Categorías múltiples:** WooCommerce permite que un producto esté en múltiples categorías
   - Frontend espera `category_id` (singular)
   - Decisión: ¿Usar primera? ¿Todas? ¿Buscar categoría primaria?

### 🟡 IMPORTANTE:

3. **Precio como string:** WooCommerce devuelve precio como string ("10.50")
   - Frontend necesita `number`
   - Conversión: `Number(wooProd.price)` o `parseFloat(wooProd.price)`

4. **IDs como números:** WooCommerce devuelve IDs numéricos
   - Frontend usa strings (UUIDs de Supabase)
   - Adaptador debe convertir: `String(wooId)`

### 🟢 MENOR:

5. **Position/orden:** Supabase tiene `position`, WooCommerce tiene `menu_order`
   - Frontend no usa actualmente `position`
   - Puede ignorarse por ahora

---

## 1️⃣3️⃣ CONCLUSIÓN DEL ANÁLISIS

✅ **Frontend está preparado para migración:**
- Tipos son simples y claros
- Componentes son agnósticos a fuente de datos
- No hay dependencias hard-coded a Supabase

✅ **Adaptador es trivial:**
- Simple mapeo de campos
- Pocas conversiones de tipos

⚠️ **Decisiones pendientes:**
1. ¿Usar `featured` de WooCommerce? (verificar que existe)
2. ¿Cómo manejar categorías múltiples?
3. ¿Dónde almacenar lista de categorías? (¿actualizar Supabase en sync? ¿usar caché?)

✅ **Paso siguiente:** Crear adaptador y modificar `catalog.functions.ts`

---

## 1️⃣4️⃣ CHANGELOG POST-MIGRACIÓN (Preview)

Una vez migrado:

- ✅ `getCatalogo()` consultará WooCommerce en lugar de Supabase
- ✅ Adaptador convierte WooCommerce → Producto
- ✅ Frontend recibe exactamente el mismo formato actual
- ✅ Componentes no cambian (ProductCard, FeaturedCarousel, etc.)
- ✅ Rutas no cambian
- ✅ URLs siguen siendo `/producto/{slug}` y `/categoria/{slug}`
- ✅ Supabase sigue intacto (para órdenes, usuarios, reviews, etc.)

---

**Estado:** ✅ AUDITORÍA COMPLETADA  
**Siguiente paso:** Esperar confirmación para PASO 2 (Crear adaptador)
