import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import 'react-toastify/dist/ReactToastify.css'
// Bootstrap and datepicker styles
//import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-datepicker/dist/react-datepicker.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
