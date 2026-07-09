/**
 * Badge.jsx — Insignia de estado o categoría
 *
 * Props:
 *   tipo  → 'active' | 'inactive' | 'categoria'
 *   texto → Texto a mostrar dentro del badge
 */

export default function Badge({ tipo = 'active', texto }) {
  const claseMap = {
    active:    'badge badge-active',
    inactive:  'badge badge-inactive',
    categoria: 'badge badge-categoria',
  };

  return (
    <span className={claseMap[tipo] ?? 'badge'}>
      {texto}
    </span>
  );
}
