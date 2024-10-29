import React, { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Select,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  Flex,
  useMediaQuery,
  Badge,
  Button,
  ButtonGroup,
} from "@chakra-ui/react"
import { Clock, ShoppingCart, User, DollarSign } from 'lucide-react'

interface Order {
  id: number
  name: string
  client: string
  total: number
  status: 'recibido' | 'listo' | 'entregado'
}

const useOrderData = (): [Order[], React.Dispatch<React.SetStateAction<Order[]>>] => {
  const [orders, setOrders] = useState<Order[]>([])
  
  useEffect(() => {
    const fetchData = async () => {
      const data: Order[] = [
        { id: 1, name: 'Hamburguesa Deluxe', client: 'Juan Pérez', total: 15.99, status: 'recibido' },
        { id: 2, name: 'Pizza Familiar', client: 'María García', total: 22.50, status: 'listo' },
        { id: 3, name: 'Ensalada César', client: 'Carlos Rodríguez', total: 10.99, status: 'entregado' },
        { id: 4, name: 'Pasta Alfredo', client: 'Ana Martínez', total: 18.75, status: 'recibido' },
        { id: 5, name: 'Sushi Variado', client: 'Luis Sánchez', total: 30.00, status: 'listo' },
      ]
      setOrders(data)
    }
    fetchData()
  }, [])

  return [orders, setOrders]
}

const RestaurantOrders: React.FC = () => {
  const [orders, setOrders] = useOrderData()
  const [filter, setFilter] = useState<'todos' | 'recibido' | 'listo' | 'entregado' | 'enespera'>('todos')
  const [isMobile] = useMediaQuery('(max-width: 48em)')

  const filteredOrders = orders.filter(order => 
    filter === 'todos' ? true : order.status === filter
  )

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'recibido':
        return 'red'
      case 'listo':
        return 'yellow'
      case 'entregado':
        return 'green'
      default:
        return 'gray'
    }
  }

  const changeOrderStatus = (orderId: number, newStatus: Order['status']) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    )
  }

  return (
    <Box maxW="full" mx="auto" py={8} px={4}>
      <Flex bgGradient="linear(to-r, blue.500, blue.600)" color="white" p={isMobile ? 4 : 6} alignItems="center" rounded="lg" mb={6}>
        <Clock size={24} className="mr-2" />
        <Heading size={isMobile ? 'sm' : 'md'}>Pedidos</Heading>
      </Flex>
      
      <Box mb={6}>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          width="200px"
        >
          <option value="todos">Todos</option>
          <option value="recibido">Recibidos</option>
          <option value="listo">Listos</option>
          <option value="entregado">Entregados</option>
          <option value="enespera">En espera</option>
        </Select>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {filteredOrders.map((order) => (
          <Card key={order.id} borderTop="4px solid" borderTopColor={getStatusColor(order.status)}>
            <CardHeader>
              <Flex justifyContent="space-between" alignItems="center">
                <Heading size="md">{order.name}</Heading>
                <Badge colorScheme={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </Flex>
            </CardHeader>
            <CardBody>
              <Flex alignItems="center" mb={2}>
                <User size={16} className="mr-2" />
                <Text>{order.client}</Text>
              </Flex>
              <Flex alignItems="center">
                <DollarSign size={16} className="mr-2" />
                <Text>${order.total.toFixed(2)}</Text>
              </Flex>
            </CardBody>
            <CardFooter>
              <Flex direction="column" w="100%">
                <Flex alignItems="center" mb={4}>
                  <ShoppingCart size={16} className="mr-2" />
                  <Text>Pedido #{order.id}</Text>
                </Flex>
                <ButtonGroup size="sm" isAttached variant="outline">
                  <Button
                    onClick={() => changeOrderStatus(order.id, 'recibido')}
                    colorScheme={order.status === 'recibido' ? 'red' : 'gray'}
                    isDisabled={order.status === 'recibido'}
                  >
                    Recibido
                  </Button>
                  <Button
                    onClick={() => changeOrderStatus(order.id, 'listo')}
                    colorScheme={order.status === 'listo' ? 'yellow' : 'gray'}
                    isDisabled={order.status === 'listo'}
                  >
                    Listo
                  </Button>
                  <Button
                    onClick={() => changeOrderStatus(order.id, 'entregado')}
                    colorScheme={order.status === 'entregado' ? 'green' : 'gray'}
                    isDisabled={order.status === 'entregado'}
                  >
                    Entregado
                  </Button>
                </ButtonGroup>
              </Flex>
            </CardFooter>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  )
}

export default RestaurantOrders