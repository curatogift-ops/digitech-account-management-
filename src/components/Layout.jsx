import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

export default function Layout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <div className="app-shell">
      <Sidebar open={open} onNavigate={() => setOpen(false)} />
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <div className="main-col">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
