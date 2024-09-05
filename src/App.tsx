import PuntoDeVenta from "./views/punto_de_venta"
import { ChakraProvider } from "@chakra-ui/react"

function App() {

  return (
    <ChakraProvider>
      <PuntoDeVenta />
    </ChakraProvider>
  )
}

export default App
