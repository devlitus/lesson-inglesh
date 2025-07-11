import { Header, Card, Button } from "../../design-system";
import { CardHeader, CardTitle, CardDescription } from "../../design-system/components/molecules";
import { useUserStore } from "../../infrastructure/store/userStore";
import { useNavigation } from "../../application/hooks";
import { LessonViewer } from "../components/LessonViewer";
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

        {/* Lesson Content - Powered by Gemini AI */}
        <LessonViewer />
      </main>
    </div>
  );
}