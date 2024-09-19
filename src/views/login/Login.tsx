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

const Login: React.FC = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const ingresar = async () => {
    try {
      const response = await axios.post('https://localhost:4000/api/usuarios/login', {
        user: usuario,
        pass: password,
      });

      login(response.data.body);
      navigate('/punto-de-venta');
    } catch (error) {
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