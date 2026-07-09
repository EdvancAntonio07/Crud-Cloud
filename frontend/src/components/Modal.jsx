/**
 * Modal.jsx — Diálogo de confirmación
 *
 * Aparece antes de borrar un cliente (lógico o físico).
 * Requiere confirmación explícita del usuario.
 *
 * Props:
 *   abierto      → boolean — controla si se muestra
 *   tipo         → 'logico' | 'fisico'
 *   cliente      → objeto con datos del cliente a borrar
 *   onConfirmar  → función llamada al confirmar
 *   onCancelar   → función llamada al cancelar
 *   cargando     → boolean — deshabilita botones mientras procesa
 */

import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function Modal({ abierto, tipo, cliente, onConfirmar, onCancelar, cargando }) {
  if (!abierto) return null;

  const esFisico = tipo === 'fisico';

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        
        {/* Ícono superior */}
        <div className={`modal-icon ${esFisico ? 'danger' : 'warning'}`}>
          {esFisico ? <Trash2 size={24} /> : <AlertTriangle size={24} />}
        </div>

        {/* Textos */}
        <h2 className="modal-title">
          {esFisico ? 'Eliminar permanentemente' : 'Desactivar cliente'}
        </h2>
        
        <p className="modal-desc">
          {esFisico ? (
            <>
              Estás a punto de eliminar a <strong>{cliente?.nombre} {cliente?.apellido}</strong>. 
              Esta acción no se puede deshacer y los datos se borrarán definitivamente.
            </>
          ) : (
            <>
              ¿Deseas desactivar a <strong>{cliente?.nombre} {cliente?.apellido}</strong>? 
              El cliente se ocultará de la lista principal, pero podrás reactivarlo luego.
            </>
          )}
        </p>

        {/* Botones */}
        <div className="modal-actions">
          <button
            className="btn btn-outline"
            onClick={onCancelar}
            disabled={cargando}
          >
            Cancelar
          </button>
          
          <button
            className={`btn ${esFisico ? 'btn-danger' : 'btn-warning'}`}
            onClick={onConfirmar}
            disabled={cargando}
          >
            {cargando ? 'Procesando...' : (esFisico ? 'Eliminar' : 'Desactivar')}
          </button>
        </div>
      </div>
    </div>
  );
}
