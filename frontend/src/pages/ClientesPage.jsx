/**
 * ClientesPage.jsx — Página principal del CRUD
 *
 * Muestra:
 *   - Tarjetas de estadísticas (total clientes)
 *   - Barra de búsqueda por nombre o RUT
 *   - Tabla de clientes activos con acciones
 *   - Modal de confirmación para borrar
 *
 * Flujo:
 *   1. Al cargar, pide GET /api/clientes/
 *   2. El usuario puede filtrar en tiempo real
 *   3. Editar → navega a /editar/:rut
 *   4. Desactivar → DELETE /api/clientes/:rut/  (activo=False)
 *   5. Eliminar → DELETE /api/clientes/:rut/eliminar/ (permanente)
 */

import { useState, useEffect, useMemo } from 'react';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import api from '../api/axios.js';
import ClienteTable from '../components/ClienteTable.jsx';
import Modal from '../components/Modal.jsx';
import Spinner from '../components/Spinner.jsx';

export default function ClientesPage() {
  // ── Estado ──────────────────────────────────────
  const [clientes, setClientes]       = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [busqueda, setBusqueda]       = useState('');
  const [alerta, setAlerta]           = useState(null);   // { tipo, msg }

  // Modal
  const [modal, setModal] = useState({
    abierto: false,
    tipo: 'logico',        // 'logico' | 'fisico'
    cliente: null,
    procesando: false,
  });

  // ── Cargar clientes al montar el componente ──────
  useEffect(() => {
    cargarClientes();
  }, []);

  async function cargarClientes() {
    setCargando(true);
    try {
      const res = await api.get('/clientes/');
      setClientes(res.data.datos ?? []);
    } catch (err) {
      console.error("Error al cargar clientes:", err);
      const msg = err.message || 'Error desconocido';
      mostrarAlerta('error', 'No se pudo conectar con la API: ' + msg);
    } finally {
      setCargando(false);
    }
  }

  // ── Filtro de búsqueda ───────────────────────────
  const { activos, inactivos } = useMemo(() => {
    // 1. Filtrar por búsqueda
    const q = busqueda.toLowerCase().trim();
    let base = clientes;
    if (q) {
      base = clientes.filter(c =>
        c.rut.toLowerCase().includes(q) ||
        c.nombre.toLowerCase().includes(q) ||
        c.apellido.toLowerCase().includes(q) ||
        (c.correo ?? '').toLowerCase().includes(q)
      );
    }

    // 2. Separar activos e inactivos
    return {
      activos: base.filter(c => c.activo === true),
      inactivos: base.filter(c => c.activo === false)
    };
  }, [clientes, busqueda]);

  // ── Abrir modal ──────────────────────────────────
  function abrirModal(tipo, cliente) {
    setModal({ abierto: true, tipo, cliente, procesando: false });
  }

  function cerrarModal() {
    if (!modal.procesando) {
      setModal(m => ({ ...m, abierto: false, cliente: null }));
    }
  }

  // ── Confirmar acción del modal ───────────────────
  async function confirmarModal() {
    setModal(m => ({ ...m, procesando: true }));

    const { tipo, cliente } = modal;
    const rutEncoded = encodeURIComponent(cliente.rut);

    try {
      if (tipo === 'logico') {
        // Borrado lógico: pone activo=False
        await api.delete(`/clientes/${rutEncoded}/`);
        mostrarAlerta('success', `Cliente ${cliente.nombre} ${cliente.apellido} desactivado correctamente.`);
      } else {
        // Borrado físico: elimina el registro permanentemente
        await api.delete(`/clientes/${rutEncoded}/eliminar/`, {
          data: { confirmar: true }
        });
        mostrarAlerta('success', `Cliente ${cliente.nombre} ${cliente.apellido} eliminado permanentemente.`);
      }

      // Recargamos la lista
      await cargarClientes();
    } catch (err) {
      const msg = err.response?.data?.mensaje ?? 'Error al procesar la solicitud.';
      mostrarAlerta('error', msg);
    } finally {
      setModal({ abierto: false, tipo: 'logico', cliente: null, procesando: false });
    }
  }

  // ── Reactivar cliente ────────────────────────────
  async function manejarActivar(cliente) {
    try {
      const rutEncoded = encodeURIComponent(cliente.rut);
      await api.patch(`/clientes/${rutEncoded}/`, { activo: true });
      mostrarAlerta('success', `Cliente ${cliente.nombre} ${cliente.apellido} reactivado correctamente.`);
      cargarClientes();
    } catch (err) {
      mostrarAlerta('error', 'Error al reactivar cliente.');
    }
  }

  // ── Mostrar alerta temporal ──────────────────────
  function mostrarAlerta(tipo, msg) {
    setAlerta({ tipo, msg });
    // Auto-ocultar después de 4 segundos
    setTimeout(() => setAlerta(null), 4000);
  }

  // ── Render ───────────────────────────────────────
  return (
    <>
      {/* Encabezado de la página */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Panel de Clientes</h1>
          <p>Gestiona el registro completo de clientes del sistema</p>
        </div>
      </div>



      {/* Alerta de éxito o error */}
      {alerta && (
        <div className={`alert alert-${alerta.tipo === 'success' ? 'success' : 'error'}`}>
          <span className="alert-icon">
            {alerta.tipo === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          </span>
          <span className="alert-msg">{alerta.msg}</span>
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="search-bar">
        <span className="search-icon"><Search size={18} /></span>
        <input
          id="input-busqueda"
          type="text"
          placeholder="Buscar por RUT, nombre o correo..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tablas de clientes o spinner */}
      {cargando ? (
        <Spinner texto="Cargando clientes..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {/* Activos */}
          <div>
            <ClienteTable
              clientes={activos}
              onDesactivar={c => abrirModal('logico', c)}
              onEliminar={c => abrirModal('fisico', c)}
              onActivar={manejarActivar}
            />
          </div>

          {/* Inactivos (solo si hay) */}
          {inactivos.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  Clientes Inactivos
                </h3>
                <span className="badge-count" style={{ marginTop: '0' }}>{inactivos.length}</span>
              </div>
              <ClienteTable
                clientes={inactivos}
                onDesactivar={c => abrirModal('logico', c)}
                onEliminar={c => abrirModal('fisico', c)}
                onActivar={manejarActivar}
              />
            </div>
          )}
        </div>
      )}

      {/* Modal de confirmación */}
      <Modal
        abierto={modal.abierto}
        tipo={modal.tipo}
        cliente={modal.cliente}
        onConfirmar={confirmarModal}
        onCancelar={cerrarModal}
        cargando={modal.procesando}
      />
    </>
  );
}
