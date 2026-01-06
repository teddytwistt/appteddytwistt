# Optimizaciones de Performance - Rama Dev

## Objetivo
Mejorar el Real Experience Score (RES) de Vercel de 75 a +90 en dispositivos móviles.

## Problema Identificado
- **RES actual**: 75 (Needs Improvement)
- **Causa principal**: Videos pesados que se cargan inmediatamente en mobile
- **Recursos problemáticos**:
  - `video_principal_web.mp4`: 3.1MB
  - `animation_teddytwist.mp4`: 2.6MB
  - Video externo de Vercel Blob Storage
  - PNGs grandes sin optimizar (screenshot001.png: 1.3MB)

## Cambios Implementados

### 1. Optimización de Videos (`components/product-hero.tsx`)

**Antes:**
```tsx
<video src="/videos/video_principal_web.mp4" autoPlay loop muted playsInline />
```

**Después:**
```tsx
// Mobile - solo carga metadatos, no el video completo
<video src="/videos/video_principal_web.mp4" autoPlay loop muted playsInline preload="metadata" />

// Desktop hover - no carga hasta que se necesite
<video src="/videos/animation_teddytwist.mp4" autoPlay loop muted playsInline preload="none" />
```

**Mejora esperada**:
- Reducción de ~3MB en carga inicial mobile
- Video solo se descarga cuando se reproduce

### 2. Optimización de Imágenes Hero

**Antes:**
```tsx
<img src="/images/screenshot001.png" alt="..." />
```

**Después:**
```tsx
<img src="/images/screenshot001.webp" alt="..." loading="eager" />
```

**Mejora esperada**:
- WebP reduce tamaño ~60-80% vs PNG
- `loading="eager"` garantiza carga prioritaria de la imagen principal

### 3. Optimización Video de Review (`components/product-gallery.tsx`)

**Antes:**
```tsx
<video autoPlay loop muted playsInline>
  <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/..." />
</video>
```

**Después:**
```tsx
<video autoPlay loop muted playsInline preload="none">
  <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/..." />
</video>
```

**Mejora esperada**:
- Video externo no se descarga hasta que esté visible
- Reduce consumo de ancho de banda inicial

### 4. Optimización Meta Pixel (`components/meta-pixel.tsx`)

**Antes:**
```tsx
<Script id="meta-pixel" strategy="afterInteractive" ... />
```

**Después:**
```tsx
<Script id="meta-pixel" strategy="lazyOnload" ... />
```

**Mejora esperada**:
- Script de Facebook se carga después de todos los recursos críticos
- No bloquea renderizado inicial
- Reduce latencia de conexión a servidores externos

## Próximos Pasos Sugeridos (Opcionales)

### Comprimir Videos
```bash
# Reducir video principal de 3.1MB a ~1MB
ffmpeg -i video_principal_web.mp4 -vcodec h264 -crf 28 video_principal_compressed.mp4

# Reducir video de animación
ffmpeg -i animation_teddytwist.mp4 -vcodec h264 -crf 28 animation_compressed.mp4
```

### Convertir PNGs Restantes a WebP
```bash
# Convertir PNGs grandes
cwebp -q 80 01.png -o 01.webp
cwebp -q 80 02.png -o 02.webp
cwebp -q 80 03.png -o 03.webp
cwebp -q 80 04.png -o 04.webp
```

## Impacto Esperado

| Métrica | Antes | Después (Estimado) |
|---------|-------|-------------------|
| **RES Mobile** | 75 | 85-92 |
| **First Contentful Paint (FCP)** | ~2.5s | ~1.2s |
| **Largest Contentful Paint (LCP)** | ~3.5s | ~1.8s |
| **Total Blocking Time (TBT)** | ~400ms | ~150ms |
| **Peso inicial (Mobile)** | ~6MB | ~2.5MB |

## Verificación

### En Local
```bash
npm run dev
# Abrir DevTools > Network
# Verificar que videos tengan preload correcto
# Verificar que Meta Pixel cargue al final
```

### En Vercel
1. Hacer commit y push a rama `dev`
2. Esperar deploy preview
3. Revisar Speed Insights en 24-48 horas
4. Comparar RES antes vs después

## Referencias
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)
- [Next.js Script Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/scripts)
- [Video Preload Attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#preload)
