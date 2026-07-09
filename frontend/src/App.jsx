/**
 * App.jsx — Componente raíz y sistema de rutas
 *
 * Define las rutas principales de la aplicación:
 *   /          → Página principal (tabla de clientes)
 *   /nuevo     → Formulario para crear un cliente
 *   /editar/:rut → Formulario para editar un cliente
 */

import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ClientesPage from './pages/ClientesPage.jsx';
import FormPage from './pages/FormPage.jsx';
import LoadBalancerMonitor from './components/LoadBalancerMonitor.jsx';

export default function App() {
  return (
    <div className="app-layout">
      {/* Barra de navegación fija en la parte superior */}
      <Navbar />

      {/* Contenido de cada página según la ruta */}
      <main className="page-content fade-in">
        <Routes>
          {/* Ruta principal: listado de clientes */}
          <Route path="/" element={<ClientesPage />} />

          {/* Ruta para crear un nuevo cliente */}
          <Route path="/nuevo" element={<FormPage />} />

          {/* Ruta para editar un cliente existente (por RUT) */}
          <Route path="/editar/:rut" element={<FormPage />} />
        </Routes>
        
        {/* Widget del Monitor de AWS en la parte inferior */}
        <LoadBalancerMonitor />
      </main>
    </div>
  );
}

