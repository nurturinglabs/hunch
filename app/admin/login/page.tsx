import LoginForm from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-serif text-3xl">Hunch admin</h1>
      <p className="mt-2 text-hunch-muted">
        Sign in with your admin email. We'll send a magic link.
      </p>
      <div className="mt-6">
        <LoginForm />
      </div>
    </main>
  );
}
