import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'
import { UserIcon, LockKeyhole } from 'lucide-react'
import { Button, Input } from "@chakra-ui/react"

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const inputPassRef = useRef<HTMLInputElement>(null)
  const btnIngresarRef = useRef<HTMLButtonElement>(null)

  const api = axios.create({
    baseURL: 'http://localhost:4000',
  });


  const ingresar = async () => {
    try {
      const response = await api.post('/api/usuarios/login', { user: usuario, pass: password })
      const { body } = response.data

      axios.defaults.headers.common['Authorization'] = 'Bearer ' + body.token
      localStorage.setItem('token', 'Bearer ' + body.token)
      localStorage.setItem('user_id', body.usuario[0].op_codigo)
      localStorage.setItem('user_name', body.usuario[0].op_nombre)
      localStorage.setItem('user_suc', body.usuario[0].op_sucursal)

      const rolesResponse = await api.get('/api/menu/rol?user=' + localStorage.getItem('user_id'))
      const roles = rolesResponse.data.body
      let user = localStorage.getItem('user_name')
      if (user) {
        user = user.toUpperCase().trim()
        if (user === "SOFMAR") {
          localStorage.setItem('es_admin', 'true')
        } else {
          const isAdmin = roles.some((role: { or_rol: number }) => role.or_rol === 7)
          if (isAdmin) {
            localStorage.setItem('es_admin', 'true')
          }
        }
      }

      onLoginSuccess()
      navigate('/punto-de-venta')
    } catch (error) {
      console.error(error)
      Swal.fire(
        'Credenciales Incorrectas',
        'Verifique los datos e intente nuevamente',
        'error'
      )
    }
  }

  const cancelar = () => {
    setUsuario('')
    setPassword('')
  }

  return (
    <div className="bg-sky-100 flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-2xl text-gray-600 shadow-md w-96">
        <div className="flex justify-center">
        </div>
        <h1 className="text-center text-3xl font-bold mt-4">Iniciar Sesión</h1>
        <div className="mt-6 space-y-4">
          <div className="flex">
            <div className="bg-sky-500 p-2 rounded-l-md">
              <UserIcon className="h-5 w-5 text-white" />
            </div>
            <Input
              className="flex-grow rounded-l-none"
              type="text"
              placeholder="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && inputPassRef.current?.focus()}
            />
          </div>
          <div className="flex">
            <div className="bg-sky-500 p-2 rounded-l-md">
              <LockKeyhole className="h-5 w-5 text-white" />
            </div>
            <Input
              className="flex-grow rounded-l-none"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              ref={inputPassRef}
              onKeyDown={(e) => e.key === 'Enter' && btnIngresarRef.current?.click()}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Button onClick={ingresar} ref={btnIngresarRef}>
            Ingresar
          </Button>
          <Button variant="destructive" onClick={cancelar}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}