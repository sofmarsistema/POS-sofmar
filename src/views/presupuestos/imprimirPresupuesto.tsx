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

interface PresupuestoModalProps {
  isOpen: boolean
  onClose: () => void
  presupuestoID: number | null
}

interface Presupuesto {
  preCodigo: number
  pre_cliente: number
  pre_operador: number
  pre_moneda: number
  pre_fecha: string
  pre_descuento: number
  pre_estado: number,
  pre_confirmado: number
  pre_vendedor: number
  pre_credito: number
  pre_hora: string
  pre_obs: string
  pre_flete: number
  pre_plazo: string
  pre_validez: string
  pre_condicion: string
  pre_sucursal: number
  pre_deposito: number
  pre_total: number
}

interface DetallePresupuesto {
    altura: number
    art_codigo: number
    cantidad: number
    cinco: number
    codbarra: string
    codlote: number
    depre_obs: string
    descripcion: string
    descuento: number
    det_codigo: number
    diez: number
    exentas: number
    iva: number
    precio: number
    vence: string
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

export default function PresupuestoModal({ isOpen, onClose, presupuestoID }: PresupuestoModalProps) {
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null)
  const [detallePresupuesto, setDetallePresupuesto] = useState<DetallePresupuesto[]>([])
  const [clienteInfo, setClienteInfo] = useState<Cliente | null>(null)
  const [sucursalInfo, setSucursalInfo] = useState<Sucursal | null>(null)
  const [depositoInfo, setDepositoInfo] = useState<Deposito | null>(null)
  const [vendedorInfo, setVendedorInfo] = useState<Vendedor | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { toPDF, targetRef } = usePDF({ filename: `presupuesto-${presupuestoID}.pdf` })

  useEffect(() => {
    if (isOpen && presupuestoID) {
      fetchVentaData()
    }
  }, [isOpen, presupuestoID])

  const fetchVentaData = async () => {
    if (!presupuestoID) {
      console.error("Venta ID no proporcionado")
      return
    }
  
    setIsLoading(true)
    try {
      const [ventaResponse, detalleResponse] = await Promise.all([
        axios.get(`${api_url}presupuestos/?cod=${presupuestoID}`),
        axios.get(`${api_url}presupuestos/detalles?cod=${presupuestoID}`)
      ])

      console.log(ventaResponse.data.body);
      console.log(detalleResponse.data.body);

  
      const [presupuestoData] = ventaResponse.data.body
      const detalles = detalleResponse.data.body

      setPresupuesto(presupuestoData)
      setDetallePresupuesto(detalles)
  
      await Promise.all([
        fetchClienteInfo(presupuestoData.pre_cliente),
        fetchSucursalInfo(),
        fetchDepositoInfo(),
        fetchVendedorInfo(presupuestoData.pre_vendedor)
      ])
    } catch (error) {
      console.error("Error fetching presupuesto data", error)
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
      currency: presupuesto?.pre_moneda === 1 ? 'PYG' : 'USD',
      minimumFractionDigits: presupuesto?.pre_moneda === 1 ? 0 : 2,
      maximumFractionDigits: presupuesto?.pre_moneda === 1 ? 0 : 2,
    }).format(amount)
  }


  const safeString = (value: any): string => {
    return typeof value === 'string' ? value : String(value || '')
  }

  if (isLoading || !presupuesto || !clienteInfo || !sucursalInfo || !vendedorInfo) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cargando detalles del presupuesto</ModalHeader>
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


  const total = detallePresupuesto.reduce((sum, detalle) => {
    return sum + (detalle.cantidad * detalle.precio - detalle.descuento);
  }, 0);


  const totalDescuentos = detallePresupuesto.reduce((sum, detalle)=>{
    return sum + detalle.descuento;
  }, 0)

  
  const totalFinal = total - totalDescuentos;


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
                  <ReceiptCell className="right">PRESUPUESTO Nro. {presupuestoID}</ReceiptCell>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptCell>Fecha..: {`${formatDate(presupuesto.pre_fecha)} : ${presupuesto.pre_hora}`}</ReceiptCell>
                  <ReceiptCell className="right">Sucursal.: {safeString(sucursalInfo.descripcion)}</ReceiptCell>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptCell>Moneda.: {presupuesto.pre_moneda === 1 ? 'GUARANI' : 'USD'}</ReceiptCell>
                  <ReceiptCell className="right">Depósito.: {safeString(depositoInfo?.dep_descripcion)}</ReceiptCell>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptCell>Cliente: {safeString(clienteInfo.cli_razon)}</ReceiptCell>
                  <ReceiptCell className="right">Operacion.: {safeString(presupuestoID)}</ReceiptCell>
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
                {detallePresupuesto.map((detalle, index) => (
                  <ReceiptRow key={index}>
                    <ReceiptCell>{safeString(detalle.art_codigo)}</ReceiptCell>
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
                  <ReceiptCell>Total Items: {detallePresupuesto.length}</ReceiptCell>
                  <ReceiptCell className="right">Total s/Desc.: {formatCurrency(total)}</ReceiptCell>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptCell>Condicion de pago.: {presupuesto.pre_condicion}</ReceiptCell>
                  <ReceiptCell className="right">Descuento: {formatCurrency(totalDescuentos)}</ReceiptCell>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptCell>Validez.:{presupuesto.pre_validez}</ReceiptCell>
                  <ReceiptCell className="right">Total: {formatCurrency(totalFinal)}</ReceiptCell>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptCell>Plazo de entrega.:{presupuesto.pre_plazo}</ReceiptCell>
                  <ReceiptCell className="right"></ReceiptCell>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptCell>Flete.:{presupuesto.pre_flete}</ReceiptCell>
                  <ReceiptCell className="right">Obs.:{presupuesto.pre_obs}</ReceiptCell>
                </ReceiptRow>
              </tbody>
            </ReceiptTable>
            <ReceiptDivider />
            <Text>{'<<Gracias por su preferencia>>'}</Text>
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