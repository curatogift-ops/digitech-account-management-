import { useAuth } from '../context/AuthContext';
import OwnerDashboard from './OwnerDashboard';
import PMDashboard from './PMDashboard';

export default function Home() {
  const { isOwner } = useAuth();
  return isOwner ? <OwnerDashboard /> : <PMDashboard />;
}
