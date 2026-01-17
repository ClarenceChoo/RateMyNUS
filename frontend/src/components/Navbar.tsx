import { Link } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import Button from "@/components/ui/Button";
import SearchBar from "@/components/SearchBar";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="shrink-0 font-bold tracking-tight">
          RateMyNUS
        </Link>

        {/* Search Bar - hidden on mobile */}
        <div className="hidden flex-1 md:block md:max-w-md">
          <SearchBar placeholder="Search..." className="w-full" />
        </div>

        <nav className="flex shrink-0 items-center gap-3 text-sm">
          <Link to="/explore" className="hover:underline">Explore</Link>
          {user ? (
            <>
              <Link to="/me" className="hover:underline">Profile</Link>
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
