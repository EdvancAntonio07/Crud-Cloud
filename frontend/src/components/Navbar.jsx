/**
 * Navbar.jsx — Barra de navegación superior
 *
 * Aparece en todas las páginas (definida en App.jsx).
 * Muestra el nombre de la app y un botón para agregar cliente.
 */

import { Link, useLocation } from 'react-router-dom';
import { Users, Plus } from 'lucide-react';
import NodeBadge from './NodeBadge';

export default function Navbar() {
  const location = useLocation();

  // Solo mostramos el botón "Nuevo cliente" en la página principal
  const esInicio = location.pathname === '/';

  return (
    <nav className="navbar">
      {/* Logo / Marca */}
      <Link to="/" className="navbar-brand">
        <div className="brand-icon"><Users size={20} /></div>
        <span className="brand-name">
          Gestión<span> Clientes</span>
        </span>
      </Link>

      {/* Acciones de la derecha */}
      <div className="navbar-actions">
        {/* Badge del nodo backend activo */}
        <NodeBadge />

        {esInicio && (
          <Link to="/nuevo" className="btn btn-primary">
            <Plus size={16} /> Nuevo Cliente
          </Link>
        )}
      </div>
    </nav>
  );
}
