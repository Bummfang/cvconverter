import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Program from './components/program/App.tsx'
import './index.css'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Program />
  </StrictMode>,
)
