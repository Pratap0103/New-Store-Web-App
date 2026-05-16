import React, { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import Vendor from './Vendor';
import Company from './Company';
import Item from './Item';
import GroupHead from './GroupHead';
import UOM from './UOM';
import Department from './Department';
import TermsCondition from './TermsCondition';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function Master() {
  const [activeTab, setActiveTab] = useState('Vendor');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Triggers to open Add Modal in child components
  const [triggerAddVendor, setTriggerAddVendor] = useState(0);
  const [triggerAddCompany, setTriggerAddCompany] = useState(0);
  const [triggerAddItem, setTriggerAddItem] = useState(0);
  const [triggerAddGroupHead, setTriggerAddGroupHead] = useState(0);
  const [triggerAddUOM, setTriggerAddUOM] = useState(0);
  const [triggerAddDept, setTriggerAddDept] = useState(0);
  const [triggerAddTC, setTriggerAddTC] = useState(0);

  const handleAddClick = () => {
    if (activeTab === 'Vendor') setTriggerAddVendor(prev => prev + 1);
    else if (activeTab === 'Company') setTriggerAddCompany(prev => prev + 1);
    else if (activeTab === 'Item') setTriggerAddItem(prev => prev + 1);
    else if (activeTab === 'Group Head') setTriggerAddGroupHead(prev => prev + 1);
    else if (activeTab === 'UOM') setTriggerAddUOM(prev => prev + 1);
    else if (activeTab === 'Department') setTriggerAddDept(prev => prev + 1);
    else if (activeTab === 'Terms & Condition') setTriggerAddTC(prev => prev + 1);
  };

  return (
    <div className="p-0 sm:p-2 md:p-6 space-y-2 md:space-y-6 flex flex-col h-full min-h-0">
      {/* Header with Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 lg:gap-4 w-full">
        <div className="flex flex-col lg:flex-row w-full gap-2 lg:gap-3 items-center">
          
          {/* Top Row for Mobile: Dropdown + Filter + Add */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            {/* 1. Searchable Drop-Down (Switcher) */}
            <SearchableDropdown
              className="flex-1 lg:w-64"
              options={[
                { value: 'Vendor', label: 'Vendor' },
                { value: 'Company', label: 'Company' },
                { value: 'Item', label: 'Item' },
                { value: 'Group Head', label: 'Group Head' },
                { value: 'UOM', label: 'UOM' },
                { value: 'Department', label: 'Department' },
                { value: 'Terms & Condition', label: 'Terms & Condition' }
              ]}
              value={activeTab}
              onChange={(val) => {
                setActiveTab(val);
                setShowMobileFilters(false);
              }}
            />

            {/* 2. Mobile Filter Button */}
            <button
               onClick={() => setShowMobileFilters(!showMobileFilters)}
               className={`lg:hidden flex items-center justify-center rounded-lg shadow-sm h-[32px] w-[32px] flex-shrink-0 transition ${showMobileFilters ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              <Filter size={14} />
            </button>

            {/* 3. Mobile Add Button */}
            <button
              onClick={handleAddClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center lg:hidden h-[32px] w-[32px] flex-shrink-0 shadow-sm transition active:scale-95"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* 4. Search Bar (Toggleable on mobile) */}
          <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block w-full lg:flex-[1.5] relative animate-in slide-in-from-top-2 duration-200`}>
            <Search className="absolute left-2.5 top-[9px] lg:top-[11px] text-gray-400" size={14} />
            <input
              type="text"
              placeholder={`Search ${activeTab}s...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg lg:rounded pl-8 pr-2 py-1.5 focus:outline-none focus:border-sky-500 text-base md:text-sm h-[32px] md:h-[38px] shadow-sm"
            />
          </div>
        </div>

        {/* Desktop Add Button */}
        <button
          onClick={handleAddClick}
          className="hidden lg:flex bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 h-[38px] rounded-lg font-semibold items-center justify-center gap-2 transition shadow-sm w-full lg:w-auto flex-shrink-0 active:scale-95 mt-2 lg:mt-0"
        >
          <Plus size={16} /> Add {activeTab}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col pt-1 mt-2 flex-1 min-h-0 overflow-hidden">
        {activeTab === 'Vendor' && <Vendor searchQuery={searchQuery} triggerAdd={triggerAddVendor} />}
        {activeTab === 'Company' && <Company searchQuery={searchQuery} triggerAdd={triggerAddCompany} />}
        {activeTab === 'Item' && <Item searchQuery={searchQuery} triggerAdd={triggerAddItem} />}
        {activeTab === 'Group Head' && <GroupHead searchQuery={searchQuery} triggerAdd={triggerAddGroupHead} />}
        {activeTab === 'UOM' && <UOM searchQuery={searchQuery} triggerAdd={triggerAddUOM} />}
        {activeTab === 'Department' && <Department searchQuery={searchQuery} triggerAdd={triggerAddDept} />}
        {activeTab === 'Terms & Condition' && <TermsCondition searchQuery={searchQuery} triggerAdd={triggerAddTC} />}
      </div>
    </div>
  );
}
