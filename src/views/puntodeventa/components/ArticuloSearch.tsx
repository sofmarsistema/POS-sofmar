import React, { useState } from 'react'
import { Box, Button, Flex, Input } from '@chakra-ui/react'
import { Search } from 'lucide-react'
import { Articulo, Item } from '../types'
import { calcularImpuesto } from '../utils'

interface ArticuloSearchProps {
  articulos: Articulo[]
  moneda: string
  impuestos: string[]
  agregarItem: (item: Item) => void
  isMobile: boolean
}

export default function ArticuloSearch({
  articulos,
  moneda,
  impuestos,
  agregarItem,
  isMobile
}: ArticuloSearchProps) {
  const [busqueda, setBusqueda] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [selectedItem, setSelectedItem] = useState<Articulo | null>(null)

  const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value)
    setSelectedItem(null)
  }

  const handleSeleccion = (articulo: Articulo) => {
    setSelectedItem(articulo)
    setBusqueda(articulo.nombre)
  }

  const handleAgregar = () => {
    if (selectedItem) {
      const precioEnMonedaActual = selectedItem.precio
      const impuesto = calcularImpuesto(precioEnMonedaActual, impuestos)
      const nuevoItem: Item = {
        id: selectedItem.id,
        nombre: selectedItem.nombre,
        precio: selectedItem.precio, // Add the 'precio' property
        codigo: selectedItem.codigo, // Add the 'codigo' property
        precioOriginal: selectedItem.precio,
        precioUnitario: precioEnMonedaActual,
        cantidad,
        impuesto: impuesto * cantidad,
        subtotal: (precioEnMonedaActual + impuesto) * cantidad,
      }
      agregarItem(nuevoItem)
      setBusqueda('')
      setCantidad(1)
      setSelectedItem(null)
    }
  }

  return (
    <Flex gap={4} mb={6} flexDirection={isMobile ? 'column' : 'row'}>
      <Box position="relative" flexGrow={1}>
        <Input 
          placeholder="Buscar artículo" 
          value={busqueda} 
          onChange={handleBusqueda}
        />
        {busqueda && !selectedItem && (
          <Box
            position="absolute"
            top="100%"
            left={0}
            zIndex={1}
            width="100%"
            bg="white"
            boxShadow="md"
            borderRadius="md"
          >
            {articulos
              .filter(a => a.nombre.toLowerCase().includes(busqueda.toLowerCase()) || a.codigo.toLowerCase().includes(busqueda.toLowerCase()))
              .slice(0, 5)
              .map(a => (
                <Box
                  key={a.id}
                  p={2}
                  _hover={{bg: 'gray.100'}}
                  onClick={() => handleSeleccion(a)}
                >
                  {a.nombre} - {a.codigo}
                </Box>
              ))
            }
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
      <Button colorScheme="green" onClick={handleAgregar} flexShrink={0} isDisabled={!selectedItem}>
        <Search size={20} className="mr-2" /> Agregar
      </Button>
    </Flex>
  )
}