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
  useMediaQuery,
  Divider,
  ChakraProvider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import Invoice from './facturaPdf'

interface Sucursal {
  id: number
  descripcion: string
}

interface Deposito {
  id: number
  nombre: string
}

interface Vendedor {
  id: number
  op_nombre: string
  op_codigo: string
}

interface Cliente {
  cli_codigo: number
  cli_razon: string
  cli_ruc: string
  cli_limitecredito: number
}

interface Articulo {
  ar_codigo: number
  ar_descripcion: string
  ar_pcg: number
  ar_codbarra: string
  ar_iva: string
  ar_stkmin: number
}


const tasasDeCambio: { [key: string]: number } = {
  USD: 0.00013,
  PYG: 1,
}

const API_BASE_URL = 'https://db.sofmar.com.py:4008'

const fetchData = async (endpoint: string, token: string) => {
  try {
    
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,  
        'Content-Type': 'application/json'
      },
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error)
    throw error
  }
}
const postData = async (endpoint: string, data: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error posting to ${endpoint}:`, error)
    throw error
  }
}



export default function PuntoDeVenta() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [depositos, setDepositos] = useState<Deposito[]>([])
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [sucursal, setSucursal] = useState('Central')
  const [deposito, setDeposito] = useState('Principal')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [moneda, setMoneda] = useState('PYG')
  const [vendedor, setVendedor] = useState('')
  const [clienteSeleccionado, setClienteSeleccionado] = useState<typeof clientes[0] | null>(null)
  const [articuloBusqueda, setArticuloBusqueda] = useState('')
  const [clienteBusqueda, setClienteBusqueda] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [items, setItems] = useState<{ id: number, nombre: string, precioUnitario: number, cantidad: number, subtotal: number, impuesto:string, impuesto5:number, impuesto10:number,exentas:number, precioOriginal: number}[]>([])
  const [selectedItem, setSelectedItem] = useState<typeof articulos[0] | null>(null)
  const [condicionVenta, setCondicionVenta] = useState(0)
  const [notaFiscal, setNotaFiscal] = useState(0)
  const [isMobile] = useMediaQuery('(max-width: 48em)')
  const [recomendaciones, setRecomendaciones] = useState<typeof articulos>([])
  const [recomendacionesClientes, setRecomendacionesClientes] = useState<typeof clientes>([])
  const [descuentoTipo, setDescuentoTipo] = useState<'porcentaje' | 'valor'>('porcentaje')
  const [descuentoValor, setDescuentoValor] = useState(0)
  const [buscarVendedor, setBuscarVendedor] = useState('')
  const [recomedacionesVendedores, setRecomendacionesVendedores] = useState<typeof vendedores>([])
  const [showInvoice, setShowInvoice]= useState(false)
  const [ newSaleId, setNewSaleID]= useState<number | null>(null)
  const toast = useToast()

  const formatCurrency = (amount: number) => {
    const currencySymbol : {[key: string] :string} = {
      USD: '$',
      PYG: '₲',
    };
  
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: moneda === 'PYG' ? 0 : 2,
      maximumFractionDigits: moneda === 'PYG' ? 0 : 2,
    }).format(amount).replace(/\s/g, '').replace(moneda, currencySymbol[moneda]);
  }

    const calcularImpuesto = (precio: number, impuesto: string) => {
      switch(impuesto){
        case '5%':
          return {impuesto5: precio * 1, impuesto10: 0, exentas: 0};
        case '10%':
          return {impuesto5: 0, impuesto10: precio * 1, exentas: 0};
        case 'exentas':
          return {impuesto5: 0, impuesto10: 0, exentas: precio};
        default:
          return {impuesto5: 0, impuesto10: 0, exentas: 0};


      }
    }

    const calcularTotalExcentas =()=>{
      let totalExentas= 0;
      items.forEach((item)=>{
        const precioEnMonedaActual = item.precioOriginal * tasasDeCambio[moneda];
        const exentas = calcularImpuesto(precioEnMonedaActual, item.impuesto);
        totalExentas += exentas.exentas * item.cantidad;
      });
      return totalExentas;
    }

    const calcularTotal5 = () => {
      let totalImpuesto5 = 0;
      items.forEach((item) => {
        const precioEnMonedaActual = item.precioOriginal * tasasDeCambio[moneda];
        const impuestos = calcularImpuesto(precioEnMonedaActual, item.impuesto);
        totalImpuesto5 += impuestos.impuesto5 * item.cantidad;
      });
      return totalImpuesto5;
    };

    const calcularTotal10 = () => {
      let totalImpuesto10 = 0;
      items.forEach((item) => {
        const precioEnMonedaActual = item.precioOriginal * tasasDeCambio[moneda];
        const impuestos = calcularImpuesto(precioEnMonedaActual, item.impuesto);
        totalImpuesto10 += impuestos.impuesto10 * item.cantidad;
      });
      return totalImpuesto10;
    };

    const calcularTotalImpuestos = () => {
      let totalImpuesto5 = 0;
      let totalImpuesto10 = 0;
      let totalExentas = 0;
    
      items.forEach((item) => {
        const precioEnMonedaActual = item.precioOriginal* tasasDeCambio[moneda];
        const impuestos = calcularImpuesto(precioEnMonedaActual, item.impuesto);
    
        totalImpuesto5 += impuestos.impuesto5 * item.cantidad;
        totalImpuesto10 += impuestos.impuesto10 * item.cantidad;
        totalExentas += impuestos.exentas * item.cantidad;
      });
    
      return totalImpuesto5 + totalImpuesto10 + totalExentas;
    };


  const agregarItem = () => {
    if (selectedItem) {
      const precioEnMonedaActual = selectedItem.ar_pcg * tasasDeCambio[moneda];
      const impuestos = calcularImpuesto(selectedItem.ar_pcg, selectedItem.ar_iva)
      const nuevoItem = {
        id: selectedItem.ar_codigo,
        nombre: selectedItem.ar_descripcion,
        precioOriginal: selectedItem.ar_pcg,
        precioUnitario: precioEnMonedaActual,
        cantidad: cantidad,
        impuesto: selectedItem.ar_iva,
        impuesto5: impuestos.impuesto5,
        impuesto10: impuestos.impuesto10,
        exentas: impuestos.exentas,
        subtotal: precioEnMonedaActual * cantidad,
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
    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    let total = subtotal;
    if(descuentoTipo === 'porcentaje'){
      total -= (subtotal * descuentoValor) / 100;
    } else {
      total -= descuentoValor * tasasDeCambio[moneda];
    }
    return total;
  }

  const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busqueda = e.target.value
    setArticuloBusqueda(busqueda)

    if (busqueda.length > 0) {
      const filteredRecomendaciones = articulos.filter((articulo) => 
        articulo.ar_descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        articulo.ar_codbarra.toLowerCase().includes(busqueda.toLowerCase())
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
        cliente.cli_razon.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
        cliente.cli_ruc.includes(busquedaCliente)
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
        vendedor.op_nombre.toLowerCase().includes(busquedaVendedor.toLowerCase()) ||
        vendedor.op_codigo.includes(busquedaVendedor)
      ).slice(0, 5)
      setRecomendacionesVendedores(filteredVendedores)
      if (filteredVendedores.length > 0) {
        setVendedor(filteredVendedores[0].op_nombre)
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


  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token no disponible. El usuario no está autenticado.');
        }
        const [sucursalesData, depositosData, vendedoresData, clientesData, articulosData] = await Promise.all([
          fetchData('sucursales', token),
          fetchData('depositos', token),
          fetchData('vendedores/vendedor', token),
          fetchData('clientes', token),
          fetchData('articulos', token),
        ]);

        setSucursales(sucursalesData);
        setDepositos(depositosData);
        setVendedores(vendedoresData);
        setClientes(clientesData);
        setArticulos(articulosData);

        if (sucursalesData.length > 0) {
          setSucursal(sucursalesData[0].id.toString());
        }
        if (depositosData.length > 0) {
          setDeposito(depositosData[0].id.toString());
        }
      } catch (error) {
        toast({
          title: "Error al cargar datos",
          description: "No se pudieron cargar algunos datos. Por favor, intente de nuevo.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchAllData();
  }, [])


  useEffect(() => {
    setItems(prevItems => prevItems.map(item => {
      const precioEnMonedaActual = item.precioOriginal * tasasDeCambio[moneda];
      const impuestos = calcularImpuesto(item.precioOriginal, item.impuesto);
      return {
        ...item,
        precioUnitario: precioEnMonedaActual,
        ...impuestos,
        subtotal: precioEnMonedaActual * item.cantidad,
      };
    }));
    if (descuentoTipo === 'valor') {
      setDescuentoValor(prevValor => prevValor / tasasDeCambio[moneda === 'USD' ? 'PYG' : 'USD'] * tasasDeCambio[moneda]);
    }
  }, [moneda]);


  

  const finalizarVenta = async () => {
    try {
      if (!sucursal || !deposito || !vendedor || !clienteSeleccionado) {
        throw new Error('Faltan campos requeridos');
      }

      const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
      const descuento = descuentoTipo === 'porcentaje'
        ? subtotal * (descuentoValor / 100)
        : descuentoValor;
      const total = subtotal - descuento;

      const ventaData = {
        sucursal_id: parseInt(sucursal),
        deposito_id: parseInt(deposito),
        vendedor_id: parseInt(vendedor),
        cliente_id: clienteSeleccionado.cli_codigo,
        total,
        descuento,
        condicion_venta: condicionVenta,
        nota_fiscal: notaFiscal,
        items: items.map(item => ({
          articulo_id: item.id,
          cantidad: item.cantidad,
          precio_unitario: item.precioUnitario,
          subtotal: item.subtotal,
          impuesto5: item.impuesto5*item.cantidad,
          impuesto10: item.impuesto10*item.cantidad,
          exentas: item.exentas*item.cantidad,
        }))
      };

      const result = await postData('ventas', ventaData);
      setNewSaleID(result.id);

      // Limpiar el estado y mostrar mensaje de éxito
      setItems([]);
      setVendedor('');
      setClienteSeleccionado(null);
      setDescuentoValor(0);
      setCondicionVenta(0);
      setNotaFiscal(0);

      toast({
        title: "Venta finalizada",
        description: "La venta se ha guardado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setShowInvoice(true);
    } catch (error) {
      console.error('Error detallado al finalizar la venta:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al finalizar la venta",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };


      const getCreditColor= (credit:number)=>{
        if (credit<0) return 'red.500';
        if (credit===0) return 'gray.500';
        return 'green.500';
      };

      const eliminarItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
      }

      const actualizarMoneda= (n:number)=>{
        const precioEnMonedaActual = n * tasasDeCambio[moneda];
        return precioEnMonedaActual;
      }

  return (
    <div>
          <ChakraProvider>
              <Box maxW="100%" mx="auto" p={isMobile ? 2 : 6} bg="white" shadow="xl" rounded="lg">
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
                        <option key={sucursal.id} value={sucursal.id.toString()}>{sucursal.descripcion}</option>
                      ))}
                    </Select>
                  </Box>
                  <Box>
                    <FormLabel>Depósito</FormLabel>
                    <Select placeholder="Seleccionar depósito" value={deposito} onChange={(e) => setDeposito(e.target.value)}>
                      {depositos.map((deposito) => (
                        <option key={deposito.id} value={deposito.id.toString()}>{deposito.nombre}</option>
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
                              setBuscarVendedor(vendedor.op_codigo)
                              setVendedor(vendedor.id.toString())
                              setRecomendacionesVendedores([])
                            }}
                          >
                            <Text fontWeight="bold">{vendedor.op_nombre}</Text>
                            <Text as="span" color="gray.500" fontSize="sm">Código: {vendedor.op_codigo}</Text>
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
                        {recomendacionesClientes.map((cliente) => {
                    const credit = Number(cliente.cli_limitecredito) || 0;
                    const creditColor = getCreditColor(credit);

                    return (
                      <Box
                        key={cliente.cli_codigo}
                        p={2}
                        _hover={{ bg: 'gray.100' }}
                        cursor="pointer"
                        onClick={() => {
                          setClienteBusqueda(cliente.cli_razon);
                          setClienteSeleccionado(cliente);
                          setRecomendacionesClientes([]);
                        }}
                      >
                        <Text fontWeight="bold">{cliente.cli_razon}</Text>
                        <Text as="span" color="gray.500" fontSize="sm">RUC: {cliente.cli_ruc}</Text>
                        <Text as="span" color={creditColor} fontSize="sm" ml={2}>Línea de crédito: {formatCurrency(credit)}</Text>
                      </Box>
                    );
                  })}
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
                            key={articulo.ar_codigo}
                            p={2}
                            _hover={{bg: 'gray.100'}}
                            onClick={() => {
                              setArticuloBusqueda(articulo.ar_descripcion)
                              setSelectedItem(articulo)
                              setRecomendaciones([])
                            }}
                          >
                            <Flex >
                            {articulo.ar_descripcion}
                              <Text as="span" color="gray.500" fontSize={'12px'}>//Codigo: {articulo.ar_codigo}</Text>
                              <Text as="span" color="gray.500" fontSize={'12px'}>//Precio: {articulo.ar_pcg}</Text>
                              <Text as="span" color="gray.500" fontSize={'12px'}>//Stock: {articulo.ar_stkmin}</Text>
                            </Flex>
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
                        <Th>Nombre</Th>
                        <Th isNumeric>Precio Unitario</Th>
                        <Th isNumeric>Cantidad</Th>
                        <Th isNumeric>Exentas</Th>
                        <Th isNumeric>5%</Th>
                        <Th isNumeric>10%</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {items.map((item, index) => (
                        <Tr key={index}>
                          <Td>{item.id}</Td>
                          <Td>{item.nombre}</Td>
                          <Td isNumeric>{formatCurrency(item.precioUnitario)}</Td>
                          <Td isNumeric>{item.cantidad}</Td>
                          <Td isNumeric>{formatCurrency(actualizarMoneda(item.exentas)*item.cantidad)}</Td>
                          <Td isNumeric>{formatCurrency(actualizarMoneda(item.impuesto5)*item.cantidad)}</Td>
                          <Td isNumeric>{formatCurrency(actualizarMoneda(item.impuesto10)*item.cantidad)}</Td>
                          <Td>
                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={() => eliminarItem(index)}
                            >
                              Eliminar
                            </Button>
                          </Td>
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
                        variant={condicionVenta === 0 ? 'solid' : 'outline'}
                        bg={condicionVenta === 0 ? 'blue.500' : 'transparent'}
                        color={condicionVenta === 0 ? 'white' : 'blue.500'}
                        borderColor="blue.500"
                        _hover={{
                          bg: condicionVenta === 0 ? 'blue.600' : 'blue.50',
                        }}
                        onClick={() => setCondicionVenta(0)}
                        width={isMobile ? "full" : "auto"}
                      >
                        Contado
                      </Button>
                      <Button 
                        variant={condicionVenta === 1 ? 'solid' : 'outline'}
                        bg={condicionVenta === 1 ? 'blue.500' : 'transparent'}
                        color={condicionVenta === 1 ? 'white' : 'blue.500'}
                        borderColor="blue.500"
                        _hover={{
                          bg: condicionVenta === 1 ? 'blue.600' : 'blue.50',
                        }}
                        onClick={() => setCondicionVenta(1)}
                        width={isMobile ? "full" : "auto"}
                        isDisabled={!clienteSeleccionado || clienteSeleccionado.cli_limitecredito <= 0}
                      >
                        Crédito
                      </Button>
                    </Flex>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={2}>Nota Fiscal</Text>
                    <Flex flexDirection={isMobile ? 'column' : 'row'} gap={2}>
                      <Button 
                        variant={notaFiscal === 0 ? 'solid' : 'outline'}
                        bg={notaFiscal === 0 ? 'blue.500' : 'transparent'}
                        color={notaFiscal === 0 ? 'white' : 'blue.500'}
                        borderColor="blue.500"
                        _hover={{
                          bg: notaFiscal === 0 ? 'blue.600' : 'blue.50',
                        }}
                        onClick={() => setNotaFiscal(0)}
                        width={isMobile ? "full" : "auto"}
                      >
                        Factura
                      </Button>
                      <Button 
                        variant={notaFiscal === 1 ? 'solid' : 'outline'}
                        bg={notaFiscal === 1 ? 'blue.500' : 'transparent'}
                        color={notaFiscal === 1 ? 'white' : 'blue.500'}
                        borderColor="blue.500"
                        _hover={{
                          bg: notaFiscal === 1 ? 'blue.600' : 'blue.50',
                        }}
                        onClick={() => setNotaFiscal(1)}
                        width={isMobile ? "full" : "auto"}
                      >
                        Nota Comun
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
                <Box>
                    <Text fontSize="md" fontWeight="bold">Total Exentas: {formatCurrency(calcularTotalExcentas())}</Text>
                    <Divider borderWidth={'2px'} borderColor={'blue.500'} my={1}/>
                    <Text fontSize="md" fontWeight="bold">Total IVA 5%: {formatCurrency(calcularTotal5()/20)}</Text>
                    <Divider borderWidth={'2px'} borderColor={'blue.500'} my={1}/>
                    <Text fontSize="md" fontWeight="bold">Total IVA 10%: {formatCurrency(calcularTotal10()/10)}</Text>
                    <Divider borderWidth={'2px'} borderColor={'blue.500'} my={1}/>
                    <Text fontSize="md" fontWeight="bold">Total Impuestos: {formatCurrency(calcularTotalImpuestos())}</Text>
                </Box>
                <Box textAlign={isMobile ? "left" : "right"}>
                  <Text fontSize="lg" fontWeight="bold">Subtotal: {formatCurrency(items.reduce((acc, item) => acc + item.subtotal, 0))}</Text>
                  <Text fontSize="lg" fontWeight="bold">Descuento: {descuentoTipo === 'porcentaje' ? `${descuentoValor}%` : formatCurrency(descuentoValor*tasasDeCambio[moneda])}</Text>
                  <Text fontSize="lg" fontWeight="bold">Total Neto: {formatCurrency(calcularTotal())}</Text>
                  <Button colorScheme="blue" mt={4} width={isMobile ? "full" : "auto"} onClick={finalizarVenta}>Finalizar Venta</Button>
                </Box>
              </Flex>
              
            </Box>
            <Modal isOpen={showInvoice} onClose={() => setShowInvoice(false)} size="full">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Factura</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {newSaleId && <Invoice ventaId={newSaleId} />}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={() => setShowInvoice(false)}>
                Cerrar
              </Button>
              {/* You can add a print button here if needed */}
            </ModalFooter>
          </ModalContent>
        </Modal>
          </ChakraProvider>
    </div>
  
)
}