'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Key,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function ResetarSenhaPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const token = params.token as string

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const calcularForcaSenha = (senha: string): number => {
    let forca = 0
    if (senha.length >= 8) forca++
    if (/[A-Z]/.test(senha)) forca++
    if (/[a-z]/.test(senha)) forca++
    if (/[0-9]/.test(senha)) forca++
    if (/[^A-Za-z0-9]/.test(senha)) forca++
    return forca
  }

  const forcaSenha = calcularForcaSenha(password)
  const percentualForca = (forcaSenha / 5) * 100

  const getForcaTexto = () => {
    if (password.length === 0) return ''
    if (forcaSenha <= 2) return { texto: 'Fraca', cor: 'text-red-600' }
    if (forcaSenha <= 3) return { texto: 'Média', cor: 'text-yellow-600' }
    if (forcaSenha <= 4) return { texto: 'Boa', cor: 'text-blue-600' }
    return { texto: 'Forte', cor: 'text-green-600' }
  }

  const forcaTexto = getForcaTexto()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('As senhas não conferem')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres')
      setIsLoading(false)
      return
    }

    try {
      await api.post('/auth/reset-password', {
        token,
        password,
      })

      setSuccess(true)
      toast({
        title: 'Senha alterada!',
        description: 'Sua senha foi alterada com sucesso.',
      })

      setTimeout(() => {
        router.push('/login?reset=true')
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao redefinir senha')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-0 shadow-2xl bg-card/50 backdrop-blur">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Senha alterada!
            </CardTitle>
            <CardDescription className="text-center">
              Sua senha foi alterada com sucesso
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Você será redirecionado para o login em instantes...
            </p>
            <Progress value={100} className="h-1" />
          </CardContent>

          <CardFooter>
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ir para o login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-2xl bg-card/50 backdrop-blur">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <Badge variant="secondary" className="px-3 py-1">
              <Key className="h-3 w-3 mr-1" />
              Redefinir Senha
            </Badge>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Crie uma nova senha
          </CardTitle>
          <CardDescription className="text-center">
            Digite sua nova senha nos campos abaixo
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {password.length > 0 && (
                <div className="space-y-1 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Força da senha:</span>
<<<<<<< HEAD
                    <span className={cn('text-xs font-medium', forcaTexto.cor)}>
                      {forcaTexto.texto}
                    </span>
=======
                    {forcaTexto && typeof forcaTexto !== 'string' && (
                      <span className={cn('text-xs font-medium', forcaTexto.cor)}>
                        {forcaTexto.texto}
                      </span>
                    )}
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
                  </div>
                  <Progress value={percentualForca} className="h-1" />
                </div>
              )}

              <ul className="text-xs space-y-1 text-muted-foreground mt-2">
                <li className={password.length >= 6 ? 'text-green-600' : ''}>
                  • Mínimo 6 caracteres
                </li>
                <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                  • Pelo menos uma letra maiúscula
                </li>
                <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
                  • Pelo menos uma letra minúscula
                </li>
                <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                  • Pelo menos um número
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="text-xs text-destructive mt-1">
                  As senhas não conferem
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || password !== confirmPassword}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Alterando...
                </>
              ) : (
                'Alterar senha'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <Link href="/login" className="w-full">
            <Button variant="link" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}