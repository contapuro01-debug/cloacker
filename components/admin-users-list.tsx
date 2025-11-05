"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, Trash2 } from "lucide-react"

interface User {
  id: string
  email: string
  plan_type: string
  plan_expires_at: string | null
  is_admin: boolean
  created_at: string
}

export function AdminUsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    planType: "mensal",
    durationDays: 30,
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error("[v0] Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })

      if (!response.ok) throw new Error("Falha ao criar usuário")

      setMessage({ type: "success", text: "Usuário criado com sucesso!" })
      setNewUser({ email: "", password: "", planType: "mensal", durationDays: 30 })
      fetchUsers()
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao criar usuário" })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja deletar este usuário?")) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Falha ao deletar usuário")

      setMessage({ type: "success", text: "Usuário deletado com sucesso!" })
      fetchUsers()
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao deletar usuário" })
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("pt-BR")
  }

  const isExpired = (date: string | null) => {
    if (!date) return true
    return new Date(date) < new Date()
  }

  if (isLoading) {
    return <div className="text-white">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert
          className={message.type === "success" ? "border-green-700 bg-green-900/20" : "border-red-700 bg-red-900/20"}
        >
          <AlertDescription className={message.type === "success" ? "text-green-400" : "text-red-400"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Usuários do Sistema</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#00ff9d] text-slate-900 hover:bg-[#00ff9d]/90">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Criar Usuário
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Criar Novo Usuário</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Preencha os dados abaixo para criar um novo usuário no sistema.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-slate-200">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="bg-slate-900/50 border-slate-600 text-white"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-slate-200">
                      Senha
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="bg-slate-900/50 border-slate-600 text-white"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="planType" className="text-slate-200">
                      Tipo de Plano
                    </Label>
                    <Select
                      value={newUser.planType}
                      onValueChange={(value) => setNewUser({ ...newUser, planType: value })}
                    >
                      <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="trimestral">Trimestral</SelectItem>
                        <SelectItem value="semestral">Semestral</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="durationDays" className="text-slate-200">
                      Duração (dias)
                    </Label>
                    <Input
                      id="durationDays"
                      type="number"
                      value={newUser.durationDays}
                      onChange={(e) => setNewUser({ ...newUser, durationDays: Number.parseInt(e.target.value) })}
                      className="bg-slate-900/50 border-slate-600 text-white"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="w-full bg-[#00ff9d] text-slate-900 hover:bg-[#00ff9d]/90"
                  >
                    {isCreating ? "Criando..." : "Criar Usuário"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Email</TableHead>
                <TableHead className="text-slate-300">Plano</TableHead>
                <TableHead className="text-slate-300">Expira em</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Criado em</TableHead>
                <TableHead className="text-slate-300">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-slate-700">
                  <TableCell className="text-white">{user.email}</TableCell>
                  <TableCell className="text-slate-300">{user.plan_type}</TableCell>
                  <TableCell className="text-slate-300">{formatDate(user.plan_expires_at)}</TableCell>
                  <TableCell>
                    {user.is_admin ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-purple-900/30 text-purple-400 border border-purple-700">
                        Admin
                      </span>
                    ) : isExpired(user.plan_expires_at) ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-red-900/30 text-red-400 border border-red-700">
                        Expirado
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-900/30 text-green-400 border border-green-700">
                        Ativo
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-300">{formatDate(user.created_at)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
