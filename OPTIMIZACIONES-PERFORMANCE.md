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

## 5. Compresión de Videos ✅ COMPLETADO

### Videos Optimizados (Commit: 8d42481)

**Configuración aplicada:**
```bash
# video_principal_web.mp4
ffmpeg -i video_principal_web.mp4 -vf "scale=1080:1350" -c:v libx264 -crf 23 -preset slow -movflags +faststart -an video_principal_web_optimized.mp4

# animation_teddytwist.mp4
ffmpeg -i animation_teddytwist.mp4 -vf "scale=1080:1350" -c:v libx264 -crf 23 -preset slow -movflags +faststart -an animation_teddytwist_optimized.mp4
```

**Resultados:**
- video_principal_web.mp4: 3.1MB → **1.1MB** (65% reducción)
- animation_teddytwist.mp4: 2.6MB → **1.0MB** (62% reducción)
- **Total ahorrado: 3.6MB** (63% reducción)

**Especificaciones técnicas:**
- Resolución: 1440x1800 → 1080x1350
- Codec: H.264 (libx264)
- CRF: 23 (calidad visualmente sin pérdida)
- Bitrate: ~900 kbits/s (desde ~2400 kbits/s)
- Preset: slow (mejor compresión)
- Flags: +faststart (streaming optimizado)

### Próximos Pasos Opcionales

### Convertir PNGs Restantes a WebP
```bash
# Convertir PNGs grandes (01.png: 860KB, 04.png: 740KB, etc)
cwebp -q 80 public/images/01.png -o public/images/01.webp
cwebp -q 80 public/images/02.png -o public/images/02.webp
cwebp -q 80 public/images/03.png -o public/images/03.webp
cwebp -q 80 public/images/04.png -o public/images/04.webp
```

## Impacto Esperado

| Métrica | Antes | Después (Estimado) |
|---------|-------|-------------------|
| **RES Mobile** | 75 | 85-92 |
| **First Contentful Paint (FCP)** | ~2.5s | ~1.2s |
| **Largest Contentful Paint (LCP)** | ~3.5s | ~1.8s |
| **Total Blocking Time (TBT)** | ~400ms | ~150ms |
| **Peso inicial (Mobile)** | ~6MB | **~2.5MB** ✅ |
| **Videos totales** | 5.7MB | **2.1MB** ✅ (63% reducción) |

## ✅ Ambiente Dev Configurado

**Proyecto Dev deployado en**: https://appteddytwistt-dev.vercel.app
**Rama**: `dev`
**Auto-deploy**: Activado ✓

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

