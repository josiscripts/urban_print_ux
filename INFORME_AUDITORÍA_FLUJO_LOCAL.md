# 🔍 INFORME A: AUDITORÍA DEL FLUJO LOCAL/GIT/VERCEL

**Fecha:** 2026-08-28  
**Tipo:** Auditoría READ-ONLY (sin cambios)  
**Objetivo:** Verificar el setup de desarrollo local, Git, GitHub y Vercel

---

## 📋 ESTADO ACTUAL DETECTADO

### ❌ GIT / GITHUB

| Elemento | Estado | Hallazgo |
|----------|--------|----------|
| `.git` directory | ❌ NO EXISTE | El proyecto NO es un repositorio Git local |
| Remote origin | ❌ NO EXISTE | `git remote -v` falla (no hay .git) |
| Branch actual | ❌ NO EXISTE | `git branch -a` falla (no hay .git) |
| Git config | ❌ NO EXISTE | Proyecto no está bajo control de versión Git |

**Conclusión:** El proyecto actual NO está inicializado como repositorio Git.

### ⚠️ VERCEL CONFIGURATION

| Elemento | Estado | Hallazgo |
|----------|--------|----------|
| `.vercel/` directory | ❌ NO EXISTE | Sin configuración local de Vercel |
| `vercel.json` | ❌ NO EXISTE | Sin configuración explícita de Vercel |
| Deployment info | ❌ DESCONOCIDO | No se puede verificar sin .vercel config |

**Nota:** El proyecto está desplegado en Vercel (mencionado por usuario), pero sin configuración local.

### ✅ DESARROLLO LOCAL

| Elemento | Estado | Detalles |
|----------|--------|---------|
| Node.js | ✅ INSTALADO | npm versión detectada (10.9.4) |
| Dependencias | ✅ INSTALADO | `npm run dev` existe en package.json |
| Build tools | ✅ CONFIGURADO | Vite 8.1.5 |
| Dev command | ✅ EXISTE | `npm run dev` → `vite dev` |
| Build command | ✅ EXISTE | `npm run build` → `vite build` |

### 🔴 PROBLEMA DETECTADO: DEV SERVER NO INICIA

**Error encontrado al ejecutar `npm run dev`:**

```
Error: @lovable.dev/mcp-js: routesDir "src/routes" must resolve under 
C:/Users/josia/Desktop/Websites_Clientes/urban_print/Urban Print Platform, 
got C:\Users\josia\Desktop\Websites_Clientes\urban_print\Urban Print Platform\src\routes
```

**Causa:** Plugin MCP de Lovable tiene issue con ruta format en Windows (forward slash vs backslash).

**Impacto:** `npm run dev` falla en startup.

**Solución:** Este es un problema conocido en Windows con el plugin Lovable. Requiere:
- Actualizar plugin `@lovable.dev/mcp-js`
- O usar WSL/Git Bash en lugar de PowerShell
- O usar máquina con OS compatible

---

## 🏗️ ARQUITECTURA DEL FLUJO OBJETIVO vs ACTUAL

### OBJETIVO DESEADO

```
LOCAL:
  └─ npm run dev
     └─ http://localhost:<puerto>

PREVIEW:
  └─ git push rama-feature
     └─ GitHub branch
     └─ Vercel Preview Deployment (automático)
     └─ https://proyecto-preview-xxxxx.vercel.app

PRODUCCIÓN:
  └─ merge a main (aprobado)
     └─ Vercel Production Deployment (automático)
     └─ https://urbanprint-vercel-domain.com
```

### ACTUAL DETECTADO

```
LOCAL:
  └─ npm run dev
     └─ ❌ FALLA (Plugin MCP issue)
     └─ ❌ NO FUNCIONA

GIT/GITHUB:
  └─ ❌ NO INICIALIZADO localmente
  └─ ❌ NO HAY .git
  └─ ❌ Probablemente sincronizado vía Lovable

VERCEL:
  └─ ✅ Proyecto existente en Vercel
  └─ ❌ SIN configuración local (.vercel)
  └─ ✅ Probablemente conectado vía GitHub
```

---

## 🔐 SEGURIDAD: VARIABLES DE ENTORNO

### Verificado

| Variable | Ubicación | Exposición | Estado |
|----------|-----------|-----------|--------|
| `WOOCOMMERCE_URL` | `.env` (servidor) | ✅ NO al navegador | ✅ Seguro |
| `WOOCOMMERCE_CONSUMER_KEY` | `.env` (servidor) | ✅ NO al navegador | ✅ Seguro |
| `WOOCOMMERCE_CONSUMER_SECRET` | `.env` (servidor) | ✅ NO al navegador | ✅ Seguro |
| `SUPABASE_*` vars | `.env` (mixto) | ⚠️ PARCIAL | ⚠️ Ver abajo |

### Análisis SUPABASE vars

```
Públicas (con VITE_):
  ✅ VITE_SUPABASE_PROJECT_ID - Seguro (público)
  ✅ VITE_SUPABASE_PUBLISHABLE_KEY - Seguro (solo lectura pública)
  ✅ VITE_SUPABASE_URL - Seguro (público)

Privadas (sin VITE_):
  ✅ SUPABASE_URL - Servidor only
  ✅ SUPABASE_PUBLISHABLE_KEY - Servidor only
```

**Conclusión:** ✅ Variables de WooCommerce correctamente protegidas.

---

## 📊 SCRIPTS DISPONIBLES

```json
{
  "dev": "vite dev",                      // ❌ NO FUNCIONA (MCP plugin issue)
  "build": "vite build",                  // ✅ Funciona
  "build:dev": "vite build --mode dev",   // ✅ Funciona
  "preview": "vite preview",              // Requiere build previo
  "lint": "eslint .",                     // ✅ Disponible
  "format": "prettier --write ."          // ✅ Disponible
}
```

---

## 🛠️ CONFIGURACIÓN DETECTADA

### TypeScript
- ✅ Configurado correctamente
- ✅ Path aliases (`@/*` → `src/*`)
- ✅ `strict: true`

### Vite
- ✅ Configurado para TanStack Start
- ✅ Entrypoint: `src/server.ts`
- ⚠️ Plugin MCP cause issue en Windows

### Tailwind CSS
- ✅ Configurado
- ✅ Integración Tailwind CSS 4

### Prettier
- ✅ Configurado
- ✅ `.prettierrc` presente

### ESLint
- ✅ Configurado
- ✅ `eslint.config.js` presente

---

## ⚡ PUERTO Y ENDPOINTS

**Puerto esperado por TanStack Start:** 5173 (Vite default)

**Endpoints cuando funcione:**
- `http://localhost:5173/` - Aplicación
- `http://localhost:5173/@react-refresh` - Refresh plugin
- `http://localhost:5173/__vite_ping` - Health check

**Estado:** ⚠️ NO VERIFICADO (dev server no inicia)

---

## 🎯 RECOMENDACIONES PARA FLUJO LOCAL/GITHUB/VERCEL

### INMEDIATO: Resolver dev server

**Opción 1: Usar WSL o Git Bash (Recomendado)**
```bash
# En lugar de PowerShell
# Usar: Git Bash o WSL
npm run dev
```

**Opción 2: Actualizar Lovable plugin**
```bash
npm update @lovable.dev/mcp-js@latest
```

**Opción 3: Investigación plugin**
- El error es un path format issue en Windows
- Requiere revisión del plugin o workaround

### PARA GITHUB/VERCEL FLOW

**Paso 1: Inicializar Git local (si no está hecho)**
```bash
git init
git remote add origin https://github.com/<usuario>/<repo>.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

**Paso 2: Verificar Vercel connection**
- Confirmar que proyecto está en Vercel
- Verificar que está conectado a GitHub repo
- Confirmar build settings (build command, output dir)

**Paso 3: Test Preview**
- Crear rama de feature: `git checkout -b feature/test`
- Hacer cambio mínimo
- Push: `git push -u origin feature/test`
- Vercel automáticamente creará Preview URL

---

## 📋 CHECKLIST ANTES DE IMPLEMENTAR FLUJO

- ❌ Dev server funciona localmente (`npm run dev`)
- ❌ .git inicializado localmente
- ❌ GitHub remote configurado
- ❌ Vercel conexión verificada
- ❌ Preview deployments funcionan
- ✅ Variables de entorno seguras
- ✅ Build scripts listos

---

## ESTADO FINAL

**LOCAL:** ⚠️ BLOQUEADO (dev server no inicia)  
**GIT:** ❌ NO INICIALIZADO  
**GITHUB:** ❌ NO CONECTADO  
**VERCEL:** ✅ PROBABLEMENTE FUNCIONANDO  
**SEGURIDAD:** ✅ VERIFICADA  

**Acción requerida:** Resolver plugin MCP issue en Windows antes de continuar.

---

*Auditoría completada - READ-ONLY (sin cambios realizados)*
