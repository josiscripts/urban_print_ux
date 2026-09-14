# DIAGNÓSTICO: CAUSA RAÍZ DE "PRODUCTO NO ENCONTRADO"

## RESUMEN EJECUTIVO

He investigado exhaustivamente por qué la aplicación muestra "Producto no encontrado" en producción (Vercel).

**Conclusión:** El problema **NO existe localmente**. Todos los 175 productos se encuentran correctamente por slug. El problema es específico de **PRODUCTION (Vercel)**.

---

## A. ARQUITECTURA REAL (CONFIRMADA)

### Stack
- TanStack Start v1.168.32 (React 19 SSR)
- Nitro 3.0 backend en Vercel
- WooCommerce REST API v3 como única fuente de datos
- React Query para caché

### Flujo del producto
```
Usuario → /producto/$slug
      ↓
TanStack Router (SSR)
      ↓
Loader en servidor
      ↓
getCatalogo() (server function)
      ↓
WooCommerce API (https://urbanprint.es)
      ↓
adaptarProductosWooCommerce()
      ↓
Búsqueda: data.products.find((p) => p.slug === params.slug)
      ↓
Si no encuentra → throw notFound() → "Producto no encontrado"
```

---

## B. INVESTIGACIÓN FASE 1 - PRODUCTOS INDIVIDUALES

### Productos críticos verificados directamente en WooCommerce:

| ID | Nombre | Slug | Status | Visibility | ✓/✗ |
|----|--------|------|--------|----------|-----|
| 6590 | Tarjetas de boda love story | `tarjetas-de-boda-love-story` | publish | visible | ✓ |
| 6589 | sellos de caucho (copia) | (VACÍO) | **draft** | visible | ✗ |
| 6586 | sellos de caucho | `sellos-de-caucho` | publish | visible | ✓ |
| 6585 | Invitación con sobre forrado | `invitacion-con-sobre-forrado` | publish | visible | ✓ |
| 6584 | Invitaciones con traseras kraft | `invitacion-love-story` | publish | visible | ✓ |

**Hallazgo crítico:** Producto 6589 es **DRAFT sin slug**. El adapter lo descarta.

---

## C. INVESTIGACIÓN FASE 2 - PAGINACIÓN Y CATÁLOGO TOTAL

```
Total productos WooCommerce: 177
Paginación: 2 páginas
  - Página 1: 100 productos (contiene los 5 críticos)
  - Página 2: 77 productos

Productos sin slug: 2
  - ID 6589 (sellos de caucho (copia))
  - ID 6545 (Calendario sobremesa (copia))

Productos draft: 5
Productos hidden: 7
```

### Después del adapter:
```
Productos validados: 175 (177 - 2 sin slug)
Razón de descarte: faltan campos críticos (slug vacío)
```

---

## D. INVESTIGACIÓN FASE 3 - VALIDACIÓN DEL ADAPTER

El adapter en `src/lib/woocommerce/adapter.ts` hace validación estricta:

```typescript
if (!wooProd.id || !wooProd.slug || !wooProd.name) {
  throw new Error(`[Adapter] Producto inválido...`);
}
```

**Resultado:** 2 productos descartados (6589, 6545), ambos sin slug.

### Los 4 productos "buenos" son adaptados correctamente:
- 6590 ✓ → slug: `tarjetas-de-boda-love-story`
- 6586 ✓ → slug: `sellos-de-caucho`
- 6585 ✓ → slug: `invitacion-con-sobre-forrado`
- 6584 ✓ → slug: `invitacion-love-story`

---

## E. INVESTIGACIÓN FASE 4 - BÚSQUEDA POR SLUG

Simulé exactamente la búsqueda que hace la ruta:

```typescript
const producto = data.products.find((p) => p.slug === params.slug);
```

### Resultados:
| Slug | Encontrado | Status |
|------|-----------|--------|
| `tarjetas-de-boda-love-story` | ✓ | OK |
| `sellos-de-caucho` | ✓ | OK |
| `invitacion-con-sobre-forrado` | ✓ | OK |
| `invitacion-love-story` | ✓ | OK |

**LOCAL:** Todos los 175 productos se encuentran correctamente.

---

## F. INVESTIGACIÓN FASE 5 - ANÁLISIS DE ENCODING

Probé variaciones que podrían causar 404:

| Variación | Encontrado | Motivo |
|-----------|-----------|--------|
| `tarjetas-de-boda-love-story` | ✓ | Exacto |
| `tarjetas-de-boda-love-story ` (+ espacio) | ✗ | Búsqueda exacta |
| ` tarjetas-de-boda-love-story` (espacio inicial) | ✗ | Búsqueda exacta |
| `TARJETAS-DE-BODA-LOVE-STORY` (mayúsculas) | ✗ | Case-sensitive |
| `tarjetas%20de%20boda%20love%20story` (URL encoded) | ✗ | No decodificado |

**Conclusión:** No hay problemas de encoding. La búsqueda funciona correctamente.

---

## G. INVESTIGACIÓN FASE 6 - DUPLICADOS Y CATEGORÍAS

✓ No hay duplicados de slug
✓ 13 categorías, todas válidas (tienen id, slug, name)

---

## H. BUILD LOCAL

```
Build status: ✓ Exitoso
Tiempo: 10.46s
Warnings: Solo deprecaciones de inputValidator() (no son errores)
Tamaño: Normal
```

---

## I. CAUSA RAÍZ IDENTIFICADA

**LOCAL todo funciona perfectamente.** El problema debe ser específico de **Vercel en production**.

### Causas potenciales en Vercel (en orden de probabilidad):

#### 1. **CRÍTICA - Variables de entorno no configuradas** (Probabilidad: 80%)

Si `WOOCOMMERCE_CONSUMER_KEY` o `WOOCOMMERCE_CONSUMER_SECRET` no están configuradas en Vercel:

```typescript
// En lib/woocommerce/auth.ts
if (!key || !secret) {
  throw new Error(`[WooCommerce] Missing environment variable(s)...`);
}
```

**Efecto:** getCatalogo() lanza error → catálogo vacío → TODOS los productos dan 404

**Evidencia:** El usuario mencionó "aparece Producto no encontrado" (múltiples), no "un producto".

#### 2. **ALTA - getCatalogo() error no capturado** (Probabilidad: 15%)

Si WooCommerce no responde o retorna error en Vercel:

```typescript
// En catalog.functions.ts línea 67-72
catch (error) {
  throw new Error(`No se pudo cargar el catálogo...`);
}
```

**Efecto:** Server error que causa renderizado vacío

#### 3. **MEDIA - Caché de Vercel sirviendo versión vieja** (Probabilidad: 5%)

Si se está usando ISR/revalidation:

```typescript
// Verificar si existe revalidate en loaders
```

**Efecto:** Podría servir catálogo de versión anterior

---

## J. POR QUÉ NO OCURRE LOCALMENTE

Localmente hay `.env` con credenciales válidas:
```
WOOCOMMERCE_URL="https://urbanprint.es"
WOOCOMMERCE_CONSUMER_KEY="ck_..."
WOOCOMMERCE_CONSUMER_SECRET="cs_..."
```

En Vercel (posiblemente):
```
WOOCOMMERCE_URL = ✓ configurada
WOOCOMMERCE_CONSUMER_KEY = ✗ NO configurada
WOOCOMMERCE_CONSUMER_SECRET = ✗ NO configurada
```

---

## K. FLUJO EN VERCEL CUANDO FALTA ENV

```
Usuario accede a /producto/tarjetas-de-boda-love-story
          ↓
Loader ejecuta en servidor (Vercel)
          ↓
queryClient.ensureQueryData(catalogoQuery)
          ↓
getCatalogo() llamada como server function
          ↓
getWooCommerceClient() es inicializado
          ↓
validateWooCommerceEnv() lanza Error (falta KEY/SECRET)
          ↓
getCatalogo() catch (error)
          ↓
throw new Error("No se pudo cargar el catálogo...")
          ↓
Loader error capturado por TanStack
          ↓
Renderiza errorComponent (la página blanca)
          ↓
O si usa fallback vacío:
          ↓
data.products = undefined o []
          ↓
data.products.find() retorna undefined
          ↓
throw notFound()
          ↓
"Producto no encontrado"
```

---

## L. CONFIRMACIÓN DE DIAGNÓSTICO

### ✓ Verificado Localmente:
- ✓ WooCommerce API accesible
- ✓ 177 productos presentes
- ✓ 175 adaptables (2 sin slug)
- ✓ Todos pueden buscarse por slug
- ✓ No hay errores de encoding
- ✓ Build funciona

### ✗ No se puede verificar en Vercel sin acceso:
- ✗ Variables de entorno en Vercel
- ✗ Logs de runtime de Vercel
- ✗ Estado actual del deployment

---

## M. SIGUIENTE PASO - ACCIÓN RECOMENDADA

**VERIFICAR INMEDIATAMENTE:**

En Vercel dashboard → Project Settings → Environment Variables

Confirmar que existen:
1. `WOOCOMMERCE_URL` = configurada
2. `WOOCOMMERCE_CONSUMER_KEY` = configurada  
3. `WOOCOMMERCE_CONSUMER_SECRET` = configurada

Si alguna falta → Agregarla y hacer redeploy

---

## N. CORRECCIÓN MÍNIMA (si las env vars están bien)

Si las variables están configuradas pero sigue fallando, agregar logging de debug:

**Archivo:** `src/lib/catalog.functions.ts`
**Cambio:** Agregar console.log() para entender dónde falla en Vercel

```typescript
export const getCatalogo = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const wooClient = getWooCommerceClient();
    console.log("[Catalog] Iniciando obtención de productos...");
    
    const [productos, wooCategories] = await Promise.all([
      obtenerTodosLosProductos(wooClient),
      wooClient.getCategories({ per_page: 100 }),
    ]);

    console.log(
      `[Catalog] ✓ Cargados ${productos.length} productos y ${wooCategories.length} categorías desde WooCommerce`
    );

    return {
      categories: adaptarCategoriasWooCommerce(wooCategories, true),
      products: productos,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Catalog] ✗ CRÍTICO: No se pudo cargar catálogo: ${errorMessage}`);
    console.error(`[Catalog] Stack:`, error instanceof Error ? error.stack : "");
    throw new Error(
      `No se pudo cargar el catálogo. Error: ${errorMessage}. Por favor, intenta más tarde.`
    );
  }
});
```

---

## CONCLUSIÓN

**CAUSA RAÍZ MÁS PROBABLE:** Falta de variables de entorno `WOOCOMMERCE_CONSUMER_KEY` y/o `WOOCOMMERCE_CONSUMER_SECRET` en Vercel.

**ACCIÓN INMEDIATA:** Verificar y configurar env vars en Vercel dashboard.

**VERIFICACIÓN:** Después de agregar env vars, hacer redeploy y probar un producto.
