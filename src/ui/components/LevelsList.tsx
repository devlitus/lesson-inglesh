import { useLevelsAutoLoad } from '../../application/hooks/useLevels';
import type { Level } from '../../domain/entities/Level';
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../../design-system/components/molecules';
import { Badge } from '../../design-system/components/atoms';
import { useSelection } from '../../infrastructure/store/selectionStore';

interface LevelsListProps {
  onLevelSelect?: (level: Level) => void;
  className?: string;
}

/**
 * Componente que muestra una lista de levels disponibles
 * Utiliza el hook useLevelsAutoLoad para cargar automáticamente los datos
 */
export function LevelsList({ onLevelSelect, className = '' }: LevelsListProps) {
  const { levels, selectedLevel, isLoading, error, selectLevel } = useLevelsAutoLoad();
  const { updateLevel } = useSelection();

  const handleLevelClick = (level: Level) => {
    selectLevel(level);
    updateLevel(level.id); // Actualizar el selectionStore
    onLevelSelect?.(level);
  };

  if (isLoading) {
    return (
      <div className={`levels-list ${className}`}>
        <div className="loading-state">
          <p>Cargando niveles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`levels-list ${className}`}>
        <div className="error-state">
          <p className="error-message">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (levels.length === 0) {
    return (
      <div className={`levels-list ${className}`}>
        <div className="empty-state">
          <p>No hay niveles disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`levels-list ${className}`}>
      <h3>Niveles Disponibles</h3>
      <div className="levels-grid">
        {levels.map((level) => (
          <Card
            key={level.id}
            variant="elevated"
            size="md"
            clickable
            onClick={() => handleLevelClick(level)}
            className={`relative transition-all duration-200 ${
              selectedLevel?.id === level.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
            }`}
            style={{
              borderColor: level.color_scheme
            }}
          >
            {/* Badge de selección */}
            {selectedLevel?.id === level.id && (
              <Badge
                variant="success"
                size="md"
                shape="pill"
                leftIcon="✅"
                className="absolute top-2 left-2 z-10 shadow-lg"
              >
                SELECTED
              </Badge>
            )}
            
            <CardHeader className="text-center">
              {level.icon && (
                <div className="text-4xl mb-2">{level.icon}</div>
              )}
              <CardTitle level={4}>{level.title}</CardTitle>
              <CardDescription className="font-medium text-gray-600">
                {level.sub_title}
              </CardDescription>
            </CardHeader>
            
            <CardBody>
              <p className="text-gray-700 text-sm mb-3">{level.description}</p>
              <div className="text-xs text-gray-500 italic">
                {level.feature}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Estilos CSS básicos (se pueden mover a un archivo CSS separado)
const styles = `
.levels-list {
  padding: 1rem;
}

.levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 2rem;
}

.error-message {
  color: #e53e3e;
}

.selected-level-info {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #edf2f7;
  border-radius: 6px;
}
`;

// Inyectar estilos (en una aplicación real, esto estaría en un archivo CSS)
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}