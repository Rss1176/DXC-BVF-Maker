import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, GripVertical, Download, Layout, Edit3, 
  Printer, RotateCcw, Menu, ChevronLeft, ChevronRight, 
  FileText, PlusCircle, Save, X, CheckCircle, Monitor, File
} from 'lucide-react';

// --- Generic Initial Data (Template) ---

const GENERIC_TEMPLATE = {
  corporateStrategy: [],
  pillars: [],
  businessHeaders: [],
  kpis: [],
  strategies: [],
  businessInitiatives: [],
  functionalAreas: [],
  dxcInitiatives: [],
  // Financials now handled as direct text state, empty by default for "pencil" state
  financialText: {
    growth: '',
    cashFlow: '',
    investments: '',
    leverage: ''
  }
};

// --- Helper Functions ---

const getCurrentDateString = () => {
  const date = new Date();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  return `${month} ${year}`;
};

const getDefaultBvfName = () => {
  return `BVF - Account - ${getCurrentDateString()}`;
};

// --- Components ---

// Dedicated component to handle auto-resizing text AREAS (Inputs)
const AutoTextArea = ({ value, onChange, placeholder, className, style }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      rows={1}
      // Added !border-none to allow overriding the default border if needed by className
      className={`w-full p-2 text-sm border border-gray-300 outline-none transition-all resize-none overflow-hidden block ${className}`}
      placeholder={placeholder}
      style={{ minHeight: '32px', ...style }}
    />
  );
};

// Dedicated component to handle auto-scaling font size in BOXES (Output)
const FitText = ({ text, styleClass }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    // Determine max starting size based on class heuristics
    let size = 12; // default
    if (styleClass.includes('text-[10px]')) size = 10;
    else if (styleClass.includes('text-xs')) size = 12;
    else if (styleClass.includes('text-sm')) size = 14;
    else if (styleClass.includes('text-lg')) size = 18;
    else if (styleClass.includes('text-xl')) size = 20;

    // Apply starting size
    textEl.style.fontSize = `${size}px`;

    // Shrink loop: reduce size until scrollHeight fits within clientHeight
    // We add a small buffer (size > 6) to prevent infinite loops or unreadable text
    while (textEl.scrollHeight > container.clientHeight && size > 6) {
      size -= 0.5;
      textEl.style.fontSize = `${size}px`;
    }
  }, [text, styleClass]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
      <span 
        ref={textRef} 
        className="w-full text-center block whitespace-normal break-words leading-tight px-1"
        style={{ wordBreak: 'break-word' }}
      >
        {text}
      </span>
    </div>
  );
};

const InputSection = ({ title, items, onAdd, onRemove, onUpdate }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
      <h3 className="text-base font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">
        {title}
      </h3>
      <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
        {items.length === 0 && (
            <div className="text-xs text-gray-400 italic text-center py-4">No items added yet.</div>
        )}
        {items.map((item) => (
          <div key={item.id} className="flex group items-stretch">
            <div className="flex-1 relative">
              <AutoTextArea 
                value={item.text} 
                onChange={(e) => onUpdate(item.id, e.target.value)}
                placeholder="Enter item..."
                className="rounded-l-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="px-2 h-auto bg-gray-50 border-y border-r border-gray-300 rounded-r-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100">
        <button
            onClick={onAdd}
            className="w-full flex items-center justify-center gap-2 p-2 border border-dashed border-gray-300 rounded-md text-sm text-gray-500 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all font-medium"
            >
            <Plus size={16} /> Add New
        </button>
      </div>
    </div>
  );
};

const CreateModal = ({ isOpen, onClose, onCreate }) => {
  const [accountName, setAccountName] = useState('');
  const [dateStr, setDateStr] = useState('');

  // Update default name when modal opens
  useEffect(() => {
    if (isOpen) {
        setAccountName('');
        setDateStr(getCurrentDateString());
    }
  }, [isOpen]);

  const handleCreate = () => {
      const fullName = `BVF - ${accountName} - ${dateStr}`;
      onCreate(fullName);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Create New BVF</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Framework Name</label>
          <div className="flex items-center gap-2">
              <div className="px-3 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 font-medium select-none whitespace-nowrap">
                  BVF -
              </div>
              <input
                type="text"
                autoFocus
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Account Name"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none min-w-0"
              />
              <div className="text-gray-400 font-bold select-none">-</div>
              <input
                type="text"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                placeholder="Date"
                className="w-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-center"
              />
          </div>
          <p className="text-xs text-gray-400 mt-2 ml-1">Example: BVF - Coca Cola - {getCurrentDateString()}</p>
        </div>

        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreate}
            disabled={!accountName.trim() || !dateStr.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-medium flex items-center gap-2"
          >
            <CheckCircle size={18} /> Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default function BVFBuilder() {
  // --- App Shell State ---
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bvfs, setBvfs] = useState([
    { 
      id: 'bvf-1', 
      name: getDefaultBvfName(), 
      lastModified: new Date(), 
      data: JSON.parse(JSON.stringify(GENERIC_TEMPLATE)), 
      layoutMap: {},
      customLabels: {
        kpiRow1: 'Customer Base',
        kpiRow2: 'Revenue',
        kpiRow3: 'EBITDA'
      }
    }
  ]);
  const [activeBvfId, setActiveBvfId] = useState('bvf-1');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pageSize, setPageSize] = useState('fluid'); // 'fluid' | '16:9' | 'a4'

  // --- Derived State for Active Editor ---
  const activeBvfIndex = bvfs.findIndex(b => b.id === activeBvfId);
  const activeBvf = bvfs[activeBvfIndex] || bvfs[0];

  const [activeTab, setActiveTab] = useState('information');
  const [draggedItem, setDraggedItem] = useState(null);

  // --- BVF Management Handlers ---

  const handleCreateBVF = (name) => {
    if (!name.trim()) return;
    
    const newId = `bvf-${Date.now()}`;
    const newBVF = {
      id: newId,
      name: name,
      lastModified: new Date(),
      data: JSON.parse(JSON.stringify(GENERIC_TEMPLATE)),
      layoutMap: {},
      customLabels: {
        kpiRow1: 'Customer Base',
        kpiRow2: 'Revenue',
        kpiRow3: 'EBITDA'
      }
    };
    setBvfs([...bvfs, newBVF]);
    setActiveBvfId(newId);
    setActiveTab('information');
    setShowCreateModal(false);
  };

  const deleteBVF = (e, id) => {
    e.stopPropagation();
    if (bvfs.length === 1) {
      alert("You must have at least one BVF.");
      return;
    }
    if (confirm("Are you sure you want to delete this BVF?")) {
      const newBvfs = bvfs.filter(b => b.id !== id);
      setBvfs(newBvfs);
      if (activeBvfId === id) {
        setActiveBvfId(newBvfs[0].id);
      }
    }
  };

  const updateActiveBvfData = (newData) => {
    const updatedBvfs = [...bvfs];
    updatedBvfs[activeBvfIndex] = { ...activeBvf, data: newData, lastModified: new Date() };
    setBvfs(updatedBvfs);
  };

  const updateActiveBvfLayout = (newLayout) => {
    const updatedBvfs = [...bvfs];
    updatedBvfs[activeBvfIndex] = { ...activeBvf, layoutMap: newLayout, lastModified: new Date() };
    setBvfs(updatedBvfs);
  };

  const updateActiveBvfLabels = (key, value) => {
    const updatedBvfs = [...bvfs];
    updatedBvfs[activeBvfIndex] = { 
        ...activeBvf, 
        customLabels: { ...activeBvf.customLabels, [key]: value },
        lastModified: new Date() 
    };
    setBvfs(updatedBvfs);
  };
  
  const updateFinancialText = (key, value) => {
    const newData = { ...activeBvf.data };
    if (!newData.financialText) newData.financialText = {};
    newData.financialText[key] = value;
    updateActiveBvfData(newData);
  };

  const updateBvfName = (name) => {
    const updatedBvfs = [...bvfs];
    updatedBvfs[activeBvfIndex] = { ...activeBvf, name: name };
    setBvfs(updatedBvfs);
  };

  // --- Editor Handlers ---

  const addItem = (sectionKey) => {
    const newData = { ...activeBvf.data };
    const newItem = { id: `${sectionKey}-${Date.now()}`, text: '' };
    newData[sectionKey] = [...newData[sectionKey], newItem];
    updateActiveBvfData(newData);
  };

  const removeItem = (sectionKey, id) => {
    const newData = { ...activeBvf.data };
    newData[sectionKey] = newData[sectionKey].filter(item => item.id !== id);
    
    // Also remove from layout if it exists
    const newLayout = { ...activeBvf.layoutMap };
    let layoutChanged = false;
    Object.keys(newLayout).forEach(key => {
      if (newLayout[key]?.id === id) {
        delete newLayout[key];
        layoutChanged = true;
      }
    });

    updateActiveBvfData(newData);
    if (layoutChanged) updateActiveBvfLayout(newLayout);
  };

  const updateItem = (sectionKey, id, text) => {
    const newData = { ...activeBvf.data };
    newData[sectionKey] = newData[sectionKey].map(item => item.id === id ? { ...item, text } : item);
    
    // Sync with layout map
    const newLayout = { ...activeBvf.layoutMap };
    let layoutChanged = false;
    Object.keys(newLayout).forEach(slotId => {
      if (newLayout[slotId].id === id) {
        newLayout[slotId] = { ...newLayout[slotId], text: text };
        layoutChanged = true;
      }
    });

    updateActiveBvfData(newData);
    if (layoutChanged) updateActiveBvfLayout(newLayout);
  };

  // --- Drag & Drop Handlers ---

  const handleDragStart = (e, item, type) => {
    const isUsed = Object.values(activeBvf.layoutMap).some(placed => placed.id === item.id);
    if (isUsed) {
        e.preventDefault();
        return;
    }

    setDraggedItem({ item, type });
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, slotId, allowedType) => {
    e.preventDefault();
    if (draggedItem) {
        // Enforce type checking
        if (allowedType && draggedItem.type !== allowedType) {
            alert(`You can only drop ${allowedType} items here.`);
            return;
        }

      const newLayout = { ...activeBvf.layoutMap, [slotId]: draggedItem.item };
      updateActiveBvfLayout(newLayout);
      setDraggedItem(null);
    }
  };

  const clearSlot = (slotId) => {
    const newLayout = { ...activeBvf.layoutMap };
    delete newLayout[slotId];
    updateActiveBvfLayout(newLayout);
  };

  const resetLayout = () => {
    if(window.confirm("Are you sure you want to clear the entire layout for this BVF?")) {
        updateActiveBvfLayout({});
    }
  };

  // --- Helper Components ---

  const DropZone = ({ slotId, placeholder, className, styleType = "default", allowedType }) => {
    const content = activeBvf.layoutMap[slotId];
    
    // VISUAL FEEDBACK LOGIC
    const isDragging = !!draggedItem;
    const isValidTarget = isDragging && allowedType === draggedItem.type;
    // 50% opacity for non-targets when dragging
    const opacityClass = isDragging && !isValidTarget ? "opacity-50 blur-[1px]" : "opacity-100";
    
    const styles = {
      // Solid styles (NO DASHES)
      header: "bg-purple-900 text-white font-bold flex items-center justify-center text-center p-2 text-lg",
      subHeader: "bg-purple-900 text-white font-semibold flex items-center justify-center text-center p-2 text-sm",
      kpiBox: "bg-white border-2 border-purple-900 p-2 text-xs font-medium flex items-center",
      pillar: "bg-zinc-200 border-2 border-black p-2 text-black text-sm font-semibold flex items-center justify-center text-center",
      initiative: "bg-zinc-200 border-2 border-black p-2 text-xs text-black font-medium hover:bg-zinc-100 text-center flex items-center justify-center",
      functional: "bg-purple-900 text-white text-xs font-medium p-2 text-center flex items-center justify-center",
      
      // Empty/Placeholder style (HAS DASHES)
      default: "bg-gray-50 border-2 border-dashed border-gray-300 p-2 text-gray-400 text-xs flex items-center justify-center text-center"
    };

    let activeClass = styles[styleType] || styles.default;

    if (!content) {
      return (
        <div 
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, slotId, allowedType)}
          className={`${styles.default} ${className} ${opacityClass} transition-all duration-200 hover:border-purple-400 hover:bg-purple-50 cursor-pointer min-h-[40px] h-full`}
        >
          {placeholder || (allowedType ? `Drop ${allowedType}` : "Drop Here")}
        </div>
      );
    }

    return (
      <div className={`relative group h-full w-full ${activeClass} ${className} ${opacityClass} transition-all duration-200`}>
        {/* Use FitText for content to ensure it fits nicely without overflowing */}
        <FitText text={content.text} styleClass={`${activeClass} ${className}`} />
        <button 
          onClick={() => clearSlot(slotId)}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden shadow-sm z-10"
          title="Remove from slot"
        >
          <Trash2 size={10} />
        </button>
      </div>
    );
  };

  // Global opacity class for container elements when dragging
  // Only fade the container if we are dragging something that DOESN'T belong in the KPI matrix (i.e. not a kpi or header)
  const isKpiOrHeaderDrag = draggedItem && (draggedItem.type === 'kpi' || draggedItem.type === 'businessHeader');
  const containerOpacityClass = (draggedItem && !isKpiOrHeaderDrag) ? "opacity-50 blur-[1px]" : "opacity-100";

  // Page sizing style logic
  const getContainerStyle = () => {
    switch (pageSize) {
      case '16:9':
        return 'aspect-video w-full max-w-7xl mx-auto';
      case 'a4':
        return 'w-[297mm] min-h-[210mm] mx-auto shadow-xl'; // A4 Landscape
      default:
        return 'w-full'; // Fluid
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-slate-800 overflow-hidden">
      
      <CreateModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onCreate={handleCreateBVF} 
      />

      {/* --- LEFT SIDEBAR (APP NAVIGATION) --- */}
      <div 
        className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-neutral-950 text-neutral-400 flex flex-col transition-all duration-300 ease-in-out print:hidden shadow-xl shrink-0 z-50`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-800">
          {sidebarOpen && <span className="font-bold text-white tracking-wide">My Workspace</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:text-white transition-colors">
            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* BVF List */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-3 mb-2">
            {sidebarOpen && <p className="text-xs font-bold text-neutral-500 uppercase mb-2">My Frameworks</p>}
            <button 
              onClick={() => setShowCreateModal(true)}
              className={`flex items-center gap-2 w-full p-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg transition-colors shadow-lg shadow-purple-900/20 ${!sidebarOpen && 'justify-center'}`}
            >
              <PlusCircle size={20} />
              {sidebarOpen && <span className="font-medium text-sm">Create New BVF</span>}
            </button>
          </div>

          <div className="space-y-1 mt-4 px-2">
            {bvfs.map(bvf => (
              <div 
                key={bvf.id}
                onClick={() => setActiveBvfId(bvf.id)}
                className={`group relative flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                  activeBvfId === bvf.id 
                    ? 'bg-neutral-800 text-white border-l-4 border-purple-500' 
                    : 'hover:bg-neutral-800/50 hover:text-white border-l-4 border-transparent'
                } ${!sidebarOpen && 'justify-center px-0'}`}
              >
                <FileText size={18} className="shrink-0" />
                {sidebarOpen && (
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">{bvf.name}</p>
                    <p className="text-[10px] text-neutral-500">
                        {bvf.lastModified.toLocaleDateString()}
                    </p>
                  </div>
                )}
                {sidebarOpen && bvfs.length > 1 && (
                    <button 
                        onClick={(e) => deleteBVF(e, bvf.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- MAIN APP AREA --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shrink-0 print:hidden z-40">
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-purple-700 rounded-lg flex items-center justify-center text-white font-bold">B</div>
                <input 
                    type="text" 
                    value={activeBvf.name}
                    onChange={(e) => updateBvfName(e.target.value)}
                    className="text-xl font-bold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-purple-500 outline-none px-1 transition-all w-64 md:w-96"
                />
            </div>
            
            <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 p-1 rounded-lg mr-4">
                    <button
                        onClick={() => setActiveTab('information')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'information' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Edit3 size={16} /> <span className="hidden sm:inline">Information</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'create' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Layout size={16} /> <span className="hidden sm:inline">Create & Format</span>
                    </button>
                </div>
            </div>
        </div>

        {/* --- SCROLLABLE CONTENT AREA --- */}
        <div className="flex-1 overflow-hidden relative bg-gray-50">
          
          {/* TAB 1: INFORMATION */}
          {activeTab === 'information' && (
            <div className="h-full overflow-y-auto p-6 md:p-8">
              <div className="max-w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6 border-b border-gray-200 pb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Information Collection</h2>
                    <p className="text-gray-500 mt-1">Populate your framework data here.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-12">
                    
                    <InputSection 
                        title="Corporate Strategy" 
                        items={activeBvf.data.corporateStrategy} 
                        onAdd={() => addItem('corporateStrategy')}
                        onRemove={(id) => removeItem('corporateStrategy', id)}
                        onUpdate={(id, val) => updateItem('corporateStrategy', id, val)}
                    />

                    <InputSection 
                        title="Strategic Pillars" 
                        items={activeBvf.data.pillars} 
                        onAdd={() => addItem('pillars')}
                        onRemove={(id) => removeItem('pillars', id)}
                        onUpdate={(id, val) => updateItem('pillars', id, val)}
                    />
                    
                    <InputSection 
                        title="Business Headers" 
                        items={activeBvf.data.businessHeaders} 
                        onAdd={() => addItem('businessHeaders')}
                        onRemove={(id) => removeItem('businessHeaders', id)}
                        onUpdate={(id, val) => updateItem('businessHeaders', id, val)}
                    />

                    <InputSection 
                        title="Executive KPIs" 
                        items={activeBvf.data.kpis} 
                        onAdd={() => addItem('kpis')}
                        onRemove={(id) => removeItem('kpis', id)}
                        onUpdate={(id, val) => updateItem('kpis', id, val)}
                    />

                    <InputSection 
                        title="Business Strategies" 
                        items={activeBvf.data.strategies} 
                        onAdd={() => addItem('strategies')}
                        onRemove={(id) => removeItem('strategies', id)}
                        onUpdate={(id, val) => updateItem('strategies', id, val)}
                    />

                    <InputSection 
                        title="Business Initiatives" 
                        items={activeBvf.data.businessInitiatives} 
                        onAdd={() => addItem('businessInitiatives')}
                        onRemove={(id) => removeItem('businessInitiatives', id)}
                        onUpdate={(id, val) => updateItem('businessInitiatives', id, val)}
                    />

                     <InputSection 
                        title="Functional Areas" 
                        items={activeBvf.data.functionalAreas} 
                        onAdd={() => addItem('functionalAreas')}
                        onRemove={(id) => removeItem('functionalAreas', id)}
                        onUpdate={(id, val) => updateItem('functionalAreas', id, val)}
                    />

                    <InputSection 
                        title="DXC Initiatives" 
                        items={activeBvf.data.dxcInitiatives} 
                        onAdd={() => addItem('dxcInitiatives')}
                        onRemove={(id) => removeItem('dxcInitiatives', id)}
                        onUpdate={(id, val) => updateItem('dxcInitiatives', id, val)}
                    />

                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE (BVF CANVAS) */}
          {activeTab === 'create' && (
            <div className="flex h-full">
              
              {/* Internal Sidebar: Draggable Items Pool */}
              <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden print:hidden shrink-0 z-30 shadow-lg">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <Layout size={18} /> Available Tiles
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Greyed out items are already on the board.</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
                  {[
                    { title: "Corp Strategy", type: "corporateStrategy", items: activeBvf.data.corporateStrategy, color: "bg-purple-100 border-purple-300" },
                    { title: "Pillars", type: "pillar", items: activeBvf.data.pillars, color: "bg-gray-100 border-gray-300" },
                    { title: "Bus. Headers", type: "businessHeader", items: activeBvf.data.businessHeaders, color: "bg-purple-100 border-purple-300" },
                    { title: "KPIs", type: "kpi", items: activeBvf.data.kpis, color: "bg-purple-50 border-purple-200" },
                    { title: "Strategies", type: "strategy", items: activeBvf.data.strategies, color: "bg-purple-50 border-purple-200" },
                    { title: "Bus. Initiatives", type: "businessInitiative", items: activeBvf.data.businessInitiatives, color: "bg-gray-100 border-gray-300" },
                    { title: "Functional", type: "functional", items: activeBvf.data.functionalAreas, color: "bg-purple-50 border-purple-200" },
                    { title: "DXC Initiatives", type: "dxcInitiative", items: activeBvf.data.dxcInitiatives, color: "bg-purple-50 border-purple-200" },
                  ].map((section) => (
                    <div key={section.title}>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 sticky top-0 bg-white py-1">{section.title}</h4>
                      <div className="space-y-2">
                        {section.items.map(item => {
                          const isPlaced = Object.values(activeBvf.layoutMap).some(l => l.id === item.id);
                          return (
                            <div
                              key={item.id}
                              draggable={!isPlaced}
                              onDragStart={(e) => handleDragStart(e, item, section.type)}
                              onDragEnd={handleDragEnd}
                              className={`
                                p-3 rounded-lg border text-sm flex items-start gap-2 transition-all
                                ${section.color}
                                ${isPlaced 
                                    ? 'opacity-40 grayscale cursor-not-allowed bg-gray-100 border-gray-200' 
                                    : 'cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md hover:scale-[1.02]'
                                }
                              `}
                            >
                              {!isPlaced && <GripVertical size={14} className="mt-1 opacity-40 shrink-0" />}
                              <span className="leading-tight select-none">{item.text || "Empty Item"}</span>
                              {isPlaced && <span className="ml-auto text-[10px] font-bold text-gray-400">USED</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Canvas Area */}
              <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-100/50">
                  <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white print:hidden">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                           <Layout size={14} />
                           <span>Drag items to their matching color-coded zones.</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        {/* VIEW MODE TOGGLE */}
                        <div className="flex bg-gray-200 p-1 rounded-lg mr-2">
                            <button onClick={() => setPageSize('fluid')} className={`p-1.5 rounded ${pageSize === 'fluid' ? 'bg-white shadow text-black' : 'text-gray-500'}`} title="Full Width"><Layout size={16}/></button>
                            <button onClick={() => setPageSize('16:9')} className={`p-1.5 rounded ${pageSize === '16:9' ? 'bg-white shadow text-black' : 'text-gray-500'}`} title="16:9 (PowerPoint)"><Monitor size={16}/></button>
                            <button onClick={() => setPageSize('a4')} className={`p-1.5 rounded ${pageSize === 'a4' ? 'bg-white shadow text-black' : 'text-gray-500'}`} title="A4 (Print)"><FileText size={16}/></button>
                        </div>

                        <button 
                            onClick={resetLayout}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Clear Layout"
                        >
                            <RotateCcw size={18} />
                        </button>
                        <button 
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm shadow-md"
                        >
                            <Printer size={16} /> Print / Save PDF
                        </button>
                      </div>
                  </div>

                {/* SCROLLABLE CONTAINER FOR THE DIAGRAM */}
                <div className="flex-1 overflow-auto p-8 print:p-0 print:overflow-visible">
                  
                  {/* --- THE BVF DIAGRAM --- */}
                  <div className={`${getContainerStyle()} bg-white shadow-2xl p-8 print:shadow-none print:w-full print:mx-0 print:border-none flex flex-col gap-3 transition-all duration-300`}>
                    
                    {/* Header */}
                    <div className="mb-4">
                      <h1 className="text-4xl font-bold text-purple-900 w-full text-center mb-2">
                        {activeBvf.name}
                      </h1>
                      <p className="text-center text-gray-400 text-sm uppercase tracking-widest">Business Value Framework</p>
                    </div>

                    {/* 1. Corporate Strategy Header */}
                    <div className="flex items-stretch">
                        <div className="w-32 font-bold text-sm flex items-center">Corporate<br/>Strategy</div>
                        <div className="flex-1">
                            <DropZone slotId="corp-strat" placeholder="Drop Corporate Strategy" allowedType="corporateStrategy" styleType="header" />
                        </div>
                    </div>

                    {/* 2. Pillars Row */}
                    <div className="flex">
                        <div className="w-32"></div>
                        <div className="flex-1 grid grid-cols-4 gap-2">
                            <DropZone slotId="pillar-1" placeholder="Pillar 1" allowedType="pillar" styleType="pillar" className="min-h-[4rem]" />
                            <DropZone slotId="pillar-2" placeholder="Pillar 2" allowedType="pillar" styleType="pillar" className="min-h-[4rem]" />
                            <DropZone slotId="pillar-3" placeholder="Pillar 3" allowedType="pillar" styleType="pillar" className="min-h-[4rem]" />
                            <DropZone slotId="pillar-4" placeholder="Pillar 4" allowedType="pillar" styleType="pillar" className="min-h-[4rem]" />
                        </div>
                    </div>

                    {/* 3. KPIS & FINANCIALS ROW (Mixed Grid) */}
                    <div className="flex mt-2 items-stretch">
                         <div className="w-32 font-bold text-sm flex items-center">Executive<br/>KPIs</div>
                         <div className="flex-1 flex gap-4">
                            
                            {/* LEFT SIDE: KPIs Matrix */}
                            <div className={`flex-1 border-2 border-gray-800 p-1 flex flex-col transition-all duration-200 ${containerOpacityClass}`}>
                                <div className="grid grid-cols-5 gap-1 mb-1">
                                    <div className="font-bold italic text-sm p-1">Businesses</div>
                                    <DropZone slotId="kpi-head-1" placeholder="Header" allowedType="businessHeader" styleType="subHeader" className="text-[10px]" />
                                    <DropZone slotId="kpi-head-2" placeholder="Header" allowedType="businessHeader" styleType="subHeader" className="text-[10px]"/>
                                    <DropZone slotId="kpi-head-3" placeholder="Header" allowedType="businessHeader" styleType="subHeader" className="text-[10px]"/>
                                    <DropZone slotId="kpi-head-4" placeholder="Header" allowedType="businessHeader" styleType="subHeader" className="text-[10px]"/>
                                </div>
                                
                                {/* Row 1 */}
                                <div className="grid grid-cols-5 gap-1 mb-1 flex-grow">
                                    <input 
                                        type="text"
                                        value={activeBvf.customLabels?.kpiRow1 || 'Customer Base'}
                                        onChange={(e) => updateActiveBvfLabels('kpiRow1', e.target.value)}
                                        className={`bg-purple-900 text-white text-xs font-semibold text-center p-1 border-none focus:ring-1 focus:ring-white outline-none transition-all duration-200 ${containerOpacityClass}`}
                                    />
                                    <DropZone slotId="kpi-row1-1" placeholder="Metric" allowedType="kpi" styleType="kpiBox" className="h-full" />
                                    <DropZone slotId="kpi-row1-2" placeholder="Metric" allowedType="kpi" styleType="kpiBox" className="h-full" />
                                    <DropZone slotId="kpi-row1-3" placeholder="Metric" allowedType="kpi" styleType="kpiBox" className="h-full" />
                                    <DropZone slotId="kpi-row1-4" placeholder="Metric" allowedType="kpi" styleType="kpiBox" className="h-full" />
                                </div>

                                {/* Row 2 */}
                                 <div className="grid grid-cols-5 gap-1 mb-1 flex-grow">
                                    <input 
                                        type="text"
                                        value={activeBvf.customLabels?.kpiRow2 || 'Revenue'}
                                        onChange={(e) => updateActiveBvfLabels('kpiRow2', e.target.value)}
                                        className={`bg-purple-900 text-white text-xs font-semibold text-center p-1 border-none focus:ring-1 focus:ring-white outline-none transition-all duration-200 ${containerOpacityClass}`}
                                    />
                                    <DropZone slotId="kpi-row2-1" placeholder="Metric" allowedType="kpi" styleType="kpiBox" className="h-full" />
                                    <DropZone slotId="kpi-row2-2" placeholder="Metric" allowedType="kpi" styleType="kpiBox" className="h-full" />
                                    <DropZone slotId="kpi-row2-3" placeholder="Metric" allowedType="kpi" styleType="kpiBox" className="h-full" />
                                    <DropZone slotId="kpi-row2-4" placeholder="Metric" allowedType="kpi" styleType="kpiBox" className="h-full" />
                                </div>

                                {/* Row 3 */}
                                 <div className="grid grid-cols-5 gap-1 flex-grow">
                                    <input 
                                        type="text"
                                        value={activeBvf.customLabels?.kpiRow3 || 'EBITDA'}
                                        onChange={(e) => updateActiveBvfLabels('kpiRow3', e.target.value)}
                                        className={`bg-purple-900 text-white text-xs font-semibold text-center p-1 border-none focus:ring-1 focus:ring-white outline-none transition-all duration-200 ${containerOpacityClass}`}
                                    />
                                    <DropZone slotId="kpi-row3-1" placeholder="Metric" allowedType="kpi" styleType="kpiBox" className="h-full" />
                                    <DropZone slotId="kpi-row3-2" placeholder="Metric" allowedType="kpi" styleType="kpiBox" className="h-full" />
                                    <DropZone slotId="kpi-row3-3" placeholder="Metric" allowedType="kpi" styleType="kpiBox" className="h-full" />
                                    <DropZone slotId="kpi-row3-4" placeholder="Metric" allowedType="kpi" styleType="kpiBox" className="h-full" />
                                </div>
                             </div>

                             {/* RIGHT SIDE: Financial Sidebar (Consolidated FY2024) */}
                             <div className={`w-64 border-2 border-black p-2 flex flex-col h-auto bg-gray-50/50 transition-all duration-200 ${draggedItem ? "opacity-50 blur-[1px]" : "opacity-100"}`}>
                                  <h4 className="font-bold italic mb-3 text-sm border-b border-gray-300 pb-1">Consolidated FY2024</h4>
                                  
                                  <div className="flex flex-col gap-3 flex-1">
                                      <div className="flex items-stretch min-h-[32px]">
                                          <div className="w-1/3 bg-purple-900 text-white text-[10px] p-1 flex items-center justify-center font-bold text-center">Growth</div>
                                          <div className="w-2/3 border-2 border-purple-900 border-l-0 bg-white relative">
                                            <AutoTextArea 
                                                value={activeBvf.data.financialText?.growth || ''}
                                                onChange={(e) => updateFinancialText('growth', e.target.value)}
                                                placeholder=""
                                                className="w-full h-full text-xs text-center font-bold bg-transparent border-none focus:ring-0 resize-none overflow-hidden"
                                                style={{ minHeight: '100%' }}
                                            />
                                            {!activeBvf.data.financialText?.growth && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-300">
                                                    <Edit3 size={14} />
                                                </div>
                                            )}
                                          </div>
                                      </div>
                                      <div className="flex items-stretch min-h-[32px]">
                                          <div className="w-1/3 bg-purple-900 text-white text-[10px] p-1 flex items-center justify-center font-bold text-center">Cash Flow</div>
                                          <div className="w-2/3 border-2 border-purple-900 border-l-0 bg-white relative">
                                            <AutoTextArea 
                                                value={activeBvf.data.financialText?.cashFlow || ''}
                                                onChange={(e) => updateFinancialText('cashFlow', e.target.value)}
                                                placeholder=""
                                                className="w-full h-full text-xs text-center font-bold bg-transparent border-none focus:ring-0 resize-none overflow-hidden"
                                                style={{ minHeight: '100%' }}
                                            />
                                            {!activeBvf.data.financialText?.cashFlow && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-300">
                                                    <Edit3 size={14} />
                                                </div>
                                            )}
                                          </div>
                                      </div>
                                      <div className="flex items-stretch min-h-[32px]">
                                          <div className="w-1/3 bg-purple-900 text-white text-[10px] p-1 flex items-center justify-center font-bold text-center">Investments</div>
                                          <div className="w-2/3 border-2 border-purple-900 border-l-0 bg-white relative">
                                            <AutoTextArea 
                                                value={activeBvf.data.financialText?.investments || ''}
                                                onChange={(e) => updateFinancialText('investments', e.target.value)}
                                                placeholder=""
                                                className="w-full h-full text-xs text-center font-bold bg-transparent border-none focus:ring-0 resize-none overflow-hidden"
                                                style={{ minHeight: '100%' }}
                                            />
                                            {!activeBvf.data.financialText?.investments && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-300">
                                                    <Edit3 size={14} />
                                                </div>
                                            )}
                                          </div>
                                      </div>
                                      <div className="flex items-stretch min-h-[32px]">
                                          <div className="w-1/3 bg-purple-900 text-white text-[10px] p-1 flex items-center justify-center font-bold text-center">Leverage</div>
                                          <div className="w-2/3 border-2 border-purple-900 border-l-0 bg-white relative">
                                            <AutoTextArea 
                                                value={activeBvf.data.financialText?.leverage || ''}
                                                onChange={(e) => updateFinancialText('leverage', e.target.value)}
                                                placeholder=""
                                                className="w-full h-full text-xs text-center font-bold bg-transparent border-none focus:ring-0 resize-none overflow-hidden"
                                                style={{ minHeight: '100%' }}
                                            />
                                            {!activeBvf.data.financialText?.leverage && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-300">
                                                    <Edit3 size={14} />
                                                </div>
                                            )}
                                          </div>
                                      </div>
                                  </div>
                              </div>
                         </div>
                    </div>

                    {/* 4. Business Strategies (FULL WIDTH) */}
                    <div className="flex mt-4">
                        <div className="w-32 font-bold text-sm flex items-center">Business<br/>Strategies</div>
                        <div className="flex-1 grid grid-cols-4 gap-2">
                            <DropZone slotId="strat-1" placeholder="Strategy 1" allowedType="strategy" styleType="subHeader" className="h-16" />
                            <DropZone slotId="strat-2" placeholder="Strategy 2" allowedType="strategy" styleType="subHeader" className="h-16" />
                            <DropZone slotId="strat-3" placeholder="Strategy 3" allowedType="strategy" styleType="subHeader" className="h-16" />
                            <DropZone slotId="strat-4" placeholder="Strategy 4" allowedType="strategy" styleType="subHeader" className="h-16" />
                        </div>
                    </div>

                     {/* 5. Business Initiatives Grid (FULL WIDTH) */}
                     <div className="flex mt-2">
                        <div className="w-32 font-bold text-sm flex items-center">Business<br/>Initiatives</div>
                        <div className="flex-1 grid grid-cols-4 gap-2">
                            {/* Col 1: 2 columns of 3 */}
                            <div className="grid grid-cols-2 gap-1">
                                <div className="flex flex-col gap-1">
                                    <DropZone slotId="init-c1-r1-c1" placeholder="Init" allowedType="businessInitiative" styleType="initiative" className="h-24 text-[10px]" />
                                    <DropZone slotId="init-c1-r2-c1" placeholder="Init" allowedType="businessInitiative" styleType="initiative" className="h-24 text-[10px]" />
                                    <DropZone slotId="init-c1-r3-c1" placeholder="Init" allowedType="businessInitiative" styleType="initiative" className="h-24 text-[10px]" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <DropZone slotId="init-c1-r1-c2" placeholder="Init" allowedType="businessInitiative" styleType="initiative" className="h-24 text-[10px]" />
                                    <DropZone slotId="init-c1-r2-c2" placeholder="Init" allowedType="businessInitiative" styleType="initiative" className="h-24 text-[10px]" />
                                    <DropZone slotId="init-c1-r3-c2" placeholder="Init" allowedType="businessInitiative" styleType="initiative" className="h-24 text-[10px]" />
                                </div>
                            </div>
                            {/* Col 2: 2 columns of 3 */}
                            <div className="grid grid-cols-2 gap-1">
                                <div className="flex flex-col gap-1">
                                    <DropZone slotId="init-c2-r1-c1" placeholder="Init" allowedType="businessInitiative" styleType="initiative" className="h-24 text-[10px]" />
                                    <DropZone slotId="init-c2-r2-c1" placeholder="Init" allowedType="businessInitiative" styleType="initiative" className="h-24 text-[10px]" />
                                    <DropZone slotId="init-c2-r3-c1" placeholder="Init" allowedType="businessInitiative" styleType="initiative" className="h-24 text-[10px]" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <DropZone slotId="init-c2-r1-c2" placeholder="Init" allowedType="businessInitiative" styleType="initiative" className="h-24 text-[10px]" />
                                    <DropZone slotId="init-c2-r2-c2" placeholder="Init" allowedType="businessInitiative" styleType="initiative" className="h-24 text-[10px]" />
                                    <DropZone slotId="init-c2-r3-c2" placeholder="Init" allowedType="businessInitiative" styleType="initiative" className="h-24 text-[10px]" />
                                </div>
                            </div>
                            {/* Col 3: 2 columns of 3 */}
                            <div className="grid grid-cols-2 gap-1">
                                <div className="flex flex-col gap-1">
                                    <DropZone slotId="init-c3-r1-c1" placeholder="Init" allowedType="businessInitiative" styleType="initiative" className="h-24 text-[10px]" />
                                    <DropZone slotId="init-c3-r2-c1" placeholder="Init" allowedType="businessInitiative" styleType="initiative" className="h-24 text-[10px]" />
                                    <DropZone slotId="init-c3-r3-c1" placeholder="Init" allowedType="businessInitiative" styleType="initiative" className="h-24 text-[10px]" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <DropZone slotId="init-c3-r1-c2" placeholder="Init" allowedType="businessInitiative" styleType="initiative" className="h-24 text-[10px]" />
                                    <DropZone slotId="init-c3-r2-c2" placeholder="Init" allowedType="businessInitiative" styleType="initiative" className="h-24 text-[10px]" />
                                    <DropZone slotId="init-c3-r3-c2" placeholder="Init" allowedType="businessInitiative" styleType="initiative" className="h-24 text-[10px]" />
                                </div>
                            </div>
                            {/* Col 4: 2 columns of 3 */}
                            <div className="grid grid-cols-2 gap-1">
                                <div className="flex flex-col gap-1">
                                    <DropZone slotId="init-c4-r1-c1" placeholder="Init" allowedType="businessInitiative" styleType="initiative" className="h-24 text-[10px]" />
                                    <DropZone slotId="init-c4-r2-c1" placeholder="Init" allowedType="businessInitiative" styleType="initiative" className="h-24 text-[10px]" />
                                    <DropZone slotId="init-c4-r3-c1" placeholder="Init" allowedType="businessInitiative" styleType="initiative" className="h-24 text-[10px]" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <DropZone slotId="init-c4-r1-c2" placeholder="Init" allowedType="businessInitiative" styleType="initiative" className="h-24 text-[10px]" />
                                    <DropZone slotId="init-c4-r2-c2" placeholder="Init" allowedType="businessInitiative" styleType="initiative" className="h-24 text-[10px]" />
                                    <DropZone slotId="init-c4-r3-c2" placeholder="Init" allowedType="businessInitiative" styleType="initiative" className="h-24 text-[10px]" />
                                </div>
                            </div>
                        </div>
                    </div>

                     {/* 6. Process / Functional Areas (FULL WIDTH) */}
                     <div className="flex mt-4">
                        <div className="w-32 font-bold text-sm flex items-center">Functional<br/>Areas</div>
                        <div className="flex-1 grid grid-cols-8 gap-2">
                            <DropZone slotId="func-1" placeholder="Area" allowedType="functional" styleType="functional" />
                            <DropZone slotId="func-2" placeholder="Area" allowedType="functional" styleType="functional" />
                            <DropZone slotId="func-3" placeholder="Area" allowedType="functional" styleType="functional" />
                            <DropZone slotId="func-4" placeholder="Area" allowedType="functional" styleType="functional" />
                            <DropZone slotId="func-5" placeholder="Area" allowedType="functional" styleType="functional" />
                            <DropZone slotId="func-6" placeholder="Area" allowedType="functional" styleType="functional" />
                            <DropZone slotId="func-7" placeholder="Area" allowedType="functional" styleType="functional" />
                            <DropZone slotId="func-8" placeholder="Area" allowedType="functional" styleType="functional" />
                        </div>
                    </div>

                    {/* 7. DXC Initiatives (FULL WIDTH) */}
                    <div className="flex mt-2">
                        <div className="w-32 font-bold text-sm flex items-center">DXC<br/>Initiatives</div>
                        <div className="flex-1 grid grid-cols-5 gap-2">
                            <DropZone slotId="dxc-1" placeholder="Initiative" allowedType="dxcInitiative" styleType="subHeader" className="h-16" />
                            <DropZone slotId="dxc-2" placeholder="Initiative" allowedType="dxcInitiative" styleType="subHeader" className="h-16" />
                            <DropZone slotId="dxc-3" placeholder="Initiative" allowedType="dxcInitiative" styleType="subHeader" className="h-16" />
                            <DropZone slotId="dxc-4" placeholder="Initiative" allowedType="dxcInitiative" styleType="subHeader" className="h-16" />
                            <DropZone slotId="dxc-5" placeholder="Initiative" allowedType="dxcInitiative" styleType="subHeader" className="h-16" />
                        </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
            body * {
                visibility: hidden;
            }
            .print\\:hidden {
                display: none !important;
            }
            main, .w-\\[1200px\\] {
                visibility: visible;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
            }
            .overflow-auto {
                overflow: visible !important;
            }
            /* Force background colors */
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
        }
      `}</style>
    </div>
  );
}