import  { useState } from 'react'
import { Box, FormLabel, Grid, Input, Select, CheckboxGroup, Checkbox, Stack } from '@chakra-ui/react'
import { Cliente, Vendedor } from '../types'

interface VentaFormProps {
  sucursales: string[]
  depositos: string[]
  vendedores: Vendedor[]
  clientes: Cliente[]
  moneda: string
  setMoneda: (moneda: string) => void
  impuestos: string[]
  setImpuestos: (impuestos: string[]) => void
  isMobile: boolean
}

export default function VentaForm({
  sucursales,
  depositos,
  vendedores,
  clientes,
  moneda,
  setMoneda,
  impuestos,
  setImpuestos,
  isMobile
}: VentaFormProps) {
  const [sucursal, setSucursal] = useState('Central')
  const [deposito, setDeposito] = useState('Principal')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [vendedor, setVendedor] = useState('')
  const [cliente, setCliente] = useState('')

  return (
    <Grid templateColumns={isMobile ? "repeat(1, 1fr)" : "repeat(3, 1fr)"} gap={4} mb={6}>
      <Box>
        <FormLabel>Sucursal</FormLabel>
        <Select value={sucursal} onChange={(e) => setSucursal(e.target.value)}>
          {sucursales.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </Box>
      <Box>
        <FormLabel>Depósito</FormLabel>
        <Select value={deposito} onChange={(e) => setDeposito(e.target.value)}>
          {depositos.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </Select>
      </Box>
      <Box>
        <FormLabel>Fecha</FormLabel>
        <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </Box>
      <Box>
        <FormLabel>Moneda</FormLabel>
        <Select value={moneda} onChange={(e) => setMoneda(e.target.value)}>
          <option value="USD">USD</option>
          <option value="BRL">BRL</option>
          <option value="PYG">PYG</option>
        </Select>
      </Box>
      <Box>
        <FormLabel>Impuestos</FormLabel>
        <CheckboxGroup colorScheme='green' value={impuestos} onChange={(values) => setImpuestos(values as string[])}>
          <Stack spacing={[1, 5]} direction={isMobile ? 'column' : 'row'}>
            <Checkbox value="5%">5%</Checkbox>
            <Checkbox value="10%">10%</Checkbox>
            <Checkbox value="exentas">Exentas</Checkbox>
          </Stack>
        </CheckboxGroup>
      </Box>
      <Box>
        <FormLabel>Vendedor</FormLabel>
        <Select value={vendedor} onChange={(e) => setVendedor(e.target.value)}>
          {vendedores.map((v) => (
            <option key={v.id} value={v.id}>{v.nombre}</option>
          ))}
        </Select>
      </Box>
      <Box>
        <FormLabel>Cliente</FormLabel>
        <Select value={cliente} onChange={(e) => setCliente(e.target.value)}>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </Select>
      </Box>
    </Grid>
  )
}