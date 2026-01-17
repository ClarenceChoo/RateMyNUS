import { Link } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function Landing() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">RateMyNUS</h1>
        <p className="max-w-2xl text-zinc-600">
          Rate dorms, LTs, profs, food places, and yes… toilets. Anonymous by default, useful by design.
        </p>
        <div className="flex gap-3">
          <Link to="/explore"><Button>Start exploring</Button></Link>
          <Link to="/login"><Button variant="ghost">Login</Button></Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {["DORMS", "CLASSROOMS", "TOILETS"].map((t) => (
          <Card key={t}>
            <div className="font-semibold">{t}</div>
            <div className="text-sm text-zinc-600">Find the best (and worst) spots fast.</div>
          </Card>
        ))}
      </section>
    </div>
  );
}
