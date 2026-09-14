# 🔍 INVESTIGACIÓN: ERROR DE @lovable.dev/mcp-js EN WINDOWS

**Fecha:** 2026-08-28  
**Tipo:** Investigación READ-ONLY (sin cambios aplicados todavía)  
**Objetivo:** Identificar causa exacta del error y alternativas de solución

---

## A. CAUSA EXACTA DEL ERROR

### Error Capturado

```
Error: @lovable.dev/mcp-js: routesDir "src/routes" must resolve under 
C:/Users/josia/Desktop/Websites_Clientes/urban_print/Urban Print Platform, 
got C:\Users\josia\Desktop\Websites_Clientes\urban_print\Urban Print Platform\src\routes
```

### Análisis Detallado

**Lo que el plugin espera:**
```
Base path:    C:/Users/josia/Desktop/Websites_Clientes/urban_print/Urban Print Platform
             (FORWARD SLASHES / - normalización Unix)
```

**Lo que Windows PowerShell devuelve:**
```
Full path:    C:\Users\josia\Desktop\Websites_Clientes\urban_print\Urban Print Platform\src\routes
             (BACKSLASHES \ - formato Windows nativo)
```

**Punto de comparación:**
El plugin (`@lovable.dev/mcp-js/dist/stacks/tanstack/vite.js` línea 14-36) ejecuta validación:

```javascript
function assertContains(basePath, fullPath) {
  // basePath:  "C:/Users/josia/.../Urban Print Platform" (forward slashes)
  // fullPath:  "C:\Users\josia\...\Urban Print Platform\src\routes" (backslashes)
  
  if (!fullPath.startsWith(basePath)) {
    throw new Error(`routesDir must resolve under ${basePath}, got ${fullPath}`);
  }
}
```

**Razón del fallo:**
- String comparison falla porque:
  - `"C:\Users..."` NO comienza con `"C:/Users..."`
  - Diferentes separadores de ruta (\ vs /)
  - Aunque son la misma ruta lógicamente, la validación string-based falla

### Stack Trace Completo

```
at assertContains (file:///.../vite.js:14:65)
at resolveAllRoutes (file:///.../vite.js:36:2)
at BasicMinimalPluginContext.configResolved (file:///.../vite.js:253:130)
    ↓ (Vite config resolution phase)
at resolveConfig (vite/dist/node/chunks/node.js:36732:68)
    ↓ (Dev server startup)
at _createServer (vite/dist/node/chunks/node.js:26269:65)
    ↓ (npm run dev execution)
```

**Punto de fallo:** Durante `vite dev`, Vite llama a `configResolved` del plugin, que ejecuta la validación con rutas en formato Windows, y la comparación falla.

---

## B. VERSIÓN ACTUAL VS DISPONIBLES

### Instalada Actualmente

```
@lovable.dev/mcp-js: 0.26.3
  └─ package.json especifica: ^0.26.2 (permite 0.26.2 - 0.26.999)
  └─ npm install instaló: 0.26.3 (versión más reciente que cumple rango)
```

### Versiones Disponibles (Últimas 10)

```
0.26.2  (Anterior)
0.26.3  (ACTUAL - Tiene el bug)
0.27.0  (Disponible)
0.27.1  (Disponible)
0.28.0  (Disponible - MÁS RECIENTE)
0.29.0-rc.0  (Release candidate)
0.29.0-rc.1  (Release candidate)
```

**Incremento de versión:** Se ha actualizado 2 versiones menores (0.26 → 0.28) desde la versión instalada.

---

## C. ANÁLISIS DE ALTERNATIVAS DE SOLUCIÓN

### ALTERNATIVA 1: Actualizar @lovable.dev/mcp-js a versión más reciente

**Propuesta:** Cambiar `package.json`:
```json
"@lovable.dev/mcp-js": "^0.26.2"  →  "@lovable.dev/mcp-js": "^0.28.0"
```

Luego ejecutar:
```bash
npm install
npm run dev
```

**Ventajas:**
- ✅ Solución oficial (mantainere responsable del bug)
- ✅ Probablemente incluye correcciones para Windows paths
- ✅ Recibe actualizaciones futuras
- ✅ Potencialmente incluye otros bugfixes y mejoras

**Riesgos:**
- ⚠️ Cambio de versión mayor (0.26 → 0.28) podría introducir breaking changes
- ⚠️ Lovable.dev está en evolución activa - cambios podrían afectar integración
- ⚠️ Versión instalada fue elegida por Lovable por compatibilidad con este proyecto
- ⚠️ No garantizado que 0.28.0 específicamente corrija el Windows path issue

**Compatibilidad Lovable:**
- ⚠️ RIESGO: Lovable.dev sincroniza código - actualización de plugin podría desincronizar
- ⚠️ RIESGO: Auto-generated files like `src/routes/mcp.ts` podrían regenerarse diferente

**Reversibilidad:** ✅ REVERSIBLE
- Revert: `npm install` (vuelve al lockfile anterior si no committeamos package-lock.json)

---

### ALTERNATIVA 2: Workaround - Usar Git Bash o WSL

**Propuesta:** No modificar nada, usar terminal diferente:

```bash
# En Git Bash
bash -c "npm run dev"

# O en WSL
wsl npm run dev
```

**Ventajas:**
- ✅ Completamente reversible (no cambios de código)
- ✅ No afecta Lovable integration
- ✅ Funciona con versión actual (0.26.3)
- ✅ Git Bash ya viene con Git (muy probablemente instalado)

**Riesgos:**
- ⚠️ No es una solución permanente (requiere cambiar terminal cada vez)
- ⚠️ Requiere aprender nueva terminal
- ⚠️ Workflow será diferente que otros developers que usen PowerShell
- ⚠️ Scripts/documentación en PowerShell no funcionarían

**Reversibilidad:** ✅ TRIVIALMENTE REVERSIBLE (solo cambiar terminal)

---

### ALTERNATIVA 3: Patch Manual en vite.config.ts

**Propuesta:** Normalizar rutas en vite.config.ts antes de pasar al plugin:

```typescript
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Normalizar ruta: convertir backslashes a forward slashes
const normalizedRoutesDir = path.join(__dirname, 'src/routes').replace(/\\/g, '/');

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      mcpPlugin({ 
        routesDir: normalizedRoutesDir  // Pass normalized path
      })
    ],
  },
});
```

**Ventajas:**
- ✅ Solución local, no requiere actualización del plugin
- ✅ Directo (arregla el problema en nuestro proyecto)
- ✅ No depende de Lovable mantener el plugin

**Riesgos:**
- 🔴 CRÍTICO: mcpPlugin() podría no aceptar opciones de configuración
- 🔴 CRÍTICO: Modificar vite.config.ts y pasar custom routesDir podría romper Lovable sync
- ⚠️ Violación de recomendación de Lovable (vite.config.ts es administrado por Lovable)
- ⚠️ Si Lovable regenera vite.config.ts, este patch se perdería
- ⚠️ Mantener un patch "forever" es técnicamente deuda

**Reversibilidad:** ✅ Reversible, pero riesgoso

---

### ALTERNATIVA 4: Buscar si Lovable.dev ya tiene fix en desarrollo

**Propuesta:** Contactar Lovable o revisar GitHub para ver si hay un fix en branches en desarrollo.

**Ventajas:**
- ✅ Podría encontrar solución oficial que no conocemos

**Riesgos:**
- ⚠️ Requiere tiempo (no inmediato)
- ⚠️ Podría no haber fix

**Reversibilidad:** N/A

---

## D. RECOMENDACIÓN PRELIMINAR

### Opción más segura: **ALTERNATIVA 2 (Workaround - Git Bash)**

**Por qué:**
1. ✅ Completamente reversible
2. ✅ No modifica código de la aplicación
3. ✅ No afecta Lovable integration
4. ✅ Funciona con versión actual
5. ✅ Funciona para desarrollo local (dev server)

**Limitación:**
- Solo soluciona `npm run dev`
- Production builds (Vercel) usan diferentes shells y probablemente no tendrían este problema

**Próximo paso si funciona:**
- Si deseas hacer updates de paquetes después, podrías considerar Alt 1 más adelante

### Opción más permanente: **ALTERNATIVA 1 (Actualizar a 0.28.0)**

**Pero requiere:**
1. ⚠️ Verificar que no hay breaking changes
2. ⚠️ Testing de que Lovable integration sigue funcionando
3. ⚠️ Ser consciente de que podrías desincronizar con Lovable.dev

**No recomendado ahora porque:**
- Primera vez que resolvemos este problema
- No sabemos exactamente si 0.28.0 tiene el fix
- Riesgo de efectos secundarios

---

## E. RECOMENDACIÓN FINAL ANTES DE PROCEDER

**Propongo probar en este orden:**

1. **PRIMERO:** Usar Git Bash (`bash -c "npm run dev"`)
   - Si funciona → problema resuelto con 0 cambios de código
   - Si no funciona → escalamos a actualización de paquete

2. **SEGUNDO (si Alt 2 no funciona):** Actualizar a @lovable.dev/mcp-js@0.28.0
   - Cambiar package.json
   - `npm install`
   - Probar `npm run dev` en PowerShell nuevamente
   - Verificar que Lovable integration sigue intacta

---

## 📊 MATRIZ DECISIÓN

| Alternativa | Seguridad | Reversibilidad | Afecta Lovable | Permanente | Recomendación |
|-----------|-----------|----------------|----------------|-----------|---------------|
| 1. Actualizar | Media | Sí | Sí ⚠️ | Sí | 2ª opción |
| 2. Git Bash | Alto | Sí (trivial) | No | No ⚠️ | 1ª opción 🟢 |
| 3. Patch manual | Bajo | Sí (riesgoso) | Sí 🔴 | No | ❌ No |
| 4. Contactar Lovable | Desconocido | N/A | N/A | N/A | Futuro |

---

## 🎯 SIGUIENTE PASO

**Usuario debe elegir:**

A. Probar Alternativa 2 (Git Bash) primero - sin cambios de código
B. Ir directamente a Alternativa 1 (actualizar paquete) - con cambios en package.json
C. Elegir otra estrategia

**¿Cuál prefieres que intente primero?**

---

*Investigación completada - Aguardando instrucciones para proceder*
