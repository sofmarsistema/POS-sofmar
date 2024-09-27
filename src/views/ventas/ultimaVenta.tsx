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
import { usePDF } from 'react-to-pdf';


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
  venta: any | null
  detalleVentas: any[] | null
  formatCurrency: (amount: number) => string
  clienteInfo: any | null
  sucursalInfo: any | null
  vendedorInfo: any | null
  newSaleID: number | null
}

export default function VentaModal({ 
  isOpen, 
  onClose, 
  venta, 
  detalleVentas, 
  formatCurrency,
  clienteInfo,
  sucursalInfo,
  vendedorInfo,
  newSaleID
}: VentaModalProps) {
  if (!venta || !detalleVentas || !clienteInfo || !sucursalInfo || !vendedorInfo) {
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('es-PY', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const safeString = (value: any): string => {
    return typeof value === 'string' ? value : String(value || '')
  }

  const safeNumber = (value: any): number => {
    return typeof value === 'number' ? value : 0
  }

  const {toPDF, targetRef} = usePDF({filename: `factura${safeString(clienteInfo.cli_razon)}.pdf`})

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent maxWidth="800px">
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
              <Text>VENTA: {safeString(venta.ve_credito===1? 'Credito': 'Contado')}</Text>
              <Text>CONTROL INTERNO</Text>
            </ReceiptLine>
            <ReceiptLine>
              <Text>Fecha..: {`${formatDate(safeString(venta.ve_fecha))} : ${venta.ve_hora}`}</Text>
              <Text>Sucursal.: {safeString(sucursalInfo.descripcion)}</Text>
              
            </ReceiptLine>
            <ReceiptLine>
              <Text>Moneda.: {venta.ve_moneda === 1 ? 'GUARANI' : 'USD'}</Text>
              <Text>Depósito.: {safeString(venta.ve_deposito===1? 'Casa Central': null)}</Text>
            </ReceiptLine>
            <ReceiptLine>
              <Text>Cliente: {safeString(clienteInfo.cli_razon)}</Text>
              <Text>Registro.: {safeString(newSaleID)}</Text>
            </ReceiptLine>
            <ReceiptLine>
              <Text>RUC: {safeString(clienteInfo.cli_ruc)}</Text>
              <Text>Vendedor.: {safeString(vendedorInfo.op_nombre)}</Text>
            </ReceiptLine>
            <ReceiptLine>
              <Text>Teléfono.: {safeString(clienteInfo.cli_telefono)}</Text>
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
                <Text>{safeString(detalle.deve_articulo).padEnd(6)}</Text>
                <Text>{safeString(detalle.deve_descripcion).padEnd(20)}</Text>
                <Text>{safeString(detalle.deve_cantidad).padStart(5)}</Text>
                <Text>{formatCurrency(safeNumber(detalle.deve_precio)).padStart(10)}</Text>
                <Text>{formatCurrency(safeNumber(detalle.deve_descuento)).padStart(10)}</Text>
                <Text>{formatCurrency(safeNumber(detalle.deve_cantidad) * safeNumber(detalle.deve_precio)).padStart(10)}</Text>
              </ReceiptLine>
            ))}
            <ReceiptDivider />
            <ReceiptLine>
              <Text>Total Items: {detalleVentas.length}</Text>
              <Text>Total s/Desc.: {formatCurrency(safeNumber(venta.ve_total + venta.ve_descuento))}</Text>
              <Text>Subtotal c/Desc.: {formatCurrency(safeNumber(venta.ve_total))}</Text>
            </ReceiptLine>
            <ReceiptLine>
              <Text></Text>
              <Text></Text>
              <Text>Descuento: {formatCurrency(safeNumber(venta.ve_descuento))}</Text>
            </ReceiptLine>
            <ReceiptLine>
              <Text></Text>
              <Text></Text>
              <Text>Total: {formatCurrency(safeNumber(venta.ve_total))}</Text>
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
          <Button colorScheme="green" mr={3} onClick={()=> toPDF()}>
            Descargar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}