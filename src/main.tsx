import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { DesignSystemProvider } from './design-system/index.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DesignSystemProvider >
      <App />
    </DesignSystemProvider>
  </StrictMode>,
)
