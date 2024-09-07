import React from 'react'
import { Flex, Heading } from '@chakra-ui/react'
import { ShoppingCart } from 'lucide-react'

interface HeaderProps {
  isMobile: boolean
}

export default function Header({ isMobile }: HeaderProps) {
  return (
    <Flex bgGradient="linear(to-r, blue.500, blue.600)" color="white" p={isMobile ? 4 : 6} alignItems="center" rounded="lg">
      <ShoppingCart size={24} className="mr-2" />
      <Heading size={isMobile ? 'md' : 'lg'}>Punto de Venta</Heading>
    </Flex>
  )
}