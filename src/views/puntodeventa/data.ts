import { Articulo, Cliente, Vendedor } from './types'

export const sucursales = ['Central', 'Norte', 'Sur']
export const depositos = ['Principal', 'Secundario', 'Auxiliar']

export const vendedores: Vendedor[] = [
  { id: 1, nombre: 'Juan Pérez', codigo: '001' },
  { id: 2, nombre: 'María González', codigo: '002' },
  // ... (resto de los vendedores)
]

export const clientes: Cliente[] = [
  { id: 1, nombre: 'Juan Pérez', ruc: '5566958-1', lineaCredito: 1000 },
  { id: 2, nombre: 'María González', ruc: '5566958-2', lineaCredito: 2000 },
  // ... (resto de los clientes)
]

export const articulos: Articulo[] = [
  { id: 1, nombre: 'Laptop HP', precio: 899.99, codigo: 'HP-001' },
  { id: 2, nombre: 'Monitor Dell 27"', precio: 299.99, codigo: 'DELL-001' },
  // ... (resto de los artículos)
]

export const tasasDeCambio: { [key: string]: number } = {
  USD: 1,
  BRL: 5.24,
  PYG: 7300,
}