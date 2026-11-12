import { NavLink } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  CalendarClock,
  CheckSquare,
  ClipboardList,
  Download,
  FileText,
  FolderKanban,
  FolderOpen,
  IndianRupee,
  Landmark,
  LayoutDashboard,
  Receipt,
  Settings,
  ShieldCheck,
  Target,
  UserCog,
  Users,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const OWNER_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/leads', label: 'Leads', icon: Target },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/requirements', label: 'Requirements', icon: ClipboardList },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/followups', label: 'Follow-ups', icon: CalendarClock },
  { to: '/accounts', label: 'Accounts', icon: Landmark },
  { to: '/payments', label: 'Payments', icon: IndianRupee },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/documents', label: 'Documents', icon: FolderOpen },
  { to: '/employees', label: 'Employees', icon: UserCog },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/activity-logs', label: 'Activity Logs', icon: Activity },
  { to: '/exports', label: 'Export Requests', icon: Download },
  { to: '/approvals', label: 'Approvals', icon: ShieldCheck },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const PM_NAV = [
  { to: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
  { to: '/leads', label: 'Leads', icon: Target },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/requirements', label: 'Requirements', icon: ClipboardList },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/tasks', label: 'Tasks & Pending', icon: CheckSquare },
  { to: '/followups', label: 'Follow-ups', icon: CalendarClock },
  { to: '/payments', label: 'Client Collections', icon: IndianRupee },
  { to: '/documents', label: 'Documents', icon: FolderOpen },
  { to: '/reports', label: 'My Reports', icon: BarChart3 },
  { to: '/activity-logs', label: 'My Activity', icon: Activity },
]

export default function Sidebar({ open, onNavigate }) {
  const { isOwner } = useAuth()
  const items = isOwner ? OWNER_NAV : PM_NAV

  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="brand">
        <span className="brand-mark">D</span>
        <div>
          <div className="brand-name">Digitech Avenue</div>
          <div className="brand-sub">{isOwner ? 'Owner Console' : 'Project Manager'}</div>
        </div>
      </div>
      <nav className="nav">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
