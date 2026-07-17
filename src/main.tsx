import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { WebSocketProvider } from './context/WebSocketContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <WebSocketProvider>
          <App />
        </WebSocketProvider>

      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
