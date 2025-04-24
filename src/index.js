import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
const config = defineConfig({
  theme: {
    tokens: {
      colors: {},
    },
  },
})

const system = createSystem(defaultConfig, config)
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ChakraProvider value={system}>
          <ToastContainer />
    <App />

  </ChakraProvider>
);
