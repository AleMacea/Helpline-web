import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

export function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [analystToken, setAnalystToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (email !== confirmEmail) {
      setError("Os e-mails não coincidem!");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem!");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres!");
      return;
    }

    if (!department) {
      setError("Selecione um departamento.");
      return;
    }

    setLoading(true);

    try {
      const role = (analystToken || "").trim().toUpperCase() === "SUPORTE4280" ? "analyst" : "user";
      const result = await register({
        name: fullName,
        email,
        password,
        department,
        role,
        origin: "web",
      });

      if (result.success) {
        navigate("/home");
      } else {
        setError(result.error || "Erro ao cadastrar usuário");
      }
    } catch (err) {
      setError("Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Cadastro</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="fullName" className="block font-medium">Nome Completo</label>
              <Input id="fullName" type="text" placeholder="Seu nome completo" value={fullName} onChange={(e) => setFullName(e.target.value)} required disabled={loading} />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block font-medium">E-mail</label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmEmail" className="block font-medium">Confirmar E-mail</label>
              <Input id="confirmEmail" type="email" placeholder="Confirme seu e-mail" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} required disabled={loading} />
            </div>

            <div className="space-y-2">
              <label htmlFor="department" className="block font-medium">Departamento</label>
              <select id="department" className="w-full p-2 border rounded" value={department} onChange={(e) => setDepartment(e.target.value)} required disabled={loading}>
                <option value="">Selecione um departamento</option>
                <option value="Recursos Humanos">Recursos Humanos</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Tecnologia">Tecnologia</option>
                <option value="Marketing">Marketing</option>
                <option value="Operações">Operações</option>
                <option value="Vendas">Vendas</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="analystToken" className="block font-medium">Token de analista (opcional)</label>
              <Input id="analystToken" type="text" placeholder="Informe somente se for analista" value={analystToken} onChange={(e) => setAnalystToken(e.target.value)} disabled={loading} />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block font-medium">Senha</label>
              <Input id="password" type="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block font-medium">Confirmar Senha</label>
              <Input id="confirmPassword" type="password" placeholder="********" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading} />
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Register;

