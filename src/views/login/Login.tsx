import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../services/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  FormControl, 
  Input, 
  VStack, 
  Heading, 
  Text, 
  InputGroup, 
  InputLeftElement,
  useToast
} from '@chakra-ui/react';
import { LockIcon, AtSignIcon } from '@chakra-ui/icons';
import { api_url } from '@/utils';
import Auditar from '@/services/AuditoriaHook';

const Login: React.FC = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const userID = parseInt(localStorage.getItem('user_id') || '0');

  const ingresar = async () => {
    try {
      const response = await axios.post(`${api_url}usuarios/login`, {
        user: usuario,
        pass: password,
      });

      console.log('Login response:', response.data.body);
      login(response.data.body);
      navigate('/dashboard');
      
      console.log('Calling Auditar with params:', 10, 4, userID, 0, 'Inicio de Sesión desde la web');
      Auditar(10, 4, userID, 0, 'Inicio de Sesión desde la web');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Credenciales Incorrectas',
        description: 'Verifique los datos e intente nuevamente',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="md" centerContent>
      <Box padding="8" bg="white" boxShadow="md" borderRadius="lg" width="100%" mt="20">
        <VStack spacing="6">
          <Heading size="lg">Iniciar Sesión</Heading>
          <Text fontSize="sm" color="gray.500">Ingrese sus credenciales para acceder</Text>
          <FormControl>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <AtSignIcon color="gray.300" />
              </InputLeftElement>
              <Input
                type="text"
                placeholder="Usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
              />
            </InputGroup>
          </FormControl>
          <FormControl>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <LockIcon color="gray.300" />
              </InputLeftElement>
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </InputGroup>
          </FormControl>
          <Button colorScheme="blue" width="100%" onClick={ingresar}>
            Ingresar
          </Button>
        </VStack>
      </Box>
    </Container>
  );
};

export default Login;