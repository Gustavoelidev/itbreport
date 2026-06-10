import React, { useState, useCallback, useRef } from 'react';
import { ReactFlow, addEdge, applyNodeChanges, applyEdgeChanges, Background, Controls, MiniMap, Handle, Position, BaseEdge, EdgeLabelRenderer, getSmoothStepPath, getNodesBounds, getViewportForBounds } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { X, Save, Router, Server, Monitor, Wifi, Cloud, Smartphone, Shield, Camera, HardDrive } from 'lucide-react';
import { toPng } from 'html-to-image';

// ==========================================
// Edge style system
// ==========================================
const EDGE_STYLES = {
  ethernet: { stroke: '#94a3b8', strokeWidth: 3 },
  fiber:    { stroke: '#f97316', strokeWidth: 2.5 },
  wireless: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '8 5' },
  trunk:    { stroke: '#7c3aed', strokeWidth: 4 },
};

const EDGE_TYPE_OPTIONS = {
  ethernet: { label: 'Ethernet',     color: '#94a3b8' },
  fiber:    { label: 'Fibra Óptica', color: '#f97316' },
  wireless: { label: 'Wireless',     color: '#3b82f6' },
  trunk:    { label: 'Trunk / VLAN', color: '#7c3aed' },
};

// ==========================================
// Custom Edge
// ==========================================
const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }) => {
  const edgeStyle = EDGE_STYLES[data?.edgeType || 'ethernet'];

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  const getOffset = (pos, offset = 45) => {
    switch (pos) {
      case Position.Top:    return [0, -offset];
      case Position.Bottom: return [0,  offset];
      case Position.Left:   return [-offset, 0];
      case Position.Right:  return [ offset, 0];
      default:              return [0, 0];
    }
  };

  const [soX, soY] = getOffset(sourcePosition);
  const [toX, toY] = getOffset(targetPosition);

  return (
    <>
      <BaseEdge path={edgePath} style={edgeStyle} />
      <EdgeLabelRenderer>
        {data?.label && (
          <div
            style={{ position: 'absolute', transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`, pointerEvents: 'all' }}
            className="nodrag nopan bg-white/95 px-2 py-1 rounded shadow-sm border border-slate-200 text-[10px] font-bold text-slate-800"
          >
            {data.label}
          </div>
        )}
        {data?.sourceIP && (
          <div
            style={{ position: 'absolute', transform: `translate(-50%,-50%) translate(${sourceX + soX}px,${sourceY + soY}px)`, pointerEvents: 'all' }}
            className="nodrag nopan bg-white/90 px-1 py-0.5 rounded shadow-sm border border-slate-100 text-[9px] font-mono text-sky-600"
          >
            {data.sourceIP}
          </div>
        )}
        {data?.targetIP && (
          <div
            style={{ position: 'absolute', transform: `translate(-50%,-50%) translate(${targetX + toX}px,${targetY + toY}px)`, pointerEvents: 'all' }}
            className="nodrag nopan bg-white/90 px-1 py-0.5 rounded shadow-sm border border-slate-100 text-[9px] font-mono text-emerald-600"
          >
            {data.targetIP}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};

// ==========================================
// SVGs estilo Intelbras CVD
// ==========================================
const IntelbrasRouter = () => (
  <svg width="60" height="60" viewBox="0 0 60 60">
    <circle cx="30" cy="30" r="28" fill="#00A360" />
    <path d="M30 12 v12 m-3 -3 l3 3 l3 -3" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M30 48 v-12 m-3 3 l3 -3 l3 3" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 30 h12 m-3 -3 l3 3 l-3 3" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M48 30 h-12 m3 -3 l-3 3 l3 3" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IntelbrasSwitch = () => (
  <svg width="66" height="42" viewBox="0 0 66 42">
    <rect x="0" y="0" width="66" height="42" rx="4" fill="#00A360" />
    <path d="M15 15 h36 m-4 -4 l4 4 l-4 4" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M51 27 h-36 m4 -4 l-4 4 l4 4" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IntelbrasAP = () => (
  <svg width="60" height="60" viewBox="0 0 60 60">
    <circle cx="30" cy="30" r="28" fill="#00A360" />
    <path d="M15 24 Q 30 9 45 24" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M21 33 Q 30 21 39 33" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
    <circle cx="30" cy="42" r="3" fill="white" />
  </svg>
);

const IntelbrasFirewall = () => (
  <svg width="60" height="60" viewBox="0 0 60 60">
    <circle cx="30" cy="30" r="28" fill="#dc2626" />
    <path d="M30 14 L43 20 L43 31 C43 40 37 46 30 49 C23 46 17 40 17 31 L17 20 Z"
          fill="none" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M24 30 l4 4 l8 -8" stroke="white" strokeWidth="2.5" fill="none"
          strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ServerDevice = () => (
  <svg width="66" height="54" viewBox="0 0 66 54">
    <rect x="1" y="1" width="64" height="52" rx="4" fill="#1e293b" />
    <rect x="7" y="8"  width="52" height="10" rx="2" fill="#334155" />
    <circle cx="53" cy="13" r="2.5" fill="#22c55e" />
    <rect x="7" y="22" width="52" height="10" rx="2" fill="#334155" />
    <circle cx="53" cy="27" r="2.5" fill="#22c55e" />
    <rect x="7" y="36" width="52" height="10" rx="2" fill="#334155" />
    <circle cx="53" cy="41" r="2.5" fill="#f59e0b" />
  </svg>
);

const IPCameraDevice = () => (
  <svg width="64" height="52" viewBox="0 0 64 52">
    <rect x="4" y="12" width="36" height="24" rx="4" fill="#334155" />
    <circle cx="22" cy="24" r="8" fill="#1e293b" />
    <circle cx="22" cy="24" r="5" fill="#1e293b" stroke="#60a5fa" strokeWidth="1.5" />
    <circle cx="22" cy="24" r="2" fill="#93c5fd" />
    <polygon points="40,18 58,11 58,37 40,30" fill="#475569" />
    <rect x="14" y="36" width="16" height="4" rx="2" fill="#475569" />
    <rect x="20" y="40" width="4" height="8" rx="1" fill="#475569" />
  </svg>
);

const NVRDevice = () => (
  <svg width="66" height="50" viewBox="0 0 66 50">
    <rect x="1" y="1" width="64" height="48" rx="4" fill="#1e293b" />
    <rect x="7" y="7" width="36" height="36" rx="2" fill="#0f172a" />
    <rect x="9"  y="9"  width="16" height="14" rx="1" fill="#1e293b" />
    <rect x="27" y="9"  width="14" height="14" rx="1" fill="#1e293b" />
    <rect x="9"  y="25" width="14" height="16" rx="1" fill="#1e293b" />
    <rect x="25" y="25" width="16" height="16" rx="1" fill="#1e293b" />
    <circle cx="52" cy="16" r="5" fill="#ef4444" />
    <rect x="46" y="26" width="14" height="3" rx="1" fill="#334155" />
    <rect x="46" y="32" width="10" height="3" rx="1" fill="#334155" />
    <rect x="46" y="38" width="12" height="3" rx="1" fill="#334155" />
  </svg>
);

const CloudShape = () => (
  <svg width="72" height="48" viewBox="0 0 72 48">
    <path d="M 21 36 A 12 12 0 0 1 21 12 A 18 18 0 0 1 51 12 A 12 12 0 0 1 51 36 Z" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
  </svg>
);

const DesktopPC = () => (
  <svg width="60" height="60" viewBox="0 0 60 60">
    <rect x="9" y="15" width="42" height="27" rx="3" fill="none" stroke="#334155" strokeWidth="3" />
    <path d="M15 42 h30 l3 6 h-36 z" fill="#334155" />
  </svg>
);

const MobilePhone = () => (
  <svg width="60" height="60" viewBox="0 0 60 60">
    <rect x="18" y="9" width="24" height="42" rx="4" fill="none" stroke="#334155" strokeWidth="3" />
    <circle cx="30" cy="45" r="2" fill="#334155" />
  </svg>
);

// ==========================================
// Node handles
// ==========================================
const NodeHandles = () => (
  <>
    <Handle type="target" position={Position.Top}    id="t-top"   className="w-4 h-4 bg-[#00A360] opacity-0 group-hover:opacity-100 transition-opacity z-50 border-none" />
    <Handle type="source" position={Position.Top}    id="s-top"   className="w-4 h-4 bg-[#00A360] opacity-0 group-hover:opacity-100 transition-opacity z-50 border-none" />
    <Handle type="target" position={Position.Bottom} id="t-bot"   className="w-4 h-4 bg-[#00A360] opacity-0 group-hover:opacity-100 transition-opacity z-50 border-none" />
    <Handle type="source" position={Position.Bottom} id="s-bot"   className="w-4 h-4 bg-[#00A360] opacity-0 group-hover:opacity-100 transition-opacity z-50 border-none" />
    <Handle type="target" position={Position.Left}   id="t-left"  className="w-4 h-4 bg-[#00A360] opacity-0 group-hover:opacity-100 transition-opacity z-50 border-none" />
    <Handle type="source" position={Position.Left}   id="s-left"  className="w-4 h-4 bg-[#00A360] opacity-0 group-hover:opacity-100 transition-opacity z-50 border-none" />
    <Handle type="target" position={Position.Right}  id="t-right" className="w-4 h-4 bg-[#00A360] opacity-0 group-hover:opacity-100 transition-opacity z-50 border-none" />
    <Handle type="source" position={Position.Right}  id="s-right" className="w-4 h-4 bg-[#00A360] opacity-0 group-hover:opacity-100 transition-opacity z-50 border-none" />
  </>
);

const BaseNode = ({ data, children }) => (
  <div className="relative group flex items-center justify-center min-w-[72px] min-h-[72px]">
    {children}
    <div className="absolute top-full mt-2 flex flex-col items-center pointer-events-none z-20">
      <div className="bg-white/95 px-2 py-1 rounded shadow-sm border border-slate-100 flex flex-col items-center">
        <span className="text-[12px] font-bold text-slate-800 whitespace-nowrap">{data.label}</span>
        {data.ip   && <span className="text-[11px] font-mono text-slate-600 whitespace-nowrap">{data.ip}</span>}
        {data.port && <span className="text-[11px] font-mono text-[#00A360] whitespace-nowrap">{data.port}</span>}
      </div>
    </div>
    <NodeHandles />
  </div>
);

const nodeTypes = {
  router:   ({ data }) => <BaseNode data={data}><IntelbrasRouter /></BaseNode>,
  switch:   ({ data }) => <BaseNode data={data}><IntelbrasSwitch /></BaseNode>,
  ap:       ({ data }) => <BaseNode data={data}><IntelbrasAP /></BaseNode>,
  firewall: ({ data }) => <BaseNode data={data}><IntelbrasFirewall /></BaseNode>,
  server:   ({ data }) => <BaseNode data={data}><ServerDevice /></BaseNode>,
  camera:   ({ data }) => <BaseNode data={data}><IPCameraDevice /></BaseNode>,
  nvr:      ({ data }) => <BaseNode data={data}><NVRDevice /></BaseNode>,
  cloud:    ({ data }) => <BaseNode data={data}><CloudShape /></BaseNode>,
  client:   ({ data }) => <BaseNode data={data}><DesktopPC /></BaseNode>,
  mobile:   ({ data }) => <BaseNode data={data}><MobilePhone /></BaseNode>,
};

const edgeTypes = { custom: CustomEdge };

const defaultViewport = { x: 0, y: 0, zoom: 1 };

// ==========================================
// Modal principal
// ==========================================
const TopologyModal = ({ isOpen, onClose, onSaveImage, initialData }) => {
  const [nodes, setNodes] = useState(initialData?.nodes || []);
  const [edges, setEdges] = useState(initialData?.edges || []);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const reactFlowRef = useRef(null);
  const rfRef = useRef(null);

  React.useEffect(() => {
    if (isOpen) {
      setNodes(initialData?.nodes || []);
      setEdges(initialData?.edges || []);
      setSelectedNode(null);
      setSelectedEdge(null);
    }
  }, [isOpen, initialData]);

  const onNodesChange = useCallback((changes) => setNodes(nds => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges(eds => applyEdgeChanges(changes, eds)), []);

  const onConnect = useCallback((params) => setEdges(eds => addEdge({
    ...params,
    type: 'custom',
    data: { label: '', sourceIP: '', targetIP: '', edgeType: 'ethernet' }
  }, eds)), []);

  const onSelectionChange = useCallback(({ nodes, edges }) => {
    setSelectedNode(nodes.length > 0 ? nodes[0] : null);
    setSelectedEdge(edges.length > 0 ? edges[0] : null);
  }, []);

  const updateNodeData = (id, field, value) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n));
    setSelectedNode(prev => prev?.id === id ? { ...prev, data: { ...prev.data, [field]: value } } : prev);
  };

  const updateEdgeData = (id, field, value) => {
    setEdges(eds => eds.map(e => e.id === id ? { ...e, data: { ...e.data, [field]: value } } : e));
    setSelectedEdge(prev => prev?.id === id ? { ...prev, data: { ...prev.data, [field]: value } } : prev);
  };

  const deleteSelectedNode = () => { setNodes(nds => nds.filter(n => n.id !== selectedNode.id)); setSelectedNode(null); };
  const deleteSelectedEdge = () => { setEdges(eds => eds.filter(e => e.id !== selectedEdge.id)); setSelectedEdge(null); };

  const addNode = (type, label) => {
    setNodes(nds => nds.concat({
      id: `${type}-${Date.now()}`,
      type,
      position: { x: Math.random() * 200 + 100, y: Math.random() * 150 + 80 },
      data: { label, ip: '', port: '' },
    }));
  };

  const handleSave = async () => {
    if (nodes.length === 0) {
      alert('Adicione pelo menos um equipamento antes de salvar.');
      return;
    }
    try {
      const viewportEl = reactFlowRef.current?.querySelector('.react-flow__viewport');
      if (!viewportEl) return;

      const padding = 120;
      const measuredNodes = rfRef.current?.getNodes() ?? nodes;
      const bounds = getNodesBounds(measuredNodes);
      const imageWidth  = Math.max(bounds.width  + padding * 2, 600);
      const imageHeight = Math.max(bounds.height + padding * 2, 400);
      const viewport = getViewportForBounds(bounds, imageWidth, imageHeight, 0.5, 2);

      const dataUrl = await toPng(viewportEl, {
        backgroundColor: '#ffffff',
        width: imageWidth,
        height: imageHeight,
        style: {
          width: imageWidth,
          height: imageHeight,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
        pixelRatio: 2,
      });

      const res  = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `topology_${Date.now()}.png`, { type: 'image/png' });

      onSaveImage({ file, nodes, edges });
      onClose();
    } catch (err) {
      console.error('Erro ao exportar topologia:', err);
      alert('Falha ao salvar a imagem da topologia.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 md:p-12 animate-in fade-in">
      <div className="bg-white w-full h-full rounded-xl shadow-2xl flex flex-col overflow-hidden relative">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-lg font-black uppercase tracking-widest text-[#00a335]">Designer de Topologia</h2>
            <p className="text-xs text-slate-500">Adicione equipamentos e conecte-os arrastando as bordas dos nós.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-[#00a335] text-white rounded font-bold text-xs uppercase tracking-wider hover:bg-[#008a2d] transition-colors">
              <Save size={16} /> Salvar e Inserir
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Corpo */}
        <div className="flex-1 flex relative overflow-hidden">

          {/* Toolbar Lateral Esquerda */}
          <div className="w-48 bg-slate-100 border-r border-slate-200 p-4 flex flex-col gap-2 overflow-y-auto topology-toolbar z-10">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Intelbras</h3>

            <button onClick={() => addNode('router',   'Roteador')}     className="flex items-center gap-3 p-2 bg-white border border-indigo-200 rounded hover:border-indigo-400 hover:shadow-sm transition-all text-left group">
              <Router size={16} className="text-indigo-500" />
              <span className="text-xs font-bold text-slate-600">Roteador</span>
            </button>
            <button onClick={() => addNode('switch',   'Switch')}       className="flex items-center gap-3 p-2 bg-white border border-emerald-200 rounded hover:border-emerald-400 hover:shadow-sm transition-all text-left group">
              <Server size={16} className="text-emerald-500" />
              <span className="text-xs font-bold text-slate-600">Switch</span>
            </button>
            <button onClick={() => addNode('ap',       'Access Point')} className="flex items-center gap-3 p-2 bg-white border border-amber-200 rounded hover:border-amber-400 hover:shadow-sm transition-all text-left group">
              <Wifi size={16} className="text-amber-500" />
              <span className="text-xs font-bold text-slate-600">Access Point</span>
            </button>
            <button onClick={() => addNode('firewall', 'Firewall')}     className="flex items-center gap-3 p-2 bg-white border border-red-200 rounded hover:border-red-400 hover:shadow-sm transition-all text-left group">
              <Shield size={16} className="text-red-500" />
              <span className="text-xs font-bold text-slate-600">Firewall / UTM</span>
            </button>
            <button onClick={() => addNode('camera',   'Câmera IP')}    className="flex items-center gap-3 p-2 bg-white border border-sky-200 rounded hover:border-sky-400 hover:shadow-sm transition-all text-left group">
              <Camera size={16} className="text-sky-500" />
              <span className="text-xs font-bold text-slate-600">Câmera IP</span>
            </button>
            <button onClick={() => addNode('nvr',      'NVR')}          className="flex items-center gap-3 p-2 bg-white border border-slate-300 rounded hover:border-slate-500 hover:shadow-sm transition-all text-left group">
              <HardDrive size={16} className="text-slate-500" />
              <span className="text-xs font-bold text-slate-600">NVR</span>
            </button>

            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 mb-1">Geral</h3>

            <button onClick={() => addNode('server', 'Servidor')}    className="flex items-center gap-3 p-2 bg-white border border-slate-300 rounded hover:border-slate-500 hover:shadow-sm transition-all text-left group">
              <Server size={16} className="text-slate-600" />
              <span className="text-xs font-bold text-slate-600">Servidor / NAS</span>
            </button>
            <button onClick={() => addNode('cloud',  'Internet')}    className="flex items-center gap-3 p-2 bg-white border border-gray-200 rounded hover:border-gray-400 hover:shadow-sm transition-all text-left group">
              <Cloud size={16} className="text-gray-500" />
              <span className="text-xs font-bold text-slate-600">Nuvem / Internet</span>
            </button>
            <button onClick={() => addNode('client', 'Computador')}  className="flex items-center gap-3 p-2 bg-white border border-blue-200 rounded hover:border-blue-400 hover:shadow-sm transition-all text-left group">
              <Monitor size={16} className="text-blue-500" />
              <span className="text-xs font-bold text-slate-600">PC / Notebook</span>
            </button>
            <button onClick={() => addNode('mobile', 'Smartphone')}  className="flex items-center gap-3 p-2 bg-white border border-pink-200 rounded hover:border-pink-400 hover:shadow-sm transition-all text-left group">
              <Smartphone size={16} className="text-pink-500" />
              <span className="text-xs font-bold text-slate-600">Smartphone</span>
            </button>

            <div className="mt-auto pt-4 border-t border-slate-200">
              <button onClick={() => { setNodes([]); setEdges([]); setSelectedNode(null); setSelectedEdge(null); }}
                className="w-full text-center text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest p-2">
                Limpar Tela
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-slate-50" ref={reactFlowRef}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onSelectionChange={onSelectionChange}
              onInit={rf => { rfRef.current = rf; }}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              defaultViewport={defaultViewport}
              deleteKeyCode={['Backspace', 'Delete']}
              fitView
            >
              <Background color="#f1f5f9" gap={24} size={1.5} />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>

          {/* Painel de Propriedades */}
          <div className="w-56 bg-slate-50 border-l border-slate-200 p-4 flex flex-col gap-3 overflow-y-auto topology-toolbar z-10">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Propriedades</h3>

            {!selectedNode && !selectedEdge && (
              <div className="text-[10px] text-slate-400 italic text-center mt-6 p-4 border border-dashed border-slate-200 rounded">
                Selecione um equipamento ou conexão para editar suas propriedades.
              </div>
            )}

            {selectedNode && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                <div className="p-2 bg-indigo-50 border border-indigo-100 rounded text-[10px] font-bold text-indigo-700 uppercase tracking-widest text-center">
                  {selectedNode.type}
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Nome / Apelido</label>
                  <input type="text" value={selectedNode.data?.label || ''}
                    onChange={e => updateNodeData(selectedNode.id, 'label', e.target.value)}
                    className="w-full text-xs p-1.5 border border-slate-200 rounded mt-1 outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Endereço IP</label>
                  <input type="text" value={selectedNode.data?.ip || ''}
                    onChange={e => updateNodeData(selectedNode.id, 'ip', e.target.value)}
                    placeholder="Ex: 192.168.1.1"
                    className="w-full text-xs p-1.5 border border-slate-200 rounded mt-1 font-mono outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Porta / Interface</label>
                  <input type="text" value={selectedNode.data?.port || ''}
                    onChange={e => updateNodeData(selectedNode.id, 'port', e.target.value)}
                    placeholder="Ex: Gi0/1"
                    className="w-full text-xs p-1.5 border border-slate-200 rounded mt-1 font-mono outline-none focus:border-indigo-400" />
                </div>
                <div className="pt-4 mt-2 border-t border-slate-200">
                  <button onClick={deleteSelectedNode}
                    className="w-full py-2 bg-red-50 text-red-600 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors border border-red-100">
                    Excluir Equipamento
                  </button>
                </div>
              </div>
            )}

            {selectedEdge && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                <div className="p-2 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-700 uppercase tracking-widest text-center">
                  Conexão
                </div>

                {/* Tipo de cabo */}
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Tipo de Conexão</label>
                  <div className="grid grid-cols-2 gap-1 mt-2">
                    {Object.entries(EDGE_TYPE_OPTIONS).map(([type, { label, color }]) => {
                      const active = (selectedEdge.data?.edgeType || 'ethernet') === type;
                      return (
                        <button key={type}
                          onClick={() => updateEdgeData(selectedEdge.id, 'edgeType', type)}
                          className="px-2 py-1.5 rounded text-[9px] font-bold border transition-all"
                          style={{
                            color,
                            borderColor: active ? color : '#e2e8f0',
                            background: active ? `${color}18` : 'white',
                          }}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Rótulo Central</label>
                  <input type="text" value={selectedEdge.data?.label || ''}
                    onChange={e => updateEdgeData(selectedEdge.id, 'label', e.target.value)}
                    placeholder="Ex: VLAN 10, Trunk..."
                    className="w-full text-xs p-1.5 border border-slate-200 rounded mt-1 outline-none focus:border-[#00A360]" />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase">IP Ponta A</label>
                  <input type="text" value={selectedEdge.data?.sourceIP || ''}
                    onChange={e => updateEdgeData(selectedEdge.id, 'sourceIP', e.target.value)}
                    placeholder="Ex: 192.168.1.1"
                    className="w-full text-xs p-1.5 border border-slate-200 rounded mt-1 font-mono outline-none focus:border-[#00A360]" />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase">IP Ponta B</label>
                  <input type="text" value={selectedEdge.data?.targetIP || ''}
                    onChange={e => updateEdgeData(selectedEdge.id, 'targetIP', e.target.value)}
                    placeholder="Ex: 192.168.1.2"
                    className="w-full text-xs p-1.5 border border-slate-200 rounded mt-1 font-mono outline-none focus:border-[#00A360]" />
                </div>
                <div className="pt-4 mt-2 border-t border-slate-200">
                  <button onClick={deleteSelectedEdge}
                    className="w-full py-2 bg-red-50 text-red-600 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors border border-red-100">
                    Remover Conexão
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopologyModal;
