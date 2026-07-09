/**
 * NodeBadge.jsx — Indicadores de los nodos de Frontend y Backend
 *
 * En un Auto Scaling Group o ECS Fargate de AWS, el ALB puede redirigir cada request
 * a una tarea diferente. Estos badges muestran en tiempo real qué contenedores
 * (tanto del Frontend Nginx como del Backend Django) están sirviendo la página.
 *
 * Se actualizan automáticamente cada 30 segundos extrayendo la metadata de AWS.
 */

import { useEffect, useState } from 'react';
import { Server, Activity, MonitorSmartphone } from 'lucide-react';
import api from '../api/axios';

function SingleBadge({ nodo, titulo, Icono, error }) {
  if (error) {
    return (
      <div className="node-badge node-badge--error" title={`No se pudo conectar al ${titulo}`}>
        <Server size={12} />
        <span>{titulo} Desconocido</span>
      </div>
    );
  }

  if (!nodo) return null;

  const hostname = nodo?.sistema?.hostname || 'Desconocido';
  const privateIp = nodo?.sistema?.ip_privada || 'N/A';
  const az = nodo?.aws_ecs?.zona_disponibilidad || 'local';
  const tareaId = nodo?.aws_ecs?.tarea_id || 'N/A';
  const osInfo = nodo?.sistema?.os || '';
  const ejecutandoEnAWS = nodo?.aws_ecs?.ejecutando_en_ecs;

  const identificador = ejecutandoEnAWS && tareaId !== 'N/A' 
    ? tareaId.slice(0, 8) + '…'
    : (hostname.length > 14 ? hostname.slice(0, 12) + '…' : hostname);

  const ubicacion = az !== 'local' && az !== 'N/A' ? az : `${privateIp}`;

  const tooltipInfo = `🌐 NODO ${titulo}\nOS: ${osInfo}\nTarea: ${tareaId}\nIP Privada: ${privateIp}\nZona AWS (AZ): ${az}`;

  return (
    <div
      className="node-badge node-badge--pulse"
      title={tooltipInfo}
      style={{ cursor: 'help' }}
    >
      <span className="node-badge__dot" />
      <Icono size={12} />
      <span className="node-badge__label" style={{ textTransform: 'uppercase' }}>{titulo}:</span>
      <span className="node-badge__hostname" style={{ fontWeight: '600' }}>{identificador}</span>
      {ubicacion && <span className="node-badge__az">{ubicacion}</span>}
    </div>
  );
}

export default function NodeBadge() {
  const [nodos, setNodos] = useState({ backend: null, frontend: null });
  const [errores, setErrores] = useState({ backend: false, frontend: false });

  const fetchNodos = async () => {
    // 1. Backend
    try {
      const { data } = await api.get('/node-info/');
      if (data.ok) {
        setNodos(prev => ({ ...prev, backend: data.nodo }));
        setErrores(prev => ({ ...prev, backend: false }));
      }
    } catch {
      setErrores(prev => ({ ...prev, backend: true }));
    }

    // 2. Frontend
    try {
      const res = await fetch('/frontend-info');
      const data = await res.json();
      if (data.ok) {
        setNodos(prev => ({ ...prev, frontend: data.nodo }));
        setErrores(prev => ({ ...prev, frontend: false }));
      }
    } catch {
      setErrores(prev => ({ ...prev, frontend: true }));
    }
  };

  useEffect(() => {
    fetchNodos();
    const intervalo = setInterval(fetchNodos, 30_000);
    return () => clearInterval(intervalo);
  }, []);

  if (!nodos.backend && !nodos.frontend && !errores.backend && !errores.frontend) {
    return null; // Cargando
  }

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <SingleBadge 
        nodo={nodos.frontend} 
        error={errores.frontend} 
        titulo="Frontend" 
        Icono={MonitorSmartphone} 
      />
      <SingleBadge 
        nodo={nodos.backend} 
        error={errores.backend} 
        titulo="Backend" 
        Icono={Activity} 
      />
    </div>
  );
}
