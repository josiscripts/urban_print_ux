# Integración de Google Reviews - Guía de Setup

## 📋 Archivos Creados

1. **`.env.local`** - Variables de entorno (NO incluido en git)
2. **`src/routes/api.google-reviews.ts`** - Endpoint del servidor para Google Places API
3. **`src/components/GoogleReviews.tsx`** - Componente React para mostrar reseñas

## 🔐 Configuración de Variables de Entorno

Abre `.env.local` en la raíz del proyecto y completa:

```env
GOOGLE_PLACES_API_KEY=TU_API_KEY_AQUI
GOOGLE_PLACE_ID=TU_PLACE_ID_AQUI
```

### Cómo obtener las credenciales:

1. **API Key:**
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Crea un nuevo proyecto o selecciona uno existente
   - Habilita la API "Places API"
   - Ve a "Credenciales" y crea una API Key
   - Copia la API Key en `GOOGLE_PLACES_API_KEY`

2. **Place ID:**
   - Ve a [Google Maps](https://maps.google.com/)
   - Busca tu negocio
   - Haz clic en él para abrir los detalles
   - La URL contendrá el Place ID, ejemplo: `https://maps.app.goo.gl/ChIJ...`
   - O usa la [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)

## 🚀 Cómo Usar el Componente

### En la página de inicio (`src/routes/index.tsx`):

```tsx
import { GoogleReviews } from "@/components/GoogleReviews";

export function Home() {
  // ... resto del componente

  return (
    <div>
      {/* Otras secciones */}

      {/* Agregar GoogleReviews después de Productos Destacados */}
      <GoogleReviews />

      {/* Resto del contenido */}
    </div>
  );
}
```

**Ubicación recomendada:** Después de "Productos destacados" y antes de "Opiniones de clientes" o "Preguntas frecuentes".

## ⚙️ Endpoint API

El componente consume automáticamente:

- **GET** `/api/google-reviews`

Este endpoint:

- Obtiene datos del servidor (API Key nunca se expone al frontend)
- Retorna JSON con datos de reseñas
- Maneja errores gracefully

## 🎨 Características

✅ **Responsive** - Adaptado para móvil, tablet y desktop
✅ **Carrusel** - Navega entre reseñas con botones o indicadores
✅ **Auto-rotación** - Las reseñas cambian automáticamente cada 6 segundos
✅ **Avatares** - Muestra fotos de perfil de Google si están disponibles
✅ **Seguro** - API Key protegida en backend
✅ **Integrado** - Usa los mismos estilos que el proyecto

## 🔍 Manejo de Errores

El componente maneja correctamente:

- ❌ API Key no configurada
- ❌ Place ID no configurada
- ❌ Errores de conexión con Google
- ❌ Sin reseñas disponibles
- ❌ Respuestas inesperadas

En caso de error, **no muestra la sección** (se oculta completamente).

## 🔒 Seguridad

- ✅ `.env.local` está en `.gitignore` (no se expone en git)
- ✅ API Key solo existe en servidor (`.env.local`)
- ✅ Frontend jamás ve las credenciales
- ✅ Validación de variables de entorno
- ✅ Manejo seguro de errores (no expone credenciales en logs)

## 📱 Estados del Componente

1. **Loading** - Muestra esqueleto mientras carga
2. **Error** - No muestra nada (modo silencioso)
3. **Sin reseñas** - No muestra nada
4. **Con reseñas** - Muestra la sección completa

## 🚀 Ejecutar en Local

```bash
# Instalar dependencias
npm install

# Asegúrate de que .env.local esté completado

# Ejecutar servidor de desarrollo
npm run dev

# Visita http://localhost:8080
```

## 📦 Desplegar en Vercel

1. Asegúrate de que `.env.local` esté en `.gitignore` ✅
2. En Vercel dashboard, ve a "Project Settings" → "Environment Variables"
3. Agrega:
   - `GOOGLE_PLACES_API_KEY` = Tu API Key
   - `GOOGLE_PLACE_ID` = Tu Place ID
4. Redeploy el proyecto

## ⚡ Rendimiento

- El componente se carga solo cuando se necesita
- Las reseñas se cachean en el cliente
- Requests optimizados con field masks
- Respuestas JSON pequeñas

## 🎯 Próximos Pasos Opcionales

- Agregar un enlace a "Dejar reseña en Google"
- Cachear reseñas en servidor (ISR/SSR)
- Agregar más detalles a las tarjetas de reseñas
- Integrar con un CMS para gestionar qué reseñas mostrar

## 📞 Soporte

Si hay problemas:

1. Verifica que `.env.local` tenga valores correctos
2. Abre DevTools (F12) y revisa Network
3. Verifica que `/api/google-reviews` retorna datos válidos
4. Comprueba que la API Key está activa en Google Cloud
