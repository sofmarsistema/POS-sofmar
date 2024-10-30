import { useState, useEffect} from 'react';
import axios from 'axios';
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  Divider,
  useColorModeValue,
  Image,
  useToast,
} from '@chakra-ui/react';
import { usePDF } from 'react-to-pdf';
import { api_url } from '@/utils';

interface PresupuestoModalProps {
  isOpen: boolean;
  onClose: () => void;
  presupuestoID: number | null;
}

interface Presupuesto {
  preCodigo: number;
  pre_cliente: number;
  pre_operador: number;
  pre_moneda: number;
  pre_fecha: string;
  pre_descuento: number;
  pre_estado: number;
  pre_confirmado: number;
  pre_vendedor: number;
  pre_credito: number;
  pre_hora: string;
  pre_obs: string;
  pre_flete: number;
  pre_plazo: string;
  pre_validez: string;
  pre_condicion: string;
  pre_sucursal: number;
  pre_deposito: number;
  pre_total: number;
}

interface DetallePresupuesto {
  altura: number;
  art_codigo: number;
  cantidad: number;
  cinco: number;
  codbarra: string;
  codlote: number;
  depre_obs: string;
  descripcion: string;
  descuento: number;
  det_codigo: number;
  diez: number;
  exentas: number;
  iva: number;
  precio: number;
  vence: string;
}

interface Cliente {
  cli_codigo: number;
  cli_razon: string;
  cli_ruc: string;
  cli_tel: string;
}

interface Sucursal {
  id: number;
  descripcion: string;
  ciudad: string;
  tel: string;
  nombre_emp: string;
}

interface Deposito {
  dep_codigo: number;
  dep_descripcion: string;
}

interface Vendedor {
  id: number;
  op_nombre: string;
  op_codigo: string;
}

export default function PresupuestoModalEstilizado({ isOpen, onClose, presupuestoID }: PresupuestoModalProps) {
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null);
  const [detallePresupuesto, setDetallePresupuesto] = useState<DetallePresupuesto[]>([]);
  const [clienteInfo, setClienteInfo] = useState<Cliente | null>(null);
  const [sucursalInfo, setSucursalInfo] = useState<Sucursal | null>(null);
  const [depositoInfo, setDepositoInfo] = useState<Deposito | null>(null);
  const [vendedorInfo, setVendedorInfo] = useState<Vendedor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const { toPDF, targetRef } = usePDF({ filename: `presupuesto-${presupuestoID}.pdf` });

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();

  useEffect(() => {
    if (isOpen && presupuestoID) {
      fetchVentaData();
      fetchLogo();
    }
  }, [isOpen, presupuestoID]);

  const fetchVentaData = async () => {
    if (!presupuestoID) {
      console.error("Venta ID no proporcionado");
      return;
    }

    setIsLoading(true);
    try {
      const [ventaResponse, detalleResponse] = await Promise.all([
        axios.get(`${api_url}presupuestos/?cod=${presupuestoID}`),
        axios.get(`${api_url}presupuestos/detalles?cod=${presupuestoID}`)
      ]);

      console.log(ventaResponse.data.body);
      console.log(detalleResponse.data.body);

      const [presupuestoData] = ventaResponse.data.body;
      const detalles = detalleResponse.data.body;

      setPresupuesto(presupuestoData);
      setDetallePresupuesto(detalles);

      await Promise.all([
        fetchClienteInfo(presupuestoData.pre_cliente),
        fetchSucursalInfo(),
        fetchDepositoInfo(),
        fetchVendedorInfo(presupuestoData.pre_vendedor)
      ]);
    } catch (error) {
      console.error("Error fetching presupuesto data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogo = async () => {
    try {
      const response = await axios.get(`${api_url}archivos/latest/logo`, { responseType: 'blob' });
      const imageUrl = URL.createObjectURL(response.data);
      setLogoUrl(imageUrl);
    } catch (error) {
      console.error("Error fetching logo", error);
      toast({
        title: 'Error',
        description: 'No se pudo obtener el logo.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchClienteInfo = async (clienteId: number) => {
    try {
      const response = await axios.get(`${api_url}clientes/${clienteId}`);
      const clienteData = Array.isArray(response.data.body) && response.data.body.length > 0
        ? response.data.body[0]
        : null;
      setClienteInfo(clienteData);
    } catch (error) {
      console.error("Error fetching cliente info", error);
    }
  };

  const fetchSucursalInfo = async () => {
    try {
      const response = await axios.get(`${api_url}sucursales/listar`);
      const sucursalData = Array.isArray(response.data.body) && response.data.body.length > 0
        ? response.data.body[0]
        : null;
      setSucursalInfo(sucursalData);
    } catch (error) {
      console.error("Error fetching sucursal info", error);
    }
  };

  const fetchDepositoInfo = async () => {
    try {
      const response = await axios.get(`${api_url}depositos`);
      const depositoData = Array.isArray(response.data.body) && response.data.body.length > 0
        ? response.data.body[0]
        : null;
      setDepositoInfo(depositoData);
    } catch (error) {
      console.error("Error fetching deposito info", error);
    }
  };

  const fetchVendedorInfo = async (vendedorId: number) => {
    try {
      const response = await axios.get(`${api_url}usuarios/${vendedorId}`);
      const vendedorData = Array.isArray(response.data.body) && response.data.body.length > 0
        ? response.data.body[0]
        : null;
      setVendedorInfo(vendedorData);
    } catch (error) {
      console.error("Error fetching vendedor info", error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('es-PY', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: presupuesto?.pre_moneda === 1 ? 'PYG' : 'USD',
      minimumFractionDigits: presupuesto?.pre_moneda === 1 ? 0 : 2,
      maximumFractionDigits: presupuesto?.pre_moneda === 1 ? 0 : 2,
    }).format(amount);
  };

  const safeString = (value: any): string => {
    return typeof value === 'string' ? value : String(value || '');
  };

  if (isLoading || !presupuesto || !clienteInfo || !sucursalInfo || !vendedorInfo) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cargando detalles del presupuesto</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex justify="center" align="center" height="200px">
              <Spinner size="xl" />
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  const total = detallePresupuesto.reduce((sum, detalle) => {
    return sum + (detalle.cantidad * detalle.precio - detalle.descuento);
  }, 0);

  const totalDescuentos = detallePresupuesto.reduce((sum, detalle) => {
    return sum + detalle.descuento;
  }, 0);

  const totalFinal = total - totalDescuentos;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxWidth="1200px" bg={bgColor} color={textColor}>
        <ModalHeader borderBottom="1px" borderColor={borderColor}>Presupuesto Nro. {presupuestoID}</ModalHeader>
        <ModalCloseButton />
        <ModalBody p={8} ref={targetRef}>
          <VStack spacing={6} align="stretch">
            <Box textAlign="end" display={'flex'} justifyContent={'space-between'} alignContent={'center'}>
            {logoUrl && <Image src={logoUrl} alt='logo' boxSize='120px' />}
              <Box>
                <Text fontSize="2xl" fontWeight="bold">{safeString(sucursalInfo.nombre_emp)}</Text>
                <Text>Filial: {safeString(sucursalInfo.descripcion)} | Ciudad: Ciudad del Este | Telef.: {safeString(sucursalInfo.tel)}</Text>
                <Text>Presupuesto Nro. {presupuestoID}</Text>
              </Box>
            </Box>
            <Divider />
            <HStack justify="space-between" wrap="wrap">
              <VStack align="start" spacing={1}>
                <Text><strong>Fecha:</strong> {`${formatDate(presupuesto.pre_fecha)} : ${presupuesto.pre_hora}`}</Text>
                <Text><strong>Moneda:</strong> {presupuesto.pre_moneda === 1 ? 'GUARANI' : 'USD'}</Text>
                <Text><strong>Cliente:</strong> {safeString(clienteInfo.cli_razon)}</Text>
                <Text><strong>RUC:</strong> {safeString(clienteInfo.cli_ruc)}</Text>
                <Text><strong>Teléfono:</strong> {safeString(clienteInfo.cli_tel)}</Text>
              </VStack>
              <VStack align="end" spacing={1}>
                <Text><strong>Sucursal:</strong> {safeString(sucursalInfo.descripcion)}</Text>
                <Text><strong>Depósito:</strong> {safeString(depositoInfo?.dep_descripcion)}</Text>
                <Text><strong>Operación:</strong> {safeString(presupuestoID)}</Text>
                <Text><strong>Vendedor:</strong> {safeString(vendedorInfo.op_nombre)}</Text>
                <Text><strong>Ciudad:</strong> Ciudad del Este</Text>
              </VStack>
            </HStack>
            <Divider />
            <Table variant="striped" size="sm">
              <Thead mb={8}>
                <Tr>
                  <Th>Cód</Th>
                  <Th>Descripción</Th>
                  <Th isNumeric>Cant</Th>
                  <Th isNumeric>Precio U.</Th>
                  <Th isNumeric>Desc.</Th>
                  <Th isNumeric>Valor</Th>
                </Tr>
              </Thead>
              <Tbody>
                {detallePresupuesto.map((detalle, index) => (
                  <Tr key={index}>
                    <Td>{safeString(detalle.art_codigo)}</Td>
                    <Td>{safeString(detalle.descripcion)}</Td>
                    <Td isNumeric>{safeString(detalle.cantidad)}</Td>
                    <Td isNumeric>{formatCurrency(detalle.precio)}</Td>
                    <Td isNumeric>{formatCurrency(detalle.descuento)}</Td>
                    <Td isNumeric>{formatCurrency(detalle.cantidad * detalle.precio - detalle.descuento)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Divider />
            <HStack justify="space-between">
              <VStack align={'start'}>
                <Text>Total Items: {detallePresupuesto.length}</Text>
                <Text>Condición: {safeString(presupuesto.pre_condicion)}</Text>
                <Text>Validez: {safeString(presupuesto.pre_validez)}</Text>
                <Text>Plazo: {safeString(presupuesto.pre_plazo)}</Text>
                <Text>Obs.: {safeString(presupuesto.pre_obs)}</Text>
              </VStack>
              <VStack align="end" spacing={1}>
                <Text><strong>Total s/Desc.:</strong> {formatCurrency(total)}</Text>
                <Text><strong>Descuento:</strong> {formatCurrency(totalDescuentos)}</Text>
                <Text fontSize="xl" fontWeight="bold"><strong>Total:</strong> {formatCurrency(totalFinal)}</Text>
              </VStack>
            </HStack>
            <Box textAlign="center" mt={4}>
              <Text fontSize="lg" fontStyle="italic">{'Gracias por su preferencia'}</Text>
            </Box>
            <Box mt={4} borderTop="1px" borderColor={borderColor} pt={4}>
              <Text>Firma: _________________</Text>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter borderTop="1px" borderColor={borderColor}>
          <Button colorScheme="red" mr={3} onClick={onClose}>
            Cerrar
          </Button>
          <Button colorScheme="green" onClick={() => toPDF()}>
            Descargar PDF
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}