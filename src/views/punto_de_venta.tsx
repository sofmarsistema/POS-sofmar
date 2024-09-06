import React, { useEffect, useState } from 'react'
import { Search, ShoppingCart } from 'lucide-react'
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
  useMediaQuery
} from '@chakra-ui/react'

const sucursales = ['Central', 'Norte', 'Sur']
const depositos = ['Principal', 'Secundario', 'Auxiliar']
const vendedores = [
  { id: 1, nombre: 'Juan Pérez', codigo:'001' },
  { id: 2, nombre: 'María González', codigo:'002' },
  { id: 3, nombre: 'Carlos Rodríguez', codigo:'003' },
  { id: 4, nombre: 'Ana Martínez', codigo:'004' },
  { id: 5, nombre: 'Pedro Gómez', codigo:'005' },
  { id: 6, nombre: 'Laura Benítez', codigo:'006' },
]

const clientes = [
  { id: 1, nombre: 'Juan Pérez', ruc: '5566958-1', lineaCredito: 1000 },
  { id: 2, nombre: 'María González', ruc: '5566958-2', lineaCredito: 2000 },
  { id: 3, nombre: 'Carlos Rodríguez', ruc: '5566958-3', lineaCredito: 0 },
  { id: 4, nombre: 'Ana Martínez', ruc: '5566958-4', lineaCredito: 500 },
  { id: 5, nombre: 'Pedro Gómez', ruc: '5566958-5', lineaCredito: 1500 },
  { id: 6, nombre: 'Laura Benítez', ruc: '5566958-6', lineaCredito: 0 },
  { id: 7, nombre: 'José López', ruc: '5566958-7', lineaCredito: 3000 },
  { id: 8, nombre: 'Sofía Pérez', ruc: '5566958-8', lineaCredito: 2500 },
  { id: 9, nombre: 'Diego González', ruc: '5566958-9', lineaCredito: 1000 },
  { id: 10, nombre: 'Gabriela Rodríguez', ruc: '5566958-10', lineaCredito: 0 },
  { id: 11, nombre: 'Jorge Martínez', ruc: '5566958-11', lineaCredito: 500 },
  { id: 12, nombre: 'Marcela Gómez', ruc: '5566958-12', lineaCredito: 1000 },
  { id: 13, nombre: 'Miguel Benítez', ruc: '5566958-13', lineaCredito: 2000 },
  { id: 14, nombre: 'Carmen López', ruc: '5566958-14', lineaCredito: 1500 },
]

const articulos = [
  { id: 1, nombre: 'Laptop HP', precio: 899.99, codigo: 'HP-001' },
  { id: 2, nombre: 'Monitor Dell 27"', precio: 299.99, codigo: 'DELL-001' },
  { id: 3, nombre: 'Teclado Mecánico', precio: 129.99, codigo: 'RAZER-001' },
  { id: 4, nombre: 'Mouse Logitech', precio: 49.99,  codigo: 'LOGITECH-001' },
  { id: 5, nombre: 'Impresora Epson', precio: 199.99, codigo: 'EPSON-001' },
  { id: 6, nombre: 'Silla Gamer', precio: 199.99, codigo: 'GAMER-001' },
  { id: 7, nombre: 'Escritorio', precio: 299.99, codigo: 'DESK-001' },
  { id: 8, nombre: 'Silla de Oficina', precio: 99.99, codigo: 'OFFICE-001' },
  { id: 9, nombre: 'Lámpara de Escritorio', precio: 29.99, codigo: 'LAMP-001' },
  { id: 10, nombre: 'Estantería', precio: 79.99, codigo: 'SHELF-001' },
  { id: 11, nombre: 'Cajonera', precio: 49.99, codigo: 'DRAWER-001' },
  { id: 12, nombre: 'Mesa de Centro', precio: 99.99, codigo: 'COFFEE-001' },
  { id: 13, nombre: 'Sofá', precio: 499.99, codigo: 'SOFA-001' },
  { id: 14, nombre: 'Mesa de Comedor', precio: 199.99, codigo: 'DINING-001' },
  { id: 15, nombre: 'Silla de Comedor', precio: 49.99, codigo: 'DINING-CHAIR-001' },
  { id: 16, nombre: 'Cama', precio: 299.99, codigo: 'BED-001' },
  { id: 17, nombre: 'Colchón', precio: 199.99, codigo: 'MATTRESS-001' },
  { id: 18, nombre: 'Mesa de Noche', precio: 49.99, codigo: 'NIGHTSTAND-001' },
  { id: 19, nombre: 'Armario', precio: 199.99, codigo: 'WARDROBE-001' },
  { id: 20, nombre: 'Espejo', precio: 29.99, codigo: 'MIRROR-001' },
  { id: 21, nombre: 'Cómoda', precio: 99.99, codigo: 'DRESSER-001' },
  { id: 22, nombre: 'Mesa de TV', precio: 79.99, codigo: 'TV-STAND-001' },
  { id: 23, nombre: 'Silla de Oficina', precio: 99.99, codigo: 'OFFICE-CHAIR-001' },
  { id: 24, nombre: 'Lámpara de Pie', precio: 49.99, codigo: 'FLOOR-LAMP-001' },
  { id: 25, nombre: 'Sofá Cama', precio: 399.99, codigo: 'SOFA-BED-001' },
  { id: 26, nombre: 'Mesa de Centro Elevable', precio: 149.99, codigo: 'COFFEE-TABLE-001' },
  { id: 27, nombre: 'Mesa de Comedor Extensible', precio: 299.99, codigo: 'EXTENDABLE-DINING-TABLE-001' },
]

const tasasDeCambio: { [key: string]: number } = {
  USD: 1,
  BRL: 5.24,
  PYG: 7300,
}

export default function PuntoDeVenta() {
  const [sucursal, setSucursal] = useState('Central')
  const [deposito, setDeposito] = useState('Principal')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [moneda, setMoneda] = useState('PYG')
  const [, setVendedor] = useState('')
  const [clienteSeleccionado, setClienteSeleccionado] = useState<typeof clientes[0] | null>(null)
  const [articuloBusqueda, setArticuloBusqueda] = useState('')
  const [clienteBusqueda, setClienteBusqueda] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [items, setItems] = useState<{ id: number, nombre: string, precio: number, cantidad: number, subtotal: number }[]>([])
  const [selectedItem, setSelectedItem] = useState<typeof articulos[0] | null>(null)
  const [condicionVenta, setCondicionVenta] = useState('Contado')
  const [notaFiscal, setNotaFiscal] = useState('Factura')
  const [isMobile] = useMediaQuery('(max-width: 48em)')
  const [recomendaciones, setRecomendaciones] = useState<typeof articulos>([])
  const [recomendacionesClientes, setRecomendacionesClientes] = useState<typeof clientes>([])
  const [descuentoTipo, setDescuentoTipo] = useState<'porcentaje' | 'valor'>('porcentaje')
  const [descuentoValor, setDescuentoValor] = useState(0)
  const [buscarVendedor, setBuscarVendedor] = useState('')
  const [recomedacionesVendedores, setRecomendacionesVendedores] = useState<typeof vendedores>([])

  const toast = useToast()

  const agregarItem = () => {
    if (selectedItem) {
      const nuevoItem = {
        ...selectedItem,
        cantidad,
        subtotal: selectedItem.precio * cantidad * tasasDeCambio[moneda],
      }
      setItems([...items, nuevoItem])
      setArticuloBusqueda('')
      setCantidad(1)
      setSelectedItem(null)
    } else {
      toast({
        title: "Artículo no seleccionado",
        status: "error",
        duration: 1000,
        isClosable: true,
      })
    }
  }

  const calcularTotal = () => {
    const subtotal = items.reduce((acc, item)=> acc +item.precio *tasasDeCambio[moneda] *item.cantidad, 0);
    let total = subtotal;
    if(descuentoTipo === 'porcentaje'){
      total -= (subtotal * descuentoValor)/100;
    }else{
      total -= descuentoValor;
    }
    return total.toFixed(2);

  }

  const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busqueda = e.target.value
    setArticuloBusqueda(busqueda)

    if (busqueda.length > 0) {
      const filteredRecomendaciones = articulos.filter((articulo) => 
        articulo.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        articulo.codigo.toLowerCase().includes(busqueda.toLowerCase())
      ).slice(0, 5)
      setRecomendaciones(filteredRecomendaciones)
    } else {
      setRecomendaciones([])
    }
  }

  const handleBusquedaCliente = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busquedaCliente = e.target.value
    setClienteBusqueda(busquedaCliente)
    if (busquedaCliente.length > 0) {
      const filteredRecomendacionesClientes = clientes.filter((cliente) => 
        cliente.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
        cliente.ruc.includes(busquedaCliente)
      ).slice(0, 5)
      setRecomendacionesClientes(filteredRecomendacionesClientes)
    } else {
      setRecomendacionesClientes([])
    }
  }

  const handleBusquedaVendedor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busquedaVendedor = e.target.value
    setBuscarVendedor(busquedaVendedor)
    if(busquedaVendedor.length > 0){
      const filteredVendedores = vendedores.filter((vendedor) => 
        vendedor.nombre.toLowerCase().includes(busquedaVendedor.toLowerCase()) ||
        vendedor.codigo.includes(busquedaVendedor)
      ).slice(0, 5)
      setRecomendacionesVendedores(filteredVendedores)
      if (filteredVendedores.length > 0) {
        setVendedor(filteredVendedores[0].nombre)
      }
  }else{
    setRecomendacionesVendedores([])
  }
}

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.recomendaciones-menu')) {
        setRecomendaciones([])
        setRecomendacionesClientes([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <Box maxW="5xl" mx="auto" p={isMobile ? 2 : 6} bg="white" shadow="xl" rounded="lg">
      <Flex bgGradient="linear(to-r, blue.500, blue.600)" color="white" p={isMobile ? 4 : 6} alignItems="center" rounded="lg">
        <ShoppingCart size={24} className="mr-2" />
        <Heading size={isMobile ? 'md' : 'lg'}>Punto de Venta</Heading>
      </Flex>
      <Box p={isMobile ? 2 : 6}>
        <Grid templateColumns={isMobile ? "repeat(1, 1fr)" : "repeat(3, 1fr)"} gap={4} mb={6}>
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
          <Box position={'relative'}>
            <FormLabel>Vendedor</FormLabel>
            <Input
              id='vendedor-search'
              placeholder="Buscar vendedor por código"
              value={buscarVendedor}
              onChange={handleBusquedaVendedor}
              aria-autocomplete="list"
              aria-controls="vendedor-recommendations"
            />
            {recomedacionesVendedores.length>0&&(
              <Box
              id="vendedor-recommendations"
              position="absolute"
              top="100%"
              left={0}
              right={0}
              zIndex={20}
              bg="white"
              boxShadow="md"
              borderRadius="md"
              mt={1}
              className="recomendaciones-menu"
              maxH="200px"
              overflowY="auto"
              >
                {recomedacionesVendedores.map((vendedor) => (
                  <Box
                    key={vendedor.id}
                    p={2}
                    _hover={{ bg: 'gray.100' }}
                    cursor="pointer"
                    onClick={() => {
                      setBuscarVendedor(vendedor.codigo)
                      setVendedor(vendedor.nombre)
                      setRecomendacionesVendedores([])
                    }}
                  >
                    <Text fontWeight="bold">{vendedor.nombre}</Text>
                    <Text as="span" color="gray.500" fontSize="sm">Código: {vendedor.codigo}</Text>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
          <Box position="relative">
            <FormLabel htmlFor="cliente-search">Cliente</FormLabel>
            <Input 
              id="cliente-search"
              placeholder="Buscar cliente por nombre o RUC" 
              value={clienteBusqueda} 
              onChange={handleBusquedaCliente}
              aria-autocomplete="list"
              aria-controls="cliente-recommendations"
            />
            {recomendacionesClientes.length > 0 && (
              <Box
                id="cliente-recommendations"
                position="absolute"
                top="100%"
                left={0}
                right={0}
                zIndex={10}
                bg="white"
                boxShadow="md"
                borderRadius="md"
                mt={1}
                className="recomendaciones-menu"
                maxH="200px"
                overflowY="auto"
              >
                {recomendacionesClientes.map((cliente) => (
                  <Box
                    key={cliente.id}
                    p={2}
                    _hover={{ bg: 'gray.100' }}
                    cursor="pointer"
                    onClick={() => {
                      setClienteBusqueda(cliente.nombre)
                      setClienteSeleccionado(cliente)
                      setRecomendacionesClientes([])
                    }}
                  >
                    <Text fontWeight="bold">{cliente.nombre}</Text>
                    <Text as="span" color="gray.500" fontSize="sm">RUC: {cliente.ruc}</Text>
                    <Text as="span" color="green.500" fontSize="sm" ml={2}>Línea de crédito: ${cliente.lineaCredito}</Text>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Grid>
        <Flex gap={4} mb={6} flexDirection={isMobile ? 'column' : 'row'}>
          <Box position="relative" flexGrow={1}>
            <Input 
              placeholder="Buscar artículo" 
              value={articuloBusqueda} 
              onChange={handleBusqueda}
            />
            {recomendaciones.length > 0 && (
              <Box
                position={'absolute'}
                top={'100%'}
                left={0}
                zIndex={1}
                width={'100%'}
                bg={'white'}
                boxShadow={'md'}
                borderRadius={'md'}
                className="recomendaciones-menu"
              >
                {recomendaciones.map((articulo) => (
                  <Box
                    key={articulo.id}
                    p={2}
                    _hover={{bg: 'gray.100'}}
                    onClick={() => {
                      setArticuloBusqueda(articulo.nombre)
                      setSelectedItem(articulo)
                      setRecomendaciones([])
                    }}
                  >
                    {articulo.nombre} <Text as="span" color="gray.500" fontSize={'12px'}>-{articulo.codigo}</Text>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
          <Input 
            type="number" 
            placeholder="Cantidad" 
            value={cantidad} 
            onChange={(e) => setCantidad(parseInt(e.target.value))}
            width={isMobile ? "full" : "80px"}
            min={1}
          />
          <Button colorScheme="green" onClick={agregarItem} flexShrink={0}>
            <Search size={20} className="mr-2" /> Agregar
          </Button>
        </Flex>
        <Box overflowX={'auto'}>
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
                  <Td isNumeric>{(item.precio * tasasDeCambio[moneda]).toFixed(0)}</Td>
                  <Td isNumeric>{item.cantidad}</Td>
                  <Td isNumeric>{(item.precio* tasasDeCambio[moneda] * item.cantidad).toFixed(2)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>
      <Flex justify="space-between" p={isMobile ? 2 : 6} bg="gray.50" rounded="lg" flexDirection={isMobile ? 'column' : 'row'} gap={isMobile ? 4 : 0}>
        <Flex flexDirection={isMobile ? 'column' : 'row'} gap={4}>
          <Box>
            <Text fontWeight={'bold'} mb={2}>Condición de Venta</Text>
            <Flex flexDir={isMobile ? 'column' : 'row'} gap={2}>
              <Button 
                variant={condicionVenta === 'Contado' ? 'solid' : 'outline'}
                bg={condicionVenta === 'Contado' ? 'blue.500' : 'transparent'}
                color={condicionVenta === 'Contado' ? 'white' : 'blue.500'}
                borderColor="blue.500"
                _hover={{
                  bg: condicionVenta === 'Contado' ? 'blue.600' : 'blue.50',
                }}
                onClick={() => setCondicionVenta('Contado')}
                width={isMobile ? "full" : "auto"}
              >
                Contado
              </Button>
              <Button 
                variant={condicionVenta === 'Crédito' ? 'solid' : 'outline'}
                bg={condicionVenta === 'Crédito' ? 'blue.500' : 'transparent'}
                color={condicionVenta === 'Crédito' ? 'white' : 'blue.500'}
                borderColor="blue.500"
                _hover={{
                  bg: condicionVenta === 'Crédito' ? 'blue.600' : 'blue.50',
                }}
                onClick={() => setCondicionVenta('Crédito')}
                width={isMobile ? "full" : "auto"}
                isDisabled={!clienteSeleccionado || clienteSeleccionado.lineaCredito === 0}
              >
                Crédito
              </Button>
            </Flex>
          </Box>
          <Box>
            <Text fontWeight="bold" mb={2}>Nota Fiscal</Text>
            <Flex flexDirection={isMobile ? 'column' : 'row'} gap={2}>
              <Button 
                variant={notaFiscal === 'Factura' ? 'solid' : 'outline'}
                bg={notaFiscal === 'Factura' ? 'blue.500' : 'transparent'}
                color={notaFiscal === 'Factura' ? 'white' : 'blue.500'}
                borderColor="blue.500"
                _hover={{
                  bg: notaFiscal === 'Factura' ? 'blue.600' : 'blue.50',
                }}
                onClick={() => setNotaFiscal('Factura')}
                width={isMobile ? "full" : "auto"}
              >
                Factura
              </Button>
              <Button 
                variant={notaFiscal === 'Boleta' ? 'solid' : 'outline'}
                bg={notaFiscal === 'Boleta' ? 'blue.500' : 'transparent'}
                color={notaFiscal === 'Boleta' ? 'white' : 'blue.500'}
                borderColor="blue.500"
                _hover={{
                  bg: notaFiscal === 'Boleta' ? 'blue.600' : 'blue.50',
                }}
                onClick={() => setNotaFiscal('Boleta')}
                width={isMobile ? "full" : "auto"}
              >
                Boleta
              </Button>
            </Flex>
          </Box>
        </Flex>
        <Flex mt={isMobile ? 4 : 0} gap={4} flexDirection={isMobile? 'row': 'column'} alignItems={'center'}>
        <Text fontSize="lg" fontWeight={'bold'}>Descuento</Text>
          <Select value={descuentoTipo}
                  onChange={(e)=> {
                    setDescuentoTipo(e.target.value as 'porcentaje' | 'valor')
                    setDescuentoValor(0)
                  }} width={'150px'}>
                    <option value="porcentaje">Porcentaje</option>
                    <option value="monto">Monto</option>
                  </Select>
                  <Input
                    type='number'
                    placeholder='Descuento'
                    value={descuentoValor}
                    onChange={(e)=> setDescuentoValor(parseInt(e.target.value))}
                    width={'150px'}
                    ml={2}
                  />
        </Flex>
        <Box textAlign={isMobile ? "left" : "right"}>
          <Text fontSize="lg" fontWeight="bold">Subtotal: ${items.reduce((acc, item) => acc + item.precio * item.cantidad * tasasDeCambio[moneda], 0).toFixed(0)}</Text>
          <Text fontSize="lg" fontWeight="bold">Descuento: {descuentoTipo === 'porcentaje' ? `${descuentoValor}%` : `$${descuentoValor}`}</Text>
          <Text fontSize="lg" fontWeight="bold">Total: ${Number(calcularTotal()).toFixed(0)}</Text>
          <Button colorScheme="blue" mt={4} width={isMobile ? "full" : "auto"}>Finalizar Venta</Button>
        </Box>
      </Flex>
    </Box>
  )
}