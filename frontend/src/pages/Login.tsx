import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAuth } from "@/providers/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { loginAnon, loginGoogle } = useAuth();
  const nav = useNavigate();

  return (
    <Card className="mx-auto max-w-md space-y-4">
      <div>
        <div className="text-xl font-bold">Login</div>
        <div className="text-sm text-zinc-600">
          Anonymous is fastest. Google lets you keep your reviews across devices.
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          onClick={async () => {
            await loginAnon();
            nav("/dashboard");
          }}
        >
          Continue anonymously
        </Button>

        <Button
          variant="ghost"
          onClick={async () => {
            await loginGoogle();
            nav("/dashboard");
          }}
        >
          Continue with Google
        </Button>
      </div>
    </Card>
  );
}
