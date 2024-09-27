import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Box,
  Flex,
  Spinner,
} from '@chakra-ui/react'
import styled from '@emotion/styled'
import { usePDF } from 'react-to-pdf'
import { api_url } from '@/utils'

const ReceiptWrapper = styled.pre`
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.2;
  white-space: pre-wrap;
  width: 100%;
`

const ReceiptLine = styled.div`
  display: flex;
  justify-content: space-between;
`

const ReceiptDivider = styled.div`
  border-top: 1px dotted #000;
  margin: 15px 0px;
`

interface VentaModalProps {
  isOpen: boolean
  onClose: () => void
  ventaId: number | null
}

interface Venta {
  ve_codigo: number
  ve_credito: number
  ve_fecha: string
  ve_hora: string
  ve_moneda: number
  ve_deposito: string
  ve_total: number
  ve_descuento: number
  ve_cliente: number
  ve_sucursal: number
  ve_vendedor: number
  ve_factura: string
  fecha: string
  vencimiento: string
}

interface DetalleVenta {
  codbarra: number
  descripcion: string
  cantidad: number
  precio: number
  descuento: number
  exentas: number
  cinco: number
  diez: number
}

interface Cliente {
  cli_codigo: number
  cli_razon: string
  cli_ruc: string
  cli_tel: string
}

interface Sucursal {
  id: number
  descripcion: string
  ciudad: string
  telefono: string
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

export default function VentaModal({ isOpen, onClose, ventaId }: VentaModalProps) {
  const [venta, setVenta] = useState<Venta | null>(null)
  const [detalleVentas, setDetalleVentas] = useState<DetalleVenta[]>([])
  const [clienteInfo, setClienteInfo] = useState<Cliente | null>(null)
  const [sucursalInfo, setSucursalInfo] = useState<Sucursal | null>(null)
  const [depositoInfo, setDepositoInfo] = useState<Deposito | null>(null)
  const [vendedorInfo, setVendedorInfo] = useState<Vendedor | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { toPDF, targetRef } = usePDF({ filename: `factura-${ventaId}.pdf` })

  useEffect(() => {
    if (isOpen && ventaId) {
      fetchVentaData()
    }
  }, [isOpen, ventaId])

  const fetchVentaData = async () => {
    if (!ventaId) {
      console.error("Venta ID no proporcionado");
      return;
    }
  
    setIsLoading(true);
    try {
      const [ventaResponse, detalleResponse] = await Promise.all([
        axios.get(`${api_url}venta`, { params: { id: ventaId } }),
        axios.get(`${api_url}venta/detalles?cod=${ventaId}`)
      ]);
  
      const [ventaData] = ventaResponse.data.body;
      const detalles = detalleResponse.data.body;
      
      console.log(ventaData); // Verificar la estructura completa de ventaData
      console.log(detalles); // Verificar la estructura de detalleResponse
  
      setVenta(ventaData);
      setDetalleVentas(detalles); // Esto debería mostrar el valor esperado si ve_cliente está presente en 
  
      await Promise.all([
        fetchClienteInfo(ventaData.ve_cliente),
        fetchSucursalInfo(),
        fetchDepositoInfo(),
        fetchVendedorInfo(ventaData.ve_vendedor)
      ]);
    } catch (error) {
      console.error("Error fetching venta data", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchClienteInfo = async (clienteId: number) => {
    try {
      const response = await axios.get(`${api_url}clientes/${clienteId}`);
      
      // Verificamos que el cuerpo de la respuesta sea un array y que tenga al menos un elemento
      const clienteData = Array.isArray(response.data.body) && response.data.body.length > 0
        ? response.data.body[0] // Accedemos al primer objeto
        : null; // Manejo de caso si no hay datos
  
      setClienteInfo(clienteData);
      console.log(clienteData); // Log para verificar el contenido
    } catch (error) {
      console.error("Error fetching cliente info", error);
    }
  };
  
  const fetchSucursalInfo = async () => {
    try {
      const response = await axios.get(`${api_url}sucursales/listar`);
  
      // Verificamos que el cuerpo de la respuesta sea un array y que tenga al menos un elemento
      const sucursalData = Array.isArray(response.data.body) && response.data.body.length > 0
        ? response.data.body[0] // Accedemos al primer objeto
        : null; // Manejo de caso si no hay datos
  
      setSucursalInfo(sucursalData); // Establecemos solo un objeto o null
      console.log(sucursalData); // Log para verificar el contenido
    } catch (error) {
      console.error("Error fetching sucursal info", error);
    }
  };


    const fetchDepositoInfo = async () => {
    try {
      const response = await axios.get(`${api_url}depositos`);
  
      // Verificamos que el cuerpo de la respuesta sea un array y que tenga al menos un elemento
      const depositoData = Array.isArray(response.data.body) && response.data.body.length > 0
        ? response.data.body[0] // Accedemos al primer objeto
        : null; // Manejo de caso si no hay datos
  
      setDepositoInfo(depositoData); // Establecemos solo un objeto o null
      console.log(depositoData); // Log para verificar el contenido
    } catch (error) {
      console.error("Error fetching sucursal info", error);
    }
  };

  const fetchVendedorInfo = async (vendedorId: number) => {
    try {
      const response = await axios.get(`${api_url}usuarios/${vendedorId}`);
      
      // Verificamos que el cuerpo de la respuesta sea un array y que tenga al menos un elemento
      const vendedorData = Array.isArray(response.data.body) && response.data.body.length > 0
        ? response.data.body[0] // Accedemos al primer objeto
        : null; // Manejo de caso si no hay datos
  
      setVendedorInfo(vendedorData); // Establecemos solo un objeto o null
      console.log(vendedorData); // Log para verificar el contenido
    } catch (error) {
      console.error("Error fetching vendedor info", error);
    }
  };
  

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('es-PY', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-PY', {
        style: 'currency',
        currency: venta?.ve_moneda === 1 ? 'PYG' : 'USD',
        minimumFractionDigits: venta?.ve_moneda === 1 ? 0 : 2,
        maximumFractionDigits: venta?.ve_moneda === 1 ? 0 : 2,
    }).format(amount);
};

const calcularVentaSinDescuento = (total: number, descuento: number): number => {
    return total + descuento;
};

// Asegúrate de que los valores sean números, usando 0 si son undefined
const totalSinDescuento = calcularVentaSinDescuento(
    Number(venta?.ve_total ?? 0),  // Convierte a número, usa 0 si es undefined
    Number(venta?.ve_descuento ?? 0) // Convierte a número, usa 0 si es undefined
);
  const safeString = (value: any): string => {
    return typeof value === 'string' ? value : String(value || '')
  }

  if (isLoading || !venta || !clienteInfo || !sucursalInfo || !vendedorInfo) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cargando detalles de la venta</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex justify="center" align="center" height="200px">
              <Spinner size="xl" />
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent maxWidth="1200px">
        <ModalBody p={8} ref={targetRef}>
          <ReceiptWrapper>
            <Box textAlign="center" mb={2}>
              <Text fontWeight="bold">Acricolor</Text>
              <Text>Filial: {safeString(sucursalInfo.descripcion)}</Text>
              <Text>Ciudad: {safeString(sucursalInfo.ciudad)}</Text>
              <Text>Telef.: {safeString(sucursalInfo.telefono)}</Text>
            </Box>
            <ReceiptDivider />
            <ReceiptLine>
              <Text>VENTA: {safeString(venta.ve_credito === 1 ? 'Credito' : 'Contado')}</Text>
              <Text>CONTROL INTERNO</Text>
            </ReceiptLine>
            <ReceiptLine>
              <Text>Fecha..: {`${formatDate(venta.fecha)} : ${venta.ve_hora}`}</Text>
              <Text>Sucursal.: {safeString(sucursalInfo.descripcion)}</Text>
            </ReceiptLine>
            <ReceiptLine>
              <Text>Moneda.: {venta.ve_moneda === 1 ? 'GUARANI' : 'USD'}</Text>
              <Text>Depósito.: {safeString(depositoInfo?.dep_descripcion)}</Text>
            </ReceiptLine>
            <ReceiptLine>
              <Text>Cliente: {safeString(clienteInfo.cli_razon)}</Text>
              <Text>Registro.: {safeString(venta.ve_codigo)}</Text>
            </ReceiptLine>
            <ReceiptLine>
              <Text>RUC: {safeString(clienteInfo.cli_ruc)}</Text>
              <Text>Vendedor.: {safeString(vendedorInfo.op_nombre)}</Text>
            </ReceiptLine>
            <ReceiptLine>
              <Text>Teléfono.: {safeString(clienteInfo.cli_tel)}</Text>
              <Text>Ciudad..: Ciudad del Este</Text>
            </ReceiptLine>
            <ReceiptDivider />
            <ReceiptLine>
              <Text>{'Cód'.padEnd(6)}</Text>
              <Text>{'Descripción'.padEnd(20)}</Text>
              <Text>{'Cant'.padStart(5)}</Text>
              <Text>{'Precio U.'.padStart(10)}</Text>
              <Text>{'Desc.'.padStart(10)}</Text>
              <Text>{'Valor'.padStart(10)}</Text>
            </ReceiptLine>
            <ReceiptDivider />
            {detalleVentas.map((detalle, index) => (
              <ReceiptLine key={index}>
                <Text>{safeString(detalle.codbarra).padEnd(6)}</Text>
                <Text>{safeString(detalle.descripcion).padEnd(20)}</Text>
                <Text>{safeString(detalle.cantidad).padStart(5)}</Text>
                <Text>{formatCurrency(detalle.precio).padStart(10)}</Text>
                <Text>{formatCurrency(detalle.descuento).padStart(10)}</Text>
                <Text>{formatCurrency(detalle.cantidad * detalle.precio - detalle.descuento).padStart(10)}</Text>
              </ReceiptLine>
            ))}
            <ReceiptDivider />
            <ReceiptLine>
              <Text>Total Items: {detalleVentas.length}</Text>
              <Text>Total s/Desc.: {formatCurrency(totalSinDescuento)}</Text>
              <Text>Subtotal c/Desc.: {formatCurrency(venta.ve_total)}</Text>
            </ReceiptLine>
            <ReceiptLine>
              <Text></Text>
              <Text></Text>
              <Text>Descuento: {formatCurrency(venta.ve_descuento)}</Text>
            </ReceiptLine>
            <ReceiptLine>
              <Text></Text>
              <Text></Text>
              <Text>Total: {formatCurrency(venta.ve_total)}</Text>
            </ReceiptLine>
            <ReceiptDivider />
            <Text>{'<<Pasados los 30 Ds. no se aceptarán devoluciones>>'}</Text>
            <Text>{'<<Gracias por su preferencia>>'}</Text>
            <Text>{'<<Comprobante no válido como nota fiscal>>'}</Text>
            <ReceiptLine>
              <Text>Firma: _________________</Text>
            </ReceiptLine>
          </ReceiptWrapper>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={onClose}>
            Cerrar
          </Button>
          <Button colorScheme="green" mr={3} onClick={() => toPDF()}>
            Descargar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}