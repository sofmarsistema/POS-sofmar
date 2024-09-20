import React, { useState, useRef, useEffect } from 'react'
import { Box, Flex, Icon, Text, Grid, GridItem, useMediaQuery, IconButton } from '@chakra-ui/react'
import { Link, useLocation } from 'react-router-dom'
import { ChartSpline, ShoppingCart, ScanSearch, Settings, CircleArrowUp, Users, CreditCard } from 'lucide-react'

interface NavItem {
  name: string
  icon: React.ElementType
  path: string
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', icon: ChartSpline, path: '/inicio' },
  { name: 'Punto de venta', icon: ShoppingCart, path: '/punto-de-venta' },
  { name: 'Compras', icon: CreditCard, path: '/compras' },
  { name: 'Inventario', icon: Users, path: '/inventario' },
  { name: 'Control de Caja', icon: Users, path: '/caja' },
  { name: 'Reportes', icon: Users, path: '/reportes' },
  { name: 'Empleados', icon: Settings, path: '/personal' },
  { name: 'Facturacion', icon: Settings, path: '/facturas' },
]

const Sidebar = () => {
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobileExpanded, setIsMobileExpanded] = useState(false)
  const location = useLocation()
  const mobileBarRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (isLargerThan768) {
      setIsExpanded(true)
    }
  }

  const handleMouseLeave = () => {
    if (isLargerThan768) {
      setIsExpanded(false)
    }
  }

  const toggleMobileExpansion = () => {
    setIsMobileExpanded(!isMobileExpanded)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileBarRef.current && !mobileBarRef.current.contains(event.target as Node)) {
        setIsMobileExpanded(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const renderNavItem = (item: NavItem) => (
    <GridItem key={item.name} borderTopLeftRadius="15px">
      <Link to={item.path} style={{ width: '100%', height: '100%', }}>
        <Flex
          direction="column"
          align="center"
          justify="center"
          h="100%"
          px={2}
          py={2}
          mx={2}
          my={4}
          borderRadius={'8px'}
          transition="all 0.3s"
          className='hover:scale-125'
        >
          <Icon as={item.icon} boxSize={6} color={location.pathname === item.path ? 'blue.500' : 'black'} />
          <Text fontSize="xs" mt={1} textAlign="center" color="black">
            {isLargerThan768 ? (isExpanded ? item.name : '') : item.name}
          </Text>
        </Flex>
      </Link>
    </GridItem>
  )

  if (!isLargerThan768) {
    return (
      <Box
        as="nav"
        pos="fixed"
        left={0}
        right={0}
        bottom={0}
        bg="white"
        color="blue.500"
        zIndex={1000}
        ref={mobileBarRef}
        h={isMobileExpanded ? 'auto' : '60px'}
        maxH="80vh"
        overflowY="auto"
        transition="max-height 0.5s ease-in-out" 
        borderTopLeftRadius="15px"
        borderTopRightRadius="15px"
        boxShadow="0 -2px 10px rgba(0, 0, 0, 0.1)"
      >
        {isMobileExpanded ? (
          <Grid templateColumns="repeat(3, 1fr)"
          gap={2}
          p={2}
          opacity={isMobileExpanded ? 1 : 0}  
          transform={isMobileExpanded ? 'translateY(0)' : 'translateY(-10px)'}  
          transition="opacity 0.4s ease, transform 0.4s ease"  

          >
            {NAV_ITEMS.map(renderNavItem)}
          </Grid>
        ) : (
          <Grid templateColumns="repeat(4, 1fr)" h="60px">
            {NAV_ITEMS.slice(0, 2).map((item) => (
              <GridItem key={item.name}>
                <Link to={item.path} style={{ width: '100%', height: '100%' }}>
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    h="100%"
                    _hover={{ bg: 'blue.100' }}
                    transition="all 0.3s"
                  >
                    <Icon as={item.icon} boxSize={6} color={location.pathname === item.path ? 'blue.500' : 'black'} />
                  </Flex>
                </Link>
              </GridItem>
            ))}
            <GridItem>
              <IconButton
                icon={<ScanSearch />}
                onClick={toggleMobileExpansion}
                aria-label="Toggle menu"
                variant="ghost"
                h="100%"
                w="100%"
                _hover={{ bg: 'blue.100' }}
                transition="background-color 0.3s ease-in-out"
                color="black"
              />
            </GridItem>
            <GridItem>
              <IconButton
                icon={<CircleArrowUp />}
                onClick={toggleMobileExpansion}
                aria-label="Toggle menu"
                variant="ghost"
                h="100%"
                w="100%"
                _hover={{ bg: 'blue.100' }}
                transition="background-color 0.3s ease-in-out"
                color="black"
              />
            </GridItem>
          </Grid>
        )}
      </Box>
    )
  }

  return (
    <Box
      as="nav"
      pos="fixed"
      left={0}
      top={0}
      h="100vh"
      w={isExpanded ? '200px' : '60px'}
      bg="white"
      color="blue.500"
      transition="all 0.3s"
      zIndex={1000}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      overflowY="auto"
      boxShadow="2px 0 10px rgba(0, 0, 0, 0.1)"
    >
      <Flex direction="column" h="100%" align="stretch">
        {NAV_ITEMS.map(renderNavItem)}
      </Flex>
    </Box>
  )
}

export default Sidebar