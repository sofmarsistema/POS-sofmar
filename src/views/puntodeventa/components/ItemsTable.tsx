
import { Box, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react'
import { Item } from '../types'

interface ItemsTableProps {
  items: Item[]
  formatCurrency: (amount: number, moneda: string) => string
  moneda: string
}

export default function ItemsTable({ items, formatCurrency, moneda }: ItemsTableProps) {
  return (
    <Box overflowX="auto">
      <Table variant="striped">
        <Thead>
          <Tr>
            <Th>Código</Th>
            <Th>Nombre</Th>
            <Th isNumeric>Precio</Th>
            <Th isNumeric>Cantidad</Th>
            <Th isNumeric>Impuesto</Th>
            <Th isNumeric>Subtotal</Th>
          </Tr>
        </Thead>
        <Tbody>
          {items.map((item, index) => (
            <Tr key={index}>
              <Td>{item.id}</Td>
              <Td>{item.nombre}</Td>
              <Td isNumeric>{formatCurrency(item.precioUnitario, moneda)}</Td>
              <Td isNumeric>{item.cantidad}</Td>
              <Td isNumeric>{formatCurrency(item.impuesto, moneda)}</Td>
              <Td isNumeric>{formatCurrency(item.subtotal, moneda)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}