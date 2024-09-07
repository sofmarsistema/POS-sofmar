import PuntoDeVenta from "./views/puntodeventa/punto_de_venta"
import { ChakraProvider } from "@chakra-ui/react"

function App() {

  return (
    <ChakraProvider>
      <PuntoDeVenta />
    </ChakraProvider>
  )
}

export default App
