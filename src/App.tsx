import { HeroUIProvider } from '@heroui/react'
import { StrictMode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import { SandboxSimulator } from './modules/combat/shared/simulator/sandboxSimulator'
function App() {
  return (
    <StrictMode>
      <HeroUIProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<div></div>} />
          </Routes>
        </BrowserRouter>
      </HeroUIProvider>
    </StrictMode>
  )
}
SandboxSimulator()
export default App
