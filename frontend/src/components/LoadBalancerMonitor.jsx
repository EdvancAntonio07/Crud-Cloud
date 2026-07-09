import { useEffect, useState, useRef } from 'react';
import { Activity, Server, MonitorSmartphone, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/axios';

export default function LoadBalancerMonitor() {
  const [nodes, setNodes] = useState({ backend: {}, frontend: {} });
  const [totalRequests, setTotalRequests] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const intervalRef = useRef(null);

  const pingServers = async () => {
    // 1. Ping al Backend Django (a través de /api/node-info/)
    try {
      const { data } = await api.get('/node-info/');
      if (data.ok && data.nodo) {
        const id = data.nodo.aws_ecs?.tarea_id || data.nodo.sistema?.hostname || 'unknown';
        const privateIp = data.nodo.sistema?.ip_privada;
        const az = data.nodo.aws_ecs?.zona_disponibilidad;

        setNodes((prev) => {
          const count = (prev.backend[id]?.count || 0) + 1;
          return {
            ...prev,
            backend: {
              ...prev.backend,
              [id]: { id, type: 'Backend', privateIp, az, count }
            }
          };
        });
      }
    } catch (e) {
      console.error('Error pinging backend:', e);
    }

    // 2. Ping al Frontend Nginx (directo a /frontend-info)
    try {
      const res = await fetch('/frontend-info');
      const data = await res.json();
      if (data.ok && data.nodo) {
        const id = data.nodo.sistema?.hostname || 'unknown';
        
        setNodes((prev) => {
          const count = (prev.frontend[id]?.count || 0) + 1;
          return {
            ...prev,
            frontend: {
              ...prev.frontend,
              [id]: { id, type: 'Frontend', privateIp: 'N/A', az: 'N/A', count }
            }
          };
        });
      }
    } catch (e) {
      console.error('Error pinging frontend:', e);
    }

    setTotalRequests((prev) => prev + 1);
  };

  const toggleMonitor = (e) => {
    e.stopPropagation(); // Evita que se colapse al presionar el botón
    if (isActive) {
      clearInterval(intervalRef.current);
      setIsActive(false);
    } else {
      if (!isExpanded) setIsExpanded(true); // Auto expandir al iniciar
      pingServers(); 
      intervalRef.current = setInterval(pingServers, 1500);
      setIsActive(true);
    }
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const clearData = (e) => {
    e.stopPropagation();
    setNodes({ backend: {}, frontend: {} });
    setTotalRequests(0);
  };

  const renderNodeRows = (nodeList, color, icon) => {
    return Object.values(nodeList).map((node) => {
      const percentage = Math.round((node.count / totalRequests) * 100) || 0;
      return (
        <div key={node.id} className="node-stat-row">
          <div className="node-stat-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {icon}
              <strong>{node.id.slice(0, 10)}...</strong>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              {node.type} {node.privateIp !== 'N/A' && `- ${node.privateIp}`}
            </span>
          </div>
          
          <div className="progress-container" style={{ flexGrow: 1, margin: '0 16px' }}>
            <div 
              className="progress-bar" 
              style={{ width: `${percentage}%`, backgroundColor: color, height: '10px', borderRadius: '5px', transition: 'width 0.3s ease' }}
            ></div>
          </div>
          
          <div style={{ minWidth: '60px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 'bold' }}>
            {node.count} req ({percentage}%)
          </div>
        </div>
      );
    });
  };

  return (
    <div className="lb-monitor-card fade-in">
      {/* Header clickable para expandir/colapsar */}
      <div 
        className="lb-monitor-header" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer', marginBottom: isExpanded ? '12px' : '0', paddingBottom: isExpanded ? '12px' : '0', borderBottom: isExpanded ? '1px solid #E5E7EB' : 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity className={isActive ? 'pulse-icon' : ''} size={18} color={isActive ? '#10b981' : '#6b7280'} />
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#111827' }}>Monitor de Auto Scaling Total</h3>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {isExpanded && (
            <button 
              className="btn btn--secondary" 
              style={{ padding: '4px 12px', fontSize: '0.8rem' }}
              onClick={clearData}
            >
              Limpiar
            </button>
          )}
          <button 
            className={isActive ? 'btn btn--danger' : 'btn btn--primary'} 
            style={{ padding: '4px 12px', fontSize: '0.8rem' }}
            onClick={toggleMonitor}
          >
            {isActive ? 'Detener Test' : 'Iniciar Test'}
          </button>
          {isExpanded ? <ChevronUp size={20} color="#6b7280" /> : <ChevronDown size={20} color="#6b7280" />}
        </div>
      </div>

      {/* Contenido Colapsable */}
      {isExpanded && (
        <div className="lb-monitor-content fade-in">
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '12px' }}>
            Este monitor lanza peticiones simultáneas al Backend y Frontend para visualizar cómo el Balanceador de Carga reparte el tráfico en ambas capas.
          </p>

          {totalRequests === 0 && !isActive ? (
            <div className="empty-state" style={{ padding: '20px 0' }}>
              Haz clic en "Iniciar Test" para comenzar a monitorear.
            </div>
          ) : (
            <div className="nodes-container">
              <h4 style={{ fontSize: '0.85rem', marginTop: '8px', color: '#374151' }}>🌐 Servidores Backend (Django)</h4>
              {renderNodeRows(nodes.backend, '#3b82f6', <Server size={14} color="#3b82f6" />)}
              
              <h4 style={{ fontSize: '0.85rem', marginTop: '12px', color: '#374151' }}>🖥️ Servidores Frontend (React/Nginx)</h4>
              {renderNodeRows(nodes.frontend, '#10b981', <MonitorSmartphone size={14} color="#10b981" />)}
            </div>
          )}

          {totalRequests > 0 && (
            <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#6b7280', textAlign: 'right' }}>
              Rondas de peticiones enviadas: {totalRequests}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
