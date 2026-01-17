import { Outlet, Link } from "react-router-dom";

export function DashboardLayout() {
  return (
    <div className="grid gap-6 md:grid-cols-[240px_1fr]">
      <aside className="rounded-2xl border p-4">
        <div className="font-semibold">My Stuff</div>
        <nav className="mt-3 flex flex-col gap-2 text-sm">
          <Link className="hover:underline" to="/dashboard">Dashboard</Link>
          <Link className="hover:underline" to="/me/reviews">My Reviews</Link>
        </nav>
      </aside>
      <section className="rounded-2xl border p-4">
        <Outlet />
      </section>
    </div>
  );
}
