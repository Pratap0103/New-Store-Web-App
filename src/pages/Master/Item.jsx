import React, { useState, useEffect, useMemo } from 'react';
import { Edit, Trash2, Plus, Minus } from 'lucide-react';
import { 
  getMasterItems, 
  saveMasterItems, 
  saveMasterItem, 
  getGroupHeads, 
  saveGroupHeads,
  getUOMs,
  saveUOMs
} from '../../utils/storageManager';
import { generateId } from '../../utils/helpers';
import DataTable from '../../components/DataTable';
import SearchableDropdown from '../../components/SearchableDropdown';
import ModalAlert from '../../components/ModalAlert';
import ModalForm from '../../components/ModalForm';

export default function Item({ searchQuery, triggerAdd }) {
  const [items, setItems] = useState([]);
  const [groupHeads, setGroupHeads] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showGroupHeadModal, setShowGroupHeadModal] = useState(false);
  const [showUomModal, setShowUomModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'success', title: '', message: '', onConfirm: () => {} });

  const [formData, setFormData] = useState({ name: '', groupHead: '', uom: '' });
  const [groupHeadEntries, setGroupHeadEntries] = useState([{ name: '' }]);
  const [uomEntries, setUomEntries] = useState([{ name: '' }]);

  const headers = ['Actions', 'Timestamp', 'IN-NO', 'Item Name', 'Group Head', 'UOM'];

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setItems(getMasterItems());
    setGroupHeads(getGroupHeads());
    setUoms(getUOMs());
  };

  useEffect(() => {
    if (triggerAdd > 0) handleAdd();
  }, [triggerAdd]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const q = searchQuery.toLowerCase();
      return (
        item.name?.toLowerCase().includes(q) ||
        item.inNo?.toLowerCase().includes(q) ||
        item.groupHead?.toLowerCase().includes(q) ||
        item.uom?.toLowerCase().includes(q)
      );
    });
  }, [items, searchQuery]);

  const sortedItems = useMemo(() => [...filteredItems].reverse(), [filteredItems]);
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const paginatedItems = sortedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ name: '', groupHead: '', uom: '' });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({ ...item });
    setShowModal(true);
  };

  const showAlert = (type, title, message, onConfirm = () => {}) => {
    setAlertConfig({ isOpen: true, type, title, message, onConfirm });
  };

  const handleDelete = (id) => {
    showAlert('confirm', 'Delete Item?', 'Are you sure you want to delete this item from the master database?', () => {
      const updated = items.filter(i => i.id !== id);
      saveMasterItems(updated);
      setItems(updated);
      showAlert('success', 'Deleted!', 'Item has been successfully removed.');
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.groupHead || !formData.uom) {
      showAlert('error', 'Incomplete Form', 'Please select both a Group Head and a UOM.');
      return;
    }

    if (editingId) {
      const updated = items.map(i => i.id === editingId ? { ...i, ...formData } : i);
      saveMasterItems(updated);
      setItems(updated);
      showAlert('success', 'Updated!', 'Item details have been modified successfully.');
    } else {
      const newItem = {
        ...formData,
        id: generateId(),
        timestamp: new Date().toISOString(),
        inNo: `IN-${String(items.length + 1).padStart(3, '0')}`
      };
      saveMasterItem(newItem);
      setItems([...items, newItem]);
      showAlert('success', 'Created!', 'New item has been added to the database.');
    }
    setShowModal(false);
  };

  const handleGroupHeadSubmit = (e) => {
    e.preventDefault();
    const validEntries = groupHeadEntries.filter(e => e.name.trim());
    if (validEntries.length === 0) return;

    const currentData = getGroupHeads();
    const newItems = validEntries.map((entry, index) => ({
      ...entry,
      id: generateId(),
      timestamp: new Date().toISOString(),
      code: `GH-${String(currentData.length + index + 1).padStart(3, '0')}`
    }));

    const updated = [...currentData, ...newItems];
    saveGroupHeads(updated);
    refreshData();
    setShowGroupHeadModal(false);
    setGroupHeadEntries([{ name: '' }]);
    showAlert('success', 'Success!', 'New Group Heads registered successfully.');
  };

  const handleUomSubmit = (e) => {
    e.preventDefault();
    const validEntries = uomEntries.filter(e => e.name.trim());
    if (validEntries.length === 0) return;

    const currentData = getUOMs();
    const newItems = validEntries.map((entry, index) => ({
      ...entry,
      id: generateId(),
      timestamp: new Date().toISOString(),
      code: `UOM-${String(currentData.length + index + 1).padStart(3, '0')}`
    }));

    const updated = [...currentData, ...newItems];
    saveUOMs(updated);
    refreshData();
    setShowUomModal(false);
    setUomEntries([{ name: '' }]);
    showAlert('success', 'Success!', 'New UOMs registered successfully.');
  };

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  };

  const renderRow = (item) => (
    <tr key={item.id} className="hover:bg-gray-50 transition-colors text-center text-sm border-b border-gray-100">
      <td className="px-4 py-2 whitespace-nowrap">
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-800 transition-colors"><Edit size={14}/></button>
          <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 size={14}/></button>
        </div>
      </td>
      <td className="px-4 py-2 text-gray-600 whitespace-nowrap text-[11px] md:text-xs">{formatTimestamp(item.timestamp)}</td>
      <td className="px-4 py-2 text-gray-900 font-bold whitespace-nowrap text-[11px] md:text-xs">{item.inNo}</td>
      <td className="px-4 py-2 text-gray-700 whitespace-nowrap text-[11px] md:text-xs">{item.name}</td>
      <td className="px-4 py-2 whitespace-nowrap"><span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-bold uppercase border border-indigo-100">{item.groupHead}</span></td>
      <td className="px-4 py-2 whitespace-nowrap"><span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[9px] font-bold uppercase border border-amber-100">{item.uom}</span></td>
    </tr>
  );

  const renderCard = (item) => (
    <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm space-y-3">
      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
        <div><span className="text-[9px] font-medium text-indigo-600 uppercase tracking-widest">{item.inNo}</span><h3 className="text-sm font-medium text-gray-700">{item.name}</h3></div>
        <div className="flex gap-2">
          <button onClick={() => handleEdit(item)} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Edit size={14}/></button>
          <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-red-50 text-red-500 rounded-lg"><Trash2 size={14}/></button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-0.5"><p className="text-[9px] text-gray-400 font-bold uppercase">Group Head</p><p className="text-[11px] font-bold text-indigo-700 uppercase">{item.groupHead}</p></div>
        <div className="space-y-0.5 text-right"><p className="text-[9px] text-gray-400 font-bold uppercase">UOM</p><p className="text-[11px] font-bold text-amber-700 uppercase">{item.uom}</p></div>
      </div>
      <div className="pt-2 border-t border-gray-50 flex justify-between">
        <span className="text-[10px] text-gray-400 font-medium">{formatTimestamp(item.timestamp)}</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      <DataTable 
        headers={headers} 
        data={paginatedItems}
        renderRow={renderRow}
        renderCard={renderCard}
        minWidth="800px"
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalResults={filteredItems.length}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
      />

      <ModalAlert 
        {...alertConfig} 
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })} 
      />

      <ModalForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Item' : 'New Master Item'}
        onSubmit={handleSubmit}
        submitText={editingId ? 'Update' : 'Save'}
      >
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="block text-[10px] md:text-[12px] text-gray-700 uppercase tracking-tight">Item Name *</label>
            <input 
              required 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[11px] md:text-[13px] h-[30px] md:h-[34px]" 
              placeholder="Enter item name" 
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] md:text-[12px] text-gray-700 uppercase tracking-tight">Group Head *</label>
            <SearchableDropdown 
              placeholder="Select Group Head" 
              options={groupHeads.map(h => ({ value: h.name, label: h.name }))} 
              value={formData.groupHead} 
              onAdd={() => setShowGroupHeadModal(true)}
              onChange={(val) => setFormData({...formData, groupHead: val})} 
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] md:text-[12px] text-gray-700 uppercase tracking-tight">UOM *</label>
            <SearchableDropdown 
              placeholder="Select UOM" 
              options={uoms.map(u => ({ value: u.name, label: u.name }))} 
              value={formData.uom} 
              onAdd={() => setShowUomModal(true)}
              onChange={(val) => setFormData({...formData, uom: val})} 
            />
          </div>
        </div>
      </ModalForm>

      <ModalForm
        isOpen={showGroupHeadModal}
        onClose={() => setShowGroupHeadModal(false)}
        title="Quick Group Head Registration"
        onSubmit={handleGroupHeadSubmit}
        submitText="Save"
        zIndex="z-[110]"
      >
        <div className="space-y-2">
          {groupHeadEntries.map((entry, index) => (
            <div key={index} className="flex gap-2 items-center">
              <div className="flex-1 space-y-1">
                {index === 0 && <label className="block text-[10px] font-medium text-gray-700 uppercase tracking-tight">Group Head Name *</label>}
                <input 
                  required 
                  type="text" 
                  value={entry.name} 
                  onChange={(e) => {
                    const newEntries = [...groupHeadEntries];
                    newEntries[index].name = e.target.value;
                    setGroupHeadEntries(newEntries);
                  }} 
                  className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[11px] md:text-[13px] h-[30px] md:h-[34px]" 
                  placeholder="e.g. Raw Materials" 
                />
              </div>
              {groupHeadEntries.length > 1 && (
                <button type="button" onClick={() => setGroupHeadEntries(groupHeadEntries.filter((_, i) => i !== index))} className="mt-auto mb-1 text-red-400 hover:text-red-600 p-1 transition-colors"><Minus size={16}/></button>
              )}
            </div>
          ))}
          <div className="flex justify-end pt-1">
            <button type="button" onClick={() => setGroupHeadEntries([...groupHeadEntries, { name: '' }])} className="flex items-center gap-1.5 text-[10px] font-black bg-indigo-600 text-white px-3 py-1.5 rounded shadow-sm hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest">
              <Plus size={14}/> Add
            </button>
          </div>
        </div>
      </ModalForm>

      <ModalForm
        isOpen={showUomModal}
        onClose={() => setShowUomModal(false)}
        title="Quick UOM Registration"
        onSubmit={handleUomSubmit}
        submitText="Save"
        zIndex="z-[110]"
      >
        <div className="space-y-2">
          {uomEntries.map((entry, index) => (
            <div key={index} className="flex gap-2 items-center">
              <div className="flex-1 space-y-1">
                {index === 0 && <label className="block text-[10px] font-medium text-gray-700 uppercase tracking-tight">UOM Name *</label>}
                <input 
                  required 
                  type="text" 
                  value={entry.name} 
                  onChange={(e) => {
                    const newEntries = [...uomEntries];
                    newEntries[index].name = e.target.value;
                    setUomEntries(newEntries);
                  }} 
                  className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[11px] md:text-[13px] h-[30px] md:h-[34px] uppercase" 
                  placeholder="e.g. PCS" 
                />
              </div>
              {uomEntries.length > 1 && (
                <button type="button" onClick={() => setUomEntries(uomEntries.filter((_, i) => i !== index))} className="mt-auto mb-1 text-red-400 hover:text-red-600 p-1 transition-colors"><Minus size={16}/></button>
              )}
            </div>
          ))}
          <div className="flex justify-end pt-1">
            <button type="button" onClick={() => setUomEntries([...uomEntries, { name: '' }])} className="flex items-center gap-1.5 text-[10px] font-black bg-indigo-600 text-white px-3 py-1.5 rounded shadow-sm hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest">
              <Plus size={14}/> Add
            </button>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}
