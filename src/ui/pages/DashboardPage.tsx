import { Header } from "../../design-system";
import { useUserStore } from "../../infrastructure/store/userStore";
import { LevelsList } from "../components/LevelsList";
import type { HeaderUser } from "../../design-system/components/organisms/Header/Header";

export function DashboardPage() {
  const {user: currentUser, logout} = useUserStore();
  const handleLogaout = () => {
    logout();
  }
  
  // Convertir User | null a HeaderUser | undefined
  const headerUser: HeaderUser | undefined = currentUser ? {
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email
  } : undefined;
  
  return (
    <div className="dashboard">
      <Header 
        logo={<h1>Learning English</h1>}
        onLogout={handleLogaout}
        user={headerUser}
      />
      <p>Contenido del dashboard</p>
      <LevelsList />
    </div>
  );
}