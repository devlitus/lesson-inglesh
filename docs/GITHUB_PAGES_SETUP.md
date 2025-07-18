# Configuración de GitHub Pages para Lesson-Inglesh

## Pasos para habilitar GitHub Pages

### 1. Configurar GitHub Pages en el repositorio

1. Ve a tu repositorio en GitHub
2. Ve a **Settings** → **Pages**
3. En **Source**, selecciona **GitHub Actions**
4. Guarda los cambios

### 2. Configurar permisos del workflow

1. Ve a **Settings** → **Actions** → **General**
2. En **Workflow permissions**, selecciona **Read and write permissions**
3. Marca **Allow GitHub Actions to create and approve pull requests**
4. Guarda los cambios

### 3. Variables de entorno (opcional)

Si necesitas variables de entorno para producción:

1. Ve a **Settings** → **Environments**
2. Crea un ambiente llamado `github-pages`
3. Agrega las variables necesarias

## URLs de acceso

Una vez deployado, tu aplicación estará disponible en:

- **URL principal**: `https://devlitus.github.io/lesson-inglesh/`

## Estructura del Pipeline

```yaml
lint → test → build → deploy (solo en main/master)
```

### Jobs del Pipeline:

1. **Lint**: Verifica la calidad del código con ESLint
2. **Test**: Ejecuta todos los tests con Vitest
3. **Build**: Compila la aplicación para producción
4. **Deploy**: Publica en GitHub Pages (solo en rama main/master)

## Configuración local

Para probar localmente el build de producción:

```bash
npm run build
npm run preview
```

## Estructura de archivos importantes

- `.github/workflows/ci-cd.yml` - Pipeline de CI/CD
- `vite.config.ts` - Configuración de Vite con base path para GitHub Pages
- `public/.nojekyll` - Evita que GitHub Pages use Jekyll
- `dist/` - Directorio de build (se genera automáticamente)

## Debugging

Si el deploy falla:

1. Revisa los logs en **Actions** tab del repositorio
2. Verifica que los permisos estén configurados correctamente
3. Asegúrate de que el branch sea `main` o `master`
4. Verifica que no haya errores en el build

## Notas importantes

- El deploy solo se ejecuta en push a `main` o `master`
- Los PR ejecutan lint, test y build pero no deploy
- El archivo `.nojekyll` es necesario para que funcionen las rutas del SPA
- La configuración `base: '/lesson-inglesh/'` en Vite es necesaria para las rutas relativas
