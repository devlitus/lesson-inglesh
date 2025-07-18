# 🎓 Lesson Inglesh

Una plataforma moderna de aprendizaje de inglés construida con React, TypeScript y arquitectura hexagonal.

[![CI/CD Pipeline](https://github.com/devlitus/lesson-inglesh/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/devlitus/lesson-inglesh/actions/workflows/ci-cd.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)

## 🌟 Características

- 📚 **Lecciones Interactivas**: Contenido estructurado por niveles y temas
- 📊 **Seguimiento de Progreso**: Monitoreo del avance del estudiante
- 🧪 **Quizzes Adaptativos**: Evaluaciones personalizadas
- 🎨 **Design System**: Componentes reutilizables con Tailwind CSS
- 🔐 **Autenticación**: Sistema seguro con Supabase
- 📱 **Responsive**: Optimizado para todos los dispositivos
- ✅ **100% TypeScript**: Tipado estricto para mayor confiabilidad

## 🏗️ Arquitectura

Este proyecto sigue los principios de **Arquitectura Hexagonal** (Clean Architecture) y **Domain Driven Design**:

```
src/
├── application/          # Casos de uso y lógica de aplicación
│   ├── hooks/           # Hooks personalizados de React
│   ├── navigation/      # Configuración de rutas
│   └── use-cases/       # Casos de uso del dominio
├── domain/              # Entidades y reglas de negocio
│   ├── entities/        # Modelos del dominio
│   └── schemas/         # Validaciones con Zod
├── infrastructure/      # Adaptadores externos
│   ├── adapters/        # Conexiones a APIs (Supabase)
│   └── store/           # Estado global (Zustand)
├── ui/                  # Capa de presentación
│   ├── components/      # Componentes específicos de UI
│   └── pages/           # Páginas de la aplicación
└── design-system/       # Sistema de diseño
    ├── components/      # Componentes atómicos/moleculares
    └── tokens/          # Design tokens
```

## 🚀 Stack Tecnológico

### Frontend
- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de CSS
- **React Router** - Enrutamiento

### Backend & Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Base de datos relacional

### State Management
- **Zustand** - Estado global simple y eficiente

### Testing
- **Vitest** - Testing framework
- **Testing Library** - Utilidades de testing para React

### CI/CD
- **GitHub Actions** - Pipeline de integración continua
- **GitHub Pages** - Hosting automático

## 🛠️ Instalación y Desarrollo

### Prerrequisitos
- Node.js 18.x o superior
- npm o yarn

### Configuración inicial

1. **Clonar el repositorio**
```bash
git clone https://github.com/devlitus/lesson-inglesh.git
cd lesson-inglesh
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Configurar las variables de Supabase
```

4. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📝 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Construye la aplicación para producción |
| `npm run preview` | Vista previa del build de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm test` | Ejecuta tests en modo watch |
| `npm run test:run` | Ejecuta tests una vez |
| `npm run test:coverage` | Genera reporte de cobertura |

## 🧪 Testing

El proyecto mantiene una cobertura de tests del **100%** con:

- **Unit Tests**: Para casos de uso y utilidades
- **Integration Tests**: Para componentes y hooks
- **E2E Tests**: Para flujos completos de usuario

```bash
# Ejecutar todos los tests
npm test

# Ver cobertura
npm run test:coverage

# Tests con UI
npm run test:ui
```

## 🚀 Deployment

### GitHub Pages (Automático)
El proyecto se despliega automáticamente en GitHub Pages cuando se hace push a `main`:

**URL**: https://devlitus.github.io/lesson-inglesh/

### Deploy Manual
```bash
npm run build
# Los archivos estáticos se generan en ./dist/
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución

- Sigue los principios de Clean Architecture
- Escribe tests para nuevas funcionalidades
- Mantén el tipado de TypeScript estricto
- Usa conventional commits
- Asegúrate de que pasen todos los checks del CI

## 📋 Roadmap

- [ ] Sistema de gamificación
- [ ] Integración con IA para recomendaciones personalizadas
- [ ] Modo offline
- [ ] App móvil con React Native
- [ ] Sistema de certificaciones
- [ ] Comunidad de estudiantes

## 🐛 Problemas Conocidos

Revisa los [Issues](https://github.com/devlitus/lesson-inglesh/issues) para problemas conocidos y planificados.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

- **[devlitus](https://github.com/devlitus)** - Desarrollador Principal

## 🙏 Agradecimientos

- [Supabase](https://supabase.com/) por el backend
- [Tailwind CSS](https://tailwindcss.com/) por el sistema de diseño
- [Vite](https://vitejs.dev/) por la excelente experiencia de desarrollo

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!

📧 ¿Preguntas? Abre un [Issue](https://github.com/devlitus/lesson-inglesh/issues) o contacta al equipo.
