/**
 * main.jsx — Punto de entrada de la aplicación React
 *
 * Aquí se monta el componente raíz <App /> en el DOM.
 * BrowserRouter envuelve toda la app para habilitar React Router.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BrowserRouter habilita el sistema de rutas en toda la app */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
