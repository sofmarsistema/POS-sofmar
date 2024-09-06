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
  const [isMobile]= useMediaQuery('(max-width: 48em)')
  const [recomendaciones, setRecomendaciones] = useState<typeof articulos>([])

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
    const busqueda = e.target.value
    setArticuloBusqueda(e.target.value)

    if (busqueda.length>0){
      const filteredRecomendaciones = articulos.filter((articulo)=> articulo.nombre.toLowerCase().includes(busqueda.toLowerCase())).slice(0, 3)
      setRecomendaciones(filteredRecomendaciones)
    }else{
      setRecomendaciones([])
    }
  }

  useEffect(()=> {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.recomendaciones-menu')){
        setRecomendaciones([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return ()=> {
      document.removeEventListener('mousedown', handleClickOutside)
    }

}, [])

  // const filteredArticulos = articulos.filter((articulo) =>
  //   articulo.nombre.toLowerCase().includes(articuloBusqueda.toLowerCase())
  // )

  return (
    <Box maxW="5xl" mx="auto" p={isMobile? 2: 6} bg="white" shadow="xl" rounded="lg">
      <Flex bgGradient="linear(to-r, blue.500, blue.600)" color="white" p={isMobile? 4:6} alignItems="center" rounded="lg">
        <ShoppingCart size={24} className="mr-2" />
        <Heading size={isMobile? 'md': 'lg'}>Punto de Venta</Heading>
      </Flex>
      <Box p={isMobile? 2:6}>
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
        <Flex gap={4} mb={6} flexDirection={isMobile? 'column': 'row'}>
          <Box position="relative" flexGrow={1}>
            <Input 
              placeholder="Buscar artículo" 
              value={articuloBusqueda} 
              onChange={handleBusqueda}
            />
            {recomendaciones.length>0&&(
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
                  {recomendaciones.map((articulo)=>(
                      <Box
                        key={articulo.id}
                        p={2}
                        _hover={{bg: 'gray.100'}}
                        onClick={()=> {
                          setArticuloBusqueda(articulo.nombre)
                          agregarItem(articulo)
                          setRecomendaciones([])
                        }}
                      >
                        {articulo.nombre}
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
            width="80px"
            min={1}
          />
          <Button colorScheme="green" onClick={() => agregarItem(recomendaciones[0])} flexShrink={0}>
            <Search size={20} className="mr-2" /> Agregar
          </Button>
        </Flex>
        <Box
          overflowX={'auto'}
          >
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
      </Box>
      <Flex justify="space-between" p={isMobile? 2:6} bg="gray.50" rounded="lg" flexDirection={isMobile? 'column': 'row'} gap={isMobile? 4:0}>
        <Flex
          flexDirection={isMobile? 'column': 'row'}
          gap={4}
          >
          <Box>
            <Text fontWeight={'bold'} mb={2}>Condición de Venta</Text>
            <Flex
              flexDir={isMobile? 'column': 'row'}
              gap={2}
              >
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
                >
                  Crédito
                </Button>
            </Flex>
          </Box>
          <Box>
      <Text fontWeight="bold" mb={2}>
        Nota Fiscal
      </Text>
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
        <Box textAlign="right">
          <Text fontSize="lg" fontWeight="bold">Total: {calcularTotal().toFixed(2)} {moneda}</Text>
          <Button colorScheme="blue" mt={4}>Finalizar Venta</Button>
        </Box>
      </Flex>
    </Box>
  )
}
