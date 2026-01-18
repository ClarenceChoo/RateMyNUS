import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="shrink-0 font-bold tracking-tight">
          RateMyNUS
        </Link>

        <nav className="flex shrink-0 items-center gap-3 text-sm">
          <Link to="/explore" className="hover:underline">Explore</Link>
          <Link 
            to="/create" 
            className="rounded-xl bg-zinc-900 px-3 py-1.5 text-white hover:bg-zinc-800 transition"
          >
            + Add New
          </Link>
        </nav>
      </div>
    </header>
  );
}
