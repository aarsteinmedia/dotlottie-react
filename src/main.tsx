import App from '@src/App.tsx'
import { StrictMode } from 'react'
import '@src/index.css'
import { createRoot } from 'react-dom/client'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Document root is not set')
}

createRoot(root).render(<StrictMode>
  <App />
</StrictMode>)
