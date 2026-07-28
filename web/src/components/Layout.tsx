import { Link, Outlet } from 'react-router-dom'
import '../App.css'

export function Layout() {
  return (
    <main className="min-h-screen bg-muted/30">
      <div className="container mx-auto max-w-6xl p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Mini Marketplace</h1>
          <nav className="mt-3 flex gap-4 text-sm font-medium">
            <Link to="/">Home</Link>
            <Link to="/admin">Admin</Link>
          </nav>
        </header>
        <Outlet />
      </div>
    </main>
  )
}
