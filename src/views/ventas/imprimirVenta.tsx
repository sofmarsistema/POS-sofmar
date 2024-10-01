import  { useState, useEffect } from 'react'
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

const ReceiptTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`

const ReceiptRow = styled.tr`
  &:nth-of-type(even) {
    background-color: #f9f9f9;
  }
`

const ReceiptCell = styled.td`
  padding: 4px;
  text-align: left;
  &.right {
    text-align: right;
  }
`

const ReceiptHeader = styled.th`
  padding: 4px;
  text-align: left;
  font-weight: bold;
  &.right {
    text-align: right;
  }
`

const ReceiptDivider = styled.hr`
  border: none;
  border-top: 1px dotted #000;
  margin: 8px 0;
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
  tel: string
  nombre_emp: string
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
      console.error("Venta ID no proporcionado")
      return
    }
  
    setIsLoading(true)
    try {
      const [ventaResponse, detalleResponse] = await Promise.all([
        axios.get(`${api_url}venta`, { params: { id: ventaId } }),
        axios.get(`${api_url}venta/detalles?cod=${ventaId}`)
      ])
  
      const [ventaData] = ventaResponse.data.body
      const detalles = detalleResponse.data.body
      
      setVenta(ventaData)
      setDetalleVentas(detalles)
  
      await Promise.all([
        fetchClienteInfo(ventaData.ve_cliente),
        fetchSucursalInfo(),
        fetchDepositoInfo(),
        fetchVendedorInfo(ventaData.ve_vendedor)
      ])
    } catch (error) {
      console.error("Error fetching venta data", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchClienteInfo = async (clienteId: number) => {
    try {
      const response = await axios.get(`${api_url}clientes/${clienteId}`)
      const clienteData = Array.isArray(response.data.body) && response.data.body.length > 0
        ? response.data.body[0]
        : null
      setClienteInfo(clienteData)
    } catch (error) {
      console.error("Error fetching cliente info", error)
    }
  }
  
  const fetchSucursalInfo = async () => {
    try {
      const response = await axios.get(`${api_url}sucursales/listar`)
      const sucursalData = Array.isArray(response.data.body) && response.data.body.length > 0
        ? response.data.body[0]
        : null
      setSucursalInfo(sucursalData)
    } catch (error) {
      console.error("Error fetching sucursal info", error)
    }
  }

  const fetchDepositoInfo = async () => {
    try {
      const response = await axios.get(`${api_url}depositos`)
      const depositoData = Array.isArray(response.data.body) && response.data.body.length > 0
        ? response.data.body[0]
        : null
      setDepositoInfo(depositoData)
    } catch (error) {
      console.error("Error fetching deposito info", error)
    }
  }

  const fetchVendedorInfo = async (vendedorId: number) => {
    try {
      const response = await axios.get(`${api_url}usuarios/${vendedorId}`)
      const vendedorData = Array.isArray(response.data.body) && response.data.body.length > 0
        ? response.data.body[0]
        : null
      setVendedorInfo(vendedorData)
    } catch (error) {
      console.error("Error fetching vendedor info", error)
    }
  }

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
    }).format(amount)
  }

  const calcularVentaSinDescuento = (total: number, descuento: number): number => {
    return total + descuento
  }

  const totalSinDescuento = calcularVentaSinDescuento(
    Number(venta?.ve_total ?? 0),
    Number(venta?.ve_descuento ?? 0)
  )

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
              <Text fontWeight="bold">{safeString(sucursalInfo.nombre_emp)}</Text>
              <Text>Filial: {safeString(sucursalInfo.descripcion)}</Text>
              <Text>Ciudad: Ciudad del Este</Text>
              <Text>Telef.: {safeString(sucursalInfo.tel)}</Text>
            </Box>
            <ReceiptDivider />
            <ReceiptTable>
              <tbody>
                <ReceiptRow>
                  <ReceiptCell>VENTA: {safeString(venta.ve_credito === 1 ? 'Credito' : 'Contado')}</ReceiptCell>
                  <ReceiptCell className="right">CONTROL INTERNO</ReceiptCell>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptCell>Fecha..: {`${formatDate(venta.fecha)} : ${venta.ve_hora}`}</ReceiptCell>
                  <ReceiptCell className="right">Sucursal.: {safeString(sucursalInfo.descripcion)}</ReceiptCell>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptCell>Moneda.: {venta.ve_moneda === 1 ? 'GUARANI' : 'USD'}</ReceiptCell>
                  <ReceiptCell className="right">Depósito.: {safeString(depositoInfo?.dep_descripcion)}</ReceiptCell>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptCell>Cliente: {safeString(clienteInfo.cli_razon)}</ReceiptCell>
                  <ReceiptCell className="right">Registro.: {safeString(venta.ve_codigo)}</ReceiptCell>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptCell>RUC: {safeString(clienteInfo.cli_ruc)}</ReceiptCell>
                  <ReceiptCell className="right">Vendedor.: {safeString(vendedorInfo.op_nombre)}</ReceiptCell>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptCell>Teléfono.: {safeString(clienteInfo.cli_tel)}</ReceiptCell>
                  <ReceiptCell className="right">Ciudad..: Ciudad del Este</ReceiptCell>
                </ReceiptRow>
              </tbody>
            </ReceiptTable>
            <ReceiptDivider />
            <ReceiptTable>
              <thead>
                <ReceiptRow>
                  <ReceiptHeader>Cód</ReceiptHeader>
                  <ReceiptHeader>Descripción</ReceiptHeader>
                  <ReceiptHeader className="right">Cant</ReceiptHeader>
                  <ReceiptHeader className="right">Precio U.</ReceiptHeader>
                  <ReceiptHeader className="right">Desc.</ReceiptHeader>
                  <ReceiptHeader className="right">Valor</ReceiptHeader>
                </ReceiptRow>
              </thead>
              <tbody>
                {detalleVentas.map((detalle, index) => (
                  <ReceiptRow key={index}>
                    <ReceiptCell>{safeString(detalle.codbarra)}</ReceiptCell>
                    <ReceiptCell>{safeString(detalle.descripcion)}</ReceiptCell>
                    <ReceiptCell className="right">{safeString(detalle.cantidad)}</ReceiptCell>
                    <ReceiptCell className="right">{formatCurrency(detalle.precio)}</ReceiptCell>
                    <ReceiptCell className="right">{formatCurrency(detalle.descuento)}</ReceiptCell>
                    <ReceiptCell className="right">{formatCurrency(detalle.cantidad * detalle.precio - detalle.descuento)}</ReceiptCell>
                  </ReceiptRow>
                ))}
              </tbody>
            </ReceiptTable>
            <ReceiptDivider />
            <ReceiptTable>
              <tbody>
                <ReceiptRow>
                  <ReceiptCell>Total Items: {detalleVentas.length}</ReceiptCell>
                  <ReceiptCell className="right">Total s/Desc.: {formatCurrency(totalSinDescuento)}</ReceiptCell>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptCell></ReceiptCell>
                  <ReceiptCell className="right">Descuento: {formatCurrency(venta.ve_descuento)}</ReceiptCell>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptCell></ReceiptCell>
                  <ReceiptCell className="right">Total: {formatCurrency(venta.ve_total)}</ReceiptCell>
                </ReceiptRow>
              </tbody>
            </ReceiptTable>
            <ReceiptDivider />
            <Text>{'<<Pasados los 30 Ds. no se aceptarán devoluciones>>'}</Text>
            <Text>{'<<Gracias por su preferencia>>'}</Text>
            <Text>{'<<Comprobante no válido como nota fiscal>>'}</Text>
            <Box mt={4}>
              <Text>Firma: _________________</Text>
            </Box>
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