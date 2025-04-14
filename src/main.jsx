import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
// Initialize Firebase auth listener before mounting App
import './firebase/persistence.js'
import App from './App.jsx'

console.log('Main.jsx - Initializing app with auth listener...')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
