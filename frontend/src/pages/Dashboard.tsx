import { useAuth } from "@/providers/AuthProvider";

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div className="space-y-2">
      <div className="text-lg font-semibold">Dashboard</div>
      <div className="text-sm text-zinc-600">
        Signed in as: {user?.isAnonymous ? "Anonymous" : user?.email ?? "User"}
      </div>
    </div>
  );
}
