import React, { useEffect, useRef, useState } from 'react'
import { Minus, SquareChartGantt, WalletCards } from 'lucide-react'
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
    Checkbox,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
} from '@chakra-ui/react'
import axios from 'axios'
import { useAuth } from '@/services/AuthContext'
import { api_url } from '@/utils'
import { debounce } from 'lodash';
import ResumenVentas from '../ventas/ResumenVentas'
import MenuContextual from '../modules/MenuContextual'
import PresupuestoModal from './imprimirPresupuesto'
import PresupuestoModalEstilizado from './imprimirPresupuestoEstilizado'
import { useSwitch } from '@/services/SwitchContext'
import Auditar from '@/services/AuditoriaHook'


interface Sucursal {
    id: number
    descripcion: string
}

interface Deposito {
    dep_codigo: number
    dep_descripcion: string
}

interface Vendedor {
    id: number
    op_nombre: string
    op_codigo: string
}

interface Cliente {
    cli_codigo: number
    cli_interno: number
    cli_razon: string
    cli_ruc: string
    cli_limitecredito: number
}

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
    al_codigo: number
}

type ModalType = 'venta' | 'resumen' | 'observaciones' | null;


const tasasDeCambio: { [key: string]: number } = {
    USD: 0.00013,
    PYG: 1,
}

{/* guardar items en el localstorage para evitar perder articulos por si se actualiza la pagina*/ }

const saveItemsToLocalStorage = (items: any[]) => {
    localStorage.setItem('cartItems', JSON.stringify(items));
};

const loadItemsFromLocalStorage = (): any[] => {
    const savedItems = localStorage.getItem('cartItems');
    return savedItems ? JSON.parse(savedItems) : [];
};


export default function Presupuestos() {
    const [sucursales, setSucursales] = useState<Sucursal[]>([])
    const [depositos, setDepositos] = useState<Deposito[]>([])
    const [vendedores, setVendedores] = useState<Vendedor[]>([])
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [articulos, setArticulos] = useState<Articulo[]>([])
    const [sucursal, setSucursal] = useState('')
    const [deposito, setDeposito] = useState('')
    const [, setDepositoSeleccionado] = useState<Deposito | null>(null);
    const [depositoId, setDepositoId] = useState<string>('');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
    const [moneda, setMoneda] = useState('PYG')
    const [vendedor, setVendedor] = useState('')
    const [operador, setOperador] = useState<string>('')
    const [clienteSeleccionado, setClienteSeleccionado] = useState<typeof clientes[0] | null>(null)
    const [articuloBusqueda, setArticuloBusqueda] = useState('')
    const [clienteBusqueda, setClienteBusqueda] = useState('')
    const [cantidad, setCantidad] = useState(1)
    const [items, setItems] = useState<{ id: number, nombre: string, precioUnitario: number, cantidad: number, subtotal: number, impuesto: number, impuesto5: number, impuesto10: number, exentas: number, precioOriginal: number, vencimiento: string, lote: number }[]>(loadItemsFromLocalStorage());
    const [selectedItem, setSelectedItem] = useState<typeof articulos[0] | null>(null)
    const [isMobile] = useMediaQuery('(max-width: 48em)')
    const [recomendaciones, setRecomendaciones] = useState<typeof articulos>([])
    const [recomendacionesClientes, setRecomendacionesClientes] = useState<typeof clientes>([])
    const [descuentoTipo, setDescuentoTipo] = useState<'porcentaje' | 'valor'>('porcentaje')
    const [descuentoValor, setDescuentoValor] = useState(0)
    const [buscarVendedor, setBuscarVendedor] = useState('')
    const [recomedacionesVendedores, setRecomendacionesVendedores] = useState<typeof vendedores>([])
    const [newPresupuestoID, setNewPresupuestoID] = useState<number | null>(null)
    const [, setError] = useState<string | null>(null)
    const [buscarSoloConStock, setBuscarSoloConStock] = useState(false)
    const toast = useToast()
    const { auth } = useAuth()
    const vendedorRef = useRef<HTMLInputElement>(null);
    const clienteRef = useRef<HTMLInputElement>(null);
    const articuloRef = useRef<HTMLInputElement>(null);
    const cantidadRef = useRef<HTMLInputElement>(null);
    const [, setPresupuestoFinalizado] = useState<any>(null)
    const [, setDetallePresupuestoFinalizado] = useState<any[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [, setClienteInfo] = useState<any>(null)
    const [, setSucursalInfo] = useState<any>(null)
    const [, setVendedorInfo] = useState<any>(null)
    const [activeModal, setActiveModal] = useState<ModalType>(null)
    const [condicionPago, setCondicionPago] = useState('Crédito/Contado')
    const [validezOferta, setValidezOferta] = useState('15 Dias')
    const [plazoEntrega, setPlazoEntrega] = useState('15 Dias')
    const [tipoFlete, setTipoFlete] = useState('')
    const [observaciones, setObservaciones] = useState('')
    const {isSwitchOn} = useSwitch()


    useEffect(() => {

        // traerSucursales

        const fetchSucursales = async () => {
            if (!auth) {
                setError("No estás autentificado");
                return;
            }
            try {
                const response = await axios.get(`${api_url}sucursales/listar`);
                console.log(response.data.body)
                setSucursales(response.data.body);
                if (response.data.body.length > 0) {
                    setSucursal(response.data.body[0].id.toString());
                    console.log(response.data.body)
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
                const response = await axios.get(`${api_url}depositos/`);
                setDepositos(response.data.body);
                if (response.data.body.length > 0) {
                    const primerDeposito = response.data.body[0];
                    setDeposito(primerDeposito.dep_codigo.toString());
                    setDepositoId(primerDeposito.dep_codigo.toString());
                    setDepositoSeleccionado(primerDeposito);
                }
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Error desconocido");
                }
                toast({
                    title: "Error",
                    description: "Hubo un problema al traer los depósitos.",
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

        fetchSucursales();
        fetchDepositos();
        fetchClientes();
        fetchVendedores();
    }, [auth, toast]);


    const formatCurrency = (amount: number) => {
        const currencySymbol: { [key: string]: string } = {
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
        switch (impuesto) {
            case 3:
                return { impuesto5: precio * 1, impuesto10: 0, exentas: 0 };
            case 2:
                return { impuesto5: 0, impuesto10: precio * 1, exentas: 0 };
            case 1:
                return { impuesto5: 0, impuesto10: 0, exentas: precio };
            default:
                return { impuesto5: 0, impuesto10: 0, exentas: 0 };


        }
    }

    const calcularTotalExcentas = () => {
        let totalExentas = 0;
        items.forEach((item) => {
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

    const agregarItem = () => {
        if (selectedItem) {
            const precioEnMonedaActual = selectedItem.ar_pvg * tasasDeCambio[moneda];
            const impuestos = calcularImpuesto(selectedItem.ar_pvg, selectedItem.ar_iva)
            const nuevoItem = {
                id: selectedItem.ar_codigo,
                nombre: selectedItem.ar_descripcion,
                precioOriginal: selectedItem.ar_pvg,
                precioUnitario: precioEnMonedaActual,
                cantidad: cantidad,
                impuesto: selectedItem.ar_iva,
                impuesto5: impuestos.impuesto5,
                impuesto10: impuestos.impuesto10,
                exentas: impuestos.exentas,
                subtotal: precioEnMonedaActual * cantidad,
                vencimiento: selectedItem.al_vencimiento,
                lote: selectedItem.al_codigo
            }
            const newItems = [...items, nuevoItem];
            setItems(newItems);
            saveItemsToLocalStorage(newItems);
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

    const eliminarItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        saveItemsToLocalStorage(newItems);
    }

    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);

    const calcularTotal = () => {
        let total = subtotal;
        if (descuentoTipo === 'porcentaje') {
            total -= (subtotal * descuentoValor) / 100;
        } else {
            total -= descuentoValor * tasasDeCambio[moneda];
        }
        return total;
    }

    const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
        const busqueda = e.target.value;
        setArticuloBusqueda(busqueda);
        debouncedFetchArticulos(busqueda);
    };

    const debouncedFetchArticulos = debounce(async (busqueda: string) => {
        if (busqueda.length > 0) {
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
                setRecomendaciones(response.data.body)
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
                setRecomendaciones([])
            }
        } else {
            setRecomendaciones([])
        }
    }, 300)






    useEffect(() => {
        return () => {
            debouncedFetchArticulos.cancel();
        };
    }, []);



    useEffect(() => {
        saveItemsToLocalStorage(items);
    }, [items]);

    const handleDepositoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setDepositoId(id);
        const deposito = depositos.find(d => d.dep_codigo.toString() === id) || null;
        setDepositoSeleccionado(deposito);
    };

    const handleStockCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBuscarSoloConStock(e.target.checked);
        if (articuloBusqueda.length > 0) {
            debouncedFetchArticulos(articuloBusqueda);
        }
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
            ).slice(0, 5);

            setRecomendacionesVendedores(filteredVendedores);

            if (filteredVendedores.length > 0) {
                setVendedor(filteredVendedores[0].op_nombre);
                setOperador(filteredVendedores[0].op_codigo);
            } else {
                setVendedor('');
                setOperador('');
            }
        } else {
            setRecomendacionesVendedores([]);
            setVendedor('');
            setOperador('');
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


    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "Sin registro";
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const presupuestoData = {
        presupuesto: {
            pre_cliente: clienteSeleccionado?.cli_codigo,
            pre_operador: operador ? parseInt(operador) : 1,
            pre_moneda: moneda === 'PYG' ? 1 : 0,
            pre_fecha: fecha,
            pre_descuento: descuentoTipo === 'porcentaje'
                ? items.reduce((acc, item) => acc + item.subtotal, 0) * (descuentoValor / 100)
                : descuentoValor,
            pre_vendedor: operador ? parseInt(operador) : 1,
            pre_hora: horaLocal,
            pre_obs: observaciones,
            pre_flete: tipoFlete,
            pre_plazo: plazoEntrega,
            pre_sucursal: parseInt(sucursal),
            pre_deposito: parseInt(deposito),
            pre_total: calcularTotal(),
            pre_vencimiento: selectedItem?.al_vencimiento.substring(0, 10) ? selectedItem.al_vencimiento : '2001-01-01',
            pre_condicion: condicionPago,
            pre_validez: validezOferta,

        },
        detalle_presupuesto: items.map(item => {
            const itemSubtotal = item.precioUnitario * item.cantidad;
            const totalSubtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
            let itemDescuento = 0;

            if (descuentoTipo === 'porcentaje') {
                itemDescuento = itemSubtotal * (descuentoValor / 100);
            } else {
                itemDescuento = (itemSubtotal / totalSubtotal) * descuentoValor;
            }
            const depre_exentas = Math.max(item.exentas * item.cantidad - itemDescuento, 0);
            const depre_cinco = Math.max(item.impuesto5 * item.cantidad - itemDescuento, 0);
            const depre_diez = Math.max(item.impuesto10 * item.cantidad - itemDescuento, 0);

            return {
                depre_articulo: item.id,
                depre_cantidad: item.cantidad,
                depre_precio: item.precioUnitario,
                depre_descuento: itemDescuento,
                depre_exentas: depre_exentas,
                depre_cinco: depre_cinco,
                depre_diez: depre_diez,
                depre_codlote: item.lote,
                depre_lote: item.lote.toString(),
                depre_vendedor: operador ? parseInt(operador) : 1,
                depre_vence:formatDate(item.vencimiento),
                depre_descripcio_art: item.nombre
            };
        })
    };




    const finalizarPresupuesto = async () => {
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
                description: "Por favor, agregue al menos un artículo al presupuesto",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            console.log(presupuestoData)
            const response = await axios.post(`${api_url}presupuestos/agregarPresupuesto`, presupuestoData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });


            if (response.data && response.data.body) {
                setNewPresupuestoID(response.data.body);
                setPresupuestoFinalizado(presupuestoData.presupuesto)
                setDetallePresupuestoFinalizado(presupuestoData.detalle_presupuesto)
                setClienteInfo(clienteSeleccionado)
                setSucursalInfo(sucursales.find(s => s.id.toString() === sucursal))
                setVendedorInfo(vendedores.find(v => v.op_codigo === operador))
                setIsModalOpen(true)
                setItems([]);
                saveItemsToLocalStorage([]);
                setClienteSeleccionado(null);
                setClienteBusqueda('')
                setDescuentoValor(0);
                Auditar(73, 8, newPresupuestoID , parseInt(operador), `Presupuesto ${newPresupuestoID} creado por ${vendedor}`);
                toast({
                    title: "Presupuesto finalizado",
                    description: "El presupuesto se ha guardado correctamente",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                throw new Error('No se recibió un ID de presupuesto válido');
            }
        } catch (error) {
            console.error('Error detallado al finalizar el presupuesto:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Ha ocurrido un error al finalizar el presupuesto",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const cancelarPresupuesto = async () => {
        setItems([]);
        saveItemsToLocalStorage([]);
        setClienteSeleccionado(null);
        setClienteBusqueda('')
        setDescuentoValor(0);
    }


    const getCreditColor = (credit: number) => {
        if (credit < 0) return 'red.500';
        if (credit === 0) return 'gray.500';
        return 'green.500';
    };

    const actualizarMoneda = (n: number) => {
        const precioEnMonedaActual = n * tasasDeCambio[moneda];
        return precioEnMonedaActual;
    }

    const selectFirstRecommendation = (
        recommendations: any[] | undefined,
        setSelected: (item: any) => void,
        clearRecommendations: () => void,
        setSearchValue: (value: string) => void
    ) => {
        if (recommendations && recommendations.length > 0) {
            const firstItem = recommendations[0];
            setSelected(firstItem);
            clearRecommendations();
            setSearchValue(firstItem.nombre || firstItem.cli_razon || firstItem.ar_descripcion || firstItem.op_nombre);
            return true;
        }
        return false;
    };

    const handleEnterKey = (
        e: React.KeyboardEvent<HTMLElement>,
        nextRef: React.RefObject<HTMLElement>,
        selectFirst: () => boolean
    ) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (selectFirst && !selectFirst()) {
                nextRef.current?.focus();
            }
        }
    };

    const selectFirstVendedor = () => {
        if (!recomedacionesVendedores || recomedacionesVendedores.length === 0) return false;
        const firstVendedor = recomedacionesVendedores[0];
        setVendedor(firstVendedor.op_nombre);
        setOperador(firstVendedor.op_codigo);
        setBuscarVendedor(firstVendedor.op_codigo);
        setRecomendacionesVendedores([]);
        return true;
    };

    const selectFirstCliente = () => {
        return selectFirstRecommendation(
            recomendacionesClientes,
            setClienteSeleccionado,
            () => setRecomendacionesClientes([]),
            setClienteBusqueda
        );
    };

    const selectFirstArticulo = () => {
        return selectFirstRecommendation(
            recomendaciones,
            setSelectedItem,
            () => setRecomendaciones([]),
            setArticuloBusqueda
        );
    };

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setPresupuestoFinalizado(null)
        setDetallePresupuestoFinalizado([])
        setClienteInfo(null)
        setSucursalInfo(null)
        setVendedorInfo(null)
    }

    const handleOpenOtherModal = (modalType: ModalType) => {
        setActiveModal(modalType)
    }

    const handleCloseOtherModal = () => {
        setActiveModal(null)
    }



    return (
        <div>
            <ChakraProvider>
                <Box maxW="100%" mx="auto" p={isMobile ? 2 : 6} bg="white" shadow="xl" rounded="lg" fontSize={'smaller'}>
                    <Flex bgGradient="linear(to-r, blue.500, blue.600)" color="white" p={isMobile ? 4 : 6} alignItems="center" rounded="lg">
                        <SquareChartGantt size={24} className="mr-2" />
                        <Heading size={isMobile ? 'sm' : 'md'}>Presupuestos</Heading>
                        <MenuContextual />
                    </Flex>
                    <Flex
                        flexDirection={isMobile ? 'column' : 'row'}
                    >
                        <Box p={isMobile ? 2 : 4}>
                            <Grid templateColumns={isMobile ? "repeat(1, 1fr)" : "repeat(3, 1fr)"} gap={3} mb={4}>
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
                                        {depositos.map((deposito) => (
                                            <option key={deposito.dep_codigo} value={deposito.dep_codigo.toString()}>{deposito.dep_descripcion}</option>
                                        ))}
                                    </Select>
                                </Box>
                                <Flex
                                    align={'end'}
                                    fill={'row'}
                                    justify={'space-between'}
                                >
                                    <Box
                                        display={'column'}
                                    >
                                        <FormLabel>Fecha</FormLabel>
                                        <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                                    </Box>
                                    <Button
                                        colorScheme="blue"
                                        size="md"
                                        ml={2}
                                        onClick={() => handleOpenOtherModal('resumen')}
                                        width={'100%'}
                                        variant={'outline'}
                                    >
                                        <WalletCards />
                                        Consultar Ventas
                                    </Button>
                                </Flex>
                                <Flex
                                    flexDir={'row'}
                                    gap={4}
                                >
                                    <Box>
                                        <FormLabel>Moneda</FormLabel>
                                        <Select placeholder="Seleccionar moneda" value={moneda} onChange={(e) => setMoneda(e.target.value)}>
                                            <option value="USD">USD</option>
                                            <option value="PYG">PYG</option>
                                        </Select>
                                    </Box>
                                    <Box>
                                        <FormLabel>Lista de Precios</FormLabel>
                                        <Select placeholder="Seleccionar...">
                                            <option>PARTICULAR</option>
                                        </Select>
                                    </Box>
                                </Flex>
                                <Box position={'relative'}>
                                    <FormLabel>Vendedor</FormLabel>
                                    <Input
                                        id='vendedor-search'
                                        placeholder="Buscar vendedor por código"
                                        value={buscarVendedor}
                                        onChange={handleBusquedaVendedor}
                                        onFocus={() => {
                                            if (vendedor) {
                                                setBuscarVendedor('');
                                                setRecomendacionesVendedores([]);
                                            }
                                        }}
                                        aria-autocomplete="list"
                                        aria-controls="vendedor-recommendations"
                                        ref={vendedorRef}
                                        onKeyDown={(e) => handleEnterKey(e, clienteRef, selectFirstVendedor)}
                                    />
                                    {vendedor && (
                                        <Text mt={2} fontWeight="bold" color="green.500">
                                            Vendedor seleccionado: {vendedor}
                                        </Text>
                                    )}
                                    {recomedacionesVendedores.length === 0 && buscarVendedor.length > 0 && !vendedor && (
                                        <Text color="red.500" mt={2}>
                                            No se encontró vendedor con ese código
                                        </Text>
                                    )}
                                    {recomedacionesVendedores.length > 0 && (
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
                                                        setVendedor(vendedor.op_nombre)
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
                                        ref={clienteRef}
                                        onKeyDown={(e) => handleEnterKey(e, articuloRef, selectFirstCliente)}
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
                                        ref={articuloRef}
                                        onKeyDown={(e) => handleEnterKey(e, cantidadRef, selectFirstArticulo)}
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
                                            maxHeight={'600px'}
                                            overflowY={'auto'}
                                        >
                                            {recomendaciones.map((articulo) => (
                                                <Box
                                                    key={articulo.ar_codigo}
                                                    p={2}
                                                    _hover={{ bg: 'gray.100' }}
                                                    onClick={() => {
                                                        setArticuloBusqueda(articulo.ar_descripcion)
                                                        setSelectedItem(articulo)
                                                        setRecomendaciones([])
                                                    }}
                                                >
                                                    <Flex >
                                                        {articulo.ar_descripcion}
                                                        <Minus />
                                                        <Text as="span" color="gray.500" fontSize={'14px'}>Codigo: {articulo.ar_codbarra}</Text>
                                                        <Minus />
                                                        <Text as="span" color="red.500" fontSize={'14px'}>Precio Contado: {formatCurrency(articulo.ar_pvg)}</Text>
                                                        <Minus />
                                                        <Text as="span" color="red.500" fontSize={'14px'}>Precio Credito: {formatCurrency(articulo.ar_pvcredito)}</Text>
                                                        <Minus />
                                                        <Text as="span" color="red.500" fontSize={'14px'}>Precio Mostrador: {formatCurrency(articulo.ar_pvmostrador)}</Text>
                                                        <Minus />
                                                        <Text as="span" color="gray.500" fontSize={'14px'}>Stock {articulo.al_cantidad}</Text>
                                                        <Minus />
                                                        <Text as="span" color="gray.500" fontSize={'14px'}>Vencimiento: {articulo.al_vencimiento.substring(0, 10)}</Text>
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
                                    width={isMobile ? "full" : "60px"}
                                    min={1}
                                    ref={cantidadRef}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            agregarItem();
                                            articuloRef.current?.focus();
                                        }
                                    }}
                                />
                                <Checkbox
                                    isChecked={buscarSoloConStock}
                                    onChange={handleStockCheckboxChange}
                                >
                                    En stock
                                </Checkbox>
                                <Button colorScheme="green" onClick={agregarItem} flexShrink={0} >
                                    +
                                </Button>
                            </Flex>
                            <Box overflowX={'auto'} height={'300px'} width={isMobile ? '100%' : '1400px'}>
                                <Table variant="striped" size={'sm'}>
                                    <Thead position="sticky" top={0} bg="white" zIndex={0}>
                                        <Tr>
                                            <Th>Código</Th>
                                            <Th>Nombre</Th>
                                            <Th isNumeric>Precio Unitario</Th>
                                            <Th isNumeric>Cantidad</Th>
                                            <Th isNumeric>Exentas</Th>
                                            <Th isNumeric>5%</Th>
                                            <Th isNumeric>10%</Th>
                                            <Th>Lote</Th>
                                            <Th>Vencimiento</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {items.map((item, index) => (
                                            <Tr key={index}>
                                                <Td>{item.id}</Td>
                                                <Td>{item.nombre}</Td>
                                                <Td isNumeric>{formatCurrency(item.precioUnitario)}</Td>
                                                <Td isNumeric>{item.cantidad}</Td>
                                                <Td isNumeric>{formatCurrency(actualizarMoneda(item.exentas) * item.cantidad)}</Td>
                                                <Td isNumeric>{formatCurrency(actualizarMoneda(item.impuesto5) * item.cantidad)}</Td>
                                                <Td isNumeric>{formatCurrency(actualizarMoneda(item.impuesto10) * item.cantidad)}</Td>
                                                <Td>{item.lote}</Td>
                                                <Td>{formatDate(item.vencimiento)}</Td>
                                                <Td>
                                                    <Button
                                                        size="xs"
                                                        colorScheme="red"
                                                        onClick={() => eliminarItem(index)}
                                                    >
                                                        x
                                                    </Button>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
                        </Box>
                        <Flex justify="space-between" p={isMobile ? 2 : 4} rounded="lg" flexDirection={'column'} gap={isMobile ? 3 : 0}>
                        <Flex
                            flexDir={'column'}
                            justify={isMobile ? 'center' : 'space-between'}
                            gap={3}
                        >
                            <Flex
                                flexDir={'row'}
                                gap={2}
                            >
                                <Box>
                                    <FormLabel>Condición de pago</FormLabel>
                                    <Input
                                        id='condicionPago'
                                        placeholder="En días..."
                                        value={condicionPago}
                                        onChange={(e) => setCondicionPago(e.target.value)}
                                    />
                                </Box>
                                <Box>
                                    <FormLabel>Validez de la oferta</FormLabel>
                                    <Input
                                        id='validezOferta'
                                        placeholder="En días..."
                                        value={validezOferta}
                                        onChange={(e) => setValidezOferta(e.target.value)}
                                    />
                                </Box>
                            </Flex>
                            <Flex
                                flexDir={'row'}
                                gap={2}
                            >
                                <Box>
                                    <FormLabel>Plazo de entrega</FormLabel>
                                    <Input
                                        id='plazoEntrega'
                                        placeholder="En días..."
                                        value={plazoEntrega}
                                        onChange={(e) => setPlazoEntrega(e.target.value)}
                                    />
                                </Box>
                                <Box>
                                    <FormLabel>Tipo de flete</FormLabel>
                                    <Input
                                        id='tipoFlete'
                                        value={tipoFlete}
                                        onChange={(e) => setTipoFlete(e.target.value)}
                                    />
                                </Box>
                            </Flex>
                        </Flex>
                            <Flex mt={isMobile ? 4 : 0} gap={2} flexDirection={'column'} alignItems={'center'}>
                                <Text fontSize="md" fontWeight={'semibold'}>Descuento</Text>
                                <Flex>
                                    <Select value={descuentoTipo}
                                        onChange={(e) => {
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
                                        onChange={(e) => setDescuentoValor(parseInt(e.target.value))}
                                        width={'90px'}
                                        ml={2}
                                    />
                                </Flex>
                            </Flex>
                            <Box pt={2}>
                                <Text fontSize="sm" fontWeight="bold">Total Exentas: {formatCurrency(calcularTotalExcentas())}</Text>
                                <Divider borderWidth={'2px'} borderColor={'blue.500'} my={1} />
                                <Text fontSize="sm" fontWeight="bold">Total IVA 5%: {formatCurrency(calcularTotal5())}</Text>
                                <Divider borderWidth={'2px'} borderColor={'blue.500'} my={1} />
                                <Text fontSize="sm" fontWeight="bold">Total IVA 10%: {formatCurrency(calcularTotal10())}</Text>
                            </Box>
                            <Box textAlign={isMobile ? "left" : "right"}>
                                <Text fontSize="lg" fontWeight="bold">Subtotal: {formatCurrency(items.reduce((acc, item) => acc + item.subtotal, 0))}</Text>
                                <Text fontSize="lg" fontWeight="bold">Descuento: {descuentoTipo === 'porcentaje' ? `${descuentoValor}%` : formatCurrency(descuentoValor * tasasDeCambio[moneda])}</Text>
                                <Text fontSize="lg" fontWeight="bold">Total a Pagar: {formatCurrency(calcularTotal())}</Text>
                                <Flex gap={4}>
                                    <Button variant={'outline'} colorScheme="teal" mt={4} width={isMobile ? "full" : "auto"} onClick={() => { handleOpenOtherModal('observaciones') }}>Agregar Obs.</Button>
                                    <Button variant={'outline'} colorScheme="red" mt={4} width={isMobile ? "full" : "auto"} onClick={cancelarPresupuesto}>Cancelar</Button>
                                    <Button colorScheme="blue" mt={4} width={isMobile ? "full" : "auto"} onClick={finalizarPresupuesto
                                    }>Guardar Presupuesto</Button>
                                </Flex>
                            </Box>
                        </Flex>
                    </Flex>
                </Box>
                {isSwitchOn ? (
                <PresupuestoModalEstilizado
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    presupuestoID={newPresupuestoID}
                />
            ) : (
                <PresupuestoModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    presupuestoID={newPresupuestoID}
                />
            )}
                <Modal isOpen={activeModal === 'resumen'} onClose={handleCloseOtherModal} size="6xl" isCentered={true}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalCloseButton />
                        <ModalBody>
                            <ResumenVentas />
                        </ModalBody>
                    </ModalContent>
                </Modal>

                <Modal isOpen={activeModal === 'observaciones'} onClose={handleCloseOtherModal} size="6xl" isCentered={true}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Observaciones del presupuesto</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody
                        padding={isMobile ? 2 : 8}
                    >
                        <Input
                            variant='filled'
                            placeholder='Escriba aquí las observaciones...'
                            height={'50px'}
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                        />
                        <Flex
                            width={'100%'}
                            justifyContent={'flex-end'}
                        >
                            <Button
                                colorScheme="green"
                                mt={4}
                                width={isMobile ? "full" : "auto"}
                                onClick={handleCloseOtherModal}
                                alignSelf={'center'}
                            >
                                Guardar Obs.
                            </Button>
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>
                </ChakraProvider>
        </div>

    )
}