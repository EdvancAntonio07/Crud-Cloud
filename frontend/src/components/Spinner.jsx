/**
 * Spinner.jsx — Indicador de carga
 *
 * Se muestra mientras se esperan respuestas de la API.
 * Acepta un texto personalizado opcionalmente.
 */

export default function Spinner({ texto = 'Cargando...' }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <p className="spinner-text">{texto}</p>
    </div>
  );
}
