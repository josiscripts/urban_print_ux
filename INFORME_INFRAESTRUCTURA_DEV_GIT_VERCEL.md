# 📋 INFORME: INFRAESTRUCTURA DE DESARROLLO / GIT / GITHUB / VERCEL

**Fecha:** 2026-08-28  
**Tipo:** Auditoría READ-ONLY (sin cambios realizados)  
**Objeto:** Configuración de flujo local → GitHub → Vercel (Preview + Production)

---

## A. ESTADO ACTUAL

### 🔴 GIT LOCAL

| Aspecto | Estado | Detalles |
|---------|--------|---------|
| `.git` directory | ❌ NO EXISTE | Proyecto NOT inicializado como repositorio Git |
| Git branches | ❌ NO DISPONIBLE | Sin repositorio local |
| Remote origin | ❌ NO CONFIGURADO | `git remote -v` no funciona |
| Git history | ❌ NO EXISTE | Sin commits locales |

**Conclusión:** El proyecto está bajo control de **Lovable.dev platform**, no bajo Git local tradicional.

### 🟡 GITHUB

| Aspecto | Estado | Detalles |
|---------|--------|---------|
| `.github/` workflows | ❌ NO ENCONTRADO | Sin GitHub Actions CI/CD local |
| Repositorio remoto | ❌ DESCONOCIDO | No se puede determinar si existe |
| Conexión directa | ❌ NO | El proyecto NO está conectado localmente a GitHub |

**Conclusión:** El proyecto presumiblemente existe en GitHub (porque está desplegado en Vercel), pero la máquina local no tiene acceso configurado.

### ✅ VERCEL

| Aspecto | Estado | Detalles |
|---------|--------|---------|
| Proyecto en Vercel | ✅ SÍ (presumido) | Usuario confirma: "actualmente desplegado en Vercel" |
| `.vercel/` local | ❌ NO EXISTE | Sin metadata local de Vercel |
| `vercel.json` | ❌ NO EXISTE | Usando configuración por defecto |
| Deployment pipeline | ⚠️ DESCONOCIDO | Probablemente conectado a GitHub para auto-deploy |

**Conclusión:** Vercel probablemente está observando un repositorio GitHub, pero se necesita verificación en dashboard.

### 📦 STACK TÉCNICO

```
✅ Node.js v22.21.1
✅ npm v10.9.4
✅ TanStack Start (Full-stack React framework)
✅ Vite 8.1.5
✅ TypeScript 5.8.3 (strict mode)
✅ Tailwind CSS 4.2.1
✅ Supabase Integration
✅ Lovable.dev Platform Integration
```

### 🔐 VARIABLES DE ENTORNO

**Ubicación:** `.env` en raíz del proyecto

**Variables presentes:**
```
✅ SUPABASE_PROJECT_ID
✅ SUPABASE_PUBLISHABLE_KEY (pública - ok)
✅ SUPABASE_URL
✅ VITE_SUPABASE_PROJECT_ID (pública - ok)
✅ VITE_SUPABASE_PUBLISHABLE_KEY (pública - ok)
✅ VITE_SUPABASE_URL (pública - ok)
✅ WOOCOMMERCE_URL
✅ WOOCOMMERCE_CONSUMER_KEY (privada - crítica)
✅ WOOCOMMERCE_CONSUMER_SECRET (privada - crítica)
```

### 🛠️ SCRIPTS DISPONIBLES

```json
"dev":          "vite dev"              // ❌ FALLA en PowerShell Windows
"build":        "vite build"            // ✅ Funciona
"build:dev":    "vite build --mode development"  // ✅ Funciona
"preview":      "vite preview"          // ✅ Funciona
"lint":         "eslint ."              // ✅ Funciona
"format":       "prettier --write ."    // ✅ Funciona
```

---

## B. PROBLEMAS ENCONTRADOS

### 🔴 PROBLEMA 1: .env NO ESTÁ EN .gitignore - SEGURIDAD CRÍTICA

**Severidad:** 🔴 CRÍTICA

**Descripción:**
El archivo `.gitignore` existe pero NO incluye `.env`. Si el proyecto se sube a GitHub (público o privado), las credenciales se expondrían.

**Qué está en riesgo:**
- ✅ Supabase credentials (PÚBLICO - aceptable)
- ✅ WooCommerce URL (PÚBLICO - aceptable)
- 🔴 WOOCOMMERCE_CONSUMER_KEY (PRIVADO - CRÍTICO)
- 🔴 WOOCOMMERCE_CONSUMER_SECRET (PRIVADO - CRÍTICO)

**Impacto si se expone:**
- Cualquiera podría modificar productos en WooCommerce
- Podrían crear/editar órdenes
- Podrían cambiar precios
- Acceso completo a API de tienda

**Estado actual:**
```
.gitignore NO contiene:
  ❌ .env
  ❌ .env.local
  ❌ .env.*.local
  ❌ .env.example (documento de estructura)
```

### 🔴 PROBLEMA 2: npm run dev FALLA EN WINDOWS POWERSHELL

**Severidad:** 🔴 CRÍTICA (Bloquea desarrollo local)

**Error exacto:**
```
Error: @lovable.dev/mcp-js: routesDir "src/routes" must resolve under 
C:/Users/josia/Desktop/Websites_Clientes/urban_print/Urban Print Platform, 
got C:\Users\josia\Desktop\Websites_Clientes\urban_print\Urban Print Platform\src\routes
```

**Causa raíz:**
El plugin `@lovable.dev/mcp-js v0.26.3` espera rutas con forward slashes (`/`), pero PowerShell devuelve backslashes (`\`). El string comparison falla.

**Archivos afectados:**
- `vite.config.ts` - Usa `mcpPlugin()` de Lovable
- `src/routes/mcp.ts` - Auto-generado (marcado como DO NOT EDIT)

**Workaround actual:**
Puede ejecutarse con:
```bash
bash -c "npm run dev"  # En Git Bash
# o en WSL
wsl npm run dev
```

**Solución permanente:**
- Esperar actualización de plugin Lovable (plugin maintainer debe corregir Windows path handling)
- O usar Git Bash/WSL en lugar de PowerShell

### ❌ PROBLEMA 3: SIN INICIALIZACIÓN GIT LOCAL

**Severidad:** 🟡 ALTA

**Descripción:**
- No hay `.git` directory
- No hay Git remotes configurado
- No hay branches
- No hay commits locales

**Por qué es un problema:**
- No se pueden hacer commits locales
- No se puede hacer push a GitHub
- No se puede crear pull requests
- No hay historial de versiones

**Causa probable:**
Proyecto está bajo control de Lovable.dev, que sincronizan a Git cuando está configurado, pero no hay setup Git local.

### ❌ PROBLEMA 4: NO HAY CONEXIÓN A GITHUB

**Severidad:** 🟡 ALTA

**Descripción:**
- No hay remote origin configurado
- No hay GitHub workflows
- No hay acceso a repository desde local

**Impacto:**
- No se pueden hacer push
- No se pueden crear PRs
- No se puede disparar Vercel Preview Deployments

### ⚠️ PROBLEMA 5: NO HAY .env.example

**Severidad:** 🟠 MEDIA

**Descripción:**
No existe archivo `.env.example` que documente la estructura de variables necesarias.

**Impacto:**
- Difícil para nuevo developer conocer qué variables configurar
- Riesgo de perder variables críticas si `.env` se borra

---

## C. QUÉ HAY QUE CONFIGURAR

### PASO 1: CORRECCIÓN URGENTE DE SEGURIDAD

**Archivo:** `.gitignore`

**Acción:** Agregar exclusión de archivos secretos

```
# Agregar estas líneas a .gitignore:
.env
.env.local
.env.*.local
.env.*.example
```

**Verificación después:**
```bash
git check-ignore .env  # Debe devolver: .env
```

### PASO 2: CREAR PLANTILLA DE VARIABLES

**Archivo:** Crear `.env.example`

**Contenido:**
```bash
# Supabase Configuration
SUPABASE_PROJECT_ID=your_project_id_here
SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PROJECT_ID=your_project_id_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
VITE_SUPABASE_URL=https://your-project.supabase.co

# WooCommerce Configuration (Store Backend)
WOOCOMMERCE_URL=https://urbanprint.es
WOOCOMMERCE_CONSUMER_KEY=your_consumer_key_here
WOOCOMMERCE_CONSUMER_SECRET=your_consumer_secret_here
```

**Propósito:** Documentar estructura sin exponer credenciales.

### PASO 3: INICIALIZAR GIT LOCAL

**Prerrequisito:** Paso 1 (asegurar .env en .gitignore)

**Comandos:**
```bash
git init
git add .
git commit -m "Initial commit: Urban Print Platform with WooCommerce Phase 2"
```

### PASO 4: CONECTAR A GITHUB REMOTO

**Información requerida:**
- URL del repositorio GitHub (ejemplo: `https://github.com/usuario/urban-print.git`)
- O usar SSH (requiere SSH keys configuradas)

**Comandos:**
```bash
git remote add origin https://github.com/usuario/urban-print.git
git branch -M main
git push -u origin main
```

### PASO 5: VERIFICAR VERCEL CONNECTION

**Acción:** Ingresar a Vercel dashboard y verificar:
- ✅ Proyecto existe
- ✅ Está conectado al repositorio GitHub correcto
- ✅ Build command: `npm run build`
- ✅ Output directory: `.` (TanStack Start auto-configures)
- ✅ Environment variables están configuradas en Vercel

**Variables en Vercel (no en .env):**
```
Production environment:
  ✅ WOOCOMMERCE_URL
  ✅ WOOCOMMERCE_CONSUMER_KEY
  ✅ WOOCOMMERCE_CONSUMER_SECRET
  ✅ SUPABASE_URL
  ✅ SUPABASE_PUBLISHABLE_KEY
  
Preview environment:
  ✅ Mismas variables (o subset)
```

### PASO 6: RESOLVER npm run dev EN WINDOWS

**Opción A (Recomendada - Ahora):**
Usar Git Bash para desarrollo local:
```bash
# En lugar de PowerShell, abrir Git Bash
bash -c "npm run dev"
```

**Opción B (Alternativa - WSL):**
```bash
wsl npm run dev
```

**Opción C (Futuro - Esperar):**
Esperar a que Lovable.dev actualice `@lovable.dev/mcp-js` para corregir Windows path handling.

---

## D. QUÉ NO HAY QUE TOCAR

### ✅ NO MODIFICAR

| Elemento | Razón |
|----------|-------|
| `src/routes/mcp.ts` | Auto-generado por Lovable (marcado DO NOT EDIT) |
| `vite.config.ts` plugin config | Removimiento de Lovable causaría problemas |
| Lovable integrations | Afectaría sincronización con platform |
| Supabase database schema | Fuera de scope (Phase 2 solo productos) |
| WooCommerce data | Solo lectura para catálogo |
| Diseño frontend | User específicamente pidió no tocar |
| Rutas de frontend | User específicamente pidió no tocar |
| Componentes React | User específicamente pidió no tocar |

### ⚠️ TENER CUIDADO

| Elemento | Por qué |
|----------|---------|
| `.env` file | Contiene credenciales - NUNCA commitear |
| `package.json` dependencies | Cambiar versiones podría romper Lovable |
| TypeScript config | Cambios podrían afectar compilación |
| Git history | Lovable advierte contra rewriting published history |

---

## E. FLUJO FINAL RECOMENDADO

### Arquitectura Deseada

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPER LOCAL                          │
│  • npm run dev → http://localhost:5173 (Hot Reload)        │
│  • Git Bash or WSL terminal                                │
│  • Editar código y ver cambios en vivo                      │
└──────────────┬──────────────────────────────────────────────┘
               │ git push -u origin feature/nombre
               ↓
┌─────────────────────────────────────────────────────────────┐
│                   GITHUB REPOSITORY                         │
│  • Rama feature con cambios                                │
│  • Automáticamente dispara Vercel Preview Build             │
│  • Opcionalmente crear Pull Request                         │
└──────────────┬──────────────────────────────────────────────┘
               │ (Automático) Vercel detecta nueva rama
               ↓
┌─────────────────────────────────────────────────────────────┐
│              VERCEL PREVIEW DEPLOYMENT                      │
│  • URL: https://urban-print-[hash].vercel.app              │
│  • Ambiente: Igual a producción                            │
│  • Variables: Mismo .env de Preview                        │
│  • Propósito: Revisar cambios antes de producción          │
└──────────────┬──────────────────────────────────────────────┘
               │ (Opcional) Crear PR en GitHub
               │ (Opcional) Code review
               │ Merge → main cuando aprobado
               ↓
┌─────────────────────────────────────────────────────────────┐
│                  GITHUB MAIN BRANCH                         │
│  • Pull Request merged                                     │
│  • Vercel automáticamente dispara Production Build          │
└──────────────┬──────────────────────────────────────────────┘
               │ (Automático) Vercel builds production
               ↓
┌─────────────────────────────────────────────────────────────┐
│            VERCEL PRODUCTION DEPLOYMENT                     │
│  • URL: https://urbanprint-vercel-domain.com (actual)      │
│  • Ambiente: Production (variables prod)                   │
│  • Base de datos: WooCommerce (urbanprint.es)              │
│  • Live para usuarios reales                               │
└─────────────────────────────────────────────────────────────┘
```

### Comandos Típicos del Developer

```bash
# 1. Traer cambios más recientes
git pull origin main

# 2. Crear rama para feature
git checkout -b feature/nueva-funcionalidad

# 3. Editar código y ver en vivo
npm run dev
# Ahora en Git Bash: bash -c "npm run dev"

# 4. Commitear cambios
git add .
git commit -m "Descripción breve del cambio"

# 5. Push a GitHub (dispara Vercel Preview)
git push -u origin feature/nueva-funcionalidad

# 6. Ir a GitHub, crear Pull Request

# 7. Revisar en Vercel Preview URL

# 8. Merge cuando aprobado
# → Automáticamente dispara production deployment en Vercel
```

---

## F. PASOS EXACTOS PARA CONFIGURAR EL FLUJO COMPLETO

### FASE 1: PREPARACIÓN URGENTE (SEGURIDAD)

```bash
# 1. Editar .gitignore para agregar .env
#    (ver sección C, PASO 1)

# 2. Crear .env.example
#    (ver sección C, PASO 2)

# 3. Verificar que .env NO se va a subir:
git status
# Debe mostrar: .env in .gitignore
# NO debe mostrar: .env en archivos a commitear

# 4. Si ya está en un repo con .env expuesto:
#    Necesita rotación de credenciales en Vercel y WooCommerce admin
```

### FASE 2: INICIALIZAR GIT LOCAL

```bash
# 1. Ir a la carpeta del proyecto
cd c:\Users\josia\Desktop\Websites_Clientes\urban_print\Urban\ Print\ Platform

# 2. Inicializar Git
git init

# 3. Agregar todos los archivos
git add .

# 4. Hacer commit inicial
git commit -m "Initial commit: Urban Print Platform with TanStack Start + WooCommerce Phase 2 adapter"

# 5. Listar commits (verificación)
git log --oneline
# Debe mostrar: Initial commit...
```

### FASE 3: CONECTAR A GITHUB

**Prerequisito:** Tener repositorio GitHub creado (vacío o existente)

```bash
# 1. Agregar remote origin (REEMPLAZAR URL)
git remote add origin https://github.com/USUARIO/REPO-NAME.git

# 2. Verificar remote
git remote -v
# Debe mostrar: origin https://github.com/USUARIO/REPO-NAME.git

# 3. Cambiar rama a main (si necesario)
git branch -M main

# 4. Push a GitHub
git push -u origin main

# 5. Verificar en GitHub
# Abre: https://github.com/USUARIO/REPO-NAME
# Debe mostrar: Urban Print Platform files
```

### FASE 4: CONFIGURAR VERCEL

**Prerequisito:** Cuenta Vercel activa, conectada a GitHub

```
1. Ir a: https://vercel.com/dashboard

2. Crear nuevo proyecto:
   → "Add New..." → "Project"
   → Seleccionar repositorio GitHub
   → Seleccionar rama: main
   
3. Configuración del proyecto:
   Framework Preset: TanStack Start (o detectar automáticamente)
   Build Command: npm run build (por defecto)
   Output Directory: . (TanStack Start auto-configures)
   
4. Environment Variables (agregar en Vercel dashboard):
   
   PRODUCTION environment:
   ├─ SUPABASE_URL = [value from .env]
   ├─ SUPABASE_PUBLISHABLE_KEY = [value from .env]
   ├─ WOOCOMMERCE_URL = https://urbanprint.es
   ├─ WOOCOMMERCE_CONSUMER_KEY = [from .env - KEEP SECRET]
   └─ WOOCOMMERCE_CONSUMER_SECRET = [from .env - KEEP SECRET]
   
   PREVIEW environment:
   └─ (Mismo que Production)
   
5. Deploy
   → Click "Deploy"
   → Esperar build (2-5 minutos)
   → Vercel asignará URL: https://urban-print-[hash].vercel.app
```

### FASE 5: VERIFICAR PREVIEW DEPLOYMENTS

```bash
# 1. Crear rama de feature
git checkout -b feature/test-preview

# 2. Hacer un cambio mínimo (ej: comentario)
#    Editar cualquier archivo
git add .
git commit -m "Test preview deployment"

# 3. Push a GitHub
git push -u origin feature/test-preview

# 4. Ir a Vercel dashboard
#    Debe mostrar: "Preview" deployment creándose
#    Esperar a que termine

# 5. Vercel enviará URL de preview (comentario en GitHub)
#    Ejemplo: https://urban-print-feature-test-preview-[hash].vercel.app

# 6. Abrir esa URL en navegador → Debe verse igual que producción

# 7. Merge rama a main
git checkout main
git pull origin main
git merge feature/test-preview
git push origin main

# 8. Vercel automáticamente hace deploy a PRODUCTION
#    URL: https://urbanprint-vercel-domain.com (o asignada)
```

### FASE 6: CONFIGURAR npm run dev LOCAL

**OPCIÓN A: Git Bash (Recomendada)**

```bash
# 1. Abrir Git Bash (en lugar de PowerShell)
#    Windows: Botón derecho en carpeta → "Open Git Bash here"

# 2. Ejecutar:
bash -c "npm run dev"

# 3. Debe mostrar:
#    Port: 5173
#    URL: http://localhost:5173

# 4. Abrir navegador en http://localhost:5173
#    Ver aplicación corriendo

# 5. Editar un archivo y guardar
#    Hot Reload debe actualizar navegador automáticamente
```

**OPCIÓN B: WSL (Si tienes WSL instalado)**

```bash
# 1. Abrir WSL terminal

# 2. Navegar a proyecto:
cd /mnt/c/Users/josia/Desktop/Websites_Clientes/urban_print/Urban\ Print\ Platform

# 3. Ejecutar:
npm run dev

# 4. Mismo resultado que Git Bash
```

**OPCIÓN C: PowerShell (Esperar arreglo)**

```bash
# NO funciona ahora, esperar que Lovable arregle el plugin
# O cambiar a Git Bash/WSL
```

---

## G. QUÉ PUEDE HACER CLAUDE CODE AUTOMÁTICAMENTE Y QUÉ REQUIERE AUTORIZACIÓN

### ✅ PUEDE HACER AUTOMÁTICAMENTE (Sin tu autorización)

| Tarea | Por qué | Limitación |
|-------|---------|-----------|
| Editar `.gitignore` para agregar `.env` | Es configuración local, mejora seguridad | No afecta funcionalidad |
| Crear `.env.example` | Documentación, sin credenciales | Completamente seguro |
| Crear archivos de configuración | `.github/workflows/`, `vercel.json` (si necesario) | Mejora workflow |
| Investigar/auditar estado | Lectura de archivos | Solo descubrimiento |
| Sugerir cambios | Análisis | No-invasivo |
| Formatear código | Prettier | Ya configurado |

### 🔐 REQUIERE TU AUTORIZACIÓN EXPLÍCITA

| Tarea | Por qué | Riesgo |
|-------|---------|--------|
| `git init` | Inicializa repositorio | Irreversible localmente |
| `git add .` | Staging files | Podría incluir archivos no deseados |
| `git commit` | Commits los cambios | Crea historial |
| `git push` | Sube a GitHub | Afecta repositorio remoto |
| `git remote add` | Conecta remoto | Cambio de configuración Git |
| Cambiar variables Vercel | Afecta deployments | Impacto en producción |
| Modificar `vite.config.ts` | Afecta dev server | Podría romper Lovable |
| Borrar/modificar Lovable files | `.lovable/`, `src/routes/mcp.ts` | Rompe integración |
| Deploy a producción | Afecta usuarios reales | Alto riesgo |

### 📋 PLAN PROPUESTO PARA CLAUDE CODE

**Con autorización del usuario, Claude CODE PODRÍA:**

1. ✅ Editar `.gitignore` (agregar `.env`)
2. ✅ Crear `.env.example`
3. ⚠️ Ejecutar `git init` (SI AUTORIZAS)
4. ⚠️ Ejecutar `git add .` (SI AUTORIZAS)
5. ⚠️ Ejecutar `git commit` (SI AUTORIZAS)
6. ⚠️ Ejecutar `git remote add origin` (SI AUTORIZAS - necesitas GitHub URL)
7. ⚠️ Ejecutar `git push` (SI AUTORIZAS)
8. ❌ Modificar Vercel (requiere acceso manual a dashboard)
9. ❌ Cambiar variables en Vercel (requiere acceso manual a dashboard)

**Lo que REQUIERE TU INTERACCIÓN MANUAL:**

1. Crear repositorio en GitHub
2. Obtener URL del repositorio
3. Ingresar a Vercel dashboard
4. Conectar repositorio a Vercel
5. Configurar environment variables en Vercel
6. Usar Git Bash/WSL para `npm run dev`

---

## RESUMEN RÁPIDO: PRÓXIMOS PASOS

| Paso | Tipo | Acción | Cuando |
|------|------|--------|--------|
| 1 | Auto | Editar .gitignore + crear .env.example | YA |
| 2 | Manual | Crear repo en GitHub | Hoy |
| 3 | Manual | Obtener GitHub URL | Hoy |
| 4 | Auto | git init + git add + git commit + git push | Cuando autorice |
| 5 | Manual | Conectar repo a Vercel | Hoy |
| 6 | Manual | Configurar env vars en Vercel | Hoy |
| 7 | Manual | Usar Git Bash para npm run dev | Siempre |
| 8 | Auto | Crear .github/workflows (opcional) | Si lo solicita |

---

## RIESGOS SI NO SE CONFIGURA CORRECTAMENTE

| Riesgo | Impacto | Severidad |
|--------|---------|-----------|
| .env sin .gitignore → credenciales en GitHub | WooCommerce comprometido, cambios de precios/productos | 🔴 CRÍTICO |
| npm run dev no funciona | Desarrollo bloqueado | 🔴 CRÍTICO |
| Sin Git local | No se puede hacer commits/push | 🔴 CRÍTICO |
| Sin GitHub remoto | No se pueden crear PRs, no funciona Preview | 🟡 ALTO |
| Sin Preview Deployments | No se puede revisar cambios antes de producción | 🟠 MEDIO |
| Vercel sin env vars | Production deployment fallará | 🔴 CRÍTICO |

---

## CONCLUSIÓN

**Estado actual:** Proyecto está en Lovable.dev, desplegado en Vercel, pero SIN Git local ni GitHub connection.

**Bloqueadores:**
1. 🔴 npm run dev FALLA (Windows PowerShell + Lovable plugin issue)
2. 🔴 Credenciales en riesgo (.env no en .gitignore)
3. ❌ Sin Git local
4. ❌ Sin GitHub remoto

**Orden de resolución:**
1. URGENTE: Agregar .env a .gitignore
2. URGENTE: Usar Git Bash para desarrollo
3. HOY: Crear GitHub repo
4. HOY: Conectar Vercel a GitHub
5. HOY: git init + push (con autorización)
6. LISTO: Flujo completo funcionando

---

**Auditoría completada - Esperando instrucciones para proceder con la configuración.**

*Informe generado por Claude Code - Investigación READ-ONLY (sin cambios)*
