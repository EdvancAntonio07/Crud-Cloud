/**
 * ClienteTable.jsx — Tabla principal de clientes
 *
 * Muestra todos los clientes activos en una tabla con acciones.
 * Cada fila tiene botones para editar, desactivar y eliminar.
 *
 * Props:
 *   clientes     → Array de clientes a mostrar
 *   onEditar     → fn(cliente) — navega al formulario de edición
 *   onDesactivar → fn(cliente) — abre modal borrado lógico
 *   onEliminar   → fn(cliente) — abre modal borrado físico
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Pencil, Ban, Trash2, ChevronDown, ChevronRight, Mail, MapPin, Calendar, Tag, IdCard, RefreshCw } from 'lucide-react';
import Badge from './Badge.jsx';

function ClienteRow({ cliente, onDesactivar, onEliminar, onActivar }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr 
        onClick={() => setExpanded(!expanded)} 
        style={{ cursor: 'pointer', opacity: cliente.activo ? 1 : 0.55, transition: 'opacity 0.2s' }}
        className={expanded ? 'row-expanded' : ''}
      >
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {expanded ? <ChevronDown size={16} color="var(--text-secondary)" /> : <ChevronRight size={16} color="var(--text-secondary)" />}
            <span className="td-name">{cliente.nombre} {cliente.apellido}</span>
          </div>
        </td>
        <td>{cliente.telefono}</td>
        <td>
          <Badge
            tipo={cliente.activo ? 'active' : 'inactive'}
            texto={cliente.activo ? 'Activo' : 'Inactivo'}
          />
        </td>
        <td onClick={(e) => e.stopPropagation()}>
          <div className="td-actions">
            <Link
              to={`/editar/${encodeURIComponent(cliente.rut)}`}
              className="btn btn-secondary btn-sm"
              title="Editar"
            >
              <Pencil size={14} />
            </Link>
            {cliente.activo ? (
              <button
                className="btn btn-warning btn-sm"
                onClick={() => onDesactivar(cliente)}
                title="Desactivar"
              >
                <Ban size={14} />
              </button>
            ) : (
              <button
                className="btn btn-success btn-sm"
                onClick={() => onActivar(cliente)}
                title="Reactivar"
              >
                <RefreshCw size={14} />
              </button>
            )}
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onEliminar(cliente)}
              title="Eliminar"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>
      
      {/* ── Fila de detalles expandible ── */}
      {expanded && (
        <tr className="expanded-details-row">
          <td colSpan="4" style={{ padding: 0, borderBottom: '1px solid var(--border-color)' }}>
            <div className="expanded-details-content">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label"><IdCard size={14}/> RUT</span>
                  <span className="detail-value td-rut">{cliente.rut}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label"><Mail size={14}/> Correo Electrónico</span>
                  <span className="detail-value">{cliente.correo || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label"><MapPin size={14}/> Dirección Completa</span>
                  <span className="detail-value">{cliente.direccion || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label"><MapPin size={14}/> Ciudad</span>
                  <span className="detail-value">{cliente.ciudad || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label"><Tag size={14}/> Categoría</span>
                  <span className="detail-value"><Badge tipo="categoria" texto={cliente.categoria || '—'} /></span>
                </div>
                <div className="detail-item">
                  <span className="detail-label"><Calendar size={14}/> Fecha de Registro</span>
                  <span className="detail-value">{cliente.fecha_registro ? new Date(cliente.fecha_registro).toLocaleDateString('es-CL') : '—'}</span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function ClienteTable({ clientes, onDesactivar, onEliminar, onActivar }) {
  if (clientes.length === 0) {
    return (
      <div className="table-wrapper">
        <div className="empty-state">
          <div className="empty-icon"><Users size={48} /></div>
          <h3>Sin clientes registrados</h3>
          <p>Aún no hay clientes en el sistema.</p>
          <Link to="/nuevo" className="btn btn-primary">
            <Users size={16} /> Agregar primer cliente
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(cliente => (
            <ClienteRow 
              key={cliente.rut} 
              cliente={cliente} 
              onDesactivar={onDesactivar} 
              onEliminar={onEliminar} 
              onActivar={onActivar}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
