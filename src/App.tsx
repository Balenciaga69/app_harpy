import { HeroUIProvider } from '@heroui/react'
import { StrictMode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import { runSimpleCombat } from './modules/combat/examples/simpleCombat'
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
const result = runSimpleCombat()
console.info('xZx result', result)
export default App
