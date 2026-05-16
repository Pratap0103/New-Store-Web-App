// Storage Manager - Handle all localStorage operations

const STORAGE_KEYS = {
  USERS: 'pcb_users',
  CREDITS: 'pcb_credits',
  EXPENSES: 'pcb_expenses',
  LEDGER: 'pcb_ledger',
  SETTINGS: 'pcb_settings',
  AUTH_USER: 'pcb_authUser',
  VENDORS: 'pcb_vendors_v3',
  COMPANIES: 'pcb_companies_v3',
  ITEMS: 'pcb_items_v3',
  GROUP_HEADS: 'pcb_group_heads_v3',
  UOMS: 'pcb_uoms_v3',
  DEPARTMENTS: 'pcb_departments_v3',
  INDENTS: 'pcb_indents_v3',
  POS: 'pcb_pos_v4',
  TERMS_CONDITIONS: 'pcb_terms_conditions_v1',
  LIFTING: 'pcb_lifting_v1',
  STORE_IN: 'pcb_store_in_v1',
  DIRECT_STORE_IN: 'pcb_direct_store_in_v1'
};

// Initialize default data
const DEFAULT_USERS = [
  { id: 'admin', name: 'Admin User', password: 'admin123', role: 'ADMIN', accessPages: [] },
  { id: 'user', name: 'Employee 1', password: 'user123', role: 'USER', accessPages: [] },
  { id: 'user2', name: 'Employee 2', password: 'user123', role: 'USER', accessPages: [] }
];

const DEFAULT_SETTINGS = {
  groupHeads: ['IT', 'HR', 'Finance', 'Operations', 'Marketing'],
  paymentModes: ['Cash', 'Cheque', 'Bank Transfer', 'Online Payment'],
  lastSerialNumber: 0
};

const DEFAULT_CREDITS = [];
const DEFAULT_EXPENSES = [];
const DEFAULT_LEDGER = [];
const DEFAULT_VENDORS = [];
const DEFAULT_COMPANIES = [];

// Initialize storage with defaults
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CREDITS)) {
    localStorage.setItem(STORAGE_KEYS.CREDITS, JSON.stringify(DEFAULT_CREDITS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(DEFAULT_EXPENSES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LEDGER)) {
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(DEFAULT_LEDGER));
  }
  if (!localStorage.getItem(STORAGE_KEYS.VENDORS)) {
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(DEFAULT_VENDORS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMPANIES)) {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(DEFAULT_COMPANIES));
  }

  // --- DATA MIGRATION: Update legacy JJSPL PO Numbers ---
  const existingPOs = JSON.parse(localStorage.getItem(STORAGE_KEYS.POS) || '[]');
  const existingIndents = JSON.parse(localStorage.getItem(STORAGE_KEYS.INDENTS) || '[]');
  
  let needsMigration = false;

  const migratedPOs = existingPOs.map(po => {
    if (po.poNumber && po.poNumber.includes('JJSPL/STORES/')) {
      needsMigration = true;
      return { ...po, poNumber: po.poNumber.replace('JJSPL/STORES/', 'Botivate/Store/') };
    }
    return po;
  });

  const migratedIndents = existingIndents.map(indent => {
    let indentChanged = false;
    const updatedItems = indent.items.map(item => {
      if (item.poNumber && item.poNumber.includes('JJSPL/STORES/')) {
        indentChanged = true;
        needsMigration = true;
        return { ...item, poNumber: item.poNumber.replace('JJSPL/STORES/', 'Botivate/Store/') };
      }
      return item;
    });
    if (indentChanged) return { ...indent, items: updatedItems };
    return indent;
  });

  if (needsMigration) {
    localStorage.setItem(STORAGE_KEYS.POS, JSON.stringify(migratedPOs));
    localStorage.setItem(STORAGE_KEYS.INDENTS, JSON.stringify(migratedIndents));
    console.log('Migration Complete: JJSPL updated to Botivate');
  }
};

// Get data from storage
export const getFromStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

// Save data to storage
export const saveToStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// User operations
export const getUsers = () => {
  const users = getFromStorage(STORAGE_KEYS.USERS);
  if (!users || !users.some(u => u.id === 'admin')) {
    saveToStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    return DEFAULT_USERS;
  }
  return users;
};
export const saveUsers = (users) => saveToStorage(STORAGE_KEYS.USERS, users);

// Credits operations
export const getCredits = () => {
  const credits = getFromStorage(STORAGE_KEYS.CREDITS) || [];

  // Seed dummy data if needed (less than 50 rows)
  if (credits.length < 50) {
    const recordsToCreate = 50 - credits.length;
    let currentSnCount = credits.length > 0 ? parseInt(credits[credits.length - 1].sn.split('-')[1]) || 1000 : 1000;
    const dummyCredits = [...credits];
    const dummyLedger = getFromStorage(STORAGE_KEYS.LEDGER) || [];

    // Seed backwards based on today's date
    const baseDate = new Date();

    for (let i = 0; i < recordsToCreate; i++) {
      currentSnCount++;
      const pName = ['John Doe', 'Jane Smith', 'Acme Corp', 'Admin User', 'Employee 1'][(i % 5)];
      const mode = ['Cash', 'Cheque', 'Bank Transfer', 'Online'][(i % 4)];

      const dateObj = new Date(baseDate.getTime() - ((recordsToCreate - i) * 86400000));
      const dateStr = dateObj.toISOString().split('T')[0];

      const creditId = `CRD-${Date.now()}-${currentSnCount}`;
      const amount = (Math.floor(Math.random() * 50) + 1) * 100; // 100 to 5000

      const newCredit = {
        id: creditId,
        sn: `SN-${currentSnCount}`,
        personName: pName,
        date: dateStr,
        amount: amount,
        paymentMode: mode,
        image: '',
        remarks: `Dummy seed record ${i + 1}`,
        status: 'APPROVED',
        timestamp: dateObj.toISOString()
      };

      dummyCredits.push(newCredit);

      // Calculate current active balance for this person
      let currentBalance = 0;
      dummyLedger.filter(l => l.personName === pName).forEach(l => {
        if (l.type === 'CREDIT') currentBalance += l.amount;
        if (l.type === 'DEBIT') currentBalance -= l.amount;
      });
      currentBalance += amount;

      dummyLedger.push({
        id: `LDG-${Date.now()}-${currentSnCount}`,
        personName: pName,
        type: 'CREDIT',
        amount: amount,
        date: dateStr,
        referenceId: creditId,
        balance: currentBalance,
        timestamp: dateObj.toISOString()
      });
    }

    saveToStorage(STORAGE_KEYS.CREDITS, dummyCredits);
    saveToStorage(STORAGE_KEYS.LEDGER, dummyLedger);

    // Attempt to quickly refresh the page silently to grab the new changes
    if (typeof window !== 'undefined' && dummyCredits.length >= 50 && credits.length < 50) {
      setTimeout(() => window.location.reload(), 200);
    }
    return dummyCredits;
  }

  return credits;
};
export const saveCredits = (credits) => saveToStorage(STORAGE_KEYS.CREDITS, credits);
export const saveCredit = (credit) => {
  const credits = getCredits();
  credits.push(credit);
  saveCredits(credits);
};
export const getCreditById = (id) => {
  const credits = getCredits();
  return credits.find(c => c.id === id);
};
export const updateCredit = (updated) => {
  const credits = getCredits();
  const index = credits.findIndex(c => c.id === updated.id);
  if (index !== -1) {
    credits[index] = updated;
    saveCredits(credits);
  }
};

// Expenses operations
export const getExpenses = () => {
  const expenses = getFromStorage(STORAGE_KEYS.EXPENSES) || [];

  // Seed dummy data if needed (less than 25 rows)
  if (expenses.length < 25) {
    const recordsToCreate = 25 - expenses.length;
    let currentSnCount = expenses.length > 0 ? parseInt(expenses[expenses.length - 1].sn.split('-')[1]) || 2000 : 2000;
    const dummyExpenses = [...expenses];
    const dummyLedger = getFromStorage(STORAGE_KEYS.LEDGER) || [];

    // Seed backwards based on today's date
    const baseDate = new Date();

    for (let i = 0; i < recordsToCreate; i++) {
      currentSnCount++;
      const pName = ['John Doe', 'Jane Smith', 'Acme Corp', 'Admin User', 'Employee 1'][(i % 5)];
      const mode = ['Cash', 'Cheque', 'Bank Transfer', 'Online'][(i % 4)];
      const group = ['IT', 'HR', 'Finance', 'Operations', 'Marketing'][(i % 5)];
      // Mix of statuses
      const status = i % 5 === 0 ? 'REJECTED' : (i % 2 === 0 ? 'APPROVED' : 'PENDING');

      const dateObj = new Date(baseDate.getTime() - ((recordsToCreate - i) * 86400000));
      const dateStr = dateObj.toISOString().split('T')[0];

      const expenseId = `EXP-${Date.now()}-${currentSnCount}`;
      const amount = (Math.floor(Math.random() * 15) + 1) * 100; // 100 to 1500

      const newExpense = {
        id: expenseId,
        sn: `EXP-${currentSnCount}`,
        personName: pName,
        date: dateStr,
        amount: amount,
        paymentMode: mode,
        groupHead: group,
        image: '',
        remarks: `Dummy expense record ${i + 1}`,
        status: status,
        timestamp: dateObj.toISOString()
      };

      dummyExpenses.push(newExpense);

      // Calculate current active balance for this person if APPROVED
      if (status === 'APPROVED') {
        let currentBalance = 0;
        dummyLedger.filter(l => l.personName === pName).forEach(l => {
          if (l.type === 'CREDIT') currentBalance += l.amount;
          if (l.type === 'EXPENSE') currentBalance -= l.amount;
          if (l.type === 'DEBIT') currentBalance -= l.amount; // Just in case
        });
        currentBalance -= amount;

        dummyLedger.push({
          id: `LDG-${Date.now()}-${currentSnCount}`,
          personName: pName,
          type: 'EXPENSE', // Used in standard ledger additions
          amount: amount,
          date: dateStr,
          referenceId: expenseId,
          balance: currentBalance,
          timestamp: dateObj.toISOString()
        });
      }
    }

    saveToStorage(STORAGE_KEYS.EXPENSES, dummyExpenses);
    saveToStorage(STORAGE_KEYS.LEDGER, dummyLedger);

    // Attempt to quickly refresh the page silently to grab the new changes
    if (typeof window !== 'undefined' && dummyExpenses.length >= 25 && expenses.length < 25) {
      setTimeout(() => window.location.reload(), 200);
    }
    return dummyExpenses;
  }

  return expenses;
};
export const saveExpenses = (expenses) => saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
export const saveExpense = (expense) => {
  const expenses = getExpenses();
  expenses.push(expense);
  saveExpenses(expenses);
};
export const getExpenseById = (id) => {
  const expenses = getExpenses();
  return expenses.find(e => e.id === id);
};
export const updateExpense = (updated) => {
  const expenses = getExpenses();
  const index = expenses.findIndex(e => e.id === updated.id);
  if (index !== -1) {
    expenses[index] = updated;
    saveExpenses(expenses);
  }
};

// Ledger operations
export const getLedger = () => getFromStorage(STORAGE_KEYS.LEDGER) || [];
export const saveLedgers = (ledger) => saveToStorage(STORAGE_KEYS.LEDGER, ledger);
export const saveLedger = (entry) => {
  const ledger = getLedger();
  ledger.push(entry);
  saveLedgers(ledger);
};

// Settings operations
export const getSettings = () => getFromStorage(STORAGE_KEYS.SETTINGS) || DEFAULT_SETTINGS;
export const saveSettings = (settings) => saveToStorage(STORAGE_KEYS.SETTINGS, settings);

// Auth operations
export const getAuthUser = () => getFromStorage(STORAGE_KEYS.AUTH_USER);
export const saveAuthUser = (user) => saveToStorage(STORAGE_KEYS.AUTH_USER, user);
export const clearAuthUser = () => localStorage.removeItem(STORAGE_KEYS.AUTH_USER);

// Vendor operations
export const getVendors = () => {
  const vendors = getFromStorage(STORAGE_KEYS.VENDORS) || [];
  if (vendors.length < 50) {
    const indianVendors = [
      'Botivate', 'Reliance Industries', 'Infosys Tech', 'HDFC Services', 'ICICI Solutions',
      'Wipro Limited', 'Bharti Airtel', 'Kotak Mahindra', 'Larsen & Toubro', 'Axis Bank',
      'ITC Limited', 'State Bank of India', 'Hindustan Unilever', 'Maruti Suzuki', 'Asian Paints',
      'Bajaj Finance', 'Sun Pharma', 'Titan Company', 'Mahindra & Mahindra', 'HCL Tech',
      'Adani Ports', 'Ultratech Cement', 'Power Grid Corp', 'JSW Steel', 'NTPC Limited',
      'ONGC India', 'Nestle India', 'Hindalco Industries', 'Bharat Petroleum', 'Grasim Industries',
      'Tech Mahindra', 'IndusInd Bank', 'Britannia Industries', 'Coal India', 'Dr. Reddy Labs',
      'Bajaj Auto', 'Botivate Steel', 'Hero MotoCorp', 'Eicher Motors', 'Gail India',
      'Cipla Limited', 'Divis Labs', 'Shree Cement', 'UPL Limited', 'Apollo Hospitals',
      'Godrej Consumer', 'Marico Limited', 'Bajaj Finserv', 'Pidilite Industries', 'Dabur India'
    ];
    const indianNames = [
      'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Gupta', 'Vikram Singh',
      'Anjali Verma', 'Suresh Iyer', 'Kavita Reddy', 'Manoj Bajpai', 'Rahul Dravid',
      'Sachin Tendulkar', 'Sunil Gavaskar', 'Anil Kumble', 'Rohit Sharma', 'Virat Kohli',
      'MS Dhoni', 'Ravindra Jadeja', 'Jasprit Bumrah', 'Hardik Pandya', 'KL Rahul',
      'Rishabh Pant', 'Shikhar Dhawan', 'Cheteshwar Pujara', 'Ajinkya Rahane', 'R Ashwin',
      'Mohammed Shami', 'Ishant Sharma', 'Umesh Yadav', 'Bhuvneshwar Kumar', 'Kuldeep Yadav',
      'Yuzvendra Chahal', 'Shreyas Iyer', 'Ishan Kishan', 'Sanju Samson', 'Prithvi Shaw',
      'Shubman Gill', 'Hanuma Vihari', 'Mayank Agarwal', 'Axar Patel', 'W Sundar',
      'Shardul Thakur', 'Mohammed Siraj', 'T Natarajan', 'Deepak Chahar', 'Varun Chakravarthy',
      'Prasidh Krishna', 'Arshdeep Singh', 'Umran Malik', 'Ravi Bishnoi', 'Avesh Khan'
    ];

    const recordsToCreate = 50 - vendors.length;
    const dummyVendors = [...vendors];
    const baseDate = new Date();
    for (let i = 0; i < recordsToCreate; i++) {
      const dateObj = new Date(baseDate.getTime() - ((recordsToCreate - i) * 3600000));
      const sn = `VN-${String(dummyVendors.length + 1).padStart(3, '0')}`;
      dummyVendors.push({
        id: `VND-${Date.now()}-${i}`,
        timestamp: dateObj.toISOString(),
        vnNo: sn,
        name: indianVendors[i % indianVendors.length],
        gst: `${Math.floor(10 + Math.random() * 80)}AAAAA${Math.floor(1000 + Math.random() * 8000)}A1Z${Math.floor(Math.random() * 9)}`,
        email: `contact@${indianVendors[i % indianVendors.length].toLowerCase().replace(/\s+/g, '')}.in`,
        phone: `${9800000000 + Math.floor(Math.random() * 100000000)}`,
        address: `${100 + i}, MG Road, Mumbai, Maharashtra`,
        locationLink: `https://maps.google.com/?q=${19.0760 + (Math.random() - 0.5)},${72.8777 + (Math.random() - 0.5)}`,
        responsiblePerson: indianNames[i % indianNames.length],
        paymentTerms: [
          `${15 + (i % 4) * 15} Days Credit`,
          i % 3 === 0 ? '10% Advance' : 'Net 30',
          i % 5 === 0 ? 'Special Discount 2%' : 'Standard terms',
          i % 2 === 0 ? 'Partial Advance' : 'Credit Limit 50k'
        ].slice(0, 2 + (i % 3))
      });
    }
    saveToStorage(STORAGE_KEYS.VENDORS, dummyVendors);
    return dummyVendors;
  }

  // DATA REPAIR: Ensure 2-4 terms for every vendor as requested
  let needsSave = false;
  const repairedVendors = vendors.map((v, i) => {
    if (!v.paymentTerms || v.paymentTerms.length < 3) {
      needsSave = true;
      const additional = [
        'Net 30',
        '10% Advance',
        'Partial Advance',
        'Special Discount 2%'
      ].filter(term => !v.paymentTerms?.includes(term));

      const current = v.paymentTerms || ['30 Days Credit'];
      const updated = [...current, ...additional].slice(0, 2 + (i % 3));
      return { ...v, paymentTerms: updated };
    }
    return v;
  });

  if (needsSave) {
    saveToStorage(STORAGE_KEYS.VENDORS, repairedVendors);
    return repairedVendors;
  }

  // Migration: Ensure no legacy Tata vendors
  let needsMigration = false;
  const migrated = vendors.map(v => {
    if (v.name.includes('Tata')) {
      needsMigration = true;
      return { ...v, name: v.name.replace('Tata', 'Botivate') };
    }
    return v;
  });
  if (needsMigration) {
    saveToStorage(STORAGE_KEYS.VENDORS, migrated);
    return migrated;
  }

  return vendors;
};
export const saveVendors = (vendors) => saveToStorage(STORAGE_KEYS.VENDORS, vendors);
export const saveVendor = (vendor) => {
  const vendors = getVendors();
  vendors.push(vendor);
  saveVendors(vendors);
};

// Company operations
export const getCompanies = () => {
  const companies = getFromStorage(STORAGE_KEYS.COMPANIES) || [];
  if (companies.length < 1) {
    const indianCompanies = ['Botivate Services'];
    const indianNames = ['Rajesh Kumar'];

    const dummyCompanies = [];
    const dateObj = new Date();
    const sn = `CN-001`;
    dummyCompanies.push({
      id: `CMP-${Date.now()}-0`,
      timestamp: dateObj.toISOString(),
      vnNo: sn,
      name: indianCompanies[0],
      gst: `27ABCDE1234A1Z5`,
      pan: `ABCDE1234A`,
      email: `info@tcs.com`,
      phone: `9820012345`,
      responsiblePerson: indianNames[0],
      address: `Gateway Park, Mumbai, Maharashtra`,
      billingAddress: `Gateway Park, HQ, Mumbai`,
      destinationAddress: `Warehouse 1, Mumbai`
    });
    saveToStorage(STORAGE_KEYS.COMPANIES, dummyCompanies);
    return dummyCompanies;
  }
  // Migration: Ensure no legacy Tata companies
  let needsMigration = false;
  const migrated = companies.map(c => {
    if (c.name.includes('Tata') || c.name.includes('TCS')) {
      needsMigration = true;
      return { 
        ...c, 
        name: 'Botivate',
        email: c.email.includes('tcs') ? 'info@botivate.com' : c.email
      };
    }
    return c;
  });
  if (needsMigration) {
    saveToStorage(STORAGE_KEYS.COMPANIES, migrated);
    return migrated;
  }

  return companies;
};
export const saveCompanies = (companies) => saveToStorage(STORAGE_KEYS.COMPANIES, companies);
export const saveCompany = (company) => {
  const companies = getCompanies();
  companies.push(company);
  saveCompanies(companies);
};

// Export keys
export { STORAGE_KEYS };

// Item Functions
export const getMasterItems = () => {
  const items = getFromStorage(STORAGE_KEYS.ITEMS) || [];
  if (items.length < 1) {
    const groupHeads = getGroupHeads();
    const uoms = getUOMs();
    const dummyItems = Array.from({ length: 50 }, (_, i) => ({
      id: `ITM-${Date.now()}-${i}`,
      timestamp: new Date(Date.now() - i * 1800000).toISOString(),
      inNo: `IN-${String(i + 1).padStart(3, '0')}`,
      name: `Electronic Component ${i + 1}`,
      groupHead: groupHeads[i % groupHeads.length]?.name || 'Electronics',
      uom: uoms[i % uoms.length]?.name || 'PCS'
    }));
    saveToStorage(STORAGE_KEYS.ITEMS, dummyItems);
    return dummyItems;
  }
  return items;
};
export const saveMasterItems = (items) => saveToStorage(STORAGE_KEYS.ITEMS, items);
export const saveMasterItem = (item) => {
  const items = getMasterItems();
  items.push(item);
  saveMasterItems(items);
};

// Group Head Functions
export const getGroupHeads = () => {
  const heads = getFromStorage(STORAGE_KEYS.GROUP_HEADS) || [];
  if (heads.length < 1) {
    const defaultHeads = ['Raw Materials', 'Packaging', 'Electronics', 'Chemicals', 'Stationery', 'Maintenance', 'Consumables', 'Services', 'Logistics', 'Marketing'];
    const dummyHeads = defaultHeads.map((name, i) => ({
      id: `GH-${Date.now()}-${i}`,
      timestamp: new Date().toISOString(),
      ghNo: `GH-${String(i + 1).padStart(3, '0')}`,
      name
    }));
    saveToStorage(STORAGE_KEYS.GROUP_HEADS, dummyHeads);
    return dummyHeads;
  }
  return heads;
};
export const saveGroupHeads = (data) => saveToStorage(STORAGE_KEYS.GROUP_HEADS, data);
export const saveGroupHead = (item) => {
  const data = getGroupHeads();
  data.push(item);
  saveGroupHeads(data);
};

// UOM Functions
export const getUOMs = () => {
  const uoms = getFromStorage(STORAGE_KEYS.UOMS) || [];
  if (uoms.length < 1) {
    const defaultUoms = ['PCS', 'KG', 'LTR', 'MTR', 'BOX'];
    const dummyUoms = defaultUoms.map((name, i) => ({
      id: `UOM-${Date.now()}-${i}`,
      timestamp: new Date().toISOString(),
      uomNo: `UOM-${String(i + 1).padStart(3, '0')}`,
      name
    }));
    saveToStorage(STORAGE_KEYS.UOMS, dummyUoms);
    return dummyUoms;
  }
  return uoms;
};
export const saveUOMs = (data) => saveToStorage(STORAGE_KEYS.UOMS, data);
export const saveUOM = (item) => {
  const data = getUOMs();
  data.push(item);
  saveUOMs(data);
};

// Department Functions
export const getDepartments = () => {
  const depts = getFromStorage(STORAGE_KEYS.DEPARTMENTS) || [];
  if (depts.length < 1) {
    const defaultDepts = ["Production", "Quality Assurance", "Human Resources", "Logistics", "Finance"];
    const dummyDepts = defaultDepts.map((name, i) => ({
      id: `DP-${Date.now()}-${i}`,
      timestamp: new Date().toISOString(),
      dpNo: `DP-${String(i + 1).padStart(3, '0')}`,
      name: name
    }));
    saveToStorage(STORAGE_KEYS.DEPARTMENTS, dummyDepts);
    return dummyDepts;
  }
  return depts;
};
export const saveDepartments = (data) => saveToStorage(STORAGE_KEYS.DEPARTMENTS, data);
export const saveDepartment = (item) => {
  const data = getDepartments();
  data.push(item);
  saveDepartments(data);
};

// Indent Functions
export const getIndents = () => {
  let indents = getFromStorage(STORAGE_KEYS.INDENTS) || [];
  const DATA_VERSION = 'v8_ma_split'; // Increment this to force re-migration
  const currentVersion = getFromStorage('indents_version');
  
  // Data Migration: Ensure Botivate branding and Approval Status on existing data
  let needsMigration = false;
  if (currentVersion !== DATA_VERSION) needsMigration = true;

  let totalPendingFound = 0;
  let vrPendingCount = 0;   // Indent Approved without vendorRateInfo → Vendor Rate Pending
  let vrHistoryCount = 0;   // Indent Approved with vendorRateInfo  → Vendor Rate History
  let taPendingCount = 0;   // Indent Approved with VR info but NO TA info → Technical Pending
  let maPendingCount = 0;   // Indent Approved with TA info but NO MA info → Management Pending
  const histVendors = ['Reliance Industries', 'Infosys Tech', 'Wipro Limited'];

  const migrated = indents.map(indent => {
    let updatedIndent = { ...indent };
    let changed = false;

    const updatedItems = indent.items.map(item => {
      let status = item.approvalStatus;
      let remarks = item.approvalRemarks || '';

      if (needsMigration || !status) {
        if (totalPendingFound < 15) {
          status = 'PENDING';
          remarks = '';
          totalPendingFound++;
        } else {
          const isRejected = Math.random() > 0.85;
          status = isRejected ? 'REJECTED' : 'APPROVED';
          remarks = isRejected ? 'Insufficient stock in warehouse' : 'System Approved';
          updatedIndent.items[indent.items.indexOf(item)].approvedAt = new Date().toISOString();
        }
        changed = true;
      } else if (status === 'PENDING') {
        totalPendingFound++;
      }

      const itemQty = item.itemQty && item.itemQty !== 1 ? item.itemQty : Math.floor(Math.random() * 95) + 5;
      if (!item.itemQty || item.itemQty === 1) changed = true;

      // 1. Assign vendorRateInfo (VR Split)
      let vendorRateInfo = (needsMigration) ? undefined : item.vendorRateInfo;
      if (needsMigration && status === 'APPROVED') {
        if (vrPendingCount < 10) {
          vrPendingCount++;
          vendorRateInfo = undefined;
        } else {
          vrHistoryCount++;
          const isThree = vrHistoryCount % 4 === 0;
          const vCount = isThree ? 3 : 1;
          vendorRateInfo = {
            vendorType: isThree ? 'Three Party' : 'Regular',
            vendorDetails: Array.from({ length: vCount }, (_, vi) => ({
              name: histVendors[vi % histVendors.length],
              quotationNo: `QT-${2000 + vrHistoryCount * 10 + vi}`,
              quotationDate: new Date(Date.now() - vrHistoryCount * 86400000).toISOString().split('T')[0],
              basicRate: String(Math.floor(Math.random() * 900 + 100)) + '.00',
              paymentTerms: ['30 Days Credit', 'Net 30', '15 Days Credit'][vi % 3],
              deliveryTime: String(7 + vi * 2),
              make: ['Samsung', 'LG', 'Bosch'][vi % 3],
              remarks: '', image: ''
            })),
            updatedAt: new Date(Date.now() - vrHistoryCount * 3600000).toISOString()
          };
        }
      }

      // 2. Assign technicalApproval (TA Split)
      let technicalApproval = (needsMigration) ? undefined : item.technicalApproval;
      if (needsMigration && vendorRateInfo) {
        if (taPendingCount < 5) {
          taPendingCount++;
          technicalApproval = undefined;
        } else {
          const vd = vendorRateInfo.vendorDetails || [];
          technicalApproval = {
            t1: vd[0] ? { ...vd[0] } : null,
            t2: vd[1] ? { ...vd[1] } : null,
            t3: vd[2] ? { ...vd[2] } : null,
            rankedAt: new Date(Date.now() - taPendingCount * 7200000).toISOString()
          };
        }
      }

      // 3. Assign managementApproval (MA Split: 5 Pending, rest History)
      let managementApproval = (needsMigration) ? undefined : item.managementApproval;
      if (needsMigration && technicalApproval) {
        if (maPendingCount < 5) {
          maPendingCount++;
          managementApproval = undefined;
        } else {
          managementApproval = {
            approvedVendor: technicalApproval.t1,
            remarks: 'Management Approved for Purchase',
            approvedAt: new Date(Date.now() - maPendingCount * 3600000).toISOString()
          };
        }
      }

      return { 
        ...item, 
        approvalStatus: status, 
        approvalRemarks: remarks, 
        approvedAt: item.approvedAt,
        itemQty,
        vendorRateInfo,
        technicalApproval,
        managementApproval
      };
    });

    if (changed || needsMigration) {
      updatedIndent.items = updatedItems;
      needsMigration = true;
    }

    return updatedIndent;
  });

  if (needsMigration) {
    saveToStorage(STORAGE_KEYS.INDENTS, migrated);
    saveToStorage('indents_version', DATA_VERSION);
    indents = migrated;
  }
  
  if (indents.length < 50) {
    const companies = getCompanies();
    const depts = getDepartments();
    const groupHeads = getGroupHeads();
    const masterItems = getMasterItems();
    const dummyIndents = [...indents];
    const baseDate = new Date();

    // Calculate how many pending we still need to reach 15
    let currentPendingCount = dummyIndents.reduce((acc, ind) => 
      acc + ind.items.filter(it => it.approvalStatus === 'PENDING').length, 0);

    const recordsToCreate = 50 - indents.length;
    let seedVrPendingCount = 0;
    let seedVrHistoryCount = 0;
    let seedTaPendingCount = 0;
    let seedMaPendingCount = 0;
    let seedPoPendingCount = 0;
    let seedPoHistoryCount = 0;
    const seedVendors = ['Reliance Industries', 'Infosys Tech', 'Wipro Limited'];

    for (let i = 0; i < recordsToCreate; i++) {
      const sn = `IN-${String(dummyIndents.length + 1).padStart(3, '0')}`;
      const daysBack = Math.floor(i / (recordsToCreate / 30));
      const dateObj = new Date(baseDate.getTime() - (daysBack * 86400000) - (Math.random() * 3600000)); 
      const timestamp = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}:${String(dateObj.getSeconds()).padStart(2, '0')}`;

      const itemCount = (i % 3) + 1;
      const items = Array.from({ length: itemCount }, (_, idx) => {
        const gh = groupHeads[idx % groupHeads.length]?.name || 'Electronics';
        const filteredItems = masterItems.filter(m => m.groupHead === gh);
        const item = filteredItems[idx % filteredItems.length] || masterItems[0];

        let status = 'APPROVED';
        let remarks = 'System Approved';
        let approvedAt = null;
        
        if (currentPendingCount < 15) {
          status = 'PENDING';
          remarks = '';
          currentPendingCount++;
        } else {
          if (Math.random() > 0.8) {
            status = 'REJECTED';
            remarks = 'Budget exceeded for this quarter';
          }
          const approvedDate = new Date(dateObj.getTime() + (Math.random() * 3600000 * 24));
          approvedAt = approvedDate.toISOString();
        }

        // 1. VR
        let seedVendorRateInfo = undefined;
        if (status === 'APPROVED') {
          if (seedVrPendingCount < 10) {
            seedVrPendingCount++;
          } else {
            seedVrHistoryCount++;
            const isThree = seedVrHistoryCount % 4 === 0;
            const vCount = isThree ? 3 : 1;
            seedVendorRateInfo = {
              vendorType: isThree ? 'Three Party' : 'Regular',
              vendorDetails: Array.from({ length: vCount }, (_, vi) => ({
                name: seedVendors[vi % seedVendors.length],
                quotationNo: `QT-${3000 + seedVrHistoryCount * 10 + vi}`,
                quotationDate: new Date(Date.now() - seedVrHistoryCount * 86400000).toISOString().split('T')[0],
                basicRate: String(Math.floor(Math.random() * 900 + 100)) + '.00',
                paymentTerms: ['30 Days Credit', 'Net 30', '15 Days Credit'][vi % 3],
                deliveryTime: String(7 + vi * 2),
                make: ['Samsung', 'LG', 'Bosch'][vi % 3],
                remarks: '', image: ''
              })),
              updatedAt: new Date(Date.now() - seedVrHistoryCount * 3600000).toISOString()
            };
          }
        }

        // 2. TA
        let seedTechnicalApproval = undefined;
        if (seedVendorRateInfo) {
          if (seedTaPendingCount < 5) {
            seedTaPendingCount++;
          } else {
            const vd = seedVendorRateInfo.vendorDetails;
            seedTechnicalApproval = {
              t1: vd[0] ? { ...vd[0] } : null,
              t2: vd[1] ? { ...vd[1] } : null,
              t3: vd[2] ? { ...vd[2] } : null,
              rankedAt: new Date().toISOString()
            };
          }
        }

        // 3. MA
        let seedManagementApproval = undefined;
        if (seedTechnicalApproval) {
          if (seedMaPendingCount < 5) {
            seedMaPendingCount++;
          } else {
            seedManagementApproval = {
              approvedVendor: seedTechnicalApproval.t1,
              remarks: 'Bulk Seed Approval',
              approvedAt: new Date().toISOString()
            };
          }
        }

        // 4. PO Stage
        let poGenerated = false;
        let poNumber = null;
        if (seedManagementApproval) {
          if (seedPoPendingCount < 4) {
            seedPoPendingCount++;
            poGenerated = false;
          } else {
            poGenerated = true;
            poNumber = `Botivate/Store/26-27/${seedPoHistoryCount + 1}`;
            seedPoHistoryCount++;
          }
        }

        return {
          department: depts[idx % depts.length]?.name || 'Production',
          groupHead: gh,
          itemName: item?.name || 'Standard Item',
          uom: item?.uom || 'PCS',
          itemQty: Math.floor(Math.random() * 50) + 1,
          areaOfUse: ['Production Line A', 'Warehouse B', 'Admin Block', 'Maintenance Shed'][idx % 4],
          attachment: '',
          specification: `Spec details for ${item?.name}`,
          itemCount: idx + 1,
          approvalStatus: status,
          approvalRemarks: remarks,
          approvedAt,
          vendorRateInfo: seedVendorRateInfo,
          technicalApproval: seedTechnicalApproval,
          managementApproval: seedManagementApproval,
          poGenerated,
          poNumber
        };
      });

      dummyIndents.push({
        id: `IND-${Date.now()}-${i}`,
        serialNo: sn,
        timestamp,
        firmName: companies[0]?.name || 'Botivate',
        indenterName: ['Rajesh Kumar', 'Amit Patel', 'Sneha Gupta'][i % 3],
        indentStatus: i % 4 === 0 ? 'Critical' : 'Non-Critical',
        items
      });
    }
    saveToStorage(STORAGE_KEYS.INDENTS, dummyIndents);
    return dummyIndents;
  }

  return indents;
};

export const saveIndents = (data) => saveToStorage(STORAGE_KEYS.INDENTS, data);

export const saveIndent = (indent) => {
  const data = getIndents();
  data.push(indent);
  saveIndents(data);
};
// PO Functions
export const getPOs = () => {
  const pos = getFromStorage(STORAGE_KEYS.POS) || [];
  if (pos.length < 1) {
    const companies = getCompanies();
    const vendors = getVendors();
    const dummyPOs = Array.from({ length: 20 }, (_, i) => {
      const vendor = vendors[i % vendors.length];
      const items = Array.from({ length: 2 }, (_, idx) => ({
        id: `ITM-${Date.now()}-${i}-${idx}`,
        productName: `Electronic Component ${Math.floor(Math.random() * 50) + 1}`,
        specifications: 'Standard industrial grade',
        quantity: Math.floor(Math.random() * 100) + 10,
        rate: Math.floor(Math.random() * 500) + 100,
        gst: 18,
        discount: 0,
        paymentTerm: '30 Days Credit',
        unit: 'PCS'
      }));

      const subtotal = items.reduce((acc, it) => acc + (it.rate * it.quantity), 0);
      const gst = subtotal * 0.18;

      return {
        id: `PO-${Date.now()}-${i}`,
        poNumber: `Botivate/Store/26-27/${i + 1}`,
        indentNo: `IN-${String(i + 1).padStart(3, '0')}`,
        poDate: new Date(Date.now() - (20 - i) * 86400000).toISOString(),
        supplierName: vendor.name,
        supplierAddress: vendor.address,
        gstin: vendor.gst,
        companyEmail: vendor.email,
        items,
        subtotal,
        totalGst: gst,
        totalAmount: subtotal + gst,
        preparedBy: 'System Admin',
        approvedBy: 'Management',
        companyName: companies[0]?.name || 'Botivate',
        timestamp: new Date(Date.now() - (20 - i) * 86400000).toISOString()
      };
    });
    saveToStorage(STORAGE_KEYS.POS, dummyPOs);
    saveToStorage('pos_version', 'v2_indent_fix');
    return dummyPOs;
  }
  return pos;
};

export const savePOs = (pos) => {
  saveToStorage(STORAGE_KEYS.POS, pos);
};

export const savePO = (po) => {
  const pos = getPOs();
  pos.push(po);
  savePOs(pos);
};

// Terms & Conditions Functions
export const getTermsConditions = () => {
  let terms = getFromStorage(STORAGE_KEYS.TERMS_CONDITIONS) || [];
  if (terms.length < 1) {
    const companies = getCompanies();
    const botivate = companies.find(c => c.name === 'Botivate' || c.name === 'Botivate Services') || companies[0];
    const companyName = botivate?.name || 'Botivate Services';
    
    const dummyTerms = [
      "Payment within 30 days of invoice date.",
      "Delivery within 2 weeks of purchase order.",
      "Goods once sold will not be taken back.",
      "All disputes subject to Mumbai jurisdiction.",
      "Warranty for 1 year against manufacturing defects.",
      "Prices are inclusive of all taxes unless specified.",
      "Inspection to be done at our warehouse before dispatch.",
      "Order cancellation subject to 10% restocking fee.",
      "Interest at 18% p.a. for delayed payments.",
      "Quantity tolerance of +/- 5% allowed.",
      "Standard packaging included in price.",
      "Quotations valid for 15 days only."
    ];

    const seeded = dummyTerms.map((text, i) => ({
      id: `TC-${Date.now()}-${i}`,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      tcNo: `TC-001`,
      termsNo: i + 1,
      companyName: companyName,
      content: text
    }));

    saveToStorage(STORAGE_KEYS.TERMS_CONDITIONS, seeded);
    return seeded;
  }

  // FORCE REPAIR: Ensure all terms for the same company have the same TC number
  let needsFix = false;
  const companyMap = {};
  const fixedTerms = terms.map(t => {
    if (!companyMap[t.companyName]) {
      companyMap[t.companyName] = t.tcNo;
      return t;
    }
    if (t.tcNo !== companyMap[t.companyName]) {
      needsFix = true;
      return { ...t, tcNo: companyMap[t.companyName] };
    }
    return t;
  });

  if (needsFix) {
    saveToStorage(STORAGE_KEYS.TERMS_CONDITIONS, fixedTerms);
    return fixedTerms;
  }

  return terms;
};

export const saveTermsConditions = (data) => saveToStorage(STORAGE_KEYS.TERMS_CONDITIONS, data);
export const saveTermsCondition = (item) => {
  const data = getTermsConditions();
  data.push(item);
  saveTermsConditions(data);
};
// Lifting operations
export const getLiftingRecords = () => {
  const records = getFromStorage(STORAGE_KEYS.LIFTING) || [];
  const DATA_VERSION = 'v5_botivate_services';
  const currentVersion = getFromStorage('lifting_version');
  
  // Seed 17 dummy records for History if empty or version mismatch
  if (records.length < 1 || currentVersion !== DATA_VERSION) {
    const pos = getPOs();
    const vendors = getVendors();
    const dummyRecords = [];
    
    for (let i = 0; i < 17; i++) {
      const po = pos[i % pos.length];
      const item = po.items[0];
      const dateObj = new Date(Date.now() - (17 - i) * 86400000);
      
      dummyRecords.push({
        id: `LIFT-DUMMY-${i}`,
        timestamp: dateObj.toISOString(),
        poNumber: po.poNumber,
        indentNo: po.indentNo || `IN-${String(i + 1).padStart(3, '0')}`,
        firmName: 'Botivate Services',
        projectName: 'PROJECT-' + (i + 1),
        vendorName: po.supplierName,
        billStatus: i % 2 === 0 ? 'Received' : 'Not Received',
        billNumber: `BILL-${1000 + i}`,
        billAmount: (item.rate * item.quantity * 1.18).toFixed(2),
        billRemarks: 'Automatic dummy seed record',
        challanNumber: `CHL-${500 + i}`,
        transportation: 'Yes',
        transporterName: 'Express Logistics',
        vehicleNo: `MH-${12 + i}-AB-${1000 + i}`,
        driverName: 'Rajesh Driver ' + (i + 1),
        driverMobile: '98000123' + String(i).padStart(2, '0'),
        frightAmount: '1500.00',
        freightPaymentStatus: i >= 10 ? 'Paid' : 'Pending',
        freightPaidAt: i >= 10 ? new Date(dateObj.getTime() + 86400000).toISOString() : null,
        freightData: i >= 10 ? {
            vehicleNumber: `MH-${12 + i}-AB-${1000 + i}`,
            biltyNumber: `BLT-${7000 + i}`,
            fromLocation: 'Warehouse A',
            toLocation: 'Project Site ' + (i + 1),
            rateType: 'Fixed',
            freightAmount: '1500.00',
            materialLoadDetails: 'Bulk construction material load'
        } : null,
        items: [
          {
            productName: item.productName,
            rate: item.rate,
            gst: item.gst,
            effRate: item.rate * 1.18,
            pendingQty: 0,
            liftQty: item.quantity,
            cancelQty: 0,
            amount: item.rate * item.quantity * 1.18
          }
        ],
        totalAmount: item.rate * item.quantity * 1.18
      });
    }
    saveToStorage(STORAGE_KEYS.LIFTING, dummyRecords);
    saveToStorage('lifting_version', DATA_VERSION);
    return dummyRecords;
  }
  
  return records;
};
export const saveLiftingRecords = (records) => saveToStorage(STORAGE_KEYS.LIFTING, records);
export const saveLiftingRecord = (record) => {
  const records = getLiftingRecords();
  records.push({
    ...record,
    id: record.id || `LIFT-${Date.now()}`
  });
  saveLiftingRecords(records);
};

// Store In operations
export const getStoreInRecords = () => {
  const records = getFromStorage(STORAGE_KEYS.STORE_IN) || [];
  const DATA_VERSION = 'v5_botivate_services';
  const currentVersion = getFromStorage('store_in_version');
  
  // Seed more records if empty or if version mismatch (to force the 2-pending split)
  if (records.length < 5 || currentVersion !== DATA_VERSION) {
    const lifting = getLiftingRecords();
    const dummy = lifting.map((lift, i) => {
      // First 2 are pending, rest are history as requested
      const isHistory = i >= 2;
      return {
        ...lift,
        id: `STR-DUMMY-${i}`,
        recQty: lift.items[0].liftQty,
        physicalCheck: 'Pass',
        qtyMatch: 'Yes',
        priceMatch: 'Yes',
        location: 'Main Warehouse Row ' + (i + 1),
        timestamp: new Date(new Date(lift.timestamp).getTime() + 86400000).toISOString(),
        // HOD fields
        hodStatus: isHistory ? (i % 4 === 0 ? 'Rejected' : 'Approved') : 'Pending',
        hodRemark: isHistory ? (i % 4 === 0 ? 'Quantity discrepancy in bill' : 'All items verified physically') : '',
        hodApprovedAt: isHistory ? new Date(new Date(lift.timestamp).getTime() + 172800000).toISOString() : null
      };
    });
    saveToStorage(STORAGE_KEYS.STORE_IN, dummy);
    saveToStorage('store_in_version', DATA_VERSION);
    return dummy;
  }
  return records;
};
export const saveStoreInRecords = (records) => saveToStorage(STORAGE_KEYS.STORE_IN, records);
export const saveStoreInRecord = (record) => {
  const records = getStoreInRecords();
  records.push({ ...record, id: `STR-${Date.now()}` });
  saveStoreInRecords(records);
};

// Direct Store In operations
export const getDirectStoreInRecords = () => {
  const records = getFromStorage(STORAGE_KEYS.DIRECT_STORE_IN) || [];
  const DATA_VERSION = 'v2_firm_name';
  const currentVersion = getFromStorage('direct_store_in_version');
  
  if (records.length < 1 || currentVersion !== DATA_VERSION) {
    const vendors = getVendors();
    const dummy = Array.from({ length: 12 }, (_, i) => ({
      id: `DIR-DUMMY-${i}`,
      firmName: 'Botivate Services',
      projectName: 'GOAT MARKET',
      receiverName: 'Receiver ' + (i + 1),
      vendorName: vendors[i % vendors.length].name,
      productName: 'Direct Item ' + (i + 1),
      billStatus: i % 3 === 0 ? 'Not Received' : 'Received',
      billNo: `DIR-BILL-${2000 + i}`,
      billAmount: (500 + i * 100).toFixed(2),
      receivingQty: (10 + i),
      transportingType: 'Yes',
      freightAmount: '500.00',
      transporterName: 'Local Transport',
      vehicleNo: `MH-15-TR-${3000 + i}`,
      timestamp: new Date(Date.now() - i * 86400000).toISOString()
    }));
    saveToStorage(STORAGE_KEYS.DIRECT_STORE_IN, dummy);
    saveToStorage('direct_store_in_version', DATA_VERSION);
    return dummy;
  }
  return records;
};
export const saveDirectStoreInRecords = (records) => saveToStorage(STORAGE_KEYS.DIRECT_STORE_IN, records);
export const saveDirectStoreInRecord = (record) => {
  const records = getDirectStoreInRecords();
  records.push({ ...record, id: `DIR-${Date.now()}` });
  saveDirectStoreInRecords(records);
};
