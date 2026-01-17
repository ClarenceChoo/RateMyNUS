import { Link } from "react-router-dom";
import Card from "@/components/ui/Card";
import { categories } from "@/data/seedCategories";

export default function CategoryGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {categories.map((cat) => (
        <Link key={cat.type} to={`/c/${cat.type.toLowerCase()}`}>
          <Card className="group flex h-full min-h-[140px] cursor-pointer flex-col transition hover:border-zinc-300 hover:shadow-sm">
            <div className="mb-2 text-3xl">{cat.icon}</div>
            <div className="font-semibold group-hover:text-zinc-700">{cat.label}</div>
            <div className="text-sm text-zinc-500">{cat.desc}</div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
