import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { ToastProvider } from './components/Toast.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

import Login from './pages/Login.jsx'
import OwnerDashboard from './pages/OwnerDashboard.jsx'
import PMDashboard from './pages/PMDashboard.jsx'
import Leads from './pages/Leads.jsx'
import Clients from './pages/Clients.jsx'
import ClientDetail from './pages/ClientDetail.jsx'
import Requirements from './pages/Requirements.jsx'
import RequirementDetail from './pages/RequirementDetail.jsx'
import Projects from './pages/Projects.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import Tasks from './pages/Tasks.jsx'
import FollowUps from './pages/FollowUps.jsx'
import Payments from './pages/Payments.jsx'
import Accounts from './pages/Accounts.jsx'
import Expenses from './pages/Expenses.jsx'
import Invoices from './pages/Invoices.jsx'
import Documents from './pages/Documents.jsx'
import Employees from './pages/Employees.jsx'
import Reports from './pages/Reports.jsx'
import ActivityLogs from './pages/ActivityLogs.jsx'
import Approvals from './pages/Approvals.jsx'
import Exports from './pages/Exports.jsx'
import Settings from './pages/Settings.jsx'
import Search from './pages/Search.jsx'

function Dashboard() {
  const { isOwner } = useAuth()
  return isOwner ? <OwnerDashboard /> : <PMDashboard />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="clients" element={<Clients />} />
        <Route path="clients/:id" element={<ClientDetail />} />
        <Route path="requirements" element={<Requirements />} />
        <Route path="requirements/:id" element={<RequirementDetail />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="followups" element={<FollowUps />} />
        <Route path="payments" element={<Payments />} />
        <Route path="documents" element={<Documents />} />
        <Route path="reports" element={<Reports />} />
        <Route path="activity-logs" element={<ActivityLogs />} />
        <Route path="activity" element={<ActivityLogs />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="exports" element={<Exports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="search" element={<Search />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="invoices" element={<Invoices />} />

        <Route
          path="accounts"
          element={
            <ProtectedRoute ownerOnly>
              <Accounts />
            </ProtectedRoute>
          }
        />
        <Route
          path="employees"
          element={
            <ProtectedRoute ownerOnly>
              <Employees />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
