/**
 * FormPage.jsx — Formulario de Crear / Editar cliente
 *
 * Esta página sirve para DOS casos:
 *   - /nuevo        → Crea un nuevo cliente (POST)
 *   - /editar/:rut  → Edita un cliente existente (PATCH)
 *
 * En modo edición, solo se permiten modificar nombre y teléfono.
 * Los selectores de Región → Provincia → Ciudad funcionan en cascada.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { User, Phone, MapPin, Save, X, AlertCircle, ArrowLeft, Pencil, UserPlus } from 'lucide-react';
import api from '../api/axios.js';
import Spinner from '../components/Spinner.jsx';

// Estado inicial vacío para el formulario
const FORM_INICIAL = {
  rut:          '',
  nombre:       '',
  apellido:     '',
  telefono:     '',
  correo:       '',
  direccion:    '',
  id_region:    '',
  id_provincia: '',
  id_ciudad:    '',
  id_categoria: '',
};

export default function FormPage() {
  const navigate = useNavigate();
  const { rut }  = useParams();       // Existe solo en /editar/:rut
  const esEdicion = Boolean(rut);     // true → editar, false → crear

  // ── Estado del formulario ────────────────────────
  const [form, setForm]         = useState(FORM_INICIAL);
  const [errores, setErrores]   = useState({});
  const [enviando, setEnviando] = useState(false);
  const [alerta, setAlerta]     = useState(null);
  const [cargando, setCargando] = useState(esEdicion); // Carga inicial en edición

  // ── Datos para los selectores ────────────────────
  const [regiones,    setRegiones]    = useState([]);
  const [provincias,  setProvincias]  = useState([]);
  const [ciudades,    setCiudades]    = useState([]);
  const [categorias,  setCategorias]  = useState([]);

  // Provincias y ciudades filtradas según selección
  const [provinciasFiltradas, setProvinciasFiltradas] = useState([]);
  const [ciudadesFiltradas,   setCiudadesFiltradas]   = useState([]);

  // Candado para evitar doble carga en React StrictMode
  const inicializado = useRef(false);

  // ── Cargar datos iniciales (Apoyo + Cliente) ─────
  useEffect(() => {
    if (inicializado.current) return;
    inicializado.current = true;

    async function inicializarPagina() {
      try {
        // 1. Cargar datos de apoyo en paralelo
        const [resReg, resProv, resCiu, resCat] = await Promise.all([
          api.get('/regiones/'),
          api.get('/provincias/'),
          api.get('/ciudades/'),
          api.get('/categorias/'),
        ]);
        
        const dataReg = resReg.data.datos ?? [];
        const dataProv = resProv.data.datos ?? [];
        const dataCiu = resCiu.data.datos ?? [];
        const dataCat = resCat.data.datos ?? [];

        setRegiones(dataReg);
        setProvincias(dataProv);
        setCiudades(dataCiu);
        setCategorias(dataCat);

        // 2. Si es edición, cargar el cliente ahora que tenemos las ciudades
        if (esEdicion && rut) {
          setCargando(true);
          const res = await api.get(`/clientes/${encodeURIComponent(rut)}/`);
          const c = res.data.datos;

          // Deducir provincia y región a partir de la ciudad usando los arrays locales
          const ciudad = dataCiu.find(ciu => String(ciu.id_ciudad) === String(c.id_ciudad));
          let id_prov = '';
          let id_reg = '';
          
          if (ciudad) {
            id_prov = String(ciudad.id_provincia);
            const provincia = dataProv.find(p => String(p.id_provincia) === id_prov);
            if (provincia) {
              id_reg = String(provincia.id_region);
            }
          }

          setForm(f => ({
            ...f,
            rut:       c.rut,
            nombre:    c.nombre,
            apellido:  c.apellido,
            telefono:  c.telefono,
            correo:    c.correo    ?? '',
            direccion: c.direccion ?? '',
            id_region:    id_reg,
            id_provincia: id_prov,
            id_ciudad:    String(c.id_ciudad),
            id_categoria: String(c.id_categoria),
          }));
        }
      } catch {
        mostrarAlerta('error', 'Error al cargar los datos iniciales de la página.');
      } finally {
        if (esEdicion) setCargando(false);
      }
    }

    inicializarPagina();
  }, [rut, esEdicion]);

  // ── Cascada Región → Provincias ──────────────────
  useEffect(() => {
    if (!form.id_region) {
      setProvinciasFiltradas([]);
      return;
    }
    const filtradas = provincias.filter(
      p => String(p.id_region) === String(form.id_region)
    );
    setProvinciasFiltradas(filtradas);
  }, [form.id_region, provincias]);

  // ── Cascada Provincia → Ciudades ─────────────────
  useEffect(() => {
    if (!form.id_provincia) {
      setCiudadesFiltradas([]);
      return;
    }
    const filtradas = ciudades.filter(
      c => String(c.id_provincia) === String(form.id_provincia)
    );
    setCiudadesFiltradas(filtradas);
  }, [form.id_provincia, ciudades]);

  // ── Manejar cambios del formulario ───────────────
  function manejarCambio(e) {
    const { name, value } = e.target;
    
    setForm(f => {
      const nuevoForm = { ...f, [name]: value };
      
      // Si el usuario cambia la región, reseteamos la provincia y ciudad
      if (name === 'id_region') {
        nuevoForm.id_provincia = '';
        nuevoForm.id_ciudad = '';
      }
      // Si el usuario cambia la provincia, reseteamos la ciudad
      if (name === 'id_provincia') {
        nuevoForm.id_ciudad = '';
      }
      
      return nuevoForm;
    });

    // Limpiamos el error del campo al escribir
    if (errores[name]) {
      setErrores(e => ({ ...e, [name]: '' }));
    }
  }

  // ── Validación del formulario ─────────────────────
  function validar() {
    const errs = {};

    if (!esEdicion) {
      if (!form.rut.trim())
        errs.rut = 'El RUT es obligatorio.';
      if (!form.apellido.trim())
        errs.apellido = 'El apellido es obligatorio.';
      if (!form.id_ciudad)
        errs.id_ciudad = 'Debes seleccionar una ciudad.';
      if (!form.id_categoria)
        errs.id_categoria = 'Debes seleccionar una categoría.';
    }

    if (!form.nombre.trim())
      errs.nombre = 'El nombre es obligatorio.';
    if (!form.telefono.trim())
      errs.telefono = 'El teléfono es obligatorio.';

    setErrores(errs);
    return Object.keys(errs).length === 0; // true → sin errores
  }

  // ── Enviar formulario ────────────────────────────
  async function manejarSubmit(e) {
    e.preventDefault();
    if (!validar()) return;

    setEnviando(true);
    try {
      if (esEdicion) {
        // PATCH — actualiza todos los datos (excepto rut)
        await api.patch(`/clientes/${encodeURIComponent(rut)}/`, {
          nombre:       form.nombre,
          apellido:     form.apellido,
          telefono:     form.telefono,
          correo:       form.correo   || undefined,
          direccion:    form.direccion || undefined,
          id_ciudad:    Number(form.id_ciudad),
          id_categoria: Number(form.id_categoria),
        });
        mostrarAlerta('success', '¡Cliente actualizado correctamente!');
      } else {
        // POST — crear nuevo cliente
        await api.post('/clientes/', {
          rut:          form.rut,
          nombre:       form.nombre,
          apellido:     form.apellido,
          telefono:     form.telefono,
          correo:       form.correo   || undefined,
          direccion:    form.direccion || undefined,
          id_ciudad:    Number(form.id_ciudad),
          id_categoria: Number(form.id_categoria),
        });
        mostrarAlerta('success', '¡Cliente creado exitosamente!');
        // Esperamos un momento y redirigimos al listado
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (err) {
      // Mostramos errores de validación del backend
      if (err.response?.data?.errores) {
        setErrores(err.response.data.errores);
      }
      const msg = err.response?.data?.mensaje ?? 'Error al procesar la solicitud.';
      mostrarAlerta('error', msg);
    } finally {
      setEnviando(false);
    }
  }

  function mostrarAlerta(tipo, msg) {
    setAlerta({ tipo, msg });
    if (tipo === 'success') setTimeout(() => setAlerta(null), 3000);
  }

  // ── Render: spinner mientras carga en edición ────
  if (cargando) return <Spinner texto="Cargando datos del cliente..." />;

  // ── Render: formulario ───────────────────────────
  return (
    <>
      {/* Encabezado */}
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/" className="btn btn-outline" style={{ padding: '8px', borderRadius: '50%' }} title="Volver al listado">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {esEdicion ? <><Pencil size={22} /> Editar Cliente</> : <><UserPlus size={22} /> Nuevo Cliente</>}
            </h1>
            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>
              {esEdicion
                ? `Modificando datos del cliente con RUT: ${rut}`
                : 'Completa el formulario para registrar un nuevo cliente'}
            </p>
          </div>
        </div>
      </div>

      {/* Alerta */}
      {alerta && (
        <div className={`alert alert-${alerta.tipo === 'success' ? 'success' : 'error'}`}>
          <span className="alert-icon">{alerta.tipo === 'success' ? '✅' : '❌'}</span>
          <span className="alert-msg">{alerta.msg}</span>
        </div>
      )}

      {/* Formulario */}
      <div className="form-container">
        <form onSubmit={manejarSubmit} noValidate>

          <div className="form-layout">
            {/* ── SECCIÓN 1: DATOS PERSONALES ── */}
            <div className="form-section">
              <h3 className="form-section-title">
                <User size={16} /> Datos Personales
              </h3>
              <div className="form-grid-vertical">
                {!esEdicion && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="rut">RUT <span className="required">*</span></label>
                    <input id="rut" name="rut" className="form-input" type="text" placeholder="12345678-9" value={form.rut} onChange={manejarCambio} disabled={esEdicion} maxLength={12} />
                    {errores.rut && <span className="form-error"><AlertCircle size={12} /> {errores.rut}</span>}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label" htmlFor="nombre">Nombre <span className="required">*</span></label>
                  <input id="nombre" name="nombre" className="form-input" type="text" placeholder="Juan" value={form.nombre} onChange={manejarCambio} maxLength={100} />
                  {errores.nombre && <span className="form-error"><AlertCircle size={12} /> {errores.nombre}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="apellido">Apellido <span className="required">*</span></label>
                  <input id="apellido" name="apellido" className="form-input" type="text" placeholder="Pérez" value={form.apellido} onChange={manejarCambio} maxLength={100} />
                  {errores.apellido && <span className="form-error"><AlertCircle size={12} /> {errores.apellido}</span>}
                </div>
              </div>
            </div>

            {/* ── SECCIÓN 2: CONTACTO ── */}
            <div className="form-section">
              <h3 className="form-section-title">
                <Phone size={16} /> Información de Contacto
              </h3>
              <div className="form-grid-vertical">
                <div className="form-group">
                  <label className="form-label" htmlFor="telefono">Teléfono <span className="required">*</span></label>
                  <input id="telefono" name="telefono" className="form-input" type="text" placeholder="+56912345678" value={form.telefono} onChange={manejarCambio} maxLength={15} />
                  {errores.telefono && <span className="form-error"><AlertCircle size={12} /> {errores.telefono}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="correo">Correo electrónico</label>
                  <input id="correo" name="correo" className="form-input" type="email" placeholder="juan@email.com" value={form.correo} onChange={manejarCambio} maxLength={100} />
                </div>
              </div>
            </div>

            {/* ── SECCIÓN 3: UBICACIÓN Y OTROS ── */}
            <div className="form-section form-section-full">
              <h3 className="form-section-title">
                <MapPin size={16} /> Ubicación y Otros
              </h3>
              
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" htmlFor="direccion">Dirección</label>
                <input id="direccion" name="direccion" className="form-input" type="text" placeholder="Av. Siempre Viva 123" value={form.direccion} onChange={manejarCambio} maxLength={150} />
              </div>

              <div className="form-grid-horizontal">



                {/* Región */}
                <div className="form-group">
                  <label className="form-label" htmlFor="id_region">Región</label>
                  <select
                    id="id_region"
                    name="id_region"
                    className="form-select"
                    value={form.id_region}
                    onChange={manejarCambio}
                  >
                    <option value="">— Selecciona región —</option>
                    {regiones.map(r => (
                      <option key={r.id_region} value={r.id_region}>
                        {r.nombre_region}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Provincia */}
                <div className="form-group">
                  <label className="form-label" htmlFor="id_provincia">Provincia</label>
                  <select
                    id="id_provincia"
                    name="id_provincia"
                    className="form-select"
                    value={form.id_provincia}
                    onChange={manejarCambio}
                    disabled={!form.id_region}
                  >
                    <option value="">— Selecciona provincia —</option>
                    {provinciasFiltradas.map(p => (
                      <option key={p.id_provincia} value={p.id_provincia}>
                        {p.nombre_provincia}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ciudad */}
                <div className="form-group">
                  <label className="form-label" htmlFor="id_ciudad">
                    Ciudad <span className="required">*</span>
                  </label>
                  <select
                    id="id_ciudad"
                    name="id_ciudad"
                    className="form-select"
                    value={form.id_ciudad}
                    onChange={manejarCambio}
                    disabled={!form.id_provincia}
                  >
                    <option value="">— Selecciona ciudad —</option>
                    {ciudadesFiltradas.map(c => (
                      <option key={c.id_ciudad} value={c.id_ciudad}>
                        {c.nombre_ciudad}
                      </option>
                    ))}
                  </select>
                  {errores.id_ciudad && <span className="form-error">{errores.id_ciudad}</span>}
                </div>

                {/* Categoría */}
                <div className="form-group">
                  <label className="form-label" htmlFor="id_categoria">
                    Categoría <span className="required">*</span>
                  </label>
                  <select
                    id="id_categoria"
                    name="id_categoria"
                    className="form-select"
                    value={form.id_categoria}
                    onChange={manejarCambio}
                  >
                    <option value="">— Selecciona categoría —</option>
                    {categorias.map(cat => (
                      <option key={cat.id_categoria} value={cat.id_categoria}>
                        {cat.nombre_categoria}
                      </option>
                    ))}
                  </select>
                  {errores.id_categoria && <span className="form-error">{errores.id_categoria}</span>}
                </div>
              </div>
            </div>
          </div>
          {/* ── Botones de acción ── */}
          <div className="form-actions">
            <Link to="/" className="btn btn-outline">
              <X size={16} /> Cancelar
            </Link>
            <button
              id="btn-submit-form"
              type="submit"
              className="btn btn-primary"
              disabled={enviando}
            >
              {enviando ? 'Guardando...' : <><Save size={16} /> {esEdicion ? 'Guardar cambios' : 'Crear cliente'}</>}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
