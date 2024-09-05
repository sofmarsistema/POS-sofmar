import React, { useState } from 'react'
import { Search, ShoppingCart, DollarSign, Calendar, User, Package, Store, CreditCard } from 'lucide-react'
import { 
  Box, 
  Button, 
  Flex, 
  FormLabel, 
  Grid, 
  Input, 
  Select, 
  Table, 
  Tbody, 
  Td, 
  Th, 
  Thead, 
  Tr, 
  Heading, 
  useToast, 
  Text, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem 
} from '@chakra-ui/react'

const sucursales = ['Central', 'Norte', 'Sur']
const depositos = ['Principal', 'Secundario', 'Auxiliar']
const vendedores = ['Juan Pérez', 'María González', 'Carlos Rodríguez']
const clientes = ['Cliente 1', 'Cliente 2', 'Cliente 3']
const articulos = [
  { id: 1, nombre: 'Laptop HP', precio: 899.99 },
  { id: 2, nombre: 'Monitor Dell 27"', precio: 299.99 },
  { id: 3, nombre: 'Teclado Mecánico', precio: 129.99 },
  { id: 4, nombre: 'Mouse Logitech', precio: 49.99 },
  { id: 5, nombre: 'Impresora Epson', precio: 199.99 },
]

const tasasDeCambio: { [key: string]: number } = {
  USD: 1,
  BRL: 5.24,
  PYG: 7300,
}

export default function PuntoDeVenta() {
  const [sucursal, setSucursal] = useState('')
  const [deposito, setDeposito] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [moneda, setMoneda] = useState('USD')
  const [vendedor, setVendedor] = useState('')
  const [cliente, setCliente] = useState('')
  const [articuloBusqueda, setArticuloBusqueda] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [items, setItems] = useState<{ id: number, nombre: string, precio: number, cantidad: number, subtotal: number }[]>([])
  const [condicionVenta, setCondicionVenta] = useState('Contado')
  const [notaFiscal, setNotaFiscal] = useState('Factura')

  const toast = useToast()

  const agregarItem = (articuloSeleccionado: { id: number, nombre: string, precio: number }) => {
    if (articuloSeleccionado) {
      const nuevoItem = {
        ...articuloSeleccionado,
        cantidad,
        subtotal: articuloSeleccionado.precio * cantidad * tasasDeCambio[moneda],
      }
      setItems([...items, nuevoItem])
      setArticuloBusqueda('')
      setCantidad(1)
    } else {
      toast({
        title: "Artículo no encontrado",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const calcularTotal = () => {
    return items.reduce((total, item) => total + item.subtotal, 0)
  }

  const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    setArticuloBusqueda(e.target.value)
  }

  const filteredArticulos = articulos.filter((articulo) =>
    articulo.nombre.toLowerCase().includes(articuloBusqueda.toLowerCase())
  )

  return (
    <Box maxW="5xl" mx="auto" p={6} bg="white" shadow="xl" rounded="lg">
      <Flex bgGradient="linear(to-r, blue.500, blue.600)" color="white" p={6} alignItems="center" rounded="lg">
        <ShoppingCart size={24} className="mr-2" />
        <Heading size="lg">Punto de Venta</Heading>
      </Flex>
      <Box p={6}>
        <Grid templateColumns="repeat(3, 1fr)" gap={4} mb={6}>
          <Box>
            <FormLabel>Sucursal</FormLabel>
            <Select placeholder="Seleccionar sucursal" value={sucursal} onChange={(e) => setSucursal(e.target.value)}>
              {sucursales.map((sucursal) => (
                <option key={sucursal} value={sucursal}>{sucursal}</option>
              ))}
            </Select>
          </Box>
          <Box>
            <FormLabel>Depósito</FormLabel>
            <Select placeholder="Seleccionar depósito" value={deposito} onChange={(e) => setDeposito(e.target.value)}>
              {depositos.map((deposito) => (
                <option key={deposito} value={deposito}>{deposito}</option>
              ))}
            </Select>
          </Box>
          <Box>
            <FormLabel>Fecha</FormLabel>
            <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </Box>
          <Box>
            <FormLabel>Moneda</FormLabel>
            <Select placeholder="Seleccionar moneda" value={moneda} onChange={(e) => setMoneda(e.target.value)}>
              <option value="USD">USD</option>
              <option value="BRL">BRL</option>
              <option value="PYG">PYG</option>
            </Select>
          </Box>
          <Box>
            <FormLabel>Vendedor</FormLabel>
            <Select placeholder="Seleccionar vendedor" value={vendedor} onChange={(e) => setVendedor(e.target.value)}>
              {vendedores.map((vendedor) => (
                <option key={vendedor} value={vendedor}>{vendedor}</option>
              ))}
            </Select>
          </Box>
          <Box>
            <FormLabel>Cliente</FormLabel>
            <Select placeholder="Seleccionar cliente" value={cliente} onChange={(e) => setCliente(e.target.value)}>
              {clientes.map((cliente) => (
                <option key={cliente} value={cliente}>{cliente}</option>
              ))}
            </Select>
          </Box>
        </Grid>
        <Flex gap={4} mb={6}>
          <Box position="relative" flexGrow={1}>
            <Input 
              placeholder="Buscar artículo" 
              value={articuloBusqueda} 
              onChange={handleBusqueda}
            />
            {articuloBusqueda && filteredArticulos.length > 0 && (
              <Menu>
                <MenuButton as={Box} position="absolute" top="100%" left={0} zIndex={1} width="100%">
                  <MenuList>
                    {filteredArticulos.map((articulo) => (
                      <MenuItem
                        key={articulo.id}
                        onClick={() => {
                          setArticuloBusqueda(articulo.nombre)
                          agregarItem(articulo)
                        }}
                      >
                        {articulo.nombre}
                      </MenuItem>
                    ))}
                  </MenuList>
                </MenuButton>
              </Menu>
            )}
          </Box>
          <Input 
            type="number" 
            placeholder="Cantidad" 
            value={cantidad} 
            onChange={(e) => setCantidad(parseInt(e.target.value))}
            width="80px"
            min={1}
          />
          <Button colorScheme="green" onClick={() => agregarItem(filteredArticulos[0])}>
            <Search size={20} className="mr-2" /> Agregar
          </Button>
        </Flex>
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>Código</Th>
              <Th>Descripción</Th>
              <Th isNumeric>Precio</Th>
              <Th isNumeric>Cantidad</Th>
              <Th isNumeric>Subtotal</Th>
            </Tr>
          </Thead>
          <Tbody>
            {items.map((item, index) => (
              <Tr key={index}>
                <Td>{item.id}</Td>
                <Td>{item.nombre}</Td>
                <Td isNumeric>{(item.precio * tasasDeCambio[moneda]).toFixed(2)}</Td>
                <Td isNumeric>{item.cantidad}</Td>
                <Td isNumeric>{item.subtotal.toFixed(2)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      <Flex justify="space-between" p={6} bg="gray.50" rounded="lg">
        <Box>
          <Button variant={condicionVenta === 'Contado' ? 'solid' : 'outline'} onClick={() => setCondicionVenta('Contado')}>
            Contado
          </Button>
          <Button ml={2} variant={condicionVenta === 'Crédito' ? 'solid' : 'outline'} onClick={() => setCondicionVenta('Crédito')}>
            Crédito
          </Button>
          <Button ml={4} variant={notaFiscal === 'Factura' ? 'solid' : 'outline'} onClick={() => setNotaFiscal('Factura')}>
            Factura
          </Button>
          <Button ml={2} variant={notaFiscal === 'Boleta' ? 'solid' : 'outline'} onClick={() => setNotaFiscal('Boleta')}>
            Boleta
          </Button>
        </Box>
        <Box textAlign="right">
          <Text fontSize="lg" fontWeight="bold">Total: {calcularTotal().toFixed(2)} {moneda}</Text>
          <Button colorScheme="blue" mt={4}>Finalizar Venta</Button>
        </Box>
      </Flex>
    </Box>
  )
}
