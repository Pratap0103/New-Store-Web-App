import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { GripVertical, X } from 'lucide-react';
import { 
  DndContext, 
  useDraggable, 
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import ModalForm from '../../components/ModalForm';
import { getIndents, saveIndents } from '../../utils/storageManager';

const RANK_COLORS = {
  T1: { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-700', badge: 'bg-amber-400' },
  T2: { bg: 'bg-slate-50',  border: 'border-slate-400',  text: 'text-slate-700',  badge: 'bg-slate-400'  },
  T3: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', badge: 'bg-orange-300' },
};

function DraggableVendor({ vendor, id, isInSlot, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: { vendor }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 999,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onClick && onClick(vendor)}
      className={`flex flex-col gap-1.5 p-2 bg-white border border-gray-200 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-300 transition-all select-none ${isDragging ? 'opacity-50 border-indigo-500 ring-2 ring-indigo-100' : ''}`}
    >
      <div className={`flex items-center gap-1.5 ${!isInSlot ? 'border-b border-gray-100 pb-1.5' : ''}`}>
        {!isInSlot && <GripVertical size={12} className="text-gray-300 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-gray-900 leading-tight uppercase break-words">{vendor.name}</p>
          <div className="flex justify-between items-center mt-0.5">
            <p className="text-[10px] text-indigo-600 font-bold">₹{vendor.basicRate}</p>
            {!isInSlot && <span className="text-[8px] font-bold text-gray-400">{vendor.quotationNo}</span>}
          </div>
        </div>
      </div>
      
      {!isInSlot && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <div>
            <span className="text-[8px] text-gray-400 uppercase font-bold block">QTN Date</span>
            <span className="text-[10px] text-gray-600 font-medium">{vendor.quotationDate}</span>
          </div>
          <div>
            <span className="text-[8px] text-gray-400 uppercase font-bold block">Delivery</span>
            <span className="text-[10px] text-gray-600 font-medium">{vendor.deliveryTime} Days</span>
          </div>
          <div>
            <span className="text-[8px] text-gray-400 uppercase font-bold block">Terms</span>
            <span className="text-[10px] text-gray-600 font-medium break-words">{vendor.paymentTerms}</span>
          </div>
          <div>
            <span className="text-[8px] text-gray-400 uppercase font-bold block">Make</span>
            <span className="text-[10px] text-gray-600 font-medium break-words">{vendor.make}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function DroppableSlot({ id, children, rank }) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  const colors = rank ? RANK_COLORS[rank] : null;

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border-2 border-dashed p-2 min-h-[80px] transition-all ${
        isOver 
          ? (rank ? `${colors.bg} ${colors.border}` : 'bg-indigo-50 border-indigo-300') 
          : 'border-gray-200 bg-gray-50'
      }`}
    >
      {rank && (
        <div className="flex items-center justify-center gap-1 mb-2">
          <span className={`${colors.badge} text-white text-[8px] font-black px-1.5 py-0.5 rounded`}>{rank}</span>
          <span className={`text-[9px] font-bold ${colors.text} uppercase tracking-tight`}>
            {rank === 'T1' ? 'Best' : rank === 'T2' ? '2nd' : '3rd'}
          </span>
        </div>
      )}
      {!rank && <p className="text-[9px] text-gray-400 uppercase font-bold mb-1.5">Unranked Vendors</p>}
      <div className="space-y-1.5">
        {children}
        {(!children || (Array.isArray(children) && children.length === 0)) && (
          <div className="flex items-center justify-center h-[42px] text-[10px] text-gray-400">
            {rank ? 'Drop vendor here' : 'All vendors ranked'}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TechnicalForm({ item, onClose, onSuccess }) {
  const vendorDetails = item.vendorRateInfo?.vendorDetails || [];
  const vendorType    = item.vendorRateInfo?.vendorType || 'Regular';
  const existingTA    = item.technicalApproval;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const [rankings, setRankings] = useState(() => {
    if (existingTA) {
      return {
        T1: existingTA.t1 ? { ...existingTA.t1, id: 'T1-vendor' } : null,
        T2: existingTA.t2 ? { ...existingTA.t2, id: 'T2-vendor' } : null,
        T3: existingTA.t3 ? { ...existingTA.t3, id: 'T3-vendor' } : null,
      };
    }
    // Auto-assign first vendor to T1 if Regular
    if (vendorType === 'Regular' && vendorDetails.length > 0) {
      return {
        T1: { ...vendorDetails[0], id: 'T1-vendor' },
        T2: null,
        T3: null
      };
    }
    return { T1: null, T2: null, T3: null };
  });

  const [pool, setPool] = useState(() => {
    let rankedNames = [];
    if (existingTA) {
      rankedNames = [existingTA.t1?.name, existingTA.t2?.name, existingTA.t3?.name].filter(Boolean);
    } else if (vendorType === 'Regular' && vendorDetails.length > 0) {
      rankedNames = [vendorDetails[0].name];
    }
    
    return vendorDetails
      .filter(v => !rankedNames.includes(v.name))
      .map((v, i) => ({ ...v, id: `pool-vendor-${i}` }));
  });

  const [loading, setLoading] = useState(false);

  const handleSelect = (vendor) => {
    // Only auto-assign if it's currently in the pool
    if (!pool.find(v => v.id === vendor.id)) return;

    setRankings(prev => {
      const next = { ...prev };
      // Find first empty slot
      const firstEmptySlot = ['T1', 'T2', 'T3'].find(slot => !next[slot]);
      
      if (firstEmptySlot) {
        next[firstEmptySlot] = vendor;
        // Remove from pool
        setPool(p => p.filter(v => v.id !== vendor.id));
        return next;
      }
      return prev;
    });
  };

  const handleRemove = (vendor) => {
    setRankings(prev => {
      const next = { ...prev };
      // Find which slot it's in
      const slot = ['T1', 'T2', 'T3'].find(s => next[s]?.id === vendor.id);
      if (slot) {
        next[slot] = null;
        setPool(p => [...p, vendor]);
        return next;
      }
      return prev;
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const sourceId = active.id;
    const targetId = over.id;

    if (sourceId === targetId) return;

    const vendor = active.data.current.vendor;

    setRankings(prev => {
        const next = { ...prev };
        // Remove from old slot if it was in one
        Object.keys(next).forEach(key => {
            if (next[key]?.id === sourceId) next[key] = null;
        });

        // Add to new slot if target is a slot
        if (['T1', 'T2', 'T3'].includes(targetId)) {
            const currentInTarget = next[targetId];
            next[targetId] = vendor;
            
            // If there was something in target, move it back to pool
            if (currentInTarget) {
                setPool(p => [...p, currentInTarget]);
            }
        }
        return next;
    });

    if (targetId === 'pool') {
        setPool(p => [...p, vendor]);
    } else {
        // Remove from pool if it was there
        setPool(p => p.filter(v => v.id !== sourceId));
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!rankings.T1) { toast.error('Please assign at least T1 ranking'); return; }
    
    try {
      setLoading(true);
      const allIndents = getIndents();
      const updated = allIndents.map(indent => {
        if (indent.id !== item.indentId) return indent;
        return {
          ...indent,
          items: indent.items.map(it => {
            if (it.itemCount !== item.itemCount) return it;
            // Remove our internal IDs before saving
            const cleanRank = (r) => {
                if (!r) return null;
                const { id, ...rest } = r;
                return rest;
            };
            return {
              ...it,
              technicalApproval: {
                t1: cleanRank(rankings.T1),
                t2: cleanRank(rankings.T2),
                t3: cleanRank(rankings.T3),
                rankedAt: new Date().toISOString()
              }
            };
          })
        };
      });
      saveIndents(updated);
      toast.success('Technical ranking saved!');
      setTimeout(() => { onSuccess(); setLoading(false); }, 400);
    } catch { 
      toast.error('Error saving ranking'); 
      setLoading(false); 
    }
  };

  return (
    <ModalForm
      isOpen={true}
      onClose={onClose}
      title="Technical Ranking"
      onSubmit={handleSubmit}
      submitText={loading ? 'Saving...' : 'Save Ranking'}
      maxWidth="max-w-lg"
    >
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="space-y-4">
          {/* Prefill Section - Styled like Vendor Rate Update */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
            <div className="grid grid-cols-2 gap-x-3">
              <div className="space-y-0.5">
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Serial No</label>
                <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center font-medium text-indigo-600">
                  {item.serialNo}
                </div>
              </div>
              <div className="space-y-0.5">
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Item Count</label>
                <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center text-gray-700">
                  {item.itemCount}
                </div>
              </div>
            </div>

            <div className="space-y-0.5">
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Firm Name</label>
              <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center text-gray-700">
                {item.firmName}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-3">
              <div className="space-y-0.5">
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Department</label>
                <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center text-gray-700 break-words">
                  {item.department}
                </div>
              </div>
              <div className="space-y-0.5">
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Group-Head</label>
                <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center text-gray-700 break-words">
                  {item.groupHead}
                </div>
              </div>
            </div>

            <div className="space-y-0.5">
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Item Name</label>
              <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] min-h-[32px] md:min-h-[38px] flex items-center font-semibold text-indigo-600 uppercase break-words py-2">
                {item.itemName}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-2">
              <div className="space-y-0.5">
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">UOM</label>
                <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center text-gray-700">
                  {item.uom}
                </div>
              </div>
              <div className="space-y-0.5">
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Qty</label>
                <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center font-bold text-indigo-600">
                  {item.itemQty}
                </div>
              </div>
              <div className="space-y-0.5 col-span-2 sm:col-span-1">
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-tight">Vendor Type</label>
                <div className={`w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] md:text-[13px] h-[32px] md:h-[38px] flex items-center font-black uppercase whitespace-nowrap ${vendorType === 'Three Party' ? 'text-amber-600' : 'text-blue-600'}`}>
                  {vendorType}
                </div>
              </div>
            </div>
          </div>

          {/* Rank Slots in One Row */}
          <div className="grid grid-cols-3 gap-2 py-2 border-t border-gray-100">
            {['T1', 'T2', 'T3'].map(rank => (
              <DroppableSlot key={rank} id={rank} rank={rank}>
                {rankings[rank] && (
                  <DraggableVendor 
                    id={rankings[rank].id} 
                    vendor={rankings[rank]} 
                    isInSlot={true} 
                    onClick={handleRemove}
                  />
                )}
              </DroppableSlot>
            ))}
          </div>

          {/* Pool below Rank Slots */}
          <DroppableSlot id="pool">
            {pool.map((v) => (
              <DraggableVendor 
                key={v.id} 
                id={v.id} 
                vendor={v} 
                isInSlot={false} 
                onClick={handleSelect}
              />
            ))}
          </DroppableSlot>
        </div>
      </DndContext>
    </ModalForm>
  );
}
