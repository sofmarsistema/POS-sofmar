import React, { useState, useRef, useEffect } from 'react'
import { Box, Flex, Icon, Text, Grid, GridItem, useMediaQuery, IconButton, Button } from '@chakra-ui/react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChartSpline, ShoppingCart, ScanSearch, CircleArrowUp, LogOut, Archive, SquareChartGantt, HandCoins, FilePen, DollarSign, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '@/services/AuthContext'

interface NavItem {
  name: string
  icon: React.ElementType
  path: string
  enabled: boolean
  subItems?: NavItem[]
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', icon: ChartSpline, path: '/dashboard', enabled: true },
  { 
    name: 'Ventas y Egresos', 
    icon: DollarSign, 
    path: '/ventas-y-egresos', 
    enabled: true,
    subItems: [
      { name: 'Punto de venta', icon: ShoppingCart, path: '/punto-de-venta', enabled: true },
      { name: 'Consulta de Ventas', icon: HandCoins, path: '/consulta-de-ventas', enabled: true },
      { name: 'Presupuestos', icon: SquareChartGantt, path: '/presupuestos', enabled: true },
      { name: 'Consulta de Presupuestos', icon: FilePen, path: '/consulta-de-presupuestos', enabled: true },
    ]
  },
  { name: 'Inventario', icon: Archive, path: '/inventario', enabled: true },
]

const Sidebar = () => {
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobileExpanded, setIsMobileExpanded] = useState(false)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const location = useLocation()
  const mobileBarRef = useRef<HTMLDivElement>(null)
  const {logout} = useAuth();
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    if (isLargerThan768) {
      setIsExpanded(true)
    }
  }

  const handleMouseLeave = () => {
    if (isLargerThan768) {
      setIsExpanded(false)
      setExpandedItem(null)
    }
  }

  const toggleMobileExpansion = () => {
    setIsMobileExpanded(!isMobileExpanded)
  }

  const handleLogout = () => {
    logout();
    navigate('/login')
  };

  const toggleItemExpansion = (itemName: string) => {
    setExpandedItem(expandedItem === itemName ? null : itemName)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileBarRef.current && !mobileBarRef.current.contains(event.target as Node)) {
        setIsMobileExpanded(false)
        setExpandedItem(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const renderNavItem = (item: NavItem) => (
    <GridItem key={item.name} borderTopLeftRadius="15px">
      {item.subItems ? (
        <Box>
          <Flex
            direction="column"
            align="center"
            justify="center"
            h="100%"
            px={2}
            pt={2}
            mx={2}
            mt={4}
            borderRadius={'8px'}
            transition="all 0.3s"
            className={item.enabled ? 'hover:bg-blue-100' : ''}
            opacity={item.enabled ? 1 : 0.5}
            onClick={() => toggleItemExpansion(item.name)}
            cursor="pointer"
          >
            <Icon as={item.icon} boxSize={6} color="black" />
            <Text fontSize="xs" mt={1} textAlign="center" color="black">
              {isLargerThan768 ? (isExpanded ? item.name : '') : item.name}
            </Text>
            {(isExpanded || !isLargerThan768) && (
              <Icon as={expandedItem === item.name ? ChevronUp : ChevronDown} boxSize={4} color="black" mt={1} />
            )}
          </Flex>
          {expandedItem === item.name && (
            <Box ml={isLargerThan768 && isExpanded ? 4 : 0}>
              {item.subItems.map((subItem) => (
                <Link key={subItem.name} to={subItem.path} style={{ width: '100%', height: '100%', pointerEvents: subItem.enabled ? 'auto' : 'none' }}>
                  <Flex
                    align="center"
                    px={2}
                    py={2}
                    mx={2}
                    my={1}
                    borderRadius={'8px'}
                    transition="all 0.3s"
                    className={subItem.enabled ? 'hover:bg-blue-100' : ''}
                    opacity={subItem.enabled ? 1 : 0.5}
                  >
                    <Icon as={subItem.icon} boxSize={4} color={location.pathname === subItem.path && subItem.enabled ? 'blue.500' : 'black'} mr={2} />
                    {(isExpanded || !isLargerThan768) && (
                      <Text fontSize="md" color="black">
                        {subItem.name}
                      </Text>
                    )}
                  </Flex>
                </Link>
              ))}
            </Box>
          )}
        </Box>
      ) : (
        <Link to={item.enabled ? item.path : '#'} style={{ width: '100%', height: '100%', pointerEvents: item.enabled ? 'auto' : 'none' }}>
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
            className={item.enabled ? 'hover:bg-blue-100' : ''}
            opacity={item.enabled ? 1 : 0.5}
          >
            <Icon as={item.icon} boxSize={6} color={location.pathname === item.path && item.enabled ? 'blue.500' : 'black'} />
            <Text fontSize="xs" mt={1} textAlign="center" color="black">
              {isLargerThan768 ? (isExpanded ? item.name : '') : item.name}
            </Text>
          </Flex>
        </Link>
      )}
    </GridItem>
  )

  const renderLogoutButton = () => (
    <GridItem>
      <Button
        onClick={handleLogout}
        variant="ghost"
        w="100%"
        h="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        _hover={{ bg: 'blue.100' }}
      >
        <Icon as={LogOut} boxSize={6} color="black" />
        <Text fontSize="xs" mt={1} textAlign="center" color="black">
          Cerrar Sesión
        </Text>
      </Button>
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
            {renderLogoutButton()}
          </Grid>
        ) : (
          <Grid templateColumns="repeat(4, 1fr)" h="60px">
            {NAV_ITEMS.slice(0, 2).map((item) => (
              <GridItem key={item.name}>
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  h="100%"
                  _hover={{ bg: 'blue.100' }}
                  transition="all 0.3s"
                  opacity={item.enabled ? 1 : 0.5}
                  onClick={() => item.subItems ? toggleItemExpansion(item.name) : navigate(item.path)}
                  cursor="pointer"
                >
                  <Icon as={item.icon} boxSize={6} color={location.pathname === item.path && item.enabled ? 'blue.500' : 'black'} />
                </Flex>
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
        <Box mt="auto">
          <Flex
            align='center'
            p={2}
            direction={'column'}
            onClick={handleLogout}
            _hover={{ color: 'red.500', cursor: 'pointer' }}
          >
            <LogOut />
            {isExpanded && <Text mt={1}>Cerrar Sesión</Text>}
          </Flex>
        </Box>
      </Flex>
    </Box>
  )
}

export default Sidebar