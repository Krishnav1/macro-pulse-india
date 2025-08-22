import AdminLogin from "@/components/admin/AdminLogin";

export default function Admin() {
  const handleLogin = (password: string) => {
    // Placeholder: integrate actual auth/route logic here
    console.log("Admin login attempted", { hasPassword: Boolean(password) });
  };

  return (
    <div className="container mx-auto p-4">
      <AdminLogin onLogin={handleLogin} />
    </div>
  );
}
