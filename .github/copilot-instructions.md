# GitHub Copilot Instructions - Lesson Inglesh

## Project Context

This project is an English learning platform with interactive lessons, quizzes, and progress tracking. The target audience is non-native English speakers looking to improve their language skills.

## Architecture & Patterns

### Project Structure

- **Hexagonal Architecture**: Clear separation between domain, application, and infrastructure
- **Domain Driven Design**: Well-defined entities and use cases
- **Design System**: Reusable component system with design tokens
- **State Management**: Zustand for global state management

### Main Technologies

- React + TypeScript
- Vite (build tool)
- Vitest (testing)
- Supabase (backend/database)
- Zustand (state management)

## Coding Guidelines

### Naming

- **Files**: PascalCase for React components (`UserLoginPage.tsx`)
- **Functions**: camelCase (`getUserById`, `checkUserSelection`)
- **Types/Interfaces**: PascalCase (`User`, `Level`, `Topic`)
- **Constants**: UPPER_SNAKE_CASE
- **Variables**: Descriptive camelCase

### File Structure

- Each module should have its own directory with `index.ts` for exports
- Tests in `__tests__/` folders within each module
- Specific READMEs for complex use cases
- Centralized mocks in `src/mocks/`

### React Components

- Use functional components with hooks
- Props typed with TypeScript
- Export components from `index.ts`
- Follow the atoms/molecules/organisms pattern from the design system

### Use Cases

- One function per file in `src/application/use-cases/`
- Descriptive names indicating the action (`saveSelectLevelTopic`)
- Clear documentation of purpose and parameters
- Consistent error handling

### Global State

- Domain-specific stores (`userStore`, `levelStore`, `topicsStore`)
- Immutable states
- Clear and descriptive actions

### Testing

- Unit tests for each use case
- Tests for components with complex behavior
- Reusable mocks for test data
- Minimum required coverage for business logic

### Error Handling

- Use the `UserError` entity for domain errors
- Validations with schemas (e.g., `UserSchema`)
- Informative error messages for the user
- Appropriate logging for debugging

### Security

- Validate all user inputs
- Use safe TypeScript types
- Sanitize data before sending to Supabase
- Implement proper authentication and authorization

## Project-Specific Patterns

### Adapters

- Implement Adapter pattern for Supabase communication
- Keep business logic independent from infrastructure
- Strong typing in adapter interfaces

### Custom Hooks

- Hooks for specific state logic (`useLevels`, `useTopics`)
- Separate presentation logic from business logic
- Reusable hooks for common functionalities

### Navigation

- Centralized router in `AppRouter.tsx`
- Typed routes and constants
- Route protection components (`ProtectedRoute`)

## UX/UI Considerations

### Internationalization

- Prepare code for multiple languages
- Externalize texts in constants
- Consider RTL for languages that require it

### Accessibility

- Use semantic HTML elements
- ARIA labels when necessary
- Keyboard navigation
- Adequate color contrast

### Performance

- Lazy loading for routes
- Memoization when appropriate
- Render optimization
- Efficient data loading

## Commit Conventions

- Use conventional commits
- Prefixes: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`
- Descriptive messages in English
- Reference issues when applicable

## Do Not

- Do not mix business logic with UI components
- Do not use `any` in TypeScript
- Do not commit without tests for new functionality
- Do not hardcode user-facing strings (use constants)
- Do not ignore TypeScript/ESLint warnings
- Do not create circular dependencies between modules

## Always Do

- Strong typing with TypeScript
- Tests for new functionality
- Documentation for complex logic
- Input data validation
- Proper handling of loading and error states
- Follow the established folder structure
