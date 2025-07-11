import { Header, Card, } from "../../design-system";
import { CardHeader, CardTitle, CardDescription, CardBody } from "../../design-system/components/molecules";
import { useUserStore } from "../../infrastructure/store/userStore";
import { LevelsList } from "../components/LevelsList";
import type { HeaderUser } from "../../design-system/components/organisms/Header/Header";
import { TopicList } from "../components";
import { SelectionSaver } from "../components";

export function DashboardPage() {
  const {user: currentUser, logout} = useUserStore();
  const handleLogout = () => {
    logout();
  }
  
  // Convertir User | null a HeaderUser | undefined
  const headerUser: HeaderUser | undefined = currentUser ? {
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email
  } : undefined;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <section className="mb-12">
          <Card variant="elevated" size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
            <CardHeader className="text-center">
              <div className="text-4xl mb-4">🌟</div>
              <CardTitle level={1} className="text-white text-3xl md:text-4xl font-bold mb-2">
                ¡Bienvenido{currentUser ? `, ${currentUser.name}` : ''}!
              </CardTitle>
              <CardDescription className="text-black text-lg">
                Comienza tu viaje de aprendizaje del inglés. Selecciona tu nivel y explora los topics disponibles.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        {/* Learning Content */}
        <div className="space-y-7">
          {/* Levels Section */}
          <section>
            <Card variant="outlined" size="lg" className="h-fit">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">📊</div>
                  <div>
                    <CardTitle level={2} className="text-gray-900">Niveles de Aprendizaje</CardTitle>
                    <CardDescription>
                      Selecciona el nivel que mejor se adapte a tu conocimiento actual
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <LevelsList />
              </CardBody>
            </Card>
          </section>

          {/* Topics Section */}
          <section className="gap-6">
            <Card variant="outlined" size="lg" className="h-fit">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🎨</div>
                  <div>
                    <CardTitle level={2} className="text-gray-900">Topics Disponibles</CardTitle>
                    <CardDescription>
                      Explora diferentes temas para practicar tu inglés
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <TopicList />
              </CardBody>
            </Card>
          </section>
          <SelectionSaver />
        </div>

        {/* Call to Action */}
        <section className="mt-12">
          <Card variant="filled" size="lg" className="text-center bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardBody>
              <div className="text-4xl mb-4">🚀</div>
              <CardTitle level={2} className="text-gray-900 mb-2">
                ¿Listo para comenzar?
              </CardTitle>
              <CardDescription className="text-gray-600 mb-4">
                Selecciona un nivel y un topic para empezar tu experiencia de aprendizaje personalizada.
              </CardDescription>
              <div className="text-sm text-gray-500">
                💡 Tip: Puedes cambiar de nivel y topic en cualquier momento
              </div>
            </CardBody>
          </Card>
        </section>
      </main>
    </div>
  );
}