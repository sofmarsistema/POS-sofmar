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
} from '@chakra-ui/react'
import axios from 'axios'
import { useAuth } from '@/services/AuthContext' 
import { api_url } from '@/utils'
import { debounce } from 'lodash';


interface Sucursal {
  id: number
  descripcion: string
}

interface Deposito {
  id: number
  dep_descripcion: string
}

interface Vendedor {
  id: number
  op_nombre: string
  op_codigo: string
}

interface Cliente {
  cli_codigo: number
  cli_interno:number
  cli_razon: string
  cli_ruc: string
  cli_limitecredito: number
}

interface Articulo {
  al_codigo: number
  ar_descripcion: string
  ar_pcg: number
  ar_codbarra: string
  ar_iva: number
  ar_cantidad: number
  al_vencimiento: string
}


const tasasDeCambio: { [key: string]: number } = {
  USD: 0.00013,
  PYG: 1,
}

export default function PuntoDeVenta() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [depositos, setDepositos] = useState<Deposito[]>([])
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [sucursal, setSucursal] = useState('')
  const [deposito, setDeposito] = useState('')
  const [depositoSeleccionado, setDepositoSeleccionado] = useState<Deposito | null>(null);
  const [depositoId, setDepositoId] = useState<string>('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [moneda, setMoneda] = useState('PYG')
  const [vendedor, setVendedor] = useState('')
  const [operador,setOperador ]= useState<string>('')
  const [clienteSeleccionado, setClienteSeleccionado] = useState<typeof clientes[0] | null>(null)
  const [articuloBusqueda, setArticuloBusqueda] = useState('')
  const [clienteBusqueda, setClienteBusqueda] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [items, setItems] = useState<{ id: number, nombre: string, precioUnitario: number, cantidad: number, subtotal: number, impuesto:number, impuesto5:number, impuesto10:number,exentas:number, precioOriginal: number}[]>([])
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
  const [ , setNewSaleID]= useState<number | null>(null)
  const [, setError] =useState<string | null>(null)
  const [numeroFactura, setNumeroFactura] = useState('')
  const toast = useToast()
  const {auth} = useAuth()


  // Funciones y Effects para traer los datos//

  useEffect(() => {

    // Traer articulos
    const fetchArticulos = async () => {
      if (!auth) {
        setError("No estás autentificado");
        return;
      }
      try {
        const response = await axios.get(`${api_url}articulos/`, {
          params: {
            buscar: articuloBusqueda,
            id_deposito: depositoId,
            stock: 1
          }
        });
        setArticulos(response.data.body);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido");
        }
        toast({
          title: "Error",
          description: "Hubo un problema al traer los artículos.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };
    // traerSucursales

    const fetchSucursales = async () => {
      if (!auth) {
        setError("No estás autentificado");
        return;
      }
      try {
        const response = await axios.get(`${api_url}sucursales/listar`);
        setSucursales(response.data.body);
        if (response.data.body.length > 0) {
          setSucursal(response.data.body[0].id.toString());
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido");
        }
        toast({
          title: "Error",
          description: "Hubo un problema al traer los artículos.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    // traer depositos

    const fetchDepositos = async () => {
      if (!auth) {
        setError("No estás autentificado");
        return;
      }
      try {
        const response = await axios.get(`${api_url}depositos/sucursal/${localStorage.getItem('user_id')}`);
        setDepositos(response.data.body);
        if (response.data.body.length < 1) {
          setDepositos([{ id: 1, dep_descripcion: 'Casa Central' }]);
          setDeposito('1');
        } else {
          setDepositos(response.data.body);
          setDeposito(response.data.body[0].id.toString());
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido");
        }
        toast({
          title: "Error",
          description: "Hubo un problema al traer los artículos.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };


    // traerclientes

    const fetchClientes = async () => {
      if (!auth) {
        setError("No estás autentificado");
        return;
      }
      try {
        const response = await axios.get(`${api_url}clientes`);
        setClientes(response.data.body);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido");
        }
        toast({
          title: "Error",
          description: "Hubo un problema al traer los artículos.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    const fetchVendedores = async () => {
      if (!auth) {
        setError("No estás autentificado");
        return;
      }
      try {
        const response = await axios.get(`${api_url}usuarios`);
        setVendedores(response.data.body);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido");
        }
        toast({
          title: "Error",
          description: "Hubo un problema al traer los artículos.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };


    

    fetchArticulos();
    fetchSucursales();
    fetchDepositos();
    fetchClientes();
    fetchVendedores();


  }, [auth, toast]);




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

    const calcularImpuesto = (precio: number, impuesto: number) => {
      switch(impuesto){
        case 2:
          return {impuesto5: precio * 1, impuesto10: 0, exentas: 0};
        case 3:
          return {impuesto5: 0, impuesto10: precio * 1, exentas: 0};
        case 1:
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
        id: selectedItem.al_codigo,
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
  
  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);

  const calcularTotal = () => {
    let total = subtotal;
    if(descuentoTipo === 'porcentaje'){
      total -= (subtotal * descuentoValor) / 100;
    } else {
      total -= descuentoValor * tasasDeCambio[moneda];
    }
    return total;
  }

  const debouncedFetchArticulos = debounce(async (busqueda: string) => {
    if (busqueda.length > 0) {
      try {
        const response = await axios.get(`${api_url}articulos/`, {
          params: {
            buscar: busqueda,
            id_deposito: depositoId,
            stock: 1
          }
        });
        const filteredRecomendaciones = response.data.body.slice(0, 5);
        setRecomendaciones(filteredRecomendaciones);
      } catch (error) {
        console.error('Error al buscar artículos:', error);
        toast({
          title: "Error",
          description: "Hubo un problema al buscar los artículos.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setRecomendaciones([]);
      }
    } else {
      setRecomendaciones([]);
    }
  }, 300);
  
  const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busqueda = e.target.value;
    setArticuloBusqueda(busqueda);
    debouncedFetchArticulos(busqueda);
  };
  
  useEffect(() => {
    return () => {
      debouncedFetchArticulos.cancel();
    };
  }, []);

  const handleDepositoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setDepositoId(id);
    const deposito = depositos.find(d => d.id.toString() === id) || null;
    setDepositoSeleccionado(deposito);
  };

  const handleBusquedaCliente = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busquedaCliente = e.target.value
    setClienteBusqueda(busquedaCliente)
    if (busquedaCliente.length > 0) {
      const filteredRecomendacionesClientes = clientes.filter((cliente) => 
        cliente.cli_razon.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
        cliente.cli_ruc.includes(busquedaCliente) ||
        cliente.cli_interno.toString().includes(busquedaCliente)
      ).slice(0, 5)
      setRecomendacionesClientes(filteredRecomendacionesClientes)
    } else {
      setRecomendacionesClientes([])
    }
  }

  const handleBusquedaVendedor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busquedaVendedor = e.target.value;
    setBuscarVendedor(busquedaVendedor);
    
    if (busquedaVendedor.length > 0) {
      const filteredVendedores = vendedores.filter((vendedor) =>
        vendedor.op_nombre.toLowerCase().includes(busquedaVendedor.toLowerCase()) ||
        vendedor.op_codigo.toString().includes(busquedaVendedor)
      ).slice(0, 1);
      
      setRecomendacionesVendedores(filteredVendedores);
  
      if (filteredVendedores.length > 0) {
        setVendedor(filteredVendedores[0].op_nombre);
        setOperador(filteredVendedores[0].op_codigo);
      }
    } else {
      setRecomendacionesVendedores([]);
    }
  };

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

  
  const now = new Date()
  const horaLocal = now.toLocaleTimeString();

  const ventaData = {
    venta: {
      ve_cliente: clienteSeleccionado?.cli_codigo,
      ve_operador: operador ? parseInt(operador) : 1,
      ve_deposito: parseInt(deposito),
      ve_moneda: moneda === 'PYG'? 1: 0,
      ve_fecha: fecha,
      ve_factura: numeroFactura,
      ve_credito: condicionVenta,
      ve_saldo: clienteSeleccionado?.cli_limitecredito,
      ve_sucursal: parseInt(sucursal),
      ve_total: calcularTotal(),
      ve_vencimiento: selectedItem?.al_vencimiento.substring(0,10) ? selectedItem.al_vencimiento : '2001-01-01',
      ve_descuento: descuentoTipo === 'porcentaje'
        ? items.reduce((acc, item) => acc + item.subtotal, 0) * (descuentoValor / 100)
        : descuentoValor,
      ve_vendedor: operador ? parseInt(operador): 1,
      ve_hora: horaLocal
    },
    detalle_ventas: items.map(item => {
      const itemSubtotal = item.precioUnitario * item.cantidad;
      const totalSubtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
      let itemDescuento = 0;
  
      if (descuentoTipo === 'porcentaje') {
        itemDescuento = itemSubtotal * (descuentoValor / 100);
      } else {
        // Distribuir el descuento proporcionalmente
        itemDescuento = (itemSubtotal / totalSubtotal) * descuentoValor;
      }
      const deve_exentas = Math.max(item.exentas * item.cantidad - itemDescuento, 0);
      const deve_cinco = Math.max(item.impuesto5 * item.cantidad - itemDescuento, 0);
      const deve_diez = Math.max(item.impuesto10 * item.cantidad - itemDescuento, 0);
  
      return {
        deve_articulo: item.id,
        deve_cantidad: item.cantidad,
        deve_precio: item.precioUnitario,
        deve_descuento: itemDescuento,
        deve_exentas:deve_exentas,
        deve_cinco: deve_cinco,
        deve_diez: deve_diez,
        deve_vendedor: operador ? parseInt(operador) : 1
      };
    })
  };

  const finalizarVenta = async () => {
    if (!clienteSeleccionado) {
      toast({
        title: "Error",
        description: "Por favor, seleccione un cliente",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    if (!sucursal) {
      toast({
        title: "Error",
        description: "Por favor, seleccione una sucursal",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    if (!deposito) {
      toast({
        title: "Error",
        description: "Por favor, seleccione un depósito",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    if (!vendedor) {
      toast({
        title: "Error",
        description: "Por favor, seleccione un vendedor",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Por favor, agregue al menos un artículo a la venta",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    try {
      const response = await axios.post(`${api_url}venta/agregarVenta`, ventaData,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data && response.data.body) {
        setNewSaleID(response.data.body);
  
        setItems([]);
        setClienteSeleccionado(null);
        setClienteBusqueda('')
        setDescuentoValor(0);
        setCondicionVenta(0);
        setNotaFiscal(0);
        setNumeroFactura('')
  
        toast({
          title: "Venta finalizada",
          description: "La venta se ha guardado correctamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('No se recibió un ID de venta válido');
      }
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
                    <Select placeholder="Seleccionar depósito" value={depositoId} onChange={handleDepositoChange}>
                    {depositos.map((dep) => (
                        <option key={dep.id} value={dep.id.toString()}>{dep.dep_descripcion}</option>
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
                    {recomedacionesVendedores.length === 0 && buscarVendedor.length > 0 && (
                        <Text color="red.500" mt={2}>
                          No se encontró vendedor con ese código
                        </Text>
                      )}
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
                            key={vendedor.op_codigo}
                            p={2}
                            _hover={{ bg: 'gray.100' }}
                            cursor="pointer"
                            onClick={() => {
                              setBuscarVendedor(vendedor.op_codigo)
                              setVendedor(vendedor.op_nombre.toString())
                              setOperador(vendedor.op_codigo)
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
                            key={articulo.al_codigo}
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
                              <Text as="span" color="gray.500" fontSize={'12px'}>//Codigo: {articulo.al_codigo}</Text>
                              <Text as="span" color="gray.500" fontSize={'12px'}>//Precio: {articulo.ar_pcg}</Text>
                              <Text as="span" color="gray.500" fontSize={'12px'}>//ve_vencimiento: {articulo.al_vencimiento.substring(0,10)}</Text>
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
                    <Box>
                    <FormLabel>Número de Factura</FormLabel>
                    <Input 
                      type="text" 
                      placeholder="Ingrese el número de factura" 
                      value={numeroFactura} 
                      onChange={(e) => setNumeroFactura(e.target.value)}
                    />
                  </Box>
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
          </ChakraProvider>
    </div>
  
)
}