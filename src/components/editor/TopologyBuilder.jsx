import React, { useState, useRef, useEffect } from 'react';
import { 
  Wifi, 
  Network, 
  Router, 
  Cloud, 
  Monitor, 
  Smartphone, 
  Laptop,
  Share2,
  Trash2,
  Lock,
  Unlock,
  Plus,
  MousePointer2
} from 'lucide-react';

const TopologyBuilder = ({ reportData, setReportData, t }) => {
  const [isConnecting, setIsConnecting] = useState(null); 
  const [isLocked, setIsLocked] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const infraIds = reportData.infrastructure.map(i => i.id);
    const currentNodes = { ...reportData.topology?.nodes };
    let changed = false;

    Object.keys(currentNodes).forEach(id => {
      if (!infraIds.includes(Number(id))) {
        delete currentNodes[id];
        changed = true;
      }
    });

    infraIds.forEach(id => {
      if (!currentNodes[id]) {
        currentNodes[id] = { 
          x: 50 + Math.random() * 200, 
          y: 50 + Math.random() * 200 
        };
        changed = true;
      }
    });

    if (changed) {
      const validEdges = (reportData.topology?.edges || []).filter(
        edge => infraIds.includes(edge.from) && infraIds.includes(edge.to)
      );

      setReportData(prev => ({
        ...prev,
        topology: {
          ...prev.topology,
          nodes: currentNodes,
          edges: validEdges
        }
      }));
    }
  }, [reportData.infrastructure, setReportData]);

  const handleDrag = (id, e) => {
    if (isLocked) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setReportData(prev => ({
      ...prev,
      topology: {
        ...prev.topology,
        nodes: {
          ...prev.topology.nodes,
          [id]: { x, y }
        }
      }
    }));
  };

  const startConnection = (id) => {
    if (isConnecting === id) {
      setIsConnecting(null);
    } else if (isConnecting === null) {
      setIsConnecting(id);
    } else {
      const newEdge = { id: Date.now(), from: isConnecting, to: id };
      const exists = reportData.topology.edges.some(e => 
        (e.from === newEdge.from && e.to === newEdge.to) || 
        (e.from === newEdge.to && e.to === newEdge.from)
      );

      if (!exists) {
        setReportData(prev => ({
          ...prev,
          topology: {
            ...prev.topology,
            edges: [...prev.topology.edges, newEdge]
          }
        }));
      }
      setIsConnecting(null);
    }
  };

  const removeEdge = (edgeId) => {
    setReportData(prev => ({
      ...prev,
      topology: {
        ...prev.topology,
        edges: prev.topology.edges.filter(e => e.id !== edgeId)
      }
    }));
  };

  const getDeviceStyle = (type) => {
    switch(type) {
      case 'AP': return { icon: <Wifi size={20} />, color: 'bg-indigo-500', lightColor: 'bg-indigo-50', textColor: 'text-indigo-600' };
      case 'SWITCH': return { icon: <Network size={20} />, color: 'bg-emerald-500', lightColor: 'bg-emerald-50', textColor: 'text-emerald-600' };
      case 'ROUTER': return { icon: <Router size={20} />, color: 'bg-blue-500', lightColor: 'bg-blue-50', textColor: 'text-blue-600' };
      case 'CLOUD': return { icon: <Cloud size={20} />, color: 'bg-sky-500', lightColor: 'bg-sky-50', textColor: 'text-sky-600' };
      case 'MOBILE': return { icon: <Smartphone size={20} />, color: 'bg-pink-500', lightColor: 'bg-pink-50', textColor: 'text-pink-600' };
      case 'STATION': return { icon: <Laptop size={20} />, color: 'bg-slate-700', lightColor: 'bg-slate-50', textColor: 'text-slate-700' };
      default: return { icon: <Monitor size={20} />, color: 'bg-slate-500', lightColor: 'bg-slate-50', textColor: 'text-slate-600' };
    }
  };

  const clearTopology = () => {
    setReportData(prev => ({
      ...prev,
      topology: { nodes: {}, edges: [] }
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-[10px] uppercase font-black text-slate-400">
        <div className="flex gap-2">
           <button 
             onClick={() => setIsLocked(!isLocked)} 
             className={`p-1.5 rounded-lg border transition-all flex items-center gap-2 ${isLocked ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-white hover:bg-slate-50'}`}
           >
             {isLocked ? <Lock size={14}/> : <Unlock size={14}/>}
             <span>{isLocked ? 'Bloqueado' : 'Livre'}</span>
           </button>
           <button 
             onClick={clearTopology}
             className="p-1.5 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-100 rounded-lg transition-all"
           >
             <Trash2 size={14}/>
           </button>
        </div>
        <div className="flex items-center gap-2">
          {isConnecting ? (
            <span className="text-[#00a335] animate-pulse flex items-center gap-1">
              <Plus size={12}/> Selecione o destino...
            </span>
          ) : (
            <span className="flex items-center gap-1 opacity-60">
               <MousePointer2 size={12}/> {isLocked ? 'Visualize sua rede' : 'Organize sua rede'}
            </span>
          )}
        </div>
      </div>

      <div 
        ref={containerRef}
        className="w-full h-[400px] bg-slate-50 border border-slate-200 rounded-2xl relative overflow-hidden group/canvas shadow-inner"
        onDragOver={(e) => e.preventDefault()}
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {reportData.topology?.edges?.map(edge => {
            const from = reportData.topology.nodes?.[edge.from];
            const to = reportData.topology.nodes?.[edge.to];
            if (!from || !to) return null;

            return (
              <g key={edge.id}>
                <line 
                  x1={from.x} y1={from.y} 
                  x2={to.x} y2={to.y} 
                  stroke="#94a3b8" 
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle 
                  cx={(from.x + to.x) / 2} cy={(from.y + to.y) / 2} 
                  r="12" fill="white" stroke="#E2E8F0"
                  className="pointer-events-auto cursor-pointer hover:fill-red-50 hover:stroke-red-300 transition-all"
                  onClick={() => removeEdge(edge.id)}
                />
                <text 
                  x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 + 3}
                  className="pointer-events-none text-[10px] fill-slate-400 font-black"
                  textAnchor="middle"
                >
                  ×
                </text>
              </g>
            );
          })}
        </svg>

        {reportData.infrastructure.map(infra => {
          const node = reportData.topology.nodes?.[infra.id];
          if (!node) return null;
          const { icon, color, lightColor, textColor } = getDeviceStyle(infra.type);

          return (
            <div
              key={infra.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group/node z-10`}
              style={{ left: node.x, top: node.y }}
            >
              {/* Pulse effect when connecting */}
              {isConnecting === infra.id && (
                <div className="absolute inset-0 w-12 h-12 bg-[#00a335] rounded-xl animate-ping opacity-25 -translate-x-1 -translate-y-1" />
              )}
              
              <div 
                draggable={!isLocked}
                onDrag={(e) => {
                  if (e.clientX !== 0) handleDrag(infra.id, e);
                }}
                onClick={() => startConnection(infra.id)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all cursor-move border-2 relative
                  ${isConnecting === infra.id 
                    ? 'bg-[#00a335] text-white border-[#00a335] scale-110 z-20' 
                    : `${lightColor} ${textColor} border-transparent hover:border-[#00a335] hover:scale-105`
                  }
                `}
              >
                {icon}
                {/* Badge for Type */}
                <div className={`absolute -top-2 -right-2 px-1 rounded text-[7px] font-black text-white ${color} shadow-sm uppercase`}>
                  {infra.type.substring(0, 3)}
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                 <span className="text-[9px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold shadow-sm whitespace-nowrap">
                   {infra.model || infra.type}
                 </span>
                 {infra.firmware && (
                   <span className="text-[7px] text-slate-400 font-mono mt-0.5">
                     {infra.firmware}
                   </span>
                 )}
              </div>
            </div>
          );
        })}

        {(reportData.infrastructure || []).filter(i => i.type !== 'NONE').length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 pointer-events-none">
             <Share2 size={56} className="mb-3 opacity-10"/>
             <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40">Área de Topologia</p>
             <p className="text-[9px] italic opacity-50 mt-1">Adicione itens na Infraestrutura para começar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopologyBuilder;
