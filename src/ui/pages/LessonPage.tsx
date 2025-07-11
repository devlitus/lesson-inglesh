import { Header, Card, Button } from "../../design-system";
import { CardHeader, CardTitle, CardDescription, CardBody } from "../../design-system/components/molecules";
import { useUserStore } from "../../infrastructure/store/userStore";
import { useNavigation } from "../../application/hooks";
import type { HeaderUser } from "../../design-system/components/organisms/Header/Header";

export function LessonPage() {
  const { user: currentUser, logout } = useUserStore();
  const { goToDashboard } = useNavigation();
  
  const handleLogout = () => {
    logout();
  }
  
  const handleBackToDashboard = () => {
    goToDashboard();
  }
  
  // Convertir User | null a HeaderUser | undefined
  const headerUser: HeaderUser | undefined = currentUser ? {
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email
  } : undefined;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <Header 
        logo={
          <div className="flex items-center space-x-2">
            <div className="text-2xl">🎓</div>
            <h1 className="text-xl font-bold text-gray-900">Learning English</h1>
          </div>
        }
        onLogout={handleLogout}
        user={headerUser}
      />

      {/* Main Content */}
      <main className=" mx-auto px-4 py-8 max-w-6xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Button 
            onClick={handleBackToDashboard}
            variant="outline"
            size="sm"
            className="mb-4"
          >
            ← Volver al Dashboard
          </Button>
        </div>

        {/* Lesson Header */}
        <section className="mb-8">
          <Card variant="elevated" size="lg" className="bg-gradient-to-r from-purple-500 to-blue-600 text-white border-0">
            <CardHeader className="text-center">
              <div className="text-4xl mb-4">📚</div>
              <CardTitle level={1} className="text-white text-3xl md:text-4xl font-bold mb-2">
                Lección de Inglés
              </CardTitle>
              <CardDescription className="text-purple-100 text-lg">
                Practica y mejora tu inglés con ejercicios interactivos
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        {/* Lesson Content */}
        <div className="space-y-6">
          {/* Vocabulary Section */}
          <section>
            <Card variant="outlined" size="lg">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">📖</div>
                  <div>
                    <CardTitle level={2} className="text-gray-900">Vocabulario</CardTitle>
                    <CardDescription>
                      Aprende nuevas palabras y su pronunciación
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Hello</h4>
                    <p className="text-blue-700 text-sm mb-1">/həˈloʊ/</p>
                    <p className="text-gray-600">Hola - Saludo común</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Thank you</h4>
                    <p className="text-green-700 text-sm mb-1">/θæŋk juː/</p>
                    <p className="text-gray-600">Gracias - Expresión de gratitud</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </section>

          {/* Grammar Section */}
          <section>
            <Card variant="outlined" size="lg">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">📝</div>
                  <div>
                    <CardTitle level={2} className="text-gray-900">Gramática</CardTitle>
                    <CardDescription>
                      Estructura y reglas del idioma
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">Presente Simple</h4>
                  <p className="text-gray-700 mb-2">Estructura: Sujeto + Verbo + Complemento</p>
                  <div className="text-sm text-gray-600">
                    <p>Ejemplo: <span className="font-medium">I speak English</span> (Yo hablo inglés)</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </section>

          {/* Practice Section */}
          <section>
            <Card variant="filled" size="lg" className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader className="text-center">
                <div className="text-3xl mb-3">🎯</div>
                <CardTitle level={2} className="text-gray-900 mb-2">
                  ¡Practica lo aprendido!
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Completa los ejercicios para reforzar tu conocimiento
                </CardDescription>
              </CardHeader>
              <CardBody className="text-center">
                <Button 
                  variant="primary"
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  🚀 Comenzar Ejercicios
                </Button>
              </CardBody>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}