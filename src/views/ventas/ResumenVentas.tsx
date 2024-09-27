import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Box, 
  VStack, 
  Heading,  
  Input, 
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Tabs,
  TabList,
  Tab,
  HStack,
  InputGroup,
  InputLeftElement,
  Collapse,
  Button,
  Flex,
  useMediaQuery
} from '@chakra-ui/react'
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns'
import { api_url } from '@/utils'
import { SearchIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { HandCoins, Printer } from 'lucide-react'
import VentaModal from './imprimirVenta'

interface Venta {
  codigo: number
  codcliente: number
  cliente: string
  moneda: string
  fecha: string
  codsucursal: number
  sucursal: string
  vendedor: string
  operador: string
  total: number
  descuento: number
  saldo: number
  condicion: string
  vencimiento: string
  factura: string
  obs: string
  estado: number
  estado_desc: string
}

interface DetalleVenta {
  det_codigo: number
  art_codigo: number
  codbarra: string
  descripcion: string
  cantidad: number
  precio: number
  descuento: number
  exentas: number
  cinco: number
  diez: number
  lote: string
  vencimiento: string
}

const periodos = [
  { label: 'Hoy', value: 'hoy' },
  { label: 'Ayer', value: 'ayer' },
  { label: 'Últimos 3 Días', value: 'tresDias' },
  { label: 'Esta Semana', value: 'semana' },
  { label: 'Este Mes', value: 'mes' },
]

export default function ResumenVentas() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [fechaDesde, setFechaDesde] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [fechaHasta, setFechaHasta] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(0)
  const [vendedorFiltro, setVendedorFiltro] = useState('')
  const [clienteFiltro, setClienteFiltro] = useState('')
  const [facturaFiltro, setFacturaFiltro] = useState('')
  const [detalleVenta, setDetalleVenta] = useState<DetalleVenta[]>([])
  const [ventaSeleccionada, setVentaSeleccionada] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const [isMobile] = useMediaQuery('(max-width: 48em)')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saleID, setSaleID]= useState<number | null>(null)




  useEffect(() => {
    fetchVentas()
  }, [fechaDesde, fechaHasta])

  const fetchVentas = async () => {
    setIsLoading(true)
    try {
      const response = await axios.post(`${api_url}venta/consultas`, {
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        sucursal: '',
        cliente: clienteFiltro,
        vendedor: vendedorFiltro,
        articulo: '',
        moneda: '',
        factura: facturaFiltro
      })
      setVentas(response.data.body)
      
    } catch (error) {
      toast({
        title: "Error al cargar las ventas",
        description: "Por favor, intenta de nuevo más tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDetalleVenta = async (codigo: number) => {
    setIsLoading(true)
    try {
      console.log(codigo)
      const response = await axios.get(`${api_url}venta/detalles?cod=${codigo}`)
      setDetalleVenta(response.data.body)
      setSaleID(codigo)
      console.log(response.data.body)
    } catch (error) {
      toast({
        title: "Error al cargar el detalle de la venta",
        description: "Por favor, intenta de nuevo más tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePeriodoChange = (index: number) => {
    setPeriodoSeleccionado(index)
    const hoy = new Date()
    let nuevaFechaDesde = hoy

    switch (periodos[index].value) {
      case 'hoy':
        nuevaFechaDesde = hoy
        break
      case 'ayer':
        nuevaFechaDesde = subDays(hoy, 1)
        break
      case 'tresDias':
        nuevaFechaDesde = subDays(hoy, 2)
        break
      case 'semana':
        nuevaFechaDesde = startOfWeek(hoy)
        break
      case 'mes':
        nuevaFechaDesde = startOfMonth(hoy)
        break
    }

    setFechaDesde(format(nuevaFechaDesde, 'yyyy-MM-dd'))
    setFechaHasta(format(hoy, 'yyyy-MM-dd'))
  }


  const formatNumber = (value: number) => {
    const numericValue = Number(value);
    if (!isNaN(numericValue)) {
      return numericValue.toLocaleString('es-ES', { minimumFractionDigits: 0 });
    }
    return value;
  }
  

  const filteredVentas = ventas.filter(venta => 
    venta.vendedor.toLowerCase().includes(vendedorFiltro.toLowerCase()) &&
    venta.cliente.toLowerCase().includes(clienteFiltro.toLowerCase()) &&
    venta.factura.toLowerCase().includes(facturaFiltro.toLowerCase())
  )

  const handleVentaClick = (codigo: number) => {
    if (ventaSeleccionada === codigo) {
      setVentaSeleccionada(null)
      setDetalleVenta([])
      setSaleID(codigo)
    } else {
      setVentaSeleccionada(codigo)
      fetchDetalleVenta(codigo)
    }
  }

  const handleModal = () => {
    setIsModalOpen(true)
  }

  const handleCLoseModal = ()=>{
    setIsModalOpen(false)
  }

  return (
    <Box maxW="full" m={2} p={5}>
      <VStack spacing={4} align="stretch">
      <Flex bgGradient="linear(to-r, blue.500, blue.600)" color="white" p={isMobile ? 4 : 6} alignItems="center" rounded="lg">
          <HandCoins size={32} className='mr-2' />
          <Heading size={isMobile ? 'sm' : 'md'}>Resumen de Ventas</Heading>
      </Flex>
        
        <HStack spacing={4}>
          <Input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
          <Input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
        </HStack>

        <HStack spacing={4}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Filtrar por vendedor"
              value={vendedorFiltro}
              onChange={(e) => setVendedorFiltro(e.target.value)}
            />
          </InputGroup>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Filtrar por cliente"
              value={clienteFiltro}
              onChange={(e) => setClienteFiltro(e.target.value)}
            />
          </InputGroup>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Buscar por nº de factura"
              value={facturaFiltro}
              onChange={(e) => setFacturaFiltro(e.target.value)}
            />
          </InputGroup>
        </HStack>
        <Tabs index={periodoSeleccionado} onChange={handlePeriodoChange} variant={'solid-rounded'} colorScheme='green'>
          <TabList>
            {periodos.map((periodo, index) => (
              <Tab key={index}>{periodo.label}</Tab>
            ))}
          </TabList>
        </Tabs>

          <Box height={'600px'} overflowY={'auto'} width={'90vw'}  >
            <Table variant="simple">
              <Thead> 
                <Tr>
                  <Th>Codigo</Th>
                  <Th>Fecha</Th>
                  <Th>Cliente</Th>
                  <Th>Vendedor</Th>
                  <Th>Operador</Th>
                  <Th>Factura</Th>
                  <Th>Condicion</Th>
                  <Th>Moneda</Th>
                  <Th>Saldo</Th>
                  <Th>Descuento</Th>
                  <Th>Total</Th>
                  <Th>Estado</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredVentas.map((venta) => (
                  <React.Fragment key={venta.codigo}>
                    <Tr>
                      
                      <Td>{venta.codigo}</Td>
                      <Td>{format(new Date(venta.fecha.split(' : ')[0]), 'dd/MM/yyyy')}</Td>
                      <Td>{venta.cliente}</Td>
                      <Td>{venta.vendedor}</Td>
                      <Td>{venta.operador}</Td>
                      <Td>{venta.factura}</Td>
                      <Td>{venta.condicion}</Td>
                      <Td>{venta.moneda}</Td>
                      <Td>{venta.saldo}</Td>
                      <Td>{formatNumber(venta.descuento)}</Td>
                      <Td>{formatNumber(venta.total)}</Td>
                      <Td>{venta.estado_desc}</Td>
                      <Td>
                        <Button
                          size="md"
                          onClick={() => handleVentaClick(venta.codigo)}
                          rightIcon={ventaSeleccionada === venta.codigo ? <ChevronUpIcon /> : <ChevronDownIcon />}
                          colorScheme={ventaSeleccionada=== venta.codigo? 'yellow': 'green'}
                        >
                          {ventaSeleccionada === venta.codigo ? 'Ocultar' : 'Detalles'}
                        </Button>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td colSpan={12}>
                        <Collapse in={ventaSeleccionada === venta.codigo}>
                          <Box p={4} bg="gray.100" rounded="md">
                            <Heading size="sm" mb={2}>Detalle de la Venta</Heading>
                            <Table size="sm" variant="striped" py={4}>
                              <Thead bg={'blue.200'} >
                                <Tr>
                                  <Th>Código</Th>
                                  <Th>Descripción</Th>
                                  <Th>Cantidad</Th>
                                  <Th>Precio</Th>
                                  <Th>Descuento</Th>
                                  <Th>Subtotal</Th>
                                </Tr>
                              </Thead>
                              <Tbody bg={'white'}>
                                {detalleVenta.map((detalle) => (
                                  <Tr key={detalle.det_codigo}>
                                    <Td>{detalle.art_codigo}</Td>
                                    <Td>{detalle.descripcion}</Td>
                                    <Td>{detalle.cantidad}</Td>
                                    <Td>{formatNumber(detalle.precio)}</Td>
                                    <Td>{formatNumber(detalle.descuento)}</Td>
                                    <Td>{formatNumber(detalle.precio * detalle.cantidad - detalle.descuento)}</Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                            <Flex flexDirection={'row'} justify={'end'} gap={4} width={'full'} my={4}>
                              <Button colorScheme='red'>Anular</Button>
                              <Button colorScheme='blue' onClick={handleModal}><Printer/></Button>
                            </Flex>
                          </Box>
                        </Collapse>
                      </Td>
                    </Tr>
                  </React.Fragment>
                ))}
              </Tbody>
            </Table>
          </Box>
      </VStack>
      <VentaModal
              isOpen={isModalOpen}
              onClose={handleCLoseModal}
              ventaId={saleID}
            />
    </Box>
  )
}