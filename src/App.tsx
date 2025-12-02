import { HeroUIProvider } from '@heroui/react'
import { StrictMode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import { runReplayTest } from './modules/combat-impl'
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
/* eslint-disable no-console */
// Test replay system
console.info('=== Testing Replay System ===')
runReplayTest()
/* eslint-enable no-console */
export default App
