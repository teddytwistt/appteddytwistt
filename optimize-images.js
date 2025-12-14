#!/usr/bin/env node

/**
 * Script para optimizar imágenes a WebP
 * Usa Sharp que ya está instalado en el proyecto
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'public', 'images');

async function optimizeImages() {
  console.log('🎨 OPTIMIZACIÓN DE IMÁGENES A WebP\n');
  console.log('='.repeat(60));

  const files = fs.readdirSync(imagesDir);
  const imageFiles = files.filter(file =>
    /\.(png|jpg|jpeg)$/i.test(file) && !file.includes('.webp')
  );

  if (imageFiles.length === 0) {
    console.log('✅ No hay imágenes para optimizar');
    return;
  }

  console.log(`\n📁 Encontradas ${imageFiles.length} imágenes para optimizar:\n`);

  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const file of imageFiles) {
    const inputPath = path.join(imagesDir, file);
    const outputPath = path.join(imagesDir, file.replace(/\.(png|jpg|jpeg)$/i, '.webp'));

    try {
      // Obtener tamaño original
      const originalStats = fs.statSync(inputPath);
      const originalSize = originalStats.size;
      totalOriginal += originalSize;

      // Convertir a WebP
      await sharp(inputPath)
        .webp({ quality: 85 }) // Calidad 85 - buen balance entre tamaño y calidad
        .toFile(outputPath);

      // Obtener tamaño optimizado
      const optimizedStats = fs.statSync(outputPath);
      const optimizedSize = optimizedStats.size;
      totalOptimized += optimizedSize;

      const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

      console.log(`✅ ${file}`);
      console.log(`   Original:   ${formatBytes(originalSize)}`);
      console.log(`   WebP:       ${formatBytes(optimizedSize)}`);
      console.log(`   Reducción:  ${reduction}%`);
      console.log('');

    } catch (error) {
      console.error(`❌ Error procesando ${file}:`, error.message);
    }
  }

  console.log('='.repeat(60));
  console.log('\n📊 RESUMEN TOTAL:\n');
  console.log(`   Tamaño original:    ${formatBytes(totalOriginal)}`);
  console.log(`   Tamaño optimizado:  ${formatBytes(totalOptimized)}`);
  console.log(`   Reducción total:    ${((totalOriginal - totalOptimized) / totalOriginal * 100).toFixed(1)}%`);
  console.log(`   Ahorro:             ${formatBytes(totalOriginal - totalOptimized)}`);
  console.log('');
  console.log('✨ ¡Optimización completada!\n');
  console.log('💡 Las imágenes originales NO fueron eliminadas.');
  console.log('   Puedes eliminarlas manualmente si todo funciona correctamente.\n');
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

optimizeImages().catch(console.error);
