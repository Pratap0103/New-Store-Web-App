import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FilePlus2, Pencil, Save, Trash, Eye, X, 
  Search, Calendar, RotateCcw, Loader2, ChevronRight,
  ClipboardList, Menu
} from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { PDFViewer } from '@react-pdf/renderer';
import { ClipLoader as Loader } from 'react-spinners';
import { useAuthStore } from '../../store/authStore';
import { getIndents, saveIndents, getPOs, savePO, getVendors, getCompanies, getTermsConditions } from '../../utils/storageManager';
import { 
  calculateGrandTotal, calculateSubtotal, calculateTotal, calculateTotalGst,
  cn, formatDate, formatDateTime, parseCustomDate 
} from '../../lib/utils';
import POPdf from './POPdf';
import SearchableDropdown from '../../components/SearchableDropdown';

import ModalForm from '../../components/ModalForm';

function generatePoNumber(poNumbers, today = new Date()) {
    const fyStart = today.getMonth() < 3 ? today.getFullYear() - 1 : today.getFullYear();
    const fy = `${(fyStart % 100).toString().padStart(2, '0')}-${((fyStart + 1) % 100).toString().padStart(2, '0')}`;
    const prefix = `Botivate/Store/${fy}/`;
    const numbersInFY = poNumbers
        .filter((po) => po.includes(`/${fy}/`))
        .map((po) => {
            const match = po.match(/\/(\d+)(?:-\d+)?$/);
            return match ? parseInt(match[1], 10) : null;
        })
        .filter((n) => n !== null);
    const next = numbersInFY.length > 0 ? Math.max(...numbersInFY) + 1 : 1;
    return `${prefix}${next}`;
}

const schema = z.object({
  poNumber: z.string().min(1, "PO Number is required"),
  poDate: z.coerce.date(),
  firmName: z.string().min(1, "Firm Name is required"),
  supplierName: z.string().min(1, "Supplier is required"),
  supplierAddress: z.string().min(1, "Address is required"),
  gstin: z.string(),
  companyEmail: z.string().email().or(z.literal("")),
  description: z.string().optional(),
  indents: z.array(z.object({
    id: z.string().or(z.number()),
    indentNumber: z.string(),
    productName: z.string(),
    specifications: z.string(),
    gst: z.coerce.number(),
    discount: z.coerce.number().default(0),
    quantity: z.coerce.number(),
    unit: z.string(),
    rate: z.coerce.number(),
    paymentTerm: z.string(),
    numberOfDays: z.coerce.number().optional(),
  })).min(1, "At least one item is required"),
  terms: z.array(z.string()).optional(),
  deliveryDate: z.coerce.date(),
  siteEngineerName: z.string().optional(),
  siteEngineerEmail: z.string().optional(),
  siteEngineerPhoneNo: z.string().optional(),
  quotationNumber: z.string().optional(),
  quotationDate: z.coerce.date().optional(),
  ourEnqNo: z.string().optional(),
  enquiryDate: z.coerce.date().optional(),
  preparedBy: z.string().min(1, "Prepared By is required"),
  approvedBy: z.string().min(1, "Approved By is required"),
});

const Card = ({ children, className }) => (
  <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden", className)}>
    {children}
  </div>
);

const CardHeader = ({ children, className }) => (
  <div className={cn("px-4 py-3 border-b border-gray-100 bg-gray-50", className)}>{children}</div>
);

const CardTitle = ({ children, className }) => (
  <h3 className={cn("text-sm font-semibold text-gray-700", className)}>{children}</h3>
);

const CardContent = ({ children, className }) => (
  <div className={cn("p-4", className)}>{children}</div>
);

export default function RevicePO() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [mode, setMode] = useState('revise');
  const [indentsData, setIndentsData] = useState([]);
  const [poMaster, setPoMaster] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [readOnlyTerm, setReadOnlyTerm] = useState(-1);
  const [isEditingDestination, setIsEditingDestination] = useState(false);
  const [destinationAddress, setDestinationAddress] = useState('');

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      poNumber: '',
      poDate: new Date(),
      firmName: '',
      supplierName: '',
      supplierAddress: '',
      gstin: '',
      companyEmail: '',
      description: '',
      indents: [],
      terms: [],
      deliveryDate: new Date(),
      siteEngineerName: '',
      siteEngineerEmail: '',
      siteEngineerPhoneNo: '',
      quotationNumber: '',
      quotationDate: new Date(),
      ourEnqNo: '',
      enquiryDate: new Date(),
      preparedBy: user?.name || '',
      approvedBy: '',
    }
  });

  const { fields: itemFields, remove: removeItem } = useFieldArray({
    control: form.control,
    name: 'indents'
  });

  const { fields: termFields, append: appendTerm, remove: removeTerm } = useFieldArray({
    control: form.control,
    name: 'terms'
  });

  const loadAllData = useCallback(() => {
    setLoading(true);
    try {
      const allIndents = getIndents();
      const allPOs = getPOs();
      const allVendors = getVendors();
      const allCompanies = getCompanies();
      const allTerms = getTermsConditions();

      setIndentsData(allIndents);
      setPoMaster(allPOs);
      setVendors(allVendors);
      setCompanies(allCompanies);

      if (mode === 'create' && form.getValues('terms').length === 0) {
        const defaultTerms = allTerms.map(t => t.content);
        form.setValue('terms', defaultTerms);
      }

      if (allCompanies[0]?.name) {
        form.setValue('firmName', allCompanies[0].name);
      }

      if (allCompanies[0]?.destinationAddress) {
        setDestinationAddress(allCompanies[0].destinationAddress);
      }

      if (mode === 'create') {
        const nextPO = generatePoNumber(allPOs.map(p => p.poNumber));
        form.setValue('poNumber', nextPO);
      }
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [mode, form]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const watchedSupplier = form.watch('supplierName');
  const watchedPoNumber = form.watch('poNumber');
  const watchedIndents = form.watch('indents') || [];

  useEffect(() => {
    if (mode === 'revise' && watchedPoNumber) {
      const selectedPO = poMaster.find(p => p.poNumber === watchedPoNumber);
      if (selectedPO) {
        form.reset({
          ...selectedPO,
          poDate: new Date(selectedPO.poDate),
          deliveryDate: new Date(selectedPO.deliveryDate),
        });
      }
    }
  }, [watchedPoNumber, mode, poMaster, form]);

  useEffect(() => {
    if (!watchedSupplier || mode !== 'create') return;
    const vendor = vendors.find(v => v.name === watchedSupplier);
    if (vendor) {
      form.setValue('supplierAddress', vendor.address || '');
      form.setValue('gstin', vendor.gst || '');
      form.setValue('companyEmail', vendor.email || '');
    }
    const matchingItems = [];
    indentsData.forEach(indent => {
      indent.items.forEach(item => {
        if (item.managementApproval?.approvedVendor?.name === watchedSupplier && !item.poGenerated) {
          matchingItems.push({
            id: `${indent.id}-${item.itemCount}`,
            indentNumber: indent.id,
            productName: item.itemName,
            specifications: item.specification,
            gst: 18,
            discount: 0,
            quantity: item.itemQty,
            unit: item.uom,
            rate: parseFloat(item.managementApproval.approvedVendor.basicRate) || 0,
            paymentTerm: item.managementApproval.approvedVendor.paymentTerms || '',
          });
        }
      });
    });
    form.setValue('indents', matchingItems);
  }, [watchedSupplier, vendors, indentsData, mode, form]);

  const handlePreview = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Please fill all required fields");
      return;
    }
    const values = form.getValues();
    const company = companies[0] || { name: 'Botivate Services', address: 'Mumbai', phone: '', email: '', gst: '', pan: '' };
    const mappedItems = values.indents.map(i => ({
      quantity: i.quantity,
      rate: i.rate,
      discountPercent: i.discount,
      gstPercent: i.gst
    }));
    const data = {
      companyName: company.name,
      companyAddress: company.address,
      companyPhone: company.phone,
      companyEmail: company.email,
      companyGstin: company.gst,
      companyPan: company.pan,
      supplierName: values.supplierName,
      supplierAddress: values.supplierAddress,
      supplierGstin: values.gstin,
      supplierEmail: values.companyEmail,
      poNumber: values.poNumber,
      poDate: formatDate(values.poDate),
      deliveryDate: formatDate(values.deliveryDate),
      projectName: "Project Botivate",
      deliveryAddress: destinationAddress || company.destinationAddress || 'Warehouse 1',
      siteEngineerName: values.siteEngineerName,
      siteEngineerPhoneNo: values.siteEngineerPhoneNo,
      items: values.indents.map(i => ({
        internalCode: i.indentNumber,
        product: i.productName,
        paymentTerm: i.paymentTerm,
        qty: i.quantity,
        unit: i.unit,
        rate: i.rate,
        gst: i.gst,
        discount: i.discount,
        amount: calculateTotal(i.rate, i.gst, i.discount, i.quantity)
      })),
      subtotal: calculateSubtotal(mappedItems),
      totalGst: calculateTotalGst(mappedItems),
      totalAmount: calculateGrandTotal(mappedItems),
      terms: values.terms.map((t, i) => ({ num: i + 1, text: t })),
      quotationNumber: values.quotationNumber,
      quotationDate: values.quotationDate ? formatDate(values.quotationDate) : '',
      enqNo: values.ourEnqNo,
      enqDate: values.enquiryDate ? formatDate(values.enquiryDate) : '',
      preparedBy: values.preparedBy,
      approvedBy: values.approvedBy,
      companyLogo: '/src/Assets/logo.png'
    };
    setPreviewData(data);
    setShowPreview(true);
  };

  const onSubmit = async (values) => {
    try {
      const company = companies[0] || { name: 'Botivate' };
      const mappedItems = values.indents.map(i => ({
        quantity: i.quantity,
        rate: i.rate,
        discountPercent: i.discount,
        gstPercent: i.gst
      }));
      const newPO = {
        ...values,
        id: `PO-${Date.now()}`,
        timestamp: new Date().toISOString(),
        createdBy: user?.name,
        totalAmount: calculateGrandTotal(mappedItems),
        companyName: values.firmName
      };
      savePO(newPO);
      const allIndents = getIndents();
      values.indents.forEach(item => {
        const [indentId, itemCount] = item.id.split('-');
        const indentIdx = allIndents.findIndex(ind => ind.id === indentId);
        if (indentIdx !== -1) {
          const itemIdx = allIndents[indentIdx].items.findIndex(it => it.itemCount === parseInt(itemCount));
          if (itemIdx !== -1) {
            allIndents[indentIdx].items[itemIdx].poGenerated = true;
            allIndents[indentIdx].items[itemIdx].poNumber = values.poNumber;
          }
        }
      });
      saveIndents(allIndents);
      toast.success(`Purchase Order ${values.poNumber} saved successfully`);
      form.reset();
      loadAllData();
    } catch (err) {
      toast.error("Failed to save PO");
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-gray-50/50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex w-full p-1 bg-gray-50">
          <button 
            type="button"
            onClick={() => navigate('/create-po')}
            className={cn(
              "flex-1 py-1.5 px-4 text-xs md:text-sm font-bold transition-all duration-200 rounded-md text-gray-500 hover:bg-gray-100"
            )}
          >
            Create
          </button>
          <div className="w-1" />
          <button 
            type="button"
            onClick={() => setMode('revise')}
            className={cn(
              "flex-1 py-1.5 px-4 text-xs md:text-sm font-bold transition-all duration-200 rounded-md",
              mode === 'revise' ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-gray-500 hover:bg-gray-100"
            )}
          >
            Revise
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <form id="po-form" onSubmit={form.handleSubmit(onSubmit)} className="max-w-7xl mx-auto pb-10">
          <div className="space-y-6">
            <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden mb-6">
              <div className="flex items-center justify-center gap-6 bg-blue-50/50 p-6">
                <img src="/src/Assets/logo.png" alt="Logo" className="w-20 h-20 object-contain shrink-0" />
                <div className="text-left">
                  <h1 className="text-2xl font-bold text-gray-800">{companies[0]?.name || 'Botivate Services'}</h1>
                  <div>
                    <p className="text-sm text-gray-600">{companies[0]?.address}</p>
                    <p className="text-sm text-gray-600">Phone No: +{companies[0]?.phone}</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 py-2 text-center bg-white">
                <h2 className="font-bold text-gray-700 text-lg uppercase tracking-widest">Purchase Order</h2>
              </div>
            </div>

            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList size={18} className="text-indigo-500" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Row 1: Firm & Supplier */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Firm Name</label>
                      <SearchableDropdown 
                        options={companies.map(c => ({ value: c.name, label: c.name }))}
                        value={form.watch('firmName')}
                        onChange={(val) => form.setValue('firmName', val)}
                        placeholder="Select Firm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Supplier Name</label>
                      {mode === 'create' ? (
                        <SearchableDropdown 
                          options={vendors.map(v => ({ value: v.name, label: v.name }))}
                          value={watchedSupplier}
                          onChange={(val) => form.setValue('supplierName', val)}
                          placeholder="Select Supplier"
                        />
                      ) : (
                        <input readOnly {...form.register('supplierName')} className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                      )}
                    </div>
                  </div>

                  {/* Row 2: PO Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">PO Number</label>
                      {mode === 'revise' ? (
                        <SearchableDropdown 
                          options={poMaster.map(p => ({ value: p.poNumber, label: p.poNumber }))}
                          value={watchedPoNumber}
                          onChange={(val) => form.setValue('poNumber', val)}
                          placeholder="Select PO to Revise"
                        />
                      ) : (
                        <input {...form.register('poNumber')} className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">PO Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input type="date" value={form.watch('poDate') ? formatDateTime(form.watch('poDate')).split('T')[0] : ''} onChange={(e) => form.setValue('poDate', new Date(e.target.value))} className="w-full h-10 pl-10 pr-3 bg-white border border-gray-200 rounded-lg text-sm outline-none" />
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Delivery & Contact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Delivery Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input type="date" value={form.watch('deliveryDate') ? formatDateTime(form.watch('deliveryDate')).split('T')[0] : ''} onChange={(e) => form.setValue('deliveryDate', new Date(e.target.value))} className="w-full h-10 pl-10 pr-3 bg-white border border-gray-200 rounded-lg text-sm outline-none" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Supplier Email</label>
                      <input {...form.register('companyEmail')} className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm outline-none" placeholder="Email for notification" />
                    </div>
                  </div>

                  {/* Row 4: Supplier Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Supplier Address</label>
                      <input {...form.register('supplierAddress')} readOnly={mode === 'revise'} className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">GSTIN</label>
                      <input {...form.register('gstin')} readOnly={mode === 'revise'} className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm outline-none" />
                    </div>
                  </div>

                  {/* Row 5: Quotation Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Quotation Number</label>
                      <input {...form.register('quotationNumber')} className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Quotation Date</label>
                      <input type="date" value={form.watch('quotationDate') ? formatDateTime(form.watch('quotationDate')).split('T')[0] : ''} onChange={(e) => form.setValue('quotationDate', new Date(e.target.value))} className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm outline-none" />
                    </div>
                  </div>

                  {/* Row 6: Enquiry Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Our Enq No.</label>
                      <input {...form.register('ourEnqNo')} className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Enquiry Date</label>
                      <input type="date" value={form.watch('enquiryDate') ? formatDateTime(form.watch('enquiryDate')).split('T')[0] : ''} onChange={(e) => form.setValue('enquiryDate', new Date(e.target.value))} className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm outline-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Description / Remarks</label>
                    <textarea {...form.register('description')} rows={2} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none resize-none" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="bg-gray-50 text-center border-b border-gray-100">
                  <CardTitle className="text-xs uppercase tracking-wider text-gray-500">Commercial Details</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400">GSTIN</span>
                    <span className="text-sm font-medium text-gray-700">{companies[0]?.gst || '---'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400">PAN</span>
                    <span className="text-sm font-medium text-gray-700">{companies[0]?.pan || '---'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-gray-50 text-center border-b border-gray-100">
                  <CardTitle className="text-xs uppercase tracking-wider text-gray-500">Billing Address</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm font-bold text-gray-800 mb-1">M/S {companies[0]?.name}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{companies[0]?.billingAddress || companies[0]?.address}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-gray-50 border-b border-gray-100">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-gray-500">Destination</span>
                    <button type="button" onClick={isEditingDestination ? () => setIsEditingDestination(false) : () => setIsEditingDestination(true)} className="p-1 hover:bg-gray-200 rounded">
                      {isEditingDestination ? <Save size={14} className="text-green-600" /> : <Pencil size={14} className="text-gray-400" />}
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm font-bold text-gray-800 mb-1">M/S {companies[0]?.name}</p>
                  {isEditingDestination ? (
                    <input value={destinationAddress} onChange={(e) => setDestinationAddress(e.target.value)} className="w-full h-8 px-2 text-xs border border-indigo-200 rounded outline-none" autoFocus />
                  ) : (
                    <p className="text-xs text-gray-600 leading-relaxed">{destinationAddress || 'No destination address set'}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Items & Quantities</CardTitle>
                <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                  {watchedIndents.length} Items Selected
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                {/* Desktop Table View */}
                <table className="w-full border-collapse hidden md:table">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase">S/N</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Item</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Payment</th>
                      <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-500 uppercase">Rate</th>
                      <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase">GST%</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {itemFields.map((field, index) => {
                      const row = form.watch(`indents.${index}`);
                      const amount = calculateTotal(row.rate, row.gst, row.discount, row.quantity);
                      return (
                        <tr key={field.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-4 text-xs text-gray-500">{index + 1}</td>
                          <td className="px-4 py-4 min-w-[200px]">
                            <p className="text-sm font-semibold text-gray-800">{row.productName}</p>
                            <p className="text-[11px] text-gray-500 italic mt-0.5">{row.specifications}</p>
                          </td>
                          <td className="px-4 py-4"><input {...form.register(`indents.${index}.paymentTerm`)} className="w-full h-8 px-2 border border-gray-200 rounded text-xs outline-none focus:border-indigo-400" /></td>
                          <td className="px-4 py-4 w-24"><input type="number" {...form.register(`indents.${index}.quantity`)} className="w-full h-8 text-center border border-gray-200 rounded text-xs outline-none focus:border-indigo-400" /></td>
                          <td className="px-4 py-4 w-28"><input type="number" {...form.register(`indents.${index}.rate`)} className="w-full h-8 text-right px-2 border border-gray-200 rounded text-xs outline-none focus:border-indigo-400" /></td>
                          <td className="px-4 py-4 w-20"><input type="number" {...form.register(`indents.${index}.gst`)} className="w-full h-8 text-center border border-gray-200 rounded text-xs outline-none focus:border-indigo-400" /></td>
                          <td className="px-4 py-4 text-right"><p className="text-sm font-bold text-gray-800">₹{amount.toLocaleString('en-IN')}</p></td>
                          <td className="px-4 py-4 text-center"><button type="button" onClick={() => removeItem(index)} className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"><Trash size={16} /></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-100 bg-white">
                  {itemFields.map((field, index) => {
                    const row = form.watch(`indents.${index}`);
                    const amount = calculateTotal(row.rate, row.gst, row.discount, row.quantity);
                    return (
                      <div key={field.id} className="p-4 space-y-4">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">ITEM {index + 1}</span>
                              <p className="text-sm font-bold text-gray-800">{row.productName}</p>
                            </div>
                            <p className="text-[11px] text-gray-500 italic line-clamp-2">{row.specifications}</p>
                          </div>
                          <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                            <Trash size={18} />
                          </button>
                        </div>

                        <div className="space-y-3 pt-2 border-t border-gray-50">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment Term</label>
                            <input {...form.register(`indents.${index}.paymentTerm`)} className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500" />
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Qty</label>
                              <input type="number" {...form.register(`indents.${index}.quantity`)} className="w-full h-9 text-center border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rate</label>
                              <input type="number" {...form.register(`indents.${index}.rate`)} className="w-full h-9 text-center border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">GST %</label>
                              <input type="number" {...form.register(`indents.${index}.gst`)} className="w-full h-9 text-center border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500" />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg">
                          <span className="text-[10px] font-black text-gray-400 uppercase">Item Total</span>
                          <span className="text-sm font-black text-indigo-600">₹{amount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="p-6 bg-gray-50 flex justify-end">
                <div className="w-80 space-y-3">
                  <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span className="font-medium">₹{calculateSubtotal(watchedIndents.map(i => ({ rate: i.rate, quantity: i.quantity, discountPercent: i.discount })))}</span></div>
                  <div className="flex justify-between text-sm text-gray-600"><span>GST</span><span className="font-medium">₹{calculateTotalGst(watchedIndents.map(i => ({ rate: i.rate, quantity: i.quantity, discountPercent: i.discount, gstPercent: i.gst })))}</span></div>
                  <div className="pt-3 border-t border-gray-200 flex justify-between items-center"><span className="text-sm font-bold text-gray-800 uppercase">Grand Total</span><span className="text-xl font-black text-indigo-600">₹{calculateGrandTotal(watchedIndents.map(i => ({ rate: i.rate, quantity: i.quantity, discountPercent: i.discount, gstPercent: i.gst })))}</span></div>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Terms & Conditions</CardTitle>
                <button type="button" onClick={() => appendTerm('')} className="text-xs font-bold text-indigo-600 flex items-center gap-1"><FilePlus2 size={14} /> Add Term</button>
              </CardHeader>
              <CardContent className="space-y-3">
                {termFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-3">
                    <span className="w-6 text-xs font-bold text-gray-400 text-center">{index + 1}.</span>
                    <input {...form.register(`terms.${index}`)} className="flex-1 bg-transparent border-b border-transparent focus:border-indigo-400 outline-none text-sm py-1 transition" />
                    <button type="button" onClick={() => removeTerm(index)} className="p-1 text-gray-400 hover:text-red-500"><Trash size={14} /></button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 mt-6">
              <div className="grid grid-cols-3 gap-4 items-end">
                <div className="space-y-2 text-center">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Prepared By</label>
                  <input {...form.register('preparedBy')} className="w-full h-10 text-center bg-white border border-gray-200 rounded-lg text-sm outline-none" />
                </div>
                <div className="space-y-2 text-center">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Approved By</label>
                  <input {...form.register('approvedBy')} className="w-full h-10 text-center bg-white border border-gray-200 rounded-lg text-sm outline-none" />
                </div>
                <div className="text-center py-2"><p className="text-sm font-bold text-gray-700 italic border-t-2 border-gray-100 pt-2">For {companies[0]?.name || 'Botivate Services'}</p></div>
              </div>
            </div>

            <div className="bg-white mt-8 mb-4">
              <div className="flex w-full p-1 bg-gray-50">
                <button type="button" onClick={() => form.reset()} className="flex-1 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all">Reset</button>
                <div className="w-1" />
                <button type="button" onClick={handlePreview} disabled={!watchedSupplier || watchedIndents.length === 0} className="flex-1 py-2 text-sm font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"><Eye size={18} /> Preview</button>
                <div className="w-1" />
                <button type="submit" disabled={form.formState.isSubmitting || !watchedSupplier || watchedIndents.length === 0} className="flex-1 py-2 text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                  {form.formState.isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={18} />} Generate
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Standard System Modal Preview */}
      <ModalForm
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="PO Document Preview"
        maxWidth="max-w-5xl"
        submitText="Generate PO"
        onSubmit={(e) => {
          e.preventDefault();
          setShowPreview(false);
          form.handleSubmit(onSubmit)();
        }}
      >
        <div className="bg-gray-100 p-1 rounded-lg h-[80vh] overflow-hidden">
           <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
             <POPdf {...previewData} />
           </PDFViewer>
        </div>
      </ModalForm>
    </div>
  );
}
