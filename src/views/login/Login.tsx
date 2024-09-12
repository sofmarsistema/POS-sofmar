import React, { useState } from 'react';
import { supabase } from '../../utils/supabase'; // Importar cliente de Supabase
import { Box, Button, Center, Heading, Input, Text } from '@chakra-ui/react';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Intentar iniciar sesión
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Error al iniciar sesión: ' + error.message);
    }
  };

  return (
    <Center className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12">
        <Heading as="h2" size="lg" mb={4} textAlign="center" className='text-3xl font-bold tracking-tight text-foreground'>
          Iniciar Sesión
        </Heading>
        <Text className='my-2 mb-4 text-gray-500'>Ingresa tu correo y Contraseña en el formulario</Text>
      <Box
        className="shadow-lg px-4 py-12 bg-white rounded-lg md:w-1/3 sm:w-full border"
        borderRadius="lg"
        boxShadow="md"
      >
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mb-4 w-full border rounded-lg p-0.5"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mb-4 w-full border rounded-lg p-0.5"
            />
          </div>
          {error && (
            <Text color="red.500" textAlign="center" mb={2}>
              {error}
            </Text>
          )}
          <Button
            type="submit"
            colorScheme="blue"
            width="100%"
            className="mt-2 w-full bg-blue-500 p-1 rounded-lg text-white font-bold"

          >
            Iniciar sesión
          </Button>
        </form>
      </Box>
    </Center>
  );
};

export default Login;
