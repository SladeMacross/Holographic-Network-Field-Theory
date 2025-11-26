import React, { useState } from 'react';

const HNetMap = () => {
  const [selectedNode, setSelectedNode] = useState(null);

  const details = {
    // HNet Core Concepts
    'network-field': {
      title: 'Network-Field Hybrid',
      type: 'hnet-core',
      description: 'Your foundational substrate—neither pure network nor pure field, but a hybrid with properties of both plus emergent ones.',
      status: 'partial',
      connections: ['spin-networks', 'qft'],
      gap: 'The hybrid dynamics equations don\'t exist yet. LQG is pure network, QFT is pure field. Your synthesis is conceptual only.'
    },
    'holographic': {
      title: '3D Boundary-less Holography',
      type: 'hnet-core',
      description: 'Every local region encodes the correlation state of the whole—but self-contained, no external boundary.',
      status: 'gap',
      connections: ['ads-cft'],
      gap: 'AdS/CFT requires a boundary. Your boundary-less version addresses a known problem but has no formalism yet.'
    },
    'thermodynamic': {
      title: 'Thermodynamic Processing',
      type: 'hnet-core',
      description: 'The mechanism that actualizes geometric potentials—events that constrain and update correlations.',
      status: 'partial',
      connections: ['entropic-gravity', 'decoherence'],
      gap: 'Entropic gravity exists but doesn\'t include your Higgs→time connection.'
    },
    'higgs-time': {
      title: 'Higgs → Time Flow',
      type: 'hnet-core',
      description: 'Higgs interaction gives continuous time experience; no Higgs = event-time only (massless particles).',
      status: 'gap',
      connections: ['higgs-mechanism'],
      gap: 'This is entirely yours. No existing formalism unifies Higgs with time experience.'
    },
    'correlated-space': {
      title: 'Correlated Space',
      type: 'hnet-core',
      description: 'Space carries correlations intrinsically—objects connected through space itself.',
      status: 'strong',
      connections: ['relational-qm', 'entanglement'],
      gap: 'Relational QM captures this well. Your version adds the holographic encoding layer.'
    },
    'knot-particles': {
      title: 'Knot Topology → Particles',
      type: 'hnet-bridge',
      description: 'Particles as stable topological configurations (knots/twists) in the network-field.',
      status: 'partial',
      connections: ['bilson-thompson', 'knot-physics'],
      gap: 'First generation fermions work. Full Standard Model mapping incomplete.'
    },
    'decoherence-bridge': {
      title: 'Decoherence → Classical/GR',
      type: 'hnet-bridge',
      description: 'Environmental decoherence as the bridge to classical spacetime and cosmology.',
      status: 'strong',
      connections: ['decoherence', 'zurek'],
      gap: 'Formalism exists. Connection to your specific framework needs work.'
    },

    // Existing Formalisms
    'spin-networks': {
      title: 'Spin Networks (LQG)',
      type: 'existing',
      description: 'Graphs with edges labeled by spins, nodes by intertwiners. Quantum states of geometry.',
      status: 'exists',
      connections: ['network-field'],
      keyPeople: 'Penrose, Rovelli, Smolin'
    },
    'ads-cft': {
      title: 'AdS/CFT Correspondence',
      type: 'existing',
      description: 'Holographic duality between gravity in AdS space and CFT on its boundary.',
      status: 'exists',
      connections: ['holographic'],
      keyPeople: 'Maldacena, Witten'
    },
    'entropic-gravity': {
      title: 'Entropic Gravity',
      type: 'existing',
      description: 'Gravity as emergent from thermodynamic/entropic principles.',
      status: 'exists',
      connections: ['thermodynamic'],
      keyPeople: 'Jacobson, Verlinde'
    },
    'relational-qm': {
      title: 'Relational Quantum Mechanics',
      type: 'existing',
      description: 'Properties exist only relative to other systems. No observer-independent states.',
      status: 'exists',
      connections: ['correlated-space'],
      keyPeople: 'Rovelli'
    },
    'bilson-thompson': {
      title: 'Braid/Preon Models',
      type: 'existing',
      description: 'Particles as braided ribbons. Twists = charge, braids = chirality.',
      status: 'exists',
      connections: ['knot-particles'],
      keyPeople: 'Bilson-Thompson, Smolin, Kauffman'
    },
    'decoherence': {
      title: 'Decoherence Program',
      type: 'existing',
      description: 'Environment monitors quantum systems, causing classical behavior to emerge.',
      status: 'exists',
      connections: ['decoherence-bridge', 'thermodynamic'],
      keyPeople: 'Zurek, Zeh, Joos'
    },
    'qft': {
      title: 'Quantum Field Theory',
      type: 'existing',
      description: 'Fields on continuous spacetime. Standard framework for particle physics.',
      status: 'exists',
      connections: ['network-field'],
      keyPeople: 'Standard physics'
    },
    'higgs-mechanism': {
      title: 'Higgs Mechanism',
      type: 'existing',
      description: 'Explains how particles acquire mass through Higgs field interaction.',
      status: 'exists',
      connections: ['higgs-time'],
      keyPeople: 'Higgs, Englert, etc.'
    },
    'entanglement': {
      title: 'Quantum Entanglement',
      type: 'existing',
      description: 'Non-local correlations between quantum systems.',
      status: 'exists',
      connections: ['correlated-space', 'holographic'],
      keyPeople: 'Bell, Aspect'
    },
    'knot-physics': {
      title: 'Knot Physics',
      type: 'existing',
      description: 'Spacetime as branched manifold, particles as knots.',
      status: 'exists',
      connections: ['knot-particles'],
      keyPeople: 'Various researchers'
    },
    'zurek': {
      title: 'Einselection / Quantum Darwinism',
      type: 'existing',
      description: 'Environment selects preferred basis states; information about system spreads redundantly.',
      status: 'exists',
      connections: ['decoherence-bridge'],
      keyPeople: 'Zurek'
    }
  };

  // Layout positions
  const positions = {
    // HNet core - center column
    'holographic': { x: 400, y: 80 },
    'network-field': { x: 250, y: 180 },
    'thermodynamic': { x: 550, y: 180 },
    'correlated-space': { x: 400, y: 280 },
    'higgs-time': { x: 550, y: 340 },
    
    // Bridges - lower center
    'knot-particles': { x: 250, y: 420 },
    'decoherence-bridge': { x: 550, y: 420 },
    
    // Existing formalisms - outer ring
    'ads-cft': { x: 580, y: 30 },
    'spin-networks': { x: 80, y: 140 },
    'qft': { x: 80, y: 240 },
    'entropic-gravity': { x: 720, y: 140 },
    'relational-qm': { x: 220, y: 340 },
    'entanglement': { x: 580, y: 280 },
    'higgs-mechanism': { x: 720, y: 340 },
    'bilson-thompson': { x: 80, y: 420 },
    'knot-physics': { x: 80, y: 500 },
    'decoherence': { x: 720, y: 420 },
    'zurek': { x: 720, y: 500 }
  };

  const getNodeColor = (node) => {
    const info = details[node];
    if (info.type === 'existing') return '#3b82f6'; // blue
    if (info.status === 'gap') return '#ef4444'; // red
    if (info.status === 'partial') return '#f59e0b'; // amber
    if (info.status === 'strong') return '#22c55e'; // green
    return '#6b7280'; // gray
  };

  const getNodeStyle = (node) => {
    const info = details[node];
    const baseStyle = {
      position: 'absolute',
      left: positions[node].x,
      top: positions[node].y,
      padding: '8px 12px',
      borderRadius: '8px',
      fontSize: '11px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      maxWidth: '120px',
      textAlign: 'center',
      lineHeight: '1.3',
      boxShadow: selectedNode === node ? '0 0 0 3px white, 0 0 0 5px ' + getNodeColor(node) : '0 2px 4px rgba(0,0,0,0.2)'
    };

    if (info.type === 'existing') {
      return {
        ...baseStyle,
        background: '#1e3a5f',
        border: '2px solid #3b82f6',
        color: '#93c5fd'
      };
    }
    
    return {
      ...baseStyle,
      background: getNodeColor(node),
      border: '2px solid white',
      color: 'white'
    };
  };

  // Draw connection lines
  const renderConnections = () => {
    const lines = [];
    Object.entries(details).forEach(([nodeId, info]) => {
      if (info.connections) {
        info.connections.forEach(targetId => {
          if (positions[targetId]) {
            const x1 = positions[nodeId].x + 60;
            const y1 = positions[nodeId].y + 20;
            const x2 = positions[targetId].x + 60;
            const y2 = positions[targetId].y + 20;
            
            const isHighlighted = selectedNode === nodeId || selectedNode === targetId;
            
            lines.push(
              <line
                key={`${nodeId}-${targetId}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isHighlighted ? '#fff' : '#4b5563'}
                strokeWidth={isHighlighted ? 2 : 1}
                strokeDasharray={details[nodeId].type === 'existing' || details[targetId].type === 'existing' ? '4,4' : 'none'}
                opacity={isHighlighted ? 1 : 0.5}
              />
            );
          }
        });
      }
    });
    return lines;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-2 text-center">HNet Theory: Concept Map</h1>
        <p className="text-gray-400 text-center text-sm mb-4">Click nodes to see details. Lines show connections between concepts.</p>
        
        {/* Legend */}
        <div className="flex justify-center gap-6 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span>Strong match exists</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-500"></div>
            <span>Partial match</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span>Gap (no existing math)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-900"></div>
            <span>Existing formalism</span>
          </div>
        </div>

        {/* Main diagram */}
        <div className="relative bg-gray-800 rounded-xl p-4" style={{ height: '580px' }}>
          {/* Labels for regions */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
            HNet Core
          </div>
          <div className="absolute top-2 left-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">
            Existing Math
          </div>
          <div className="absolute top-2 right-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">
            Existing Math
          </div>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
            Bridges to Physics
          </div>

          {/* SVG for connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {renderConnections()}
          </svg>

          {/* Nodes */}
          {Object.keys(details).map(nodeId => (
            <div
              key={nodeId}
              style={getNodeStyle(nodeId)}
              onClick={() => setSelectedNode(selectedNode === nodeId ? null : nodeId)}
            >
              {details[nodeId].title}
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selectedNode && (
          <div className="mt-4 bg-gray-800 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold" style={{ color: getNodeColor(selectedNode) }}>
                  {details[selectedNode].title}
                </h2>
                <p className="text-gray-300 mt-2">{details[selectedNode].description}</p>
              </div>
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
            
            {details[selectedNode].type !== 'existing' && details[selectedNode].gap && (
              <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Gap / What's Missing</div>
                <p className="text-gray-200 text-sm">{details[selectedNode].gap}</p>
              </div>
            )}
            
            {details[selectedNode].keyPeople && (
              <div className="mt-4 text-sm text-gray-400">
                <span className="font-semibold">Key people:</span> {details[selectedNode].keyPeople}
              </div>
            )}
            
            {details[selectedNode].connections && (
              <div className="mt-4">
                <div className="text-xs text-gray-400 uppercase font-semibold mb-2">Connected to:</div>
                <div className="flex flex-wrap gap-2">
                  {details[selectedNode].connections.map(conn => (
                    <button
                      key={conn}
                      onClick={() => setSelectedNode(conn)}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        background: getNodeColor(conn) + '33',
                        border: '1px solid ' + getNodeColor(conn),
                        color: getNodeColor(conn)
                      }}
                    >
                      {details[conn]?.title || conn}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-4 gap-4 text-center text-sm">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-500">2</div>
            <div className="text-gray-400">Strong matches</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold text-amber-500">3</div>
            <div className="text-gray-400">Partial matches</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-500">2</div>
            <div className="text-gray-400">Gaps (need new math)</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-500">10</div>
            <div className="text-gray-400">Existing formalisms</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HNetMap;
