export interface Articulo {
    id: number
    nombre: string
    precio: number
    codigo: string
  }
  
  export interface Item extends Articulo {
    precioOriginal: number
    precioUnitario: number
    cantidad: number
    impuesto: number
    subtotal: number
  }
  
  export interface Cliente {
    id: number
    nombre: string
    ruc: string
    lineaCredito: number
  }
  
  export interface Vendedor {
    id: number
    nombre: string
    codigo: string
  }