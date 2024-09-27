import React, { useState, useEffect } from 'react'
import { 
  Flex, Box, VStack, Heading, useMediaQuery, useToast, FormLabel, 
  Select, Checkbox, Input, Table, Thead, Tbody, Tr, Th, Td, Text 
} from '@chakra-ui/react'
import { Archive } from 'lucide-react'
import { useAuth } from '@/services/AuthContext' 
import { api_url } from '@/utils'
import axios from 'axios'
import { debounce } from 'lodash'

interface Articulo {
  ar_codigo: number
  ar_descripcion: string
  ar_pvg: number
  ar_pvcredito: number
  ar_pvmostrador: number
  ar_codbarra: string
  ar_iva: number
  al_cantidad: number
  al_vencimiento: string
}

interface Deposito {
  dep_codigo: number
  dep_descripcion: string
}

const GestionInventario: React.FC = () => {
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [depositos, setDepositos] = useState<Deposito[]>([])
  const [depositoId, setDepositoId] = useState<string>('')
  const [buscarSoloConStock, setBuscarSoloConStock] = useState(true)
  const [articuloBusqueda, setArticuloBusqueda] = useState('')
  const [moneda, setMoneda] = useState('PYG')
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
          stock: buscarSoloConStock ? 1 : 0
        }
      })
      setArticulos(response.data.body)
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

  const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busqueda = e.target.value
    setArticuloBusqueda(busqueda)
    debouncedFetchArticulos(busqueda)
  }

  const handleDepositoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDepositoId(e.target.value)
    if (articuloBusqueda) {
      debouncedFetchArticulos(articuloBusqueda)
    }
  }

  const handleStockCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBuscarSoloConStock(e.target.checked)
    if (articuloBusqueda) {
      debouncedFetchArticulos(articuloBusqueda)
    }
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
          <Box width="100%" display="flex" alignItems="flex-end">
            <Checkbox 
              id="soloConStock"
              isChecked={buscarSoloConStock}
              onChange={handleStockCheckboxChange}
            >
              Solo artículos en stock
            </Checkbox>
          </Box>
        </Flex>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Código</Th>
                <Th>Descripción</Th>
                <Th>Precio Contado</Th>
                <Th>Precio Crédito</Th>
                <Th>Precio Mostrador</Th>
                <Th>Stock</Th>
                <Th>Vencimiento</Th>
              </Tr>
            </Thead>
            <Tbody>
              {articulos.map((articulo) => (
                <Tr key={articulo.ar_codigo}>
                  <Td>{articulo.ar_codbarra}</Td>
                  <Td>{articulo.ar_descripcion}</Td>
                  <Td>{formatCurrency(articulo.ar_pvg)}</Td>
                  <Td>{formatCurrency(articulo.ar_pvcredito)}</Td>
                  <Td>{formatCurrency(articulo.ar_pvmostrador)}</Td>
                  <Td>{articulo.al_cantidad}</Td>
                  <Td>{articulo.al_vencimiento.substring(0,10)}</Td>
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