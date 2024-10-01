import React, { useState, useEffect } from 'react'
import { 
  Flex, Box, VStack, Heading, useMediaQuery, useToast, FormLabel, 
  Select, Input, Table, Thead, Tbody, Tr, Th, Td, Radio, RadioGroup,
  Stack
} from '@chakra-ui/react'
import { Archive } from 'lucide-react'
import { useAuth } from '@/services/AuthContext' 
import { api_url } from '@/utils'
import axios from 'axios'
import { debounce } from 'lodash'

interface Articulo {
  al_codigo: number
  ar_descripcion: string
  ar_pvg: number
  ar_pvcredito: number
  ar_pvmostrador: number
  ar_codbarra: string
  ar_iva: number
  al_cantidad: number
  al_vencimiento: string
  ar_stkmin: number
  al_lote: string
  dep_descripcion: string
  pro_razon: string
  ma_descripcion: string
  ar_pcg: number
  recargo: number
  sc_descripcion: string
  fecha_ultima_cpmra: string
  um_descripcion: number
}

interface Deposito {
  dep_codigo: number
  dep_descripcion: string
}

const GestionInventario: React.FC = () => {
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [allArticulos, setAllArticulos] = useState<Articulo[]>([])
  const [depositos, setDepositos] = useState<Deposito[]>([])
  const [depositoId, setDepositoId] = useState<string>('')
  const [filtroStock, setFiltroStock] = useState('todos')  // Por defecto buscará todos los articulos
  const [articuloBusqueda, setArticuloBusqueda] = useState('')
  const [moneda, ] = useState('PYG')
  const toast = useToast()
  const { auth } = useAuth()
  const [isMobile] = useMediaQuery('(max-width: 48em)')

  useEffect(() => {
    const fetchDepositos = async () => {
      if (!auth) {
        toast({
          title: "Error de autenticación",
          description: "No estás autentificado",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
        return
      }
      try {
        const response = await axios.get(`${api_url}depositos/`)
        setDepositos(response.data.body)
        if (response.data.body.length > 0) {
          const primerDeposito = response.data.body[0]
          setDepositoId(primerDeposito.dep_codigo.toString())
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Hubo un problema al traer los depósitos.",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      }
    }

    fetchDepositos()
  }, [auth, toast])

  useEffect(() => {
    const fetchInitialArticulos = async () => {
      if (!auth || !depositoId) return
  
      try {
        const response = await axios.get(`${api_url}articulos/`, {
          params: {
            buscar: 'a',
            id_deposito: parseInt(depositoId),
            stock: filtroStock === 'todos' ? undefined :filtroStock  // Enviamos el filtro de stock según lo que el usuario seleccione
          }
        })
        setAllArticulos(response.data.body)
        setArticulos(response.data.body)
      } catch (error) {
        console.error('Error al buscar artículos iniciales:', error)
        toast({
          title: "Error",
          description: "Hubo un problema al cargar los artículos iniciales.",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      }
    }
  
    fetchInitialArticulos()
  }, [auth, depositoId, filtroStock, toast])
  

  const debouncedFetchArticulos = debounce(async (busqueda: string) => {
    if (!auth) {
      toast({
        title: "Error de autenticación",
        description: "No estás autentificado",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }
    try {
      const response = await axios.get(`${api_url}articulos/`, {
        params: {
          buscar: busqueda,
          id_deposito: parseInt(depositoId),
          stock: filtroStock === 'todos' ? undefined: filtroStock
        }
      })
      setArticulos(response.data.body)
      console.log(response.data.body)
    } catch (error) {
      console.error('Error al buscar artículos:', error)
      toast({
        title: "Error",
        description: "Hubo un problema al buscar los artículos.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      setArticulos([])
    }
  }, 300)

  useEffect(() => {
    return () => {
      debouncedFetchArticulos.cancel()
    }
  }, [])

  const filterArticulos = (busqueda: string) => {
    const filteredArticulos = allArticulos.filter(articulo => 
      articulo.ar_descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      articulo.ar_codbarra.includes(busqueda)
    )
    setArticulos(filteredArticulos)
  }

  const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busqueda = e.target.value
    setArticuloBusqueda(busqueda)
    filterArticulos(busqueda)
  }

  const handleDepositoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDepositoId(e.target.value)
  }

  const handleStockRadioChange = (value: string) => {
    setFiltroStock(value)
  }
  const formatCurrency = (amount: number) => {
    const currencySymbol: { [key: string]: string } = {
      USD: '$',
      PYG: '₲',
    }

    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: moneda === 'PYG' ? 0 : 2,
      maximumFractionDigits: moneda === 'PYG' ? 0 : 2,
    }).format(amount).replace(/\s/g, '').replace(moneda, currencySymbol[moneda])
  }

  return (
    <Box maxW='full' p={5}>
  <VStack spacing={4} align="stretch">
    <Flex bgGradient="linear(to-r, blue.500, blue.600)" color="white" p={isMobile ? 4 : 6} alignItems="center" rounded="lg">
      <Archive size={32} className='mr-2' />
      <Heading size={isMobile ? 'sm' : 'md'}>Inventario</Heading>
    </Flex>
    <Flex flexDirection={isMobile ? 'column' : 'row'} gap={4}>
      <Box width="100%">
        <FormLabel htmlFor="busqueda">Buscar artículo</FormLabel>
        <Input 
          id="busqueda"
          placeholder="Buscar artículo" 
          value={articuloBusqueda} 
          onChange={handleBusqueda}
        />
      </Box>
      <Box width="100%">
        <FormLabel htmlFor="deposito">Depósito</FormLabel>
        <Select id="deposito" placeholder="Seleccionar depósito" value={depositoId} onChange={handleDepositoChange}>
          {depositos.map((deposito) => (
            <option key={deposito.dep_codigo} value={deposito.dep_codigo.toString()}>{deposito.dep_descripcion}</option>
          ))}
        </Select>
      </Box>
      <Box width="100%"  alignItems="flex-end">
      <FormLabel>Estado de Stock</FormLabel>
        <Box display={'flex'} flexDirection={'row'}>
        <RadioGroup onChange={handleStockRadioChange} value={filtroStock}>
          <Stack direction={'row'} spacing={4}>
          <Radio value="todos">Todos</Radio>
          <Radio value="1">Stock &gt; 0</Radio>
          <Radio value="0">Stock = 0</Radio>
          <Radio value="-1">Stock &lt; 0</Radio>
          </Stack>
        </RadioGroup>
        </Box>
  </Box>
    </Flex>
    <Box overflowX="auto" maxHeight={'750px'}>
      <Table variant="striped">
        <Thead bg={'blue.100'}>
          <Tr>
            <Th width="10%">Cod. Barra</Th>
            <Th width="5%">Código</Th>
            <Th width="15%">Descripción</Th>
            <Th width="15%" textAlign="right">Costo Fob.</Th>
            <Th width="15%" textAlign="right">Subtotal Compra</Th>
            <Th width="15%" textAlign="right">Subtotal Venta</Th>
            <Th width="10%">Proveedor</Th>
            <Th width="10%">Stock</Th>
            <Th width="10%">Deposito</Th>
            <Th width="10%">Lote</Th>
            <Th width="10%">Presentacion</Th>
            <Th width="10%">Marca</Th>
            <Th width="10%">Categoria</Th>
            <Th width="15%">Vencimiento</Th>
          </Tr>
        </Thead>
        <Tbody>
          {articulos.map((articulo) => (
            <Tr key={articulo.ar_codbarra}>
              <Td width="10%">{articulo.ar_codbarra}</Td>
              <Td width="5%">{articulo.al_codigo}</Td>
              <Td width="15%">{articulo.ar_descripcion}</Td>
              <Td width="15%" textAlign="right">{formatCurrency(articulo.ar_pcg)}</Td>
              <Td width="15%" textAlign="right">{formatCurrency(articulo.ar_pcg)}</Td>
              <Td width="15%" textAlign="right">{formatCurrency(articulo.ar_pvg)}</Td>
              <Td width="10%">{articulo.pro_razon}</Td>
              <Td width="10%">{articulo.al_cantidad}</Td>
              <Td width="10%">{articulo.dep_descripcion}</Td>
              <Td width="10%">{articulo.al_lote}</Td>
              <Td width="10%">{articulo.um_descripcion}</Td>
              <Td width="10%">{articulo.ma_descripcion}</Td>
              <Td width="10%">{articulo.sc_descripcion}</Td>
              <Td width="15%">{articulo.al_vencimiento.substring(0, 10)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  </VStack>
</Box>

  )
}

export default GestionInventario