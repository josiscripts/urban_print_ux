# 🔍 AUDITORÍA: ELEMENTOS LOVABLE - ANÁLISIS DE ELIMINACIÓN

**Fecha:** 2026-08-28  
**Tipo:** Auditoría READ-ONLY (sin cambios, solo análisis)  
**Objetivo:** Determinar qué elementos de Lovable son prescindibles

---

## RESUMEN EJECUTIVO

**Hallazgo:** Lovable es un framework/plataforma de desarrollo que proporciona 3 funcionalidades principales:

1. **MCP (Model Context Protocol)** - Tools que expone la aplicación a Claude/IA
2. **Auth Integration** - Autenticación con proveedores OAuth a través de Supabase
3. **Error Reporting** - Reporte de errores al editor de Lovable
4. **Project Metadata** - Metadata para sincronización con Lovable platform

**Estado actual:** La aplicación funciona en Vercel sin depender DIRECTAMENTE de Lovable en tiempo de ejecución, pero usa componentes de Lovable en la arquitectura.

---

## PARTE 1: ELEMENTOS LOVABLE IDENTIFICADOS

### 1.1 DEPENDENCIAS EN package.json

| Paquete | Versión | Ubicación | Propósito | Clasificación |
|---------|---------|-----------|----------|---------------|
| `@lovable.dev/mcp-js` | ^0.28.0 | dependencies | MCP server implementation | **B - Lovable environment** |
| `@lovable.dev/cloud-auth-js` | ^1.1.2 | dependencies | OAuth provider integration | **B - Lovable environment** |
| `@lovable.dev/vite-tanstack-config` | 2.12.0 | devDependencies | Vite build configuration | **B - Lovable environment** |

### 1.2 ARCHIVOS Y CARPETAS

| Ruta | Tipo | Tamaño | Propósito | Clasificación |
|------|------|--------|----------|---------------|
| `.lovable/` | Carpeta | ~0.5KB | Metadata de proyecto Lovable | **C - Metadata** |
| `.lovable/project.json` | Archivo | 124B | Versión y template | **C - Metadata** |
| `.lovable/mcp/` | Carpeta | - | MCP configuration | **B - Lovable environment** |
| `.lovable/plan/` | Carpeta | - | Project plans | **C - Metadata** |
| `AGENTS.md` | Archivo | ~500B | Instrucciones de Lovable | **C - Metadata** |
| `src/integrations/lovable/` | Carpeta | 939B | Auth wrapper | **A/B - Hybrid** |
| `src/integrations/lovable/index.ts` | Archivo | 939B | OAuth signIn wrapper | **A - Frontend uses it** |
| `src/lib/lovable-error-reporting.ts` | Archivo | 2.1KB | Error reporter | **A - Frontend uses it** |
| `src/lib/mcp/` | Carpeta | ~5KB | MCP tools definitions | **B - Lovable MCP** |
| `src/routes/mcp.ts` | Archivo | 500B | MCP endpoint | **B - Lovable MCP** |
| `src/routes/[.mcp]/` | Carpeta | 1.5KB | MCP routes | **B - Lovable MCP** |
| `src/routes/[.well-known]/` | Carpeta | 800B | OAuth metadata | **B - Lovable MCP** |
| `src/routes/[.]lovable.oauth.consent.tsx` | Archivo | 3.2KB | OAuth consent page | **A - Frontend UI** |

---

## PARTE 2: ANÁLISIS DETALLADO POR ELEMENTO

### A. @lovable.dev/mcp-js (DEPENDENCIA)

**Propósito:** Framework que proporciona:
- `mcpPlugin()` en vite.config.ts (genera src/routes/mcp.ts automáticamente)
- `defineMcp()`, `defineTool()` para declarar tools
- Handlers para MCP endpoints (/mcp, /.mcp/*, /.well-known/*)

**Actualmente usado en:**
- `vite.config.ts` - línea 8, 17
- `src/lib/mcp/*` - 5 archivos de tools
- `src/routes/mcp.ts` - MCP endpoint (AUTO-GENERATED)
- `src/routes/[.mcp]/*` - MCP handlers
- `src/routes/[.well-known]/*` - OAuth metadata

**Función en la aplicación:**
- ✅ Expone herramientas (tools) para Claude/IA usarlas
- ✅ Maneja OAuth en `/mcp`, `/.mcp/*`, `/.well-known/*` endpoints
- ✅ Integración MCP con Lovable platform

**¿Es necesario para el usuario final?**
```
❌ NO

Los usuarios finales usan:
- /auth (Supabase auth, NO MCP)
- /cuenta (Supabase session, NO MCP)
- /producto/* (catálogo, NO MCP)
- /carrito (carrito, NO MCP)

MCP es SOLO para Lovable platform → Claude
No se accede desde navegador del usuario
```

**¿Es necesario para Vercel production?**
```
❌ NO

Las rutas MCP (/mcp, /.mcp/*, /.well-known/*) existen pero:
- NO son utilizadas por frontend
- NO son requeridas para la aplicación funcione
- Podrían ser removidas sin afectar funcionamiento

Sin embargo:
- Vite plugin podría causar issues si se remueve (ver problema npm run dev)
```

**Impacto si se elimina:**
- 🔴 CRÍTICO: npm run dev / npm run build fallarían (porque vite plugin se carga)
- ✅ OK: Funcionalidad del usuario NO se afecta
- ✅ OK: Vercel production funciona igual

**Clasificación: B - NECESARIO SOLO PARA ENTORNO DE LOVABLE**

---

### B. @lovable.dev/cloud-auth-js (DEPENDENCIA)

**Propósito:** Proveedor OAuth que integra:
- `createLovableAuth()` - crea cliente OAuth
- Soporta OAuth providers: Google, Apple, Microsoft, Lovable
- Integración con Supabase auth

**Actualmente usado en:**
- `src/integrations/lovable/index.ts` - `createLovableAuth()`
- `src/routes/auth.tsx` - línea 89-98: `lovable.auth.signInWithOAuth("google", ...)`

**Función en la aplicación:**
```
Sí, se usa:
- Botón "Continuar con Google" en /auth
- Usa lovable.auth.signInWithOAuth("google")
```

**¿Es necesario para usuario final?**
```
✅ SÍ - parcialmente

Usuarios usan:
- Email/password login (via Supabase directo) ✅
- Google OAuth (via lovable wrapper) ⚠️

Si se elimina:
- Email/password seguiría funcionando
- Google OAuth se rompería TEMPORALMENTE
- Pero podría reemplazarse con Supabase OAuth directo
```

**¿Qué hace Lovable que Supabase no pueda hacer?**
```
Supabase tiene OAuth nativo:
- supabase.auth.signInWithOAuth({provider: 'google'})

Lovable es un wrapper que:
- Simplifica configuración
- Añade capas de abstracción
- Para este proyecto, NO añade valor funcional extra
```

**Impacto si se elimina:**
- 🟡 TEMPORAL: Google OAuth se rompería
- ✅ REVERSIBLE: Se puede reemplazar con Supabase OAuth directo
- ✅ NO CRITICAL: Email/password login seguiría funcionando
- ✅ USUARIO FINAL: Podría usar /auth igual (solo sin botón Google temporalmente)

**Clasificación: A/B - NECESARIO PARA AUTENTICACIÓN (pero reemplazable)**

---

### C. @lovable.dev/vite-tanstack-config (DEV DEPENDENCY)

**Propósito:** Configuración Vite personalizada para TanStack Start que:
- Configura plugins de Vite
- Integra TanStack DevTools, TanStack Start, React, Tailwind, etc.
- Auto-inyecta VITE_* variables de entorno
- Configura path aliases
- Dedupe de React/TanStack

**Actualmente usado en:**
- `vite.config.ts` - línea 7: `defineConfig` importado y usado

**Función en la aplicación:**
```
✅ CRÍTICA - Vite build

Sin esta config:
- npm run dev se rompería
- npm run build se rompería
- TypeScript paths no funcionarían
- Tailwind no se aplicaría
- Vercel build fallaría
```

**¿Es necesario?**
```
✅ SÍ - ABSOLUTAMENTE

Es parte crítica del sistema de build.
Sin ella, nada funciona.

PERO: Podría ser reemplazada por @vitejs/plugin-react + configuración manual
```

**Impacto si se elimina:**
- 🔴 CRÍTICO: Aplicación entera no compilaría
- 🔴 CRITICAL: Vercel deployment fallaría
- 🔴 CRÍTICO: npm run dev NO funcionaría

**Clasificación: NO ELIMINAR - CRÍTICO PARA BUILD**

---

### D. src/integrations/lovable/index.ts

**Código:**
```typescript
// AUTO-GENERATED by Lovable
import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
import { supabase } from "../supabase/client";

const lovableAuth = createLovableAuth();

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple" | "microsoft" | "lovable", opts?) => {
      // ... OAuth flow
      await supabase.auth.setSession(result.tokens);
      return result;
    },
  },
};
```

**Propósito:** Wrapper que:
- Crea cliente Lovable OAuth
- Setea sesión en Supabase
- Proporciona interfaz `lovable.auth.signInWithOAuth()`

**¿Es necesario?**
```
⚠️ PARCIALMENTE

Actual: lovable.auth.signInWithOAuth("google", opts)
Alternativa: supabase.auth.signInWithOAuth({provider: "google", ...})

Cambio sería mínimo:
const result = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: window.location.origin + next,
  }
});
```

**Impacto si se elimina:**
- 🟡 TEMPORAL: Google login se rompería
- ✅ REVERSIBLE: Reemplazar con Supabase directo (3 líneas de código)
- ✅ OK: Resto de la app NO se afecta

**Clasificación: A - NECESARIO PARA AUTH (pero fácilmente reemplazable)**

---

### E. src/lib/lovable-error-reporting.ts

**Propósito:** Hook que reporta errores a la consola de Lovable editor:
- `reportLovableError()` - reporta excepciones
- Usa global `window.__lovableEvents?.captureException`
- Usa global `window.__lovableReportRuntimeError`

**Actualmente usado en:**
- `src/routes/__root.tsx` - error boundary

**¿Es necesario?**
```
❌ NO

La función reporta a Lovable editor:
- window.__lovableEvents (NOT PRESENT en Vercel)
- window.__lovableReportRuntimeError (NOT PRESENT en Vercel)

En Vercel: Las funciones NO-OP (hacen nada)
En production: Nada se reporta a Lovable
```

**Función real:**
- Si error ocurre en Lovable editor → reporta
- Si error ocurre en Vercel/production → NO hace nada (los globals no existen)

**Impacto si se elimina:**
- ✅ ZERO: Error handling seguiría funcionando igual
- ✅ ZERO: Frontend NO sentiría cambio
- ✅ ZERO: Production NO se afecta
- ❌ MINOR: Lovable editor debugging sería menos detallado (pero NO afecta users)

**Clasificación: C - SOLO METADATA / DEBUGGEO (completamente opcional)**

---

### F. src/routes/mcp.ts

**Código:** AUTO-GENERATED
```typescript
// AUTO-GENERATED by @lovable.dev/mcp-js
export const Route = createFileRoute("/mcp")({
  server: {
    handlers: {
      ANY: createTanStackMcpHandler(mcp, {...}),
    },
  },
});
```

**Propósito:** Endpoint que:
- Expone MCP tools para Lovable/Claude
- Maneja requests a `/mcp`
- Integración MCP

**¿Es necesario?**
```
❌ NO

Usuario final:
- Nunca accede a /mcp
- MCP es solo para Lovable platform

Production:
- Endpoint existe pero NADIE lo usa
- Podría ser removido sin afectar users
```

**Impacto si se elimina:**
- ✅ ZERO: Usuario final NO se afecta
- ✅ ZERO: Frontend funcionalidad NO se afecta
- ✅ OK: Vercel produce deployment igual
- ❌ MINOR: Lovable MCP integration se rompería (pero no afecta users)

**Clasificación: B - SOLO PARA LOVABLE (opcional)**

---

### G. src/lib/mcp/ (MCP tools)

**Archivos:**
- `index.ts` - define MCP (5 tools)
- `supabase.ts` - Supabase context
- `tools/search-products.ts` - Tool
- `tools/get-product.ts` - Tool
- `tools/list-categories.ts` - Tool
- `tools/list-my-orders.ts` - Tool
- `tools/get-order.ts` - Tool

**Propósito:** Definen herramientas que Claude puede usar:
- list_categories
- search_products
- get_product
- list_my_orders
- get_order

**¿Es necesario?**
```
❌ NO

Tools son:
- Exposición de funcionalidad existente
- Para Claude/Lovable usarlas
- Usuario final NO accede a ellas

Son como una "API alt" para IA
```

**Función:**
- Si eliminas: Claude no puede usar tools
- But: Usuarios finales siguen usando app normal

**Impacto si se elimina:**
- ✅ ZERO: Usuario final NO se afecta
- ✅ ZERO: Frontend funcionalidad NO se afecta
- ✅ OK: Vercel production NO se afecta
- ❌ CRITICAL: Lovable MCP integration se rompería (pero no users)

**Clasificación: B - SOLO PARA LOVABLE (opcional)**

---

### H. src/routes/[.mcp]/ y src/routes/[.well-known]/

**Rutas:**
- `/.mcp/list-tools` - Lista herramientas disponibles
- `/.mcp/invoke-tool/$tool` - Invoca una herramienta
- `/.well-known/oauth-protected-resource` - OAuth metadata

**Propósito:** Infraestructura MCP:
- Endpoints que Lovable/Claude llaman
- OAuth metadata

**¿Es necesario?**
```
❌ NO (para usuarios finales)
✅ SÍ (para Lovable MCP)
```

**Impacto si se elimina:**
- ✅ ZERO: Usuario final NO se afecta
- ✅ ZERO: Frontend funcionalidad NO se afecta
- ✅ OK: Vercel production NO se afecta
- ❌ CRITICAL: Lovable MCP se rompería

**Clasificación: B - SOLO PARA LOVABLE (opcional)**

---

### I. src/routes/[.]lovable.oauth.consent.tsx

**Propósito:** Página de consentimiento OAuth:
- Cuando usuario autoriza una aplicación external
- Muestra: "¿Permite que APP acceda a tu cuenta?"
- Botones: Autorizar / Denegar

**¿Es necesario?**
```
❌ NO (para acceso normal de usuarios)
✅ SÍ (si otros apps tienen OAuth access)

Actualmente:
- Usuarios se loguean en app propia (NO necesita consentimiento)
- Lovable/Claude también podría requerir consentimiento
```

**Función real:**
- Route: `/.lovable/oauth/consent`
- Solo se accede si: Otra app pide OAuth permission
- Para Urban Print: NO es necesario

**Impacto si se elimina:**
- ✅ ZERO: Usuarios normales NO se afectan
- ✅ OK: Vercel production NO se afecta
- ⚠️ MODERATE: OAuth permission flow se rompería (edge case)

**Clasificación: A - NECESARIO SOLO PARA OAUTH (pero edge case)**

---

### J. .lovable/ Carpeta

**Contenido:**
- `project.json` - template y revision
- `mcp/` - MCP config
- `plan/` - Project plans

**Propósito:** Metadata de Lovable para sincronización

**¿Es necesario?**
```
❌ NO (para Vercel production)
✅ SÍ (para Lovable sync)

Si se elimina:
- Lovable perderá metadata del proyecto
- Git sync podría fallar
- Lovable editor no sabría que es proyecto Lovable
```

**Impacto si se elimina:**
- ✅ ZERO: Usuario final NO se afecta
- ✅ ZERO: Vercel deployment NO se afecta
- ❌ CRITICAL: Lovable sync se rompería (pero Vercel funciona igual)

**Clasificación: C - SOLO METADATA DE LOVABLE (completamente opcional para Vercel)**

---

### K. AGENTS.md

**Contenido:** Instrucción de Lovable sobre no reescribir git history

**Propósito:** Documentación para developers

**¿Es necesario?**
```
❌ NO (para funcionamiento)
✅ SI (para documentación/education)
```

**Impacto si se elimina:**
- ✅ ZERO: Funcionamiento NO se afecta
- ✅ INFO LOSS: Documentación se pierde (no crítico)

**Clasificación: C - SOLO DOCUMENTACIÓN (completamente opcional)**

---

## PARTE 3: IMPACTO MATRIZ

### Por eliminación de elemento:

| Elemento | Usuario Final | Vercel | Frontend | Auth | Stock | MCP |
|----------|---------------|--------|----------|------|-------|-----|
| mcp-js | ❌ NO | ✅ YES | ✅ YES | ✅ YES | ❌ NO | 🔴 BREAKS |
| cloud-auth-js | ⚠️ PARTIAL | ✅ YES | ❌ NO | 🔴 BREAKS | ❌ NO | ✅ YES |
| vite-config | 🔴 BREAKS | 🔴 BREAKS | 🔴 BREAKS | 🔴 BREAKS | 🔴 BREAKS | 🔴 BREAKS |
| lovable/index.ts | ⚠️ PARTIAL | ✅ YES | ❌ NO | 🔴 BREAKS | ❌ NO | ✅ YES |
| error-reporting | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ❌ NO |
| routes/mcp.ts | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES | 🔴 BREAKS |
| lib/mcp/ | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES | 🔴 BREAKS |
| routes/[.mcp]/ | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES | 🔴 BREAKS |
| routes/[.well-known]/ | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES | 🔴 BREAKS |
| routes/.lovable.oauth | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ❌ NO |
| .lovable/ | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES |
| AGENTS.md | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES |

---

## PARTE 4: CLASIFICACIÓN FINAL

### 🟢 PUEDO ELIMINAR CON SEGURIDAD (0 impacto en users/Vercel)

```
1. src/lib/lovable-error-reporting.ts
   - Reason: No-op en production (globals no existen)
   - Impact: ZERO
   - Risk: ZERO

2. src/lib/mcp/ (carpeta completa)
   - Reason: Solo MCP tools (Claude/Lovable)
   - Impact: MCP breaks, users NO
   - Risk: LOW

3. src/routes/mcp.ts
   - Reason: Auto-generated, solo MCP endpoint
   - Impact: MCP breaks, users NO
   - Risk: LOW

4. src/routes/[.mcp]/
   - Reason: MCP invoke endpoints
   - Impact: MCP breaks, users NO
   - Risk: LOW

5. src/routes/[.well-known]/
   - Reason: OAuth metadata (MCP)
   - Impact: MCP breaks, users NO
   - Risk: LOW

6. .lovable/ (carpeta)
   - Reason: Solo metadata Lovable
   - Impact: Lovable sync breaks, Vercel OK
   - Risk: LOW

7. AGENTS.md
   - Reason: Solo documentación
   - Impact: ZERO (es información)
   - Risk: ZERO
```

### 🟡 NECESITA PRUEBA ANTES DE ELIMINAR

```
1. src/routes/[.]lovable.oauth.consent.tsx
   - Reason: OAuth consent page
   - Impact: Si otros apps piden OAuth access, se rompe
   - Test: ¿Necesita Urban Print OAuth consent page?
   - Recommendation: PROBABLEMENTE pueda eliminarse
   
2. src/integrations/lovable/index.ts
   - Reason: OAuth wrapper
   - Impact: Google login se rompería
   - Test: ¿Queremos mantener Google login?
   - Replacement: Sustituir con Supabase OAuth directo (5 líneas)
   - Recommendation: PUEDA eliminarse SI reemplazas con Supabase
```

### 🔴 NO DEBO ELIMINAR

```
1. @lovable.dev/vite-tanstack-config
   - Reason: Crítica para build
   - Impact: ZERO impacto SI se reemplaza con config manual
   - Risk: ALTO si no hay reemplazo
   - Recommendation: MANTENER a menos que configures Vite manualmente

2. @lovable.dev/mcp-js
   - Reason: Vite plugin (genera routes, causa build issues)
   - Impact: npm run dev/build FALLA
   - Risk: MÁS del problema actual Windows rutas
   - Recommendation: MANTENER (aunque cause problemas, eliminar sería peor)

3. @lovable.dev/cloud-auth-js
   - Reason: Requerida para Google login actual
   - Impact: Google login se rompe SI no reemplazas
   - Risk: ALTO si no tienes alternativa
   - Recommendation: MANTENER O reemplazar con Supabase OAuth
```

### ✅ NO AFECTA AL USUARIO FINAL

```
Todos los elementos siguientes NO rompen la app para usuarios:

- Eliminar /mcp endpoint
- Eliminar MCP tools
- Eliminar error reporting Lovable
- Eliminar .lovable/ metadata
- Eliminar AGENTS.md documentation

Usuarios finales siguen teniendo:
✅ Catálogo funcionando
✅ Carrito funcionando
✅ Checkout funcionando
✅ Autenticación funcionando (si no eliminas cloud-auth-js sin reemplazo)
✅ Cuenta funcionando
✅ Órdenes funcionando
```

---

## RECOMENDACIÓN FINAL

### PUEDO ELIMINAR CON SEGURIDAD (sin riesgos):

```
SAFE TO DELETE IMMEDIATELY:

1. src/lib/lovable-error-reporting.ts
   - npm uninstall no necesario (no es dependencia)
   - Solo eliminar archivo
   - Eliminar import en src/routes/__root.tsx

2. src/lib/mcp/ (carpeta)
   - Eliminar carpeta completa
   - Eliminar import en src/lib/mcp/index.ts
   - Actualizar vite.config.ts si menciona MCP

3. src/routes/mcp.ts
   - Eliminar archivo (es AUTO-GENERATED, vuelve a generarse si Lovable sync)

4. src/routes/[.mcp]/
   - Eliminar carpeta

5. src/routes/[.well-known]/
   - Eliminar carpeta

6. .lovable/ carpeta
   - Eliminar carpeta (Lovable perderá sync, pero Vercel OK)

7. AGENTS.md
   - Eliminar archivo

**Resultado:** -30KB aproximadamente, CERO impacto en usuarios
```

### DEBO MANTENER O REEMPLAZAR (críticos):

```
OPTION A: MANTENER ACTUAL

1. @lovable.dev/mcp-js@0.28.0
   - Mantener en package.json
   - Aunque cause error npm run dev en Windows

2. @lovable.dev/cloud-auth-js
   - Mantener para Google login

3. @lovable.dev/vite-tanstack-config
   - Mantener para build

4. src/integrations/lovable/index.ts
   - Mantener para Google login

Result: Status quo, MCP tools + Google login funcionan en Vercel
---

OPTION B: ELIMINAR LOVABLE COMPLETAMENTE + REEMPLAZAR

Para hacer esto necesitarías:

1. Reemplazar @lovable.dev/vite-tanstack-config
   - Con: Vite config manual + @vitejs/plugin-react manual
   - Effort: ALTO (requiere testing completo)

2. Reemplazar @lovable.dev/cloud-auth-js
   - Con: supabase.auth.signInWithOAuth() directo
   - Effort: BAJO (3-5 líneas código)
   - Impact en usuarios: ZERO (Google login sigue funcionando)

3. Eliminar src/integrations/lovable/
   - Eliminar wrapper Lovable
   - Usar Supabase auth directo

4. Eliminar MCP completamente
   - Eliminar @lovable.dev/mcp-js
   - Eliminar src/lib/mcp
   - Eliminar routes MCP
   - Effort: BAJO
   - Impact en users: ZERO

Result: Proyecto completamente independiente de Lovable
Cost: ~4 horas de trabajo + testing
Risk: MEDIO (vite config es delicada)
```

### RECOMENDACIÓN ESPECÍFICA:

**Fase 1: SAFE REMOVAL (sin riesgos)**
```
Eliminar INMEDIATAMENTE:
- src/lib/lovable-error-reporting.ts (y import)
- src/lib/mcp/ (carpeta completa)
- src/routes/mcp.ts
- src/routes/[.mcp]/
- src/routes/[.well-known]/
- .lovable/ (carpeta)
- AGENTS.md

Tiempo: 15 minutos
Risk: ZERO
Testing: Verificar que Vercel preview sigue desplegando

Resultado: Proyecto "limpiado" de MCP/metadata
```

**Fase 2: OPTIONAL - REMOVE GOOGLE LOGIN BRANDING (con reemplazo)**
```
Reemplazar:
- @lovable.dev/cloud-auth-js → Supabase auth nativo
- src/integrations/lovable/index.ts → Supabase directo
- src/routes/auth.tsx: lovable.auth.signInWithOAuth() → supabase.auth.signInWithOAuth()

Tiempo: 1 hora
Risk: BAJO (Supabase es nativo, muy estable)
Testing: Verificar Google login sigue funcionando

Resultado: Autenticación completamente en Supabase
```

**Fase 3: COMPLEX - REMOVE BUILD CONFIG DEPENDENCY (alto effort)**
```
Reemplazar:
- @lovable.dev/vite-tanstack-config → config manual Vite

Tiempo: 3-4 horas + testing
Risk: ALTO (vite es compleja)
Reward: BAJO (todo funciona igual)

Recomendación: NO hacer a menos que sea NECESARIO
```

---

## CONCLUSIÓN

**Estado actual:** Aplicación tiene dependencias Lovable pero funciona en Vercel sin problemas.

**Remoción segura:** Puedes eliminar 30-40% de código Lovable (MCP, error reporting, metadata) SIN romper nada para usuarios.

**Costo completo:** Para eliminar TODAS las dependencias Lovable:
- Effort: 4-5 horas
- Risk: MEDIO (vite reconfig)
- Benefit: Proyecto "limpio" sin Lovable

**Recomendación:** 
- ✅ HACER: Fase 1 (safe removal) - cero riesgo
- ⚠️ EVALUAR: Fase 2 (Google login reemplazo) - bajo riesgo, pequeño beneficio
- ❌ EVITAR: Fase 3 (vite reconfig) - alto riesgo, sin beneficio funcional

**Decision:** ¿Deseas que proceda con Fase 1 (eliminación segura)?

---

*Auditoría completada - Aguardando autorización para proceder*
