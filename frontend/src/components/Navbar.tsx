import { Link } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import Button from "@/components/ui/Button";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-bold tracking-tight">
          RateMyNUS
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link to="/explore" className="hover:underline">Explore</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="hover:underline">Dashboard</Link>
              <Button variant="ghost" onClick={logout}>Logout</Button>
            </>
          ) : (
            <Link to="/login">
              <Button>Login</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
