import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "../src/styles/global.css";
import "./styles/buttons.css";
import "./styles/forms.css";
import "./styles/tables.css";
import "./styles/task-list.css";
import "./styles/dashboard.css";
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
