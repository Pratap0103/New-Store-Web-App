import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Plus, Search, Filter, Eye, X, Upload, Calendar, 
  ChevronLeft, ChevronRight, FileText, Trash2, Info, Check, Paperclip,
  RotateCcw, Tag, User, Layers, Box, Ruler, PackagePlus
} from 'lucide-react';
import { 
  getCompanies, getDepartments, getGroupHeads, 
  getMasterItems, getIndents, saveIndent, getUOMs
} from '../../utils/storageManager';
import { 
  generateId, formatDate, fileToBase64 
} from '../../utils/helpers';
import ModalForm from '../../components/ModalForm';
import DataTable from '../../components/DataTable';
import InfoPopover from '../../components/InfoPopover';
import ModalAlert from '../../components/ModalAlert';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function CreateIndent() {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  // Master Modals State (for onAdd support)
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showGHModal, setShowGHModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);

  // Alert State
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Master Data
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [groupHeads, setGroupHeads] = useState([]);
  const [masterItems, setMasterItems] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [indents, setIndents] = useState([]);

  // Form State
  const initialItem = {
    department: '',
    groupHead: '',
    itemName: '',
    uom: '',
    itemQty: '',
    areaOfUse: '',
    specification: '',
    attachment: ''
  };

  const [formData, setFormData] = useState({
    firmName: '',
    indenterName: '',
    indentStatus: 'Select',
    items: [{ ...initialItem }]
  });

  // Filters State
  const initialFilters = {
    searchQuery: '',
    fromDate: '',
    toDate: '',
    status: '',
    department: '',
    groupHead: '',
    itemName: '',
    uom: '',
    itemQty: ''
  };

  const [filters, setFilters] = useState({ ...initialFilters });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  useEffect(() => {
    refreshMasterData();
    setIndents(getIndents());
  }, []);

  const refreshMasterData = () => {
    const comps = getCompanies();
    setCompanies(comps);
    if (comps.length === 1 && !formData.firmName) {
      setFormData(prev => ({ ...prev, firmName: comps[0].name }));
    }
    setDepartments(getDepartments());
    setGroupHeads(getGroupHeads());
    setMasterItems(getMasterItems());
    setUoms(getUOMs());
  };

  const handleClearFilters = () => {
    setFilters({ ...initialFilters });
    setCurrentPage(1);
    toast.success('Filters cleared');
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { ...initialItem }]
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) {
      toast.error('At least one item is required');
      return;
    }
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    // Pre-fill UOM if itemName changes
    if (field === 'itemName') {
      const item = masterItems.find(i => i.name === value);
      if (item) {
        newItems[index].uom = item.uom || '';
      }
    }

    setFormData({ ...formData, items: newItems });
  };

  const handleFileChange = async (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      handleItemChange(index, 'attachment', base64);
      toast.success('Attachment added');
    } catch (error) {
      toast.error('Error reading file');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.firmName) {
      toast.error('Firm Name is required');
      return;
    }
    if (!formData.indenterName.trim()) {
      toast.error('Indenter Name is required');
      return;
    }
    if (formData.indentStatus === 'Select' || !formData.indentStatus) {
      toast.error('Please select Indent Status');
      return;
    }

    // Validate items
    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      if (!item.department || !item.groupHead || !item.itemName || !item.uom || !item.itemQty || !item.areaOfUse) {
        toast.error(`Please fill all required fields for item ${i + 1}`);
        return;
      }
    }

    setLoading(true);

    const allIndents = getIndents();
    const nextSn = allIndents.length + 1;
    const serialNo = `IN-${String(nextSn).padStart(3, '0')}`;
    const now = new Date();
    const timestamp = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newIndent = {
      id: generateId(),
      serialNo,
      timestamp,
      firmName: formData.firmName,
      indenterName: formData.indenterName,
      indentStatus: formData.indentStatus,
      items: formData.items.map((item, idx) => ({
        ...item,
        itemCount: idx + 1
      }))
    };

    saveIndent(newIndent);
    setIndents(getIndents());
    
    // Success Alert
    setAlertConfig({
      isOpen: true,
      type: 'success',
      title: 'Indent Created!',
      message: `Indent ${serialNo} has been successfully logged with ${formData.items.length} items.`
    });

    // Reset Form
    setFormData({
      firmName: companies.length === 1 ? companies[0].name : '',
      indenterName: '',
      indentStatus: 'Select',
      items: [{ ...initialItem }]
    });
    
    setShowFormModal(false);
    setLoading(false);
  };

  // Flatten indents for table display
  const flattenedIndents = indents.flatMap(indent => 
    indent.items.map(item => ({
      ...indent,
      ...item,
      indentId: indent.id 
    }))
  ).reverse();

  const filteredIndents = flattenedIndents.filter(item => {
    if (filters.status && item.indentStatus !== filters.status) return false;
    if (filters.department && item.department !== filters.department) return false;
    if (filters.groupHead && item.groupHead !== filters.groupHead) return false;
    if (filters.itemName && item.itemName !== filters.itemName) return false;
    if (filters.uom && item.uom !== filters.uom) return false;
    if (filters.itemQty && String(item.itemQty) !== filters.itemQty) return false;
    
    if (filters.fromDate || filters.toDate) {
      const [itemDateStr] = item.timestamp.split(' ');
      const [d, m, y] = itemDateStr.split('/');
      const itemDate = `${y}-${m}-${d}`;
      
      if (filters.fromDate && itemDate < filters.fromDate) return false;
      if (filters.toDate && itemDate > filters.toDate) return false;
    }
    
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      return (
        item.timestamp.toLowerCase().includes(q) ||
        item.serialNo.toLowerCase().includes(q) ||
        String(item.itemCount).includes(q) ||
        item.firmName.toLowerCase().includes(q) ||
        item.indenterName.toLowerCase().includes(q) ||
        item.indentStatus.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        item.groupHead.toLowerCase().includes(q) ||
        item.itemName.toLowerCase().includes(q) ||
        String(item.itemQty).includes(q) ||
        item.uom.toLowerCase().includes(q) ||
        item.areaOfUse.toLowerCase().includes(q) ||
        (item.specification && item.specification.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredIndents.length / itemsPerPage);
  const paginatedIndents = filteredIndents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleImageView = (base64) => {
    setSelectedImage(base64);
    setShowImageModal(true);
  };

  // Components for DataTable
  const tableHeaders = [
    "TimeStamp", "Serial No", "ItemCount", "Firm Name", "Indenter Name", 
    "Status", "Dept", "GH", "Item Name", "Qty", "UOM", 
    "Area of Use", "Attachment", "Specification"
  ];

  const renderRow = (item, idx) => (
    <tr key={`${item.indentId}-${item.itemCount}`} className="hover:bg-indigo-50/30 transition-colors border-b border-gray-100">
      <td className="px-4 py-3 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.timestamp}</td>
      <td className="px-4 py-3 text-center text-xs text-indigo-600 whitespace-nowrap">{item.serialNo}</td>
      <td className="px-4 py-3 text-center text-xs text-gray-700 whitespace-nowrap">{item.itemCount}</td>
      <td className="px-4 py-3 text-center text-[11px] text-gray-700 whitespace-nowrap">{item.firmName}</td>
      <td className="px-4 py-3 text-center text-[11px] text-gray-700 whitespace-nowrap">{item.indenterName}</td>
      <td className="px-4 py-3 text-center whitespace-nowrap">
        <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
          item.indentStatus === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {item.indentStatus}
        </span>
      </td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.department}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.groupHead}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-900 font-medium uppercase whitespace-nowrap">{item.itemName}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-indigo-600 font-bold whitespace-nowrap">{item.itemQty || 1}</td>
      <td className="px-4 py-2.5 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.uom}</td>
      <td className="px-4 py-3 text-center text-[11px] text-gray-600 whitespace-nowrap">{item.areaOfUse}</td>
      <td className="px-4 py-3 text-center whitespace-nowrap">
        {item.attachment ? (
          <button 
            onClick={() => handleImageView(item.attachment)}
            className="text-indigo-600 hover:text-indigo-800 flex justify-center w-full"
          >
            <Eye size={16} />
          </button>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </td>
      <td className="px-4 py-3 text-left whitespace-nowrap">
        {item.specification ? (
          <InfoPopover items={[item.specification]} title="Item Specification">
            <span className="text-[11px] text-gray-500 flex items-center gap-1 cursor-help hover:text-indigo-600">
              <Info size={12} /> View Info
            </span>
          </InfoPopover>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </td>
    </tr>
  );

  const renderCard = (item, idx) => (
    <div key={`${item.indentId}-${item.itemCount}`} className="bg-white rounded-lg border border-indigo-50 shadow-sm p-3 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[9px] text-indigo-500 uppercase tracking-widest">{item.serialNo} / {item.itemCount}</span>
          <h4 className="text-sm text-gray-900 uppercase">{item.itemName}</h4>
        </div>
        <span className={`px-2 py-0.5 rounded text-[8px] uppercase ${
          item.indentStatus === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {item.indentStatus}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="overflow-hidden">
          <p className="text-gray-400 uppercase tracking-tighter text-[8px]">Firm</p>
          <p className="text-gray-700 truncate leading-tight">{item.firmName}</p>
        </div>
        <div>
          <span className="text-gray-400 block uppercase text-[9px]">Qty</span>
          <span className="text-indigo-600 font-bold">{item.itemQty || 1} {item.uom}</span>
        </div>
      </div>

      <div className="bg-slate-50 rounded p-2 text-[10px] space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-500">Dept/GH:</span>
          <span className="text-gray-700">{item.department} / {item.groupHead}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Area:</span>
          <span className="text-gray-700">{item.areaOfUse}</span>
        </div>
      </div>

      {item.attachment && (
        <button 
          onClick={() => handleImageView(item.attachment)}
          className="w-full bg-indigo-50 text-indigo-600 py-1.5 rounded-lg text-[10px] flex items-center justify-center gap-2"
        >
          <Eye size={14} /> View Attachment
        </button>
      )}
    </div>
  );

  return (
    <div className="p-0 sm:p-2 md:p-6 space-y-2 md:space-y-6 flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 lg:gap-4 w-full px-2 sm:px-0">
        <div className="flex flex-col lg:flex-row w-full gap-2 lg:gap-3 items-center">
          <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-[1.5]">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-2.5 top-[9px] lg:top-[11px] text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg lg:rounded pl-8 pr-2 py-1.5 focus:outline-none focus:border-sky-500 text-xs md:text-sm h-[32px] md:h-[38px]"
              />
            </div>
            <button
               onClick={() => setShowMobileFilters(!showMobileFilters)}
               className={`lg:hidden flex items-center justify-center rounded-lg shadow-sm h-[32px] w-[32px] flex-shrink-0 transition ${showMobileFilters ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              <Filter size={14} />
            </button>
            <button
              onClick={handleClearFilters}
              className="lg:hidden flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded-lg h-[32px] w-[32px] flex-shrink-0 shadow-sm active:scale-95"
              title="Clear Filters"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={() => setShowFormModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center lg:hidden h-[32px] w-[32px] flex-shrink-0 shadow-sm transition"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Filters Row - Enhanced with SearchableDropdown */}
          <div className={`${showMobileFilters ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row lg:flex-nowrap gap-2 w-full lg:w-auto lg:flex-[8] overflow-visible`}>
              {/* Row 1: Dates */}
             <div className="flex flex-row gap-2 w-full lg:w-auto lg:contents">
                <div className="flex-1 min-w-0 lg:min-w-[150px] relative">
                  <Calendar className="absolute left-2.5 top-[9px] lg:top-[12px] text-gray-400 pointer-events-none" size={14} />
                  <input
                    type="text"
                    placeholder="From Date"
                    onFocus={(e) => (e.target.type = 'date')}
                    onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                    value={filters.fromDate}
                    onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded lg:rounded pl-8 pr-2 py-1.5 focus:outline-none focus:border-indigo-500 text-[11px] md:text-xs h-[32px] md:h-[38px]"
                  />
                </div>
                <div className="flex-1 min-w-0 lg:min-w-[150px] relative">
                  <Calendar className="absolute left-2.5 top-[9px] lg:top-[12px] text-gray-400 pointer-events-none" size={14} />
                  <input
                    type="text"
                    placeholder="To Date"
                    onFocus={(e) => (e.target.type = 'date')}
                    onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                    value={filters.toDate}
                    onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded lg:rounded pl-8 pr-2 py-1.5 focus:outline-none focus:border-indigo-500 text-[11px] md:text-xs h-[32px] md:h-[38px]"
                  />
                </div>
             </div>

             {/* Row 2: Dept (Searchable) */}
             <div className="flex flex-row gap-2 w-full lg:w-auto lg:contents">
                <div className="flex-1 min-w-0 lg:min-w-[120px]">
                  <SearchableDropdown
                    options={Array.from(new Set(flattenedIndents.map(i => i.department)))
                      .filter(Boolean)
                      .sort()
                      .map(d => ({ value: d, label: d }))}
                    value={filters.department}
                    onChange={(val) => setFilters({ ...filters, department: val })}
                    placeholder="All Dept"
                    className="h-[32px] md:h-[38px]"
                  />
                </div>
             </div>

             {/* Row 3: GH, Item, UOM (Searchable) */}
             <div className="flex flex-row gap-2 w-full lg:w-auto lg:contents">
                <div className="flex-1 min-w-0 lg:min-w-[110px]">
                  <SearchableDropdown
                    options={Array.from(new Set(flattenedIndents.map(i => i.groupHead)))
                      .filter(Boolean)
                      .sort()
                      .map(g => ({ value: g, label: g }))}
                    value={filters.groupHead}
                    onChange={(val) => setFilters({ ...filters, groupHead: val })}
                    placeholder="All GH"
                    className="h-[32px] md:h-[38px]"
                  />
                </div>
                <div className="flex-1 min-w-0 lg:min-w-[110px]">
                  <SearchableDropdown
                    options={Array.from(new Set(flattenedIndents.map(i => i.itemName)))
                      .filter(Boolean)
                      .sort()
                      .map(i => ({ value: i, label: i }))}
                    value={filters.itemName}
                    onChange={(val) => setFilters({ ...filters, itemName: val })}
                    placeholder="All Items"
                    className="h-[32px] md:h-[38px]"
                  />
                </div>
                <div className="flex-1 min-w-0 lg:min-w-[100px]">
                  <SearchableDropdown
                    options={Array.from(new Set(flattenedIndents.map(i => i.uom)))
                      .filter(Boolean)
                      .sort()
                      .map(u => ({ value: u, label: u }))}
                    value={filters.uom}
                    onChange={(val) => setFilters({ ...filters, uom: val })}
                    placeholder="All UOM"
                    className="h-[32px] md:h-[38px]"
                  />
                </div>
             </div>
             
             <button
              onClick={handleClearFilters}
              className="hidden lg:flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded lg:rounded-lg w-[38px] h-[38px] hover:bg-gray-100 transition-colors shadow-sm"
              title="Clear Filters"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowFormModal(true)}
          className="hidden lg:flex bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg items-center justify-center transition shadow-sm w-[38px] h-[38px] flex-shrink-0"
          title="New Indent"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Modal Form */}
      <ModalForm
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title="Create New Indent"
        onSubmit={handleSubmit}
        submitText={loading ? 'Creating...' : 'Save Indent'}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-3 md:space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 pb-3 md:pb-4 border-b border-gray-100">
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="block text-[11px] md:text-[13px] text-gray-700 uppercase tracking-tight">Firm Name *</label>
              <SearchableDropdown
                options={companies.map(c => ({ value: c.name, label: c.name }))}
                value={formData.firmName}
                onChange={(val) => setFormData({ ...formData, firmName: val })}
                placeholder="Select Company"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] md:text-[13px] text-gray-700 uppercase tracking-tight">Indenter Name *</label>
              <input
                type="text"
                value={formData.indenterName}
                onChange={(e) => setFormData({ ...formData, indenterName: e.target.value })}
                placeholder="Enter name"
                className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[11px] md:text-[13px] h-[30px] md:h-[34px]"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] md:text-[13px] text-gray-700 uppercase tracking-tight">Indent Status *</label>
              <SearchableDropdown
                options={[
                  { value: 'Critical', label: 'Critical' },
                  { value: 'Non-Critical', label: 'Non-Critical' }
                ]}
                value={formData.indentStatus === 'Select' ? '' : formData.indentStatus}
                onChange={(val) => setFormData({ ...formData, indentStatus: val })}
                placeholder="Select Status"
              />
            </div>
          </div>

          <div className="pt-1 hidden md:block">
            <h3 className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mb-1">Items Configuration</h3>
          </div>

          <div className="space-y-3 md:space-y-6">
            {formData.items.map((item, index) => (
              <div key={index} className="relative p-2.5 md:p-5 bg-gray-50/50 rounded-xl border border-gray-200 space-y-2.5 md:space-y-4 transition-all hover:bg-white hover:shadow-md">
                <div className="flex justify-between items-center border-b border-gray-200/50 pb-2 mb-1">
                   <span className="text-[9px] md:text-xs text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full">Item Details #{index + 1}</span>
                   {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-gray-300 hover:text-red-500 transition-all hover:scale-110 active:scale-90"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-2 md:gap-x-4 md:gap-y-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] md:text-[12px] text-gray-500 uppercase tracking-tighter">Department *</label>
                    <SearchableDropdown
                      options={departments.map(d => ({ value: d.name, label: d.name }))}
                      value={item.department}
                      onChange={(val) => handleItemChange(index, 'department', val)}
                      placeholder="Select Dept"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] md:text-[12px] text-gray-500 uppercase tracking-tighter">Group-Head *</label>
                    <SearchableDropdown
                      options={groupHeads.map(g => ({ value: g.name, label: g.name }))}
                      value={item.groupHead}
                      onChange={(val) => handleItemChange(index, 'groupHead', val)}
                      placeholder="Select GH"
                    />
                  </div>

                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="block text-[10px] md:text-[12px] text-gray-500 uppercase tracking-tighter">Item Name *</label>
                    <SearchableDropdown
                      options={masterItems
                        .filter(mi => !item.groupHead || mi.groupHead === item.groupHead)
                        .map(mi => ({ value: mi.name, label: mi.name }))
                      }
                      value={item.itemName}
                      onChange={(val) => handleItemChange(index, 'itemName', val)}
                      placeholder="Select Item"
                    />
                  </div>

                  <div className="space-y-1.5 flex-[0.5] min-w-[80px]">
                    <label className="text-[10px] md:text-[12px] text-gray-500 uppercase tracking-tighter">Qty *</label>
                    <input
                      type="number"
                      value={item.itemQty}
                      onChange={(e) => handleItemChange(index, 'itemQty', e.target.value)}
                      placeholder="0"
                      className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[11px] md:text-[13px] h-[30px] md:h-[34px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] md:text-[12px] text-gray-500 uppercase tracking-tighter">Area of Use *</label>
                    <input
                      type="text"
                      value={item.areaOfUse}
                      onChange={(e) => handleItemChange(index, 'areaOfUse', e.target.value)}
                      placeholder="e.g. Workshop"
                      className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[11px] md:text-[13px] h-[30px] md:h-[34px]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] md:text-[12px] text-gray-500 uppercase tracking-tighter">Specification</label>
                    <input
                      type="text"
                      value={item.specification}
                      onChange={(e) => handleItemChange(index, 'specification', e.target.value)}
                      placeholder="Details..."
                      className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[11px] md:text-[13px] h-[30px] md:h-[34px]"
                    />
                  </div>

                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="block text-[10px] md:text-[12px] text-gray-500 uppercase tracking-tighter">Attachment</label>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 cursor-pointer group">
                        <div className={`flex items-center justify-center gap-2 border border-dashed rounded h-[30px] md:h-[34px] transition-all
                          ${item.attachment ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-gray-50 border-gray-300 text-gray-400 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600'}
                        `}>
                          {item.attachment ? <Check size={14} /> : <Paperclip size={14} />}
                          <span className="text-[11px] md:text-[13px] uppercase tracking-wider">
                            {item.attachment ? 'Attached' : 'Browse'}
                          </span>
                        </div>
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(index, e)}
                          className="hidden"
                          accept="image/*,application/pdf"
                        />
                      </label>
                      {item.attachment && (
                        <button 
                          type="button"
                          onClick={() => handleItemChange(index, 'attachment', '')}
                          className="w-[30px] h-[30px] md:w-[34px] md:h-[34px] flex items-center justify-center text-gray-300 hover:text-red-500 bg-gray-50 rounded border border-gray-200 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Item Action Button */}
          <div className="pt-3 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-lg hover:bg-emerald-100 transition-all active:scale-[0.98] text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm animate-pulse-subtle"
            >
              <PackagePlus size={16} />
              <span>Add Item</span>
            </button>
          </div>
        </div>
      </ModalForm>

      {/* Main Content */}
      <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <DataTable
          headers={tableHeaders}
          data={paginatedIndents}
          renderRow={renderRow}
          renderCard={renderCard}
          minWidth="1400px"
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
          totalResults={filteredIndents.length}
        />
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setShowImageModal(false)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full p-2 relative shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-3 -right-3 bg-white text-gray-800 rounded-full p-1.5 shadow-lg hover:bg-gray-100 transition-colors z-10 border border-gray-200"
            >
              <X size={20} />
            </button>
            <div className="overflow-auto max-h-[85vh] rounded-xl">
              {selectedImage.startsWith('data:image/') ? (
                <img src={selectedImage} alt="Attachment" className="w-full h-auto" />
              ) : (
                <div className="p-10 text-center">
                  <FileText size={48} className="mx-auto text-indigo-200 mb-4" />
                  <p className="text-gray-600">Document Preview Not Available</p>
                  <a href={selectedImage} download className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg">Download File</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Alert */}
      <ModalAlert
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
      />
    </div>
  );
}
