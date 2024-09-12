import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { usePDF } from "react-to-pdf";
import { Button } from "@chakra-ui/react";

interface Cliente {
  id: number;
  nombre: string;
  ruc: string;
}

interface Venta {
  id: number;
  fecha: string;
  sucursal_id: number;
  deposito_id: number;
  vendedor_id: number;
  cliente_id: number;
  condicion: string;
  total: number;
}

interface ItemVendido {
  id: number;
  venta_id: number;
  articulo_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  impuesto5: number;
  impuesto10: number;
  exentas: number;
  nombre_articulo: string;
}

interface Sucursal {
  id: number;
  nombre: string;
}

interface Deposito {
  id: number;
  nombre: string;
}

interface Vendedor {
  id: number;
  nombre: string;
}

interface InvoiceProps {
  ventaId: number;
}

export default function Invoice({ ventaId }: InvoiceProps) {
  const [venta, setVenta] = useState<Venta | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [itemsVendidos, setItemsVendidos] = useState<ItemVendido[]>([]);
  const [sucursal, setSucursal] = useState<Sucursal | null>(null);
  const [deposito, setDeposito] = useState<Deposito | null>(null);
  const [vendedor, setVendedor] = useState<Vendedor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toPDF, targetRef } = usePDF({ filename: `factura_${ventaId}.pdf` });

  useEffect(() => {
    const fetchInvoiceData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch venta
        const { data: ventaData, error: ventaError } = await supabase
          .from('ventas')
          .select('*')
          .eq('id', ventaId)
          .single();
        
        if (ventaError) throw new Error(`Error fetching venta: ${ventaError.message}`);
        setVenta(ventaData);

        // Fetch cliente
        if (ventaData.cliente_id) {
          const { data: clienteData, error: clienteError } = await supabase
            .from('clientes')
            .select('*')
            .eq('id', ventaData.cliente_id)
            .single();
          
          if (clienteError) throw new Error(`Error fetching cliente: ${clienteError.message}`);
          setCliente(clienteData);
        }

        // Fetch sucursal
        if (ventaData.sucursal_id) {
          const { data: sucursalData, error: sucursalError } = await supabase
            .from('sucursales')
            .select('*')
            .eq('id', ventaData.sucursal_id)
            .single();
          
          if (sucursalError) throw new Error(`Error fetching sucursal: ${sucursalError.message}`);
          setSucursal(sucursalData);
        }

        // Fetch deposito
        if (ventaData.deposito_id) {
          const { data: depositoData, error: depositoError } = await supabase
            .from('depositos')
            .select('*')
            .eq('id', ventaData.deposito_id)
            .single();
          
          if (depositoError) throw new Error(`Error fetching deposito: ${depositoError.message}`);
          setDeposito(depositoData);
        }

        // Fetch vendedor
        if (ventaData.vendedor_id) {
          const { data: vendedorData, error: vendedorError } = await supabase
            .from('vendedores')
            .select('*')
            .eq('id', ventaData.vendedor_id)
            .single();
          
          if (vendedorError) throw new Error(`Error fetching vendedor: ${vendedorError.message}`);
          setVendedor(vendedorData);
        }

        // Fetch items vendidos with articulo details
        const { data: itemsData, error: itemsError } = await supabase
          .from('items_venta')
          .select(`
            *,
            articulos (
              nombre
            )
          `)
          .eq('venta_id', ventaId);
        
        if (itemsError) throw new Error(`Error fetching items vendidos: ${itemsError.message}`);
        setItemsVendidos(itemsData.map(item => ({
          ...item,
          nombre_articulo: item.articulos?.nombre || 'Nombre no disponible'
        })));

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoiceData();
  }, [ventaId]);

  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount == null) return 'N/A';
    return `Gs. ${amount.toLocaleString('es-PY')}`;
  };

  const calculateTotals = () => {
    let totalExentas = 0;
    let total5 = 0;
    let total10 = 0;

    itemsVendidos.forEach(item => {
      totalExentas += item.exentas || 0;
      total5 += item.impuesto5 || 0;
      total10 += item.impuesto10 || 0;
    });

    return { totalExentas, total5, total10 };
  };

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!venta || !cliente) return <div>No se encontraron datos de la venta o del cliente.</div>;

  const { totalExentas, total5, total10 } = calculateTotals();

  return (
    <div>
        <div className="p-8 max-w-4xl mx-auto" ref={targetRef}>
        <h1 className="text-3xl font-bold mb-6">Factura</h1>
        
        <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Datos de la Venta</h2>
            <p>Fecha: {new Date(venta.fecha).toLocaleDateString()}</p>
            <p>Sucursal: {sucursal?.nombre || 'N/A'}</p>
            <p>Depósito: {deposito?.nombre || 'N/A'}</p>
            <p>Vendedor: {vendedor?.nombre || 'N/A'}</p>
            <p>Condición: {venta.condicion || 'N/A'}</p>
        </div>

        <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Datos del Cliente</h2>
            <p>Nombre: {cliente.nombre}</p>
            <p>RUC: {cliente.ruc}</p>
        </div>

        <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Artículos Vendidos</h2>
            <table className="w-full border-collapse">
            <thead>
                <tr className="bg-gray-200">
                <th className="border p-2">Nombre</th>
                <th className="border p-2">Cantidad</th>
                <th className="border p-2">Precio Unitario</th>
                <th className="border p-2">Subtotal</th>
                <th className="border p-2">IVA 5%</th>
                <th className="border p-2">IVA 10%</th>
                <th className="border p-2">Exentas</th>
                </tr>
            </thead>
            <tbody>
                {itemsVendidos.map((item) => (
                <tr key={item.id}>
                    <td className="border p-2">{item.nombre_articulo}</td>
                    <td className="border p-2">{item.cantidad}</td>
                    <td className="border p-2">{formatCurrency(item.precio_unitario)}</td>
                    <td className="border p-2">{formatCurrency(item.subtotal)}</td>
                    <td className="border p-2">{formatCurrency(item.impuesto5)}</td>
                    <td className="border p-2">{formatCurrency(item.impuesto10)}</td>
                    <td className="border p-2">{formatCurrency(item.exentas)}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>

        <div>
            <h2 className="text-xl font-semibold mb-2">Totales</h2>
            <p>Total Exentas: {formatCurrency(totalExentas)}</p>
            <p>Total 5%: {formatCurrency(total5)}</p>
            <p>Total 10%: {formatCurrency(total10)}</p>
            <p className="font-bold">Total: {formatCurrency(venta.total)}</p>
        </div>
        
        </div>
        <div className="flex flex-row align-center justify-center ">
        <Button 
            onClick={() => toPDF()} 
            className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Generar PDF
        </Button>
        </div>
    </div>
  );
}