# INFORMACIÓN CRÍTICA - Workflow de Deploy

## Deploy Manual a Vercel (CLI)

**IMPORTANTE:** Este proyecto NO tiene sincronización automática con Vercel. Los deploys deben hacerse manualmente desde CLI.

### Workflow Completo

1. **Hacer cambios** en el código
   ```bash
   # Editar archivos según sea necesario
   ```

2. **Commit local**
   ```bash
   git add .
   git commit -m "Descripción del cambio"
   ```

3. **Push a GitHub**
   ```bash
   git push
   ```

4. **Deploy a Vercel (MANUAL)**
   ```bash
   vercel --prod --yes
   ```

### Información del Proyecto

- **Repositorio GitHub**: `faustinoUNC/proyectoteddytwist`
- **Rama principal**: `main`
- **Proyecto Vercel**: `nuevos-cambios-gonzalo`
- **URL Producción**: https://nuevos-cambios-gonzalo.vercel.app

### Variables de Entorno en Vercel

Las siguientes variables están configuradas en Vercel (Production):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MERCADO_PAGO_ACCESS_TOKEN`
- `NEXT_PUBLIC_FORM_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

### Archivos Sensibles

- `.env.local` está ignorado en git (contiene valores reales)
- `.env.example` está en git (contiene placeholders)

### Comandos Útiles

```bash
# Ver estado de git
git status

# Ver último commit
git log -1

# Ver proyectos de Vercel
vercel project ls

# Ver deployments recientes
vercel ls

# Hacer deploy a producción
vercel --prod --yes
```

### Notas

- **NO** hacer `git push --force` a main
- Siempre pushear a GitHub antes de deployar a Vercel
- El deploy a Vercel NO es automático, debe ejecutarse manualmente
- Usar `vercel --prod --yes` para deploys sin confirmación interactiva
