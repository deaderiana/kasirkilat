"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Package, ShoppingCart, Wallet, PieChart, Menu, X, 
  TrendingUp, TrendingDown, DollarSign, Save, Trash2, Edit2, Upload, 
  Loader2, Lock, Printer, Download, LogOut, History, FileText, Crown, Store, AlertTriangle, Clock, Settings, Plus,
  Users, ShoppingBag, ClipboardList, CheckCircle, Shield, Key, Zap, Tag, CreditCard, UserCog, Gift, FileText as FileIcon, 
  Warehouse, MapPin, AlertCircle, ArrowDownLeft, ArrowUpRight, Search, Star, MessageCircle, Landmark,BarChart3, ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { useRouter as useNav } from 'next/navigation'; // Fix import alias collision if any
import Logo from '@/components/Logo'; 
import ExcelJS from 'exceljs'; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminPage() {
  const router = useRouter();
 
  
  // --- AUTH & USER STATE ---
  const [user, setUser] = useState<any>(null); 
  const [isPro, setIsPro] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [wmsSubTab, setWmsSubTab] = useState("overview"); 
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [expandedTrxId, setExpandedTrxId] = useState<number | null>(null); // --- TAMBAHAN BARU UNTUK HP ---
  const [chartData, setChartData] = useState<any[]>([]);

  // --- DATA STATE ---
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]); 
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]); 
  const [expenses, setExpenses] = useState<any[]>([]); 
  const [suppliers, setSuppliers] = useState<any[]>([]); 
  const [purchases, setPurchases] = useState<any[]>([]);
  const [allStockLogs, setAllStockLogs] = useState<any[]>([]); 
  const [customersList, setCustomersList] = useState<any[]>([]); 
  
  const [summary, setSummary] = useState({ income: 0, expense: 0, profit: 0, stockValue: 0, lowStockCount: 0 });

  // --- FORM STATE ---
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // SETTINGS STATE (NEW: Store Branding)
  const [taxRate, setTaxRate] = useState<string>('0');
  const [adminPin, setAdminPin] = useState<string>('');
  const [storeSettings, setStoreSettings] = useState({
      name: '',
      address: '',
      phone: '',
      footer: 'Terima kasih atas kunjungan Anda.'
  });

  const [editingProduct, setEditingProduct] = useState<any>(null); 
  const [productForm, setProductForm] = useState({ name: '', price: '', buy_price: '', stock: '', category: '', image: '', location: '', min_stock: '10' }); 
  
  const [expenseForm, setExpenseForm] = useState({ title: '', amount: '', category: 'Operasional' }); 
  const [supplierForm, setSupplierForm] = useState({ name: '', phone: '', address: '' });
  const [purchaseForm, setPurchaseForm] = useState({ supplier_id: '', product_id: '', qty: '', cost_price: '' });
  const [opnameForm, setOpnameForm] = useState({ product_id: '', actual_stock: '', reason: '' });
  
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', points: '' });

  // --- MODALS ---
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [selectedProductHistory, setSelectedProductHistory] = useState<any>(null);
  
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  
  const [showLocationModal, setShowLocationModal] = useState(false); 
  const [newLocationName, setNewLocationName] = useState(""); 

  const [showCustomerEditModal, setShowCustomerEditModal] = useState(false); 

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    const checkUser = async () => {
      const isUnlocked = sessionStorage.getItem('is_admin_unlocked');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); } 
      else { 
        setUser(session.user);
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) {
            let isActivePro = false; const now = new Date();
            if (profile.is_pro) {
                if (!profile.pro_expires_at) isActivePro = true; 
                else { const exp = new Date(profile.pro_expires_at); if (exp > now) { isActivePro = true; setDaysLeft(Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))); setExpiryDate(exp); } }
            }
            setIsPro(isActivePro);
            
            // LOAD SETTINGS FROM DB
            setTaxRate(profile.tax_rate?.toString() || '0');
            setAdminPin(profile.admin_pin || '');
            setStoreSettings({
                name: profile.store_name || '',
                address: profile.store_address || '',
                phone: profile.store_phone || '',
                footer: profile.store_footer || 'Terima kasih atas kunjungan Anda.'
            });

            if (profile.admin_pin && isUnlocked !== 'true') { router.push('/pos'); return; }
        }
        setAuthLoading(false); 
      }
    };
    checkUser();
  }, [router]);

  /// --- 2. FETCH DATA (SECURITY PATCHED) ---
  const fetchAllData = async () => {
    if (!user) return;
    let startDate, endDate;
    if (selectedMonth === 0) { startDate = `${selectedYear}-01-01`; endDate = `${selectedYear}-12-31`; } 
    else {
        const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
        const monthStr = String(selectedMonth).padStart(2, '0');
        startDate = `${selectedYear}-${monthStr}-01`; endDate = `${selectedYear}-${monthStr}-${lastDay}`;
    }
    const startIso = `${startDate}T00:00:00`; const endIso = `${endDate}T23:59:59`;

    // 1. Categories - Filter by user.id
    const { data: catData } = await supabase.from('categories').select('*').eq('user_id', user.id).order('name');
    if (catData) setCategories(catData.length ? catData : [{id:-1, name:'Umum'}]);

    // 2. Locations - Filter by user.id
    const { data: locData } = await supabase.from('locations').select('*').eq('user_id', user.id).order('name');
    if (locData) setLocations(locData);

    // 3. Products - Filter by user.id
    const { data: prodData } = await supabase.from('products').select('*').eq('user_id', user.id).order('name');
    if (prodData) {
        setProducts(prodData);
        if(prodData.length > 0) {
            if(purchaseForm.product_id === '') setPurchaseForm(prev => ({...prev, product_id: prodData[0].id}));
            if(opnameForm.product_id === '') setOpnameForm(prev => ({...prev, product_id: prodData[0].id}));
        }
    }

    // 4. Transactions - Filter by user.id
    const { data: trxData } = await supabase.from('transactions').select('*').eq('user_id', user.id).gte('created_at', startIso).lte('created_at', endIso).order('created_at', { ascending: false });
    if (trxData) setTransactions(trxData);
        
    // 5. Expenses - SECURITY FIX DISINI (Filter User ID)
    const { data: expData } = await supabase.from('expenses').select('*').eq('user_id', user.id).gte('created_at', startIso).lte('created_at', endIso).order('created_at', { ascending: false });
    if (expData) setExpenses(expData);

    // 6. Suppliers - Filter by user.id
    const { data: suppData } = await supabase.from('suppliers').select('*').eq('user_id', user.id).order('name');
    if (suppData) {
        setSuppliers(suppData);
        if(suppData.length > 0 && purchaseForm.supplier_id === '') setPurchaseForm(prev => ({...prev, supplier_id: suppData[0].id}));
    }
    
    // 7. Purchases - Filter by user.id
    const { data: purchData } = await supabase.from('purchases').select('*, suppliers(name)').eq('user_id', user.id).gte('created_at', startIso).lte('created_at', endIso).order('created_at', { ascending: false });
    if (purchData) setPurchases(purchData);

    // 8. Stock Logs - Filter by user.id logic (via product list)
    const { data: logsData } = await supabase.from('stock_logs')
        .select('*, products(name)')
        .in('product_id', prodData ? prodData.map(p => p.id) : []) 
        .gte('created_at', startIso).lte('created_at', endIso).order('created_at', { ascending: false });
    if (logsData) setAllStockLogs(logsData);
    
    // 9. Customers - Filter by user.id
    const { data: custData } = await supabase.from('customers').select('*, transactions(total_amount, created_at)').eq('user_id', user.id).order('total_transactions', { ascending: false });
    if (custData) {
        const enriched = custData.map((c: any) => {
            const total = c.transactions?.reduce((sum: number, t: any) => sum + (t.total_amount || 0), 0) || 0;
            const last = c.transactions?.length ? new Date(Math.max(...c.transactions.map((t: any) => new Date(t.created_at).getTime()))) : null;
            let level = 'Bronze';
            if (total > 5000000) level = 'Gold'; else if (total > 1000000) level = 'Silver';
            return { ...c, totalSpent: total, lastTrx: last, level };
        });
        setCustomersList(enriched);
    }

    // CALCULATIONS
    const now = new Date();
    const localToday = now.toLocaleDateString('en-CA');

    const totalIncome = trxData?.filter((t:any) => {
        if (selectedMonth === 0) return true; 
        return t.status !== 'CANCELLED';
    }).reduce((a:number,c:any)=>a+c.total_amount,0)||0;

    const todayIncome = trxData?.filter((t:any) => {
        const tDate = new Date(t.created_at).toLocaleDateString('en-CA');
        return tDate === localToday && t.status !== 'CANCELLED';
    }).reduce((a:number,c:any)=>a+c.total_amount,0)||0;

    const totalExpense = expData?.reduce((a,c)=>a+c.amount,0)||0;
    const totalPurchase = purchData?.reduce((a,c)=>a+c.total_cost,0)||0;
    const stockVal = prodData?.reduce((a,c)=> a + ((c.buy_price || 0) * c.stock), 0) || 0;
    const lowStock = prodData?.filter((p:any) => p.stock <= (p.min_stock || 10)).length || 0; 

    setSummary({ income: selectedMonth === 0 ? totalIncome : todayIncome, expense: totalExpense + totalPurchase, profit: (selectedMonth === 0 ? totalIncome : todayIncome) - (totalExpense + totalPurchase), stockValue: stockVal, lowStockCount: lowStock });

    // CHART
    const last7Days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d.toLocaleDateString('en-CA'); }).reverse();
    const chart = last7Days.map(dateStr => {
        const dailyTotal = trxData?.filter((t: any) => {
            const tDate = new Date(t.created_at).toLocaleDateString('en-CA');
            return tDate === dateStr && t.status !== 'CANCELLED';
        }).reduce((acc: number, curr: any) => acc + curr.total_amount, 0) || 0;
        return { name: new Date(dateStr).toLocaleDateString('id-ID', {day: '2-digit', month: 'short'}), total: dailyTotal };
    });
    setChartData(chart);
  };

  useEffect(() => { fetchAllData(); }, [user, selectedYear, selectedMonth]);

  // --- ACTIONS HELPER ---
  const toggleExpand = (id: number) => { setExpandedTrxId(expandedTrxId === id ? null : id); }; // --- HELPER BARU ---

  const handleUpgradeRequest = (type: 'new' | 'renew' = 'new') => {
    const ownerPhone = "6282177771224"; 
    let message = type === 'renew' ? `Halo Admin, Paket PRO saya akan habis pada *${expiryDate?.toLocaleDateString('id-ID')}*. Saya ingin memperpanjang langganan.` : `Halo Admin, saya ingin upgrade ke akun *PRO PLAN*. Mohon infonya.`;
    window.open(`https://wa.me/${ownerPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // --- ACTION HANDLERS ---
  const handleSaveSettings = async (e: React.FormEvent) => {
      e.preventDefault(); setLoading(true);
      if (adminPin && !/^\d+$/.test(adminPin)) { alert("PIN harus berupa angka!"); setLoading(false); return; }
      
      const updates: any = { 
          tax_rate: Number(taxRate), 
          admin_pin: adminPin
      };

      // Simpan data toko jika user PRO
      if (isPro) {
          updates.store_name = storeSettings.name;
          updates.store_address = storeSettings.address;
          updates.store_phone = storeSettings.phone;
          updates.store_footer = storeSettings.footer;
      }

      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      
      if (error) alert("Gagal: " + error.message); 
      else { 
          alert("Pengaturan & Branding Tersimpan!"); 
          if (adminPin) sessionStorage.setItem('is_admin_unlocked', 'true'); 
      }
      setLoading(false);
  };
  
  const handleLockApp = () => {
      if (!adminPin) return alert("Anda belum mengatur PIN di menu Pengaturan!");
      if (confirm("Kunci Admin dan masuk Mode Kasir?")) { 
          sessionStorage.setItem('is_admin_unlocked', 'false'); 
          router.push('/pos'); 
      }
  };
  
  const handleAddSupplier = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); const { error } = await supabase.from('suppliers').insert([{ ...supplierForm, user_id: user.id }]); if(!error) { alert("Supplier ditambahkan!"); setSupplierForm({name:'', phone:'', address:''}); fetchAllData(); } else alert(error.message); setLoading(false); };
  const handleDeleteSupplier = async (id:number) => { if(confirm("Hapus Supplier?")) { await supabase.from('suppliers').delete().eq('id',id); fetchAllData(); }};
  
  const handleRestock = async (e: React.FormEvent) => { 
      e.preventDefault(); 
      if (!isPro) { handleUpgradeRequest('new'); return; } 
      setLoading(true); 
      const cost = Number(purchaseForm.cost_price); 
      const qty = Number(purchaseForm.qty); 
      const total = cost * qty; 
      
      try { 
          const { data: pur, error: purErr } = await supabase.from('purchases').insert([{ user_id: user.id, supplier_id: purchaseForm.supplier_id, total_cost: total, note: 'Restock Manual' }]).select().single(); 
          if(purErr) throw purErr; 
          
          const { data: prod } = await supabase.from('products').select('stock').eq('id', purchaseForm.product_id).single(); 
          if(prod) { 
              await supabase.from('products').update({ stock: prod.stock + qty, buy_price: cost }).eq('id', purchaseForm.product_id); 
              await supabase.from('stock_logs').insert([{ product_id: purchaseForm.product_id, type: 'IN', movement_type: 'INBOUND', qty: qty, note: `Restock Supplier (ID: ${pur.id})` }]); 
          } 
          alert("Stok Masuk Berhasil! Asset Updated."); 
          setPurchaseForm({ ...purchaseForm, qty: '', cost_price: '' }); 
          fetchAllData(); 
      } catch (err: any) { alert("Gagal: " + err.message); } 
      setLoading(false); 
  };

  const handleOpname = async (e: React.FormEvent) => { 
      e.preventDefault(); 
      if (!isPro) { handleUpgradeRequest('new'); return; } 
      setLoading(true); 
      const realStock = Number(opnameForm.actual_stock); 
      const prodId = opnameForm.product_id; 
      
      try { 
          const { data: prod } = await supabase.from('products').select('stock').eq('id', prodId).single(); 
          if (prod) { 
              const diff = realStock - prod.stock; 
              await supabase.from('stock_opnames').insert([{ user_id: user.id, product_id: prodId, system_stock: prod.stock, physical_stock: realStock, difference: diff, reason: opnameForm.reason }]); 
              await supabase.from('products').update({ stock: realStock }).eq('id', prodId); 
              await supabase.from('stock_logs').insert([{ product_id: prodId, type: diff >= 0 ? 'IN' : 'OUT', movement_type: 'ADJUSTMENT', qty: Math.abs(diff), note: `Stock Opname: ${opnameForm.reason}` }]); 
              alert("Stok Fisik Diupdate!"); 
              setOpnameForm({ ...opnameForm, actual_stock: '', reason: '' }); 
              fetchAllData(); 
          } 
      } catch (err: any) { alert("Error: " + err.message); } 
      setLoading(false); 
  };

  const handleAddCategory = async (e: React.FormEvent) => { e.preventDefault(); if (!newCategoryName.trim()) return; setLoading(true); const { error } = await supabase.from('categories').insert([{ name: newCategoryName.trim(), user_id: user.id }]); if (error) { if(error.code === '23505') alert("Kategori sudah ada!"); else alert("Gagal: " + error.message); } else { setNewCategoryName(""); fetchAllData(); } setLoading(false); };
  const handleDeleteCategory = async (id: number) => { if (id < 0) return alert("Kategori bawaan tidak bisa dihapus."); if (confirm("Hapus kategori ini?")) { await supabase.from('categories').delete().eq('id', id); fetchAllData(); } };
  
  const handleAddLocation = async (e: React.FormEvent) => { e.preventDefault(); if (!newLocationName.trim()) return; setLoading(true); const { error } = await supabase.from('locations').insert([{ name: newLocationName.trim(), user_id: user.id }]); if (error) alert("Gagal: " + error.message); else { setNewLocationName(""); fetchAllData(); } setLoading(false); };
  const handleDeleteLocation = async (id: number) => { if (confirm("Hapus lokasi ini?")) { await supabase.from('locations').delete().eq('id', id); fetchAllData(); } };

  // --- PRODUCT SUBMIT ---
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true);
    if (!isPro && !editingProduct && products.length >= 1000) { if(confirm("LIMIT TERCAPAI! Upgrade PRO?")) handleUpgradeRequest('new'); setLoading(false); return; }
    
    const cat = productForm.category || (categories.length > 0 ? categories[0].name : 'Uncategorized');
    const loc = productForm.location || (locations.length > 0 ? locations[0].name : '');

    const payload = { 
        name: productForm.name, 
        category: cat, 
        price: Number(productForm.price), 
        buy_price: Number(productForm.buy_price) || 0, 
        stock: Number(productForm.stock) || 0, 
        image: productForm.image, 
        user_id: user.id,
        location: loc, 
        min_stock: Number(productForm.min_stock) || 10 
    };
    
    let error;
    if (editingProduct) { 
        const diff = payload.stock - editingProduct.stock; 
        const { error: e } = await supabase.from('products').update(payload).eq('id', editingProduct.id); 
        error = e; 
        if (!e && diff !== 0) await supabase.from('stock_logs').insert([{ product_id: editingProduct.id, type: diff > 0 ? 'IN' : 'OUT', movement_type: 'ADJUSTMENT', qty: Math.abs(diff), note: diff > 0 ? 'Restock Admin' : 'Koreksi Stok' }]); 
    } else { 
        const { data, error: e } = await supabase.from('products').insert([payload]).select().single(); 
        error = e; 
        if (!e && data && payload.stock > 0) await supabase.from('stock_logs').insert([{ product_id: data.id, type: 'IN', movement_type: 'INBOUND', qty: payload.stock, note: 'Stok Awal' }]); 
    }
    
    if (!error) { 
        alert('Berhasil!'); 
        setEditingProduct(null); 
        const defaultLoc = locations.length > 0 ? locations[0].name : '';
        setProductForm({ name: '', price: '', buy_price: '', stock: '', category: categories[0]?.name || '', image: '', location: defaultLoc, min_stock: '10' }); 
        fetchAllData(); 
    } else { 
        alert(error.message); 
    } 
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { if (!e.target.files?.length) return; setUploading(true); const file = e.target.files[0]; const fileName = `${Date.now()}.${file.name.split('.').pop()}`; const { error } = await supabase.storage.from('products').upload(fileName, file); if (!error) { const { data } = supabase.storage.from('products').getPublicUrl(fileName); setProductForm({ ...productForm, image: data.publicUrl }); } setUploading(false); };
  const handleDeleteProduct = async (id: number) => { if (confirm("Hapus?")) { await supabase.from('products').delete().eq('id', id); fetchAllData(); } };
  const handleEditProduct = (p: any) => { setEditingProduct(p); setProductForm({ ...p, min_stock: p.min_stock || 10, location: p.location || (locations.length>0?locations[0].name:'') }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const openHistory = async (product: any) => { setLoading(true); setSelectedProductHistory(product); const { data } = await supabase.from('stock_logs').select('*').eq('product_id', product.id).order('created_at', { ascending: false }); setHistoryLogs(data || []); setShowHistory(true); setLoading(false); };
  
  const handleDeleteTransaction = async (id: number) => { 
      if (!confirm("⚠️ PERHATIAN!\n\nMenghapus transaksi akan mengembalikan stok produk, TETAPI Poin pelanggan tidak otomatis berkurang.\n\nLanjutkan hapus?")) return; 
      setLoading(true); 
      try { 
          const { data: items } = await supabase.from('transaction_items').select('*').eq('transaction_id', id); 
          if (items && items.length > 0) { for (const item of items) { if (item.product_id) { const { data: prod } = await supabase.from('products').select('stock').eq('id', item.product_id).single(); if (prod) { await supabase.from('products').update({ stock: prod.stock + item.qty }).eq('id', item.product_id); await supabase.from('stock_logs').insert([{ product_id: item.product_id, type: 'IN', movement_type: 'RETURN', qty: item.qty, note: `Batal Transaksi #${id}` }]); } } } } 
          await supabase.from('transactions').delete().eq('id', id); alert("Transaksi Dihapus! Stok telah dikembalikan."); fetchAllData(); 
      } catch (err: any) { alert("Gagal: " + err.message); } finally { setLoading(false); } 
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => { 
      e.preventDefault(); 
      setLoading(true); 
      // FIX: Menambahkan user_id: user.id agar data terikat ke akun ini saja
      const { error } = await supabase.from('expenses').insert([{ 
          title: expenseForm.title, 
          amount: Number(expenseForm.amount), 
          category: expenseForm.category,
          user_id: user.id 
      }]); 
      
      if(!error){
          alert("Dicatat!"); 
          setExpenseForm({title:'', amount:'', category:'Operasional'}); 
          fetchAllData();
      } else {
          alert("Gagal menyimpan: " + error.message);
      }
      setLoading(false); 
  };
  const handleDeleteExpense = async (id: number) => { if (confirm("Hapus?")) { await supabase.from('expenses').delete().eq('id', id); fetchAllData(); } };
  const handleDownloadExcel = async () => { if (!isPro) return handleUpgradeRequest('new'); const workbook = new ExcelJS.Workbook(); const wsTrx = workbook.addWorksheet('Penjualan'); wsTrx.columns = [{ header: 'Tanggal', key: 'd' }, { header: 'Detail', key: 'k' }, { header: 'Pelanggan', key: 'p' }, { header: 'Metode', key: 'm' }, { header: 'Total', key: 't' }, { header: 'Pajak', key: 'tax' }]; transactions.forEach(t => wsTrx.addRow({ d: new Date(t.created_at).toLocaleDateString(), k: t.items_summary, p: t.customer_name || '-', m: t.payment_method || 'CASH', t: t.total_amount, tax: t.tax || 0 })); const wsExp = workbook.addWorksheet('Pengeluaran'); wsExp.columns = [{ header: 'Tanggal', key: 'd' }, { header: 'Keperluan', key: 'k' }, { header: 'Kategori', key: 'c' }, { header: 'Jumlah', key: 'a' }]; expenses.forEach(e => wsExp.addRow({ d: new Date(e.created_at).toLocaleDateString(), k: e.title, c: e.category, a: e.amount })); const wsPur = workbook.addWorksheet('Pembelian'); wsPur.columns = [{ header: 'Tanggal', key: 'd' }, { header: 'Supplier', key: 's' }, { header: 'Total Biaya', key: 't' }]; purchases.forEach(p => wsPur.addRow({ d: new Date(p.created_at).toLocaleDateString(), s: p.suppliers?.name, t: p.total_cost })); const wsSup = workbook.addWorksheet('Data Supplier'); wsSup.columns = [{ header: 'Nama', key: 'n' }, { header: 'Telepon', key: 'p' }, { header: 'Alamat', key: 'a' }]; suppliers.forEach(s => wsSup.addRow({ n: s.name, p: s.phone, a: s.address })); const wsLog = workbook.addWorksheet('Laporan Arus Stok'); wsLog.columns = [{ header: 'Waktu', key: 'd' }, { header: 'Produk', key: 'p' }, { header: 'Tipe', key: 't' }, { header: 'Movement', key: 'mv' }, { header: 'Jumlah', key: 'q' }, { header: 'Keterangan', key: 'n' }]; allStockLogs.forEach(l => { wsLog.addRow({ d: new Date(l.created_at).toLocaleDateString(), p: l.products?.name, t: l.type, mv: l.movement_type || '-', q: l.qty, n: l.note }); }); const buffer = await workbook.xlsx.writeBuffer(); const url = window.URL.createObjectURL(new Blob([buffer])); const a = document.createElement('a'); a.href = url; a.download = `Laporan_Lengkap.xlsx`; a.click(); };
  
  const openCustomerEdit = (cust: any) => { setEditingCustomer(cust); setCustomerForm({ name: cust.name, phone: cust.phone, points: cust.points.toString() }); setShowCustomerEditModal(true); };
  const handleCustomerUpdate = async (e: React.FormEvent) => {
      e.preventDefault(); setLoading(true);
      const { error } = await supabase.from('customers').update({ name: customerForm.name, phone: customerForm.phone, points: Number(customerForm.points) || 0 }).eq('id', editingCustomer.id);
      if(!error) { alert("Data Pelanggan Diupdate!"); setShowCustomerEditModal(false); fetchAllData(); } else { alert("Gagal: "+error.message); }
      setLoading(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login'); };
  
  // --- NEW: DUAL PRINT LOGIC (CUSTOM BRANDING) ---
  const handlePrintStruk = (type: 'thermal' | 'invoice') => { 
      if (!invoiceData) return; 
      const w = window.open('', '', 'width=800,height=600'); 
      if (!w) return alert("Popup blocked!"); 
      
      // Gunakan data toko dari state, atau default jika kosong
      const sName = storeSettings.name || 'KASIR KILATQU';
      const sAddress = storeSettings.address || '';
      const sPhone = storeSettings.phone || '';
      const sFooter = storeSettings.footer || 'Terima kasih atas kepercayaan Anda.';

      let content = '';
      
      if (type === 'thermal') {
          // --- THERMAL (58mm STRICT) ---
          const itemsList = invoiceData.items_summary.split(', ').map((item: string) => `<div class="item"><span>${item}</span></div>`).join('');
          content = `
            <html>
            <head>
                <title>Struk - ${invoiceData.id}</title>
                <style>
                    @page { size: 58mm auto; margin: 0; }
                    body {
                        font-family: 'Courier New', monospace;
                        width: 48mm; /* Fix width content */
                        margin: 0 auto;
                        padding: 10px 0;
                        font-size: 10px;
                        color: #000;
                    }
                    .header { text-align: center; margin-bottom: 10px; }
                    .title { font-weight: bold; font-size: 14px; margin-bottom: 2px; text-transform: uppercase; }
                    .subtitle { font-size: 9px; color: #333; margin-bottom: 1px; }
                    .divider { border-top: 1px dashed black; margin: 5px 0; }
                    .item { margin-bottom: 2px; }
                    .flex { display: flex; justify-content: space-between; }
                    .bold { font-weight: bold; }
                    .footer { text-align: center; margin-top: 15px; font-size: 9px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="title">${sName}</div>
                    ${sAddress ? `<div class="subtitle">${sAddress}</div>` : ''}
                    ${sPhone ? `<div class="subtitle">${sPhone}</div>` : ''}
                    <div style="margin-top:5px;">${new Date(invoiceData.created_at).toLocaleString()}</div>
                </div>
                <div class="divider"></div>
                <div class="items">${itemsList}</div>
                <div class="divider"></div>
                <div class="flex"><span>Total</span><span>Rp ${invoiceData.total_amount.toLocaleString()}</span></div>
                ${invoiceData.discount > 0 ? `<div class="flex"><span>Diskon</span><span>- Rp ${invoiceData.discount.toLocaleString()}</span></div>` : ''}
                ${invoiceData.tax > 0 ? `<div class="flex"><span>Pajak</span><span>+ Rp ${invoiceData.tax.toLocaleString()}</span></div>` : ''}
                ${(invoiceData.discount > 0 || invoiceData.tax > 0) ? `<div class="divider"></div><div class="flex bold" style="font-size:12px"><span>Total Akhir</span><span>Rp ${(invoiceData.final_amount || invoiceData.total_amount).toLocaleString()}</span></div>` : ''}
                <div class="footer">${sFooter}<br/>Simpan struk ini sebagai bukti.</div>
                <script>window.print();</script>
            </body>
            </html>`;
      } else {
          // --- INVOICE A4 ---
          const itemsArr = invoiceData.items_summary.split(', ');
          const rows = itemsArr.map((item: string) => `<tr><td style="padding:8px;border:1px solid #ddd">${item}</td></tr>`).join('');
          content = `
            <html>
            <head>
                <title>Invoice - ${invoiceData.customer_name || 'Umum'}</title>
                <style>
                    @page { size: A4; margin: 20mm; }
                    body { font-family: Arial, sans-serif; color: #333; max-width: 210mm; margin: 0 auto; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                    .logo { font-size: 24px; font-weight: bold; color: #059669; text-transform: uppercase; }
                    .meta { text-align: right; font-size: 14px; }
                    .store-info { font-size: 12px; color: #666; margin-top: 5px; max-width: 250px; }
                    .title { font-size: 20px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th { background: #f9fafb; padding: 12px; text-align: left; border: 1px solid #ddd; font-size: 12px; text-transform: uppercase; }
                    td { padding: 12px; border: 1px solid #ddd; font-size: 14px; }
                    .totals { width: 300px; margin-left: auto; }
                    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                    .grand-total { font-weight: bold; font-size: 18px; color: #059669; border-top: 2px solid #eee; padding-top: 10px; margin-top: 5px; }
                    .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; }
                    .signature { margin-top: 60px; display: flex; justify-content: space-between; }
                    .sign-box { text-align: center; width: 200px; }
                    .line { margin-top: 60px; border-top: 1px solid #333; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="logo">${sName}</div>
                        <div class="store-info">
                            ${sAddress ? `<p>${sAddress}</p>` : ''}
                            ${sPhone ? `<p>Telp: ${sPhone}</p>` : ''}
                        </div>
                    </div>
                    <div class="meta">
                        <p><strong>No. Invoice:</strong> #${invoiceData.id}</p>
                        <p><strong>Tanggal:</strong> ${new Date(invoiceData.created_at).toLocaleDateString()}</p>
                        <p><strong>Pelanggan:</strong> ${invoiceData.customer_name || 'Umum'}</p>
                    </div>
                </div>
                <div class="title">INVOICE PEMBELIAN</div>
                <table><thead><tr><th>Deskripsi Item</th></tr></thead><tbody>${rows}</tbody></table>
                <div class="totals">
                    <div class="totals-row"><span>Subtotal</span><span>Rp ${invoiceData.total_amount.toLocaleString()}</span></div>
                    ${invoiceData.discount > 0 ? `<div class="totals-row" style="color:red"><span>Diskon</span><span>- Rp ${invoiceData.discount.toLocaleString()}</span></div>` : ''}
                    ${invoiceData.tax > 0 ? `<div class="totals-row"><span>Pajak</span><span>+ Rp ${invoiceData.tax.toLocaleString()}</span></div>` : ''}
                    <div class="totals-row grand-total"><span>TOTAL</span><span>Rp ${(invoiceData.final_amount || invoiceData.total_amount).toLocaleString()}</span></div>
                    <div class="totals-row" style="font-size:12px; margin-top:10px;"><span>Metode Bayar:</span><strong>${invoiceData.payment_method || 'CASH'}</strong></div>
                </div>
                <div class="signature"><div class="sign-box"><p>Penerima</p><div class="line"></div></div><div class="sign-box"><p>Hormat Kami,</p><div class="line"></div><p>Admin Toko</p></div></div>
                <div class="footer">${sFooter}<br/>Simpan dokumen ini sebagai bukti pembayaran yang sah.</div>
                <script>window.print();</script>
            </body>
            </html>`;
      }
      w.document.write(content); w.document.close(); 
  };
  
  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-emerald-600" size={40}/></div>;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans font-inter text-gray-800">
      
      {/* SIDEBAR FIXED */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col h-screen`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-shrink-0"><Logo /><button onClick={()=>setSidebarOpen(false)} className="md:hidden text-gray-500"><X size={24}/></button></div>
        <div className="p-4 space-y-1 flex-1 overflow-y-auto scrollbar-hide">
            <Link href="/pos" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold bg-gray-900 text-white hover:bg-black mb-6 shadow-lg shadow-gray-900/20 transition active:scale-95"><Store size={20} /> Mode Kasir</Link>
            {[{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'products', label: 'Produk', icon: Package }, { id: 'transactions', label: 'Transaksi', icon: ShoppingCart }, { id: 'finance', label: 'Keuangan', icon: Wallet }, { id: 'reports', label: 'Laporan', icon: PieChart }].map((menu) => (<button key={menu.id} onClick={()=>{setActiveTab(menu.id); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === menu.id ? 'bg-emerald-50 text-emerald-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}><menu.icon size={20} /> {menu.label}</button>))}
            {isPro && (<><div className="pt-4 pb-2"><p className="px-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Supply Chain (PRO)</p></div>
            <button onClick={()=>{setActiveTab('wms'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'wms' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}><Warehouse size={20} /> Warehouse (WMS)</button>
            <button onClick={()=>{setActiveTab('customers'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'customers' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}><UserCog size={20} /> CRM & Pelanggan</button>
            <div className="pt-4 pb-2"><p className="px-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">System</p></div><button onClick={()=>{setActiveTab('settings'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}><Settings size={20} /> Pengaturan</button></>)}
            {isPro && (<button onClick={handleLockApp} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 hover:text-red-700 transition mt-2"><Shield size={20} /> Lock (Mode Kasir)</button>)}
        </div>
        <div className="p-4 border-t border-gray-100 flex-shrink-0 space-y-2">
            {!isPro && (<div onClick={()=>handleUpgradeRequest('new')} className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white p-3 rounded-xl cursor-pointer shadow-lg hover:scale-105 transition flex items-center justify-between"><div className="flex items-center gap-2"><Crown size={20} className="text-white"/><div className="text-left"><p className="text-xs font-bold">UPGRADE PRO</p><p className="text-[9px] opacity-90">Buka semua fitur!</p></div></div><Zap size={16} className="animate-pulse"/></div>)}
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-gray-500 font-bold py-2 hover:bg-gray-50 rounded-lg transition"><LogOut size={18}/> Keluar</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4"><button onClick={()=>setSidebarOpen(true)} className="md:hidden p-2 text-gray-600"><Menu size={24}/></button><h1 className="text-xl font-bold text-gray-800 capitalize">{activeTab === 'wms' ? 'Warehouse Management' : activeTab === 'customers' ? 'Customer Relations (CRM)' : activeTab}</h1></div>
            <div className="hidden md:flex bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600"><select value={selectedMonth} onChange={(e)=>setSelectedMonth(Number(e.target.value))} className="bg-transparent outline-none cursor-pointer"><option value="0">Semua Bulan</option><option value="1">Januari</option><option value="2">Februari</option><option value="3">Maret</option><option value="4">April</option><option value="5">Mei</option><option value="6">Juni</option><option value="7">Juli</option><option value="8">Agustus</option><option value="9">September</option><option value="10">Oktober</option><option value="11">November</option><option value="12">Desember</option></select></div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            
            {activeTab === 'dashboard' && (<div className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-4 gap-6"><div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><div className="flex justify-between items-start mb-4"><div className="p-3 bg-emerald-100 rounded-xl text-emerald-600"><TrendingUp size={24}/></div><span className="text-xs font-bold text-gray-400 uppercase">Pemasukan</span></div><h3 className="text-2xl font-extrabold text-gray-900">Rp {summary.income.toLocaleString('id-ID')}</h3></div><div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><div className="flex justify-between items-start mb-4"><div className="p-3 bg-red-100 rounded-xl text-red-600"><TrendingDown size={24}/></div><span className="text-xs font-bold text-gray-400 uppercase">Pengeluaran</span></div><h3 className="text-2xl font-extrabold text-gray-900">Rp {summary.expense.toLocaleString('id-ID')}</h3></div><div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 rounded-2xl shadow-lg shadow-blue-500/20 text-white"><div className="flex justify-between items-start mb-4"><div className="p-3 bg-white/20 rounded-xl backdrop-blur"><DollarSign size={24}/></div><span className="text-xs font-bold text-blue-100 uppercase">Cashflow</span></div><h3 className="text-2xl font-extrabold">Rp {summary.profit.toLocaleString('id-ID')}</h3></div><div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><div className="flex justify-between items-start mb-4"><div className="p-3 bg-orange-100 rounded-xl text-orange-600"><Package size={24}/></div><span className="text-xs font-bold text-gray-400 uppercase">Nilai Aset Stok</span></div><h3 className="text-2xl font-extrabold text-gray-900">Rp {summary.stockValue.toLocaleString('id-ID')}</h3></div></div></div>)}
            {activeTab === 'customers' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-indigo-600 to-blue-500 p-6 rounded-2xl shadow-lg text-white"><div className="flex items-center gap-4"><div className="p-3 bg-white/20 rounded-full"><Users size={24}/></div><div><p className="text-xs font-bold text-indigo-100 uppercase">Total Pelanggan</p><h3 className="text-2xl font-extrabold">{customersList.length}</h3></div></div></div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200"><div className="flex items-center gap-4"><div className="p-3 bg-yellow-100 rounded-full text-yellow-600"><Star size={24}/></div><div><p className="text-xs font-bold text-gray-400 uppercase">Top Spender (Sultan)</p><h3 className="text-lg font-extrabold truncate w-40">{customersList[0]?.name || '-'}</h3><p className="text-[10px] text-gray-400">Rp {customersList[0]?.totalSpent?.toLocaleString() || 0}</p></div></div></div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200"><div className="flex items-center gap-4"><div className="p-3 bg-blue-100 rounded-full text-blue-600"><Gift size={24}/></div><div><p className="text-xs font-bold text-gray-400 uppercase">Total Poin Beredar</p><h3 className="text-2xl font-extrabold text-blue-600">{customersList.reduce((a,c)=>a+(c.points||0),0).toLocaleString()}</h3></div></div></div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"><div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center"><h3 className="font-bold text-gray-700 flex items-center gap-2"><UserCog size={18}/> Database & Analisa Pelanggan</h3></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-white border-b border-gray-100"><tr><th className="p-4">Pelanggan</th><th className="p-4">Level</th><th className="p-4">Total Belanja</th><th className="p-4">Terakhir Datang</th><th className="p-4">Poin Aktif</th><th className="p-4 text-center">Aksi Cepat</th></tr></thead><tbody className="divide-y divide-gray-50">{customersList.map((c: any) => { const isLost = c.lastTrx && (new Date().getTime() - c.lastTrx) > (30 * 24 * 60 * 60 * 1000); return ( <tr key={c.id} className={isLost ? 'bg-red-50/50' : ''}><td className="p-4"><div className="font-bold text-gray-800">{c.name}</div><div className="text-xs text-gray-500">{c.phone}</div></td><td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-extrabold uppercase border ${c.level === 'Gold' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : c.level === 'Silver' ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>{c.level}</span></td><td className="p-4 font-medium">Rp {c.totalSpent.toLocaleString()}</td><td className="p-4"><div className="text-xs text-gray-600">{c.lastTrx ? new Date(c.lastTrx).toLocaleDateString() : 'Belum Pernah'}</div>{isLost && <div className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertCircle size={10}/> Jarang Belanja</div>}</td><td className="p-4 text-blue-600 font-bold">{c.points.toLocaleString()}</td><td className="p-4 text-center flex justify-center gap-2"><button onClick={()=>openCustomerEdit(c)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600" title="Edit Data"><Edit2 size={16}/></button><button onClick={() => window.open(`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo Kak ${c.name}! Kami ada promo spesial untuk pelanggan setia nih. Mampir yuk ke Kasir KilatQu! 🎁`)}`, '_blank')} className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg" title="Kirim WA Promo"><MessageCircle size={16}/></button></td></tr> )})}</tbody></table></div></div>
                </div>
            )}
            {/* === INI KODE YANG HILANG (FITUR KEUANGAN) === */}
            {activeTab === 'finance' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* KIRI: Form Input */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><TrendingDown size={20} className="text-red-500"/> Catat Pengeluaran</h3>
                            <form onSubmit={handleExpenseSubmit} className="space-y-4">
                                <div><label className="text-xs font-bold text-gray-500">Judul Pengeluaran</label><input type="text" value={expenseForm.title} onChange={e=>setExpenseForm({...expenseForm, title: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border" placeholder="Contoh: Bayar Listrik" required/></div>
                                <div><label className="text-xs font-bold text-gray-500">Jumlah (Rp)</label><input type="number" value={expenseForm.amount} onChange={e=>setExpenseForm({...expenseForm, amount: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border" placeholder="0" required/></div>
                                <div><label className="text-xs font-bold text-gray-500">Kategori</label><select value={expenseForm.category} onChange={e=>setExpenseForm({...expenseForm, category: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border"><option>Operasional</option><option>Gaji Karyawan</option><option>Sewa Tempat</option><option>Lainnya</option></select></div>
                                <button disabled={loading} className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700">{loading ? <Loader2 className="animate-spin mx-auto"/> : 'Simpan Pengeluaran'}</button>
                            </form>
                        </div>
                        {/* KANAN: Riwayat */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* --- MULAI KODE BARU (HEADER + TOMBOL EXCEL) --- */}
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg">Riwayat Pengeluaran</h3>
                                <button 
                                    onClick={() => isPro ? handleDownloadExcel() : handleUpgradeRequest('new')} 
                                    className={`text-xs font-bold flex items-center gap-1 ${isPro ? 'text-emerald-600 hover:underline' : 'text-gray-400 cursor-pointer'}`}
                                >
                                    {!isPro && <Lock size={12}/>} <Download size={14}/> Excel
                                </button>
                            </div>
                            {/* --- SELESAI KODE BARU --- */}
                            <div className="max-h-80 overflow-y-auto space-y-2">
                                {expenses.length === 0 ? <p className="text-center text-gray-400 text-xs">Belum ada data.</p> : expenses.map(exp => (
                                    <div key={exp.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div><p className="font-bold text-gray-800">{exp.title}</p><p className="text-xs text-gray-500">{new Date(exp.created_at).toLocaleDateString()} • {exp.category}</p></div>
                                        <div className="flex items-center gap-3"><span className="font-bold text-red-600">- Rp {exp.amount.toLocaleString()}</span><button onClick={()=>handleDeleteExpense(exp.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* ================================================= */}
            {activeTab === 'wms' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200"><div className="flex items-center gap-4"><div className="p-3 bg-blue-100 rounded-full text-blue-600"><Package size={24}/></div><div><p className="text-xs font-bold text-gray-400 uppercase">Total SKU Item</p><h3 className="text-2xl font-extrabold">{products.length}</h3></div></div></div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200"><div className="flex items-center gap-4"><div className="p-3 bg-emerald-100 rounded-full text-emerald-600"><DollarSign size={24}/></div><div><p className="text-xs font-bold text-gray-400 uppercase">Nilai Aset Gudang</p><h3 className="text-2xl font-extrabold">Rp {summary.stockValue.toLocaleString('id-ID')}</h3></div></div></div>
                        <div className="bg-red-50 p-6 rounded-2xl shadow-sm border border-red-100"><div className="flex items-center gap-4"><div className="p-3 bg-red-200 rounded-full text-red-600 animate-pulse"><AlertTriangle size={24}/></div><div><p className="text-xs font-bold text-red-400 uppercase">Stok Menipis</p><h3 className="text-2xl font-extrabold text-red-700">{summary.lowStockCount} Item</h3></div></div></div>
                    </div>
                    <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-1 items-center justify-between">
                        <div className="flex gap-2">
                            <button onClick={()=>setWmsSubTab('overview')} className={`px-4 py-2 text-sm font-bold rounded-t-lg transition ${wmsSubTab==='overview'?'bg-gray-900 text-white':'text-gray-500 hover:bg-gray-100'}`}>Inventory Overview</button>
                            <button onClick={()=>setWmsSubTab('inbound')} className={`px-4 py-2 text-sm font-bold rounded-t-lg transition ${wmsSubTab==='inbound'?'bg-emerald-600 text-white':'text-gray-500 hover:bg-gray-100'}`}>Inbound (Masuk)</button>
                            <button onClick={()=>setWmsSubTab('opname')} className={`px-4 py-2 text-sm font-bold rounded-t-lg transition ${wmsSubTab==='opname'?'bg-orange-500 text-white':'text-gray-500 hover:bg-gray-100'}`}>Stock Opname</button>
                        </div>
                        <button onClick={()=>setShowLocationModal(true)} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"><MapPin size={14}/> Atur Lokasi</button>
                    </div>
                    {wmsSubTab === 'overview' && (
                        <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left text-sm"><thead className="bg-gray-50 border-b"><tr><th className="p-4">Produk</th><th className="p-4">Lokasi Rak</th><th className="p-4 text-center">Min. Stok</th><th className="p-4 text-center">Stok Saat Ini</th><th className="p-4 text-right">Nilai Aset</th></tr></thead><tbody className="divide-y">{products.map(p => (<tr key={p.id} className={p.stock <= (p.min_stock || 10) ? 'bg-red-50' : ''}><td className="p-4 font-bold text-gray-700">{p.name} <br/><span className="text-[10px] text-gray-400">{p.category}</span></td><td className="p-4"><span className="flex items-center gap-1 text-xs font-medium bg-gray-100 px-2 py-1 rounded w-fit"><MapPin size={12}/> {p.location || '-'}</span></td><td className="p-4 text-center font-mono text-gray-500">{p.min_stock || 10}</td><td className={`p-4 text-center font-bold ${p.stock <= (p.min_stock||10) ? 'text-red-600' : 'text-emerald-600'}`}>{p.stock}</td><td className="p-4 text-right font-medium">Rp {((p.buy_price||0) * p.stock).toLocaleString()}</td></tr>))}</tbody></table>
                        </div>
                    )}
                    {wmsSubTab === 'inbound' && (
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit"><h3 className="font-bold text-lg mb-4 flex items-center gap-2"><ArrowDownLeft size={20} className="text-emerald-600"/> Barang Masuk</h3><form onSubmit={handleRestock} className="space-y-4"><div><label className="text-xs font-bold text-gray-500">Supplier</label><select value={purchaseForm.supplier_id} onChange={e=>setPurchaseForm({...purchaseForm, supplier_id: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border">{suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div><div><label className="text-xs font-bold text-gray-500">Produk</label><select value={purchaseForm.product_id} onChange={e=>setPurchaseForm({...purchaseForm, product_id: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border">{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div><div className="grid grid-cols-2 gap-3"><div><label className="text-xs font-bold text-gray-500">Jml Masuk</label><input type="number" value={purchaseForm.qty} onChange={e=>setPurchaseForm({...purchaseForm, qty: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border" placeholder="0"/></div><div><label className="text-xs font-bold text-gray-500">HPP Baru</label><input type="number" value={purchaseForm.cost_price} onChange={e=>setPurchaseForm({...purchaseForm, cost_price: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border" placeholder="Rp"/></div></div><button disabled={loading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl">{loading ? <Loader2 className="animate-spin mx-auto"/> : 'Simpan Masuk'}</button></form></div>
                            <div className="lg:col-span-2 bg-white rounded-2xl border overflow-hidden"><div className="p-4 bg-gray-50 border-b font-bold text-gray-700">Riwayat Pergerakan Stok</div><table className="w-full text-sm text-left"><thead className="bg-white border-b"><tr><th className="p-3">Waktu</th><th className="p-3">Produk</th><th className="p-3">Tipe</th><th className="p-3">Qty</th><th className="p-3">Keterangan</th></tr></thead><tbody className="divide-y">{allStockLogs.map(l => (<tr key={l.id}><td className="p-3 text-gray-500">{new Date(l.created_at).toLocaleDateString()}</td><td className="p-3 font-bold">{l.products?.name}</td><td className="p-3"><span className={`text-[10px] px-2 py-1 rounded font-bold ${l.type==='IN'?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>{l.movement_type || (l.type==='IN'?'MASUK':'KELUAR')}</span></td><td className="p-3 font-mono">{l.qty}</td><td className="p-3 text-gray-500 text-xs">{l.note}</td></tr>))}</tbody></table></div>
                        </div>
                    )}
                    {wmsSubTab === 'opname' && (
                        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                            <div className="text-center mb-6"><div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 text-orange-600"><ClipboardList size={24}/></div><h2 className="text-xl font-bold">Stock Opname</h2><p className="text-gray-500 text-sm">Sesuaikan stok fisik vs sistem</p></div>
                            <form onSubmit={handleOpname} className="space-y-4"><div><label className="text-xs font-bold text-gray-500">Pilih Produk</label><select value={opnameForm.product_id} onChange={e=>setOpnameForm({...opnameForm, product_id: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border">{products.map(p=><option key={p.id} value={p.id}>{p.name} (Sistem: {p.stock}) - {p.location}</option>)}</select></div><div><label className="text-xs font-bold text-gray-500">Stok Fisik (Real)</label><input type="number" value={opnameForm.actual_stock} onChange={e=>setOpnameForm({...opnameForm, actual_stock: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border font-bold text-lg" placeholder="0"/></div><div><label className="text-xs font-bold text-gray-500">Alasan Selisih</label><textarea value={opnameForm.reason} onChange={e=>setOpnameForm({...opnameForm, reason: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border" placeholder="Contoh: Barang rusak, hilang, atau salah input sebelumnya" rows={2}></textarea></div><button disabled={loading} className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl">{loading ? <Loader2 className="animate-spin mx-auto"/> : 'Sesuaikan Stok'}</button></form>
                        </div>
                    )}
                </div>
            )}
            {activeTab === 'products' && ( <div className="grid lg:grid-cols-3 gap-8"><div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit"><h3 className="font-bold text-lg mb-4 flex items-center gap-2"><div className={`w-1 h-5 rounded-full ${editingProduct?'bg-orange-500':'bg-emerald-500'}`}></div> {editingProduct ? 'Edit Produk' : 'Tambah Produk'}</h3><form onSubmit={handleProductSubmit} className="space-y-4"><div><label className="text-xs font-bold text-gray-500">Nama Produk</label><input type="text" value={productForm.name} onChange={e=>setProductForm({...productForm, name: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-medium text-sm" required/></div><div className="grid grid-cols-2 gap-3"><div><label className="text-xs font-bold text-emerald-600 mb-1 block">Harga Jual</label><div className="relative"><Tag size={14} className="absolute left-3 top-3.5 text-emerald-500"/><input type="number" value={productForm.price} onChange={e=>setProductForm({...productForm, price: e.target.value})} className="w-full pl-9 p-3 bg-emerald-50 rounded-xl border border-emerald-200 font-bold text-sm text-emerald-800" required placeholder="0"/></div></div><div><label className="text-xs font-bold text-gray-500 mb-1 block">Harga Modal</label><div className="relative"><Lock size={14} className="absolute left-3 top-3.5 text-gray-400"/><input type="number" value={productForm.buy_price} onChange={e=>setProductForm({...productForm, buy_price: e.target.value})} className="w-full pl-9 p-3 bg-gray-50 rounded-xl border border-gray-200 font-medium text-sm" placeholder="Optional"/></div></div></div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 flex justify-between">Lokasi Rak <button type="button" onClick={()=>setShowLocationModal(true)} className="text-[10px] text-blue-600 hover:underline">Kelola</button></label>
                    <div className="relative">
                        <MapPin size={14} className="absolute left-3 top-3.5 text-gray-400"/>
                        {locations.length > 0 ? (
                            <select value={productForm.location} onChange={e=>setProductForm({...productForm, location: e.target.value})} className="w-full pl-9 p-3 bg-gray-50 rounded-xl border border-gray-200 font-medium text-sm">
                                {locations.map(loc => (<option key={loc.id} value={loc.name}>{loc.name}</option>))}
                            </select>
                        ) : (
                            <div onClick={()=>setShowLocationModal(true)} className="w-full pl-9 p-3 bg-red-50 rounded-xl border border-red-200 font-medium text-xs text-red-500 cursor-pointer flex items-center">Belum ada Lokasi (Klik)</div>
                        )}
                    </div>
                </div>
                <div><label className="text-xs font-bold text-gray-500 mb-1 block">Min. Stok</label><div className="relative"><AlertCircle size={14} className="absolute left-3 top-3.5 text-red-400"/><input type="number" value={productForm.min_stock} onChange={e=>setProductForm({...productForm, min_stock: e.target.value})} className="w-full pl-9 p-3 bg-gray-50 rounded-xl border border-gray-200 font-medium text-sm" placeholder="10"/></div></div>
            </div>
            <div><label className="text-xs font-bold text-gray-500">Stok Awal</label><input type="number" value={productForm.stock} onChange={e=>setProductForm({...productForm, stock: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-medium text-sm"/></div><div><label className="text-xs font-bold text-gray-500 flex justify-between">Kategori <button type="button" onClick={()=>setShowCategoryModal(true)} className="text-emerald-600 text-[10px] flex items-center gap-1 hover:underline"><Settings size={10}/> Kelola</button></label><select value={productForm.category} onChange={e=>setProductForm({...productForm, category: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-medium text-sm">{categories.map(cat => (<option key={cat.id} value={cat.name}>{cat.name}</option>))}</select></div><div><label className="text-xs font-bold text-gray-500 flex justify-between">Foto Produk <span>{isPro ? 'PRO' : <Lock size={12}/>}</span></label>{isPro ? (productForm.image ? <div className="mt-2 relative h-32 w-full rounded-xl overflow-hidden"><img src={productForm.image} className="w-full h-full object-cover"/><button type="button" onClick={()=>setProductForm({...productForm, image: ''})} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"><X size={14}/></button></div> : <label className={`mt-2 flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 ${uploading && 'opacity-50'}`}>{uploading ? <Loader2 className="animate-spin"/> : <Upload className="text-gray-400"/>}<input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading}/></label>) : (<div onClick={()=>handleUpgradeRequest('new')} className="mt-2 h-20 bg-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-400 cursor-pointer border border-gray-200 hover:bg-gray-200 transition">Klik untuk UPGRADE PRO 🔒</div>)}</div><div className="flex gap-2">{editingProduct && <button type="button" onClick={()=>{setEditingProduct(null); setProductForm({name:'',price:'',buy_price:'',stock:'',category:categories[0]?.name||'',image:'',location:locations.length>0?locations[0].name:'',min_stock:'10'})}} className="w-1/3 bg-gray-100 font-bold rounded-xl text-xs">Batal</button>}<button disabled={loading} className={`flex-1 py-3 ${editingProduct?'bg-orange-500':'bg-gray-900'} text-white font-bold rounded-xl flex justify-center`}>{loading ? <Loader2 className="animate-spin"/> : editingProduct ? 'Update' : 'Simpan'}</button></div></form></div><div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 h-fit">{products.map(p => (<div key={p.id} className={`bg-white p-3 rounded-xl shadow-sm border flex gap-3 group hover:border-emerald-300 transition relative ${p.stock <= (p.min_stock || 10) ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}><div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"><img src={p.image || "https://via.placeholder.com/150"} className="w-full h-full object-cover"/></div><div className="flex-1 min-w-0"><h4 className="font-bold text-sm text-gray-800 truncate">{p.name}</h4><p className="text-xs text-emerald-600 font-bold">Jual: Rp {p.price.toLocaleString()}</p><p className="text-[10px] text-gray-400">Modal: Rp {(p.buy_price || 0).toLocaleString()}</p><div className="flex justify-between mt-1"><p className={`text-xs font-bold ${p.stock <= (p.min_stock || 10) ? 'text-red-600' : 'text-gray-500'}`}>Stok: {p.stock}</p><span className="text-[10px] bg-gray-100 px-1 rounded flex items-center gap-1"><MapPin size={8}/> {p.location || '-'}</span></div></div><div className="flex flex-col gap-2 justify-center opacity-0 group-hover:opacity-100 transition absolute right-3 top-3 bottom-3 bg-white/90 pl-2"><button onClick={()=>openHistory(p)} className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-[10px] font-bold border border-blue-200 px-2 py-1 rounded-md"><History size={14}/> Riwayat</button><div className="flex gap-2 justify-end"><button onClick={()=>handleEditProduct(p)} className="text-orange-400 hover:text-orange-600"><Edit2 size={16}/></button><button onClick={()=>handleDeleteProduct(p.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button></div></div></div>))}</div></div>)}
            
            {/* === [FIXED SECTION] TRANSACTIONS TAB DENGAN ACCORDION MOBILE === */}
            {activeTab === 'transactions' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-700">Riwayat Penjualan</h3>
                        <button onClick={() => isPro ? handleDownloadExcel() : handleUpgradeRequest('new')} className={`text-xs font-bold ${isPro ? 'text-emerald-600 hover:underline' : 'text-gray-400 cursor-pointer flex items-center gap-1'}`}>{!isPro && <Lock size={12}/>} Download Laporan Excel</button>
                    </div>
                    
                    {/* 1. TAMPILAN LAPTOP (TABLE) - Hidden on Mobile */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white border-b border-gray-100">
                                <tr>
                                    <th className="p-4">Tanggal</th>
                                    <th className="p-4">Detail</th>
                                    <th className="p-4">Metode</th>
                                    <th className="p-4 text-right">Total</th>
                                    <th className="p-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions.map(t=>(
                                    <tr key={t.id}>
                                        <td className="p-4 text-gray-500">{new Date(t.created_at).toLocaleDateString()} <span className="text-xs block">{new Date(t.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></td>
                                        <td className="p-4 text-gray-800 font-medium max-w-xs truncate">{t.items_summary} {t.customer_name && <span className="block text-xs text-emerald-600 mt-1">Pelanggan: {t.customer_name}</span>}</td>
                                        <td className="p-4"><span className={`text-[10px] font-bold px-2 py-1 rounded ${t.payment_method==='CASH'?'bg-emerald-100 text-emerald-700':t.payment_method==='QRIS'?'bg-purple-100 text-purple-700':'bg-blue-100 text-blue-700'}`}>{t.payment_method || 'CASH'}</span></td>
                                        <td className="p-4 text-right font-bold text-emerald-600">Rp {t.total_amount.toLocaleString()}</td>
                                        <td className="p-4 text-center flex justify-center gap-2">
                                            <button onClick={() => { setInvoiceData(t); handlePrintStruk('thermal'); }} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition" title="Cetak Struk Thermal"><Printer size={16}/></button>
                                            <button onClick={() => { setInvoiceData(t); handlePrintStruk('invoice'); }} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-emerald-100 hover:text-emerald-600 transition" title="Cetak Invoice A4"><FileIcon size={16}/></button>
                                            <button onClick={() => handleDeleteTransaction(t.id)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-red-100 hover:text-red-600 transition" title="Hapus"><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 2. TAMPILAN MOBILE (ACCORDION) - Only visible on Mobile */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {transactions.map(t => (
                            <div key={t.id} className="bg-white">
                                <div onClick={() => toggleExpand(t.id)} className="p-4 flex justify-between items-center active:bg-gray-50 cursor-pointer">
                                    <div className="flex gap-3 items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.payment_method==='HUTANG'?'bg-red-100 text-red-600':'bg-emerald-100 text-emerald-600'}`}>
                                            {t.payment_method==='HUTANG'?<AlertTriangle size={14}/>:<CheckCircle size={14}/>}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Rp {t.total_amount.toLocaleString()}</p>
                                            <p className="text-xs text-gray-500">{new Date(t.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} • {t.customer_name||'Umum'}</p>
                                        </div>
                                    </div>
                                    <ChevronDown size={20} className={`text-gray-400 transition ${expandedTrxId===t.id?'rotate-180':''}`}/>
                                </div>
                                {expandedTrxId === t.id && (
                                    <div className="px-4 pb-4 bg-gray-50 text-sm border-t border-gray-100 pt-3 animate-in slide-in-from-top-1">
                                        <p className="font-bold text-[10px] text-gray-500 uppercase mb-1">Detail Barang:</p>
                                        <p className="mb-3 text-gray-700">{t.items_summary}</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button onClick={() => { setInvoiceData(t); handlePrintStruk('thermal'); }} className="py-2 bg-white border border-blue-200 text-blue-600 font-bold rounded-lg flex items-center justify-center gap-2 text-xs"><Printer size={14}/> Struk</button>
                                            <button onClick={() => { setInvoiceData(t); handlePrintStruk('invoice'); }} className="py-2 bg-white border border-emerald-200 text-emerald-600 font-bold rounded-lg flex items-center justify-center gap-2 text-xs"><FileIcon size={14}/> Invoice</button>
                                            <button onClick={() => handleDeleteTransaction(t.id)} className="py-2 bg-white border border-red-200 text-red-600 font-bold rounded-lg flex items-center justify-center gap-2 text-xs"><Trash2 size={14}/> Hapus</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {/* === [END FIXED SECTION] === */}

            {activeTab === 'reports' && (<div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border border-gray-200 text-center p-8"><div className="bg-emerald-100 p-6 rounded-full mb-6"><PieChart size={64} className="text-emerald-600"/></div><h2 className="text-2xl font-bold text-gray-800 mb-2">Laporan Bisnis Lengkap</h2><p className="text-gray-500 mb-8 max-w-md">Download Laporan Penjualan, Pengeluaran, Pembelian Stok, dan Data Supplier dalam format Excel.</p><button onClick={() => isPro ? handleDownloadExcel() : handleUpgradeRequest('new')} className={`px-8 py-4 rounded-xl font-bold text-white flex items-center gap-3 transition shadow-xl ${isPro ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-300 cursor-pointer hover:bg-gray-400'}`}>{isPro ? <Download size={20}/> : <Lock size={20}/>} {isPro ? 'Download Excel' : 'Upgrade PRO'}</button></div>)}
            
            {/* UPDATED SETTINGS TAB WITH BRANDING */}
            {activeTab === 'settings' && (
                <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings size={24}/> Pengaturan Toko</h2>
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        
                        {/* STORE BRANDING (PRO ONLY) */}
                        <div className={`space-y-4 p-4 rounded-xl border ${isPro ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-200 opacity-70'}`}>
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-sm text-gray-700 flex items-center gap-2"><Store size={16}/> Branding Toko (Struk)</h3>
                                {!isPro && <span className="text-[10px] bg-gray-200 px-2 py-1 rounded text-gray-500 font-bold flex items-center gap-1"><Lock size={10}/> PRO ONLY</span>}
                            </div>
                            
                            {isPro ? (
                                <>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1">Nama Toko</label>
                                        <input type="text" value={storeSettings.name} onChange={e => setStoreSettings({...storeSettings, name: e.target.value})} className="w-full p-2.5 bg-white rounded-lg border border-blue-200 text-sm font-bold" placeholder="Contoh: Warung Bu Dewi"/>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1">Alamat Singkat</label>
                                        <input type="text" value={storeSettings.address} onChange={e => setStoreSettings({...storeSettings, address: e.target.value})} className="w-full p-2.5 bg-white rounded-lg border border-blue-200 text-sm" placeholder="Contoh: Jl. Mawar No. 12, Jakarta"/>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1">No. Telepon / WA</label>
                                        <input type="text" value={storeSettings.phone} onChange={e => setStoreSettings({...storeSettings, phone: e.target.value})} className="w-full p-2.5 bg-white rounded-lg border border-blue-200 text-sm" placeholder="08123456789"/>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1">Footer Struk (Pesan Bawah)</label>
                                        <input type="text" value={storeSettings.footer} onChange={e => setStoreSettings({...storeSettings, footer: e.target.value})} className="w-full p-2.5 bg-white rounded-lg border border-blue-200 text-sm italic" placeholder="Terima kasih..."/>
                                    </div>
                                </>
                            ) : (
                                <div onClick={()=>handleUpgradeRequest('new')} className="text-center py-4 cursor-pointer">
                                    <p className="text-xs text-gray-500 mb-2">Upgrade ke PRO untuk mengubah nama toko di struk.</p>
                                    <button type="button" className="text-xs bg-gray-900 text-white px-4 py-2 rounded-lg font-bold">Buka Fitur Ini</button>
                                </div>
                            )}
                        </div>

                        <hr className="border-gray-100"/>

                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-2">Pajak / PPN (%)</label>
                            <div className="flex items-center gap-2"><input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold" placeholder="0"/><span className="font-bold text-gray-500">%</span></div>
                            <p className="text-xs text-gray-400 mt-2">Isi 0 jika tidak ingin menggunakan pajak.</p>
                        </div>
                        
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-2">Keamanan (Admin PIN)</label>
                            <div className="flex items-center gap-2 relative"><Key className="absolute left-3 text-gray-400" size={18}/><input type="password" value={adminPin} onChange={e => setAdminPin(e.target.value)} className="flex-1 pl-10 p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold" placeholder="Atur 6 digit PIN" maxLength={6}/></div>
                            <p className="text-xs text-gray-400 mt-2">PIN ini digunakan untuk membuka menu Admin saat Mode Kasir aktif.</p>
                        </div>

                        <button disabled={loading} className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl">{loading ? <Loader2 className="animate-spin mx-auto"/> : 'Simpan Pengaturan'}</button>
                    </form>
                </div>
            )}

            {activeTab === 'suppliers' && (<div className="grid lg:grid-cols-3 gap-8"><div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit"><h3 className="font-bold text-lg mb-4">Tambah Supplier</h3><form onSubmit={handleAddSupplier} className="space-y-4"><input type="text" value={supplierForm.name} onChange={e=>setSupplierForm({...supplierForm, name: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border" placeholder="Nama Supplier / PT" required/><input type="text" value={supplierForm.phone} onChange={e=>setSupplierForm({...supplierForm, phone: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border" placeholder="Nomor HP / WA" required/><textarea value={supplierForm.address} onChange={e=>setSupplierForm({...supplierForm, address: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border" placeholder="Alamat (Opsional)" rows={3}></textarea><button disabled={loading} className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl">{loading ? <Loader2 className="animate-spin mx-auto"/> : 'Simpan Supplier'}</button></form></div><div className="lg:col-span-2 grid gap-4">{suppliers.map(sup => (<div key={sup.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center"><div><h4 className="font-bold">{sup.name}</h4><p className="text-sm text-gray-500">{sup.phone}</p><p className="text-xs text-gray-400">{sup.address}</p></div><div className="flex gap-2"><button onClick={() => window.open(`https://wa.me/${sup.phone.replace(/[^0-9]/g, '')}`, '_blank')} className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Users size={14}/> Chat WA</button><button onClick={()=>handleDeleteSupplier(sup.id)} className="bg-red-100 text-red-600 p-2 rounded-lg"><Trash2 size={16}/></button></div></div>))}</div></div>)}
            {activeTab === 'purchases' && (<div className="grid lg:grid-cols-3 gap-8"><div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit"><h3 className="font-bold text-lg mb-4">Input Belanja Stok</h3><form onSubmit={handleRestock} className="space-y-4"><div><label className="text-xs font-bold text-gray-500">Supplier</label><select value={purchaseForm.supplier_id} onChange={e=>setPurchaseForm({...purchaseForm, supplier_id: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border">{suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div><div><label className="text-xs font-bold text-gray-500">Produk</label><select value={purchaseForm.product_id} onChange={e=>setPurchaseForm({...purchaseForm, product_id: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border">{products.map(p=><option key={p.id} value={p.id}>{p.name} (Stok: {p.stock})</option>)}</select></div><div className="grid grid-cols-2 gap-3"><div><label className="text-xs font-bold text-gray-500">Jml Beli</label><input type="number" value={purchaseForm.qty} onChange={e=>setPurchaseForm({...purchaseForm, qty: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border" placeholder="0"/></div><div><label className="text-xs font-bold text-gray-500">Harga Beli/Pcs</label><input type="number" value={purchaseForm.cost_price} onChange={e=>setPurchaseForm({...purchaseForm, cost_price: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border" placeholder="Rp"/></div></div><button disabled={loading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl">{loading ? <Loader2 className="animate-spin mx-auto"/> : 'Simpan & Update Stok'}</button><p className="text-[10px] text-gray-400 text-center">Stok & Harga Modal akan otomatis terupdate.</p></form></div><div className="lg:col-span-2 bg-white rounded-2xl border overflow-hidden"><div className="p-4 bg-gray-50 border-b font-bold text-gray-700">Riwayat Pembelian</div><table className="w-full text-sm text-left"><thead className="bg-white border-b"><tr><th className="p-3">Tanggal</th><th className="p-3">Supplier</th><th className="p-3 text-right">Total</th></tr></thead><tbody>{purchases.map(p => (<tr key={p.id} className="border-b"><td className="p-3">{new Date(p.created_at).toLocaleDateString()}</td><td className="p-3 font-bold text-gray-700">{p.suppliers?.name}</td><td className="p-3 text-right text-emerald-600 font-bold">Rp {p.total_cost.toLocaleString()}</td></tr>))}</tbody></table></div></div>)}
            {activeTab === 'opname' && (<div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200"><div className="text-center mb-6"><div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 text-orange-600"><ClipboardList size={24}/></div><h2 className="text-xl font-bold">Stock Opname</h2><p className="text-gray-500 text-sm">Sesuaikan stok aplikasi dengan fisik</p></div><form onSubmit={handleOpname} className="space-y-4"><div><label className="text-xs font-bold text-gray-500">Pilih Produk</label><select value={opnameForm.product_id} onChange={e=>setOpnameForm({...opnameForm, product_id: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border">{products.map(p=><option key={p.id} value={p.id}>{p.name} (Sistem: {p.stock})</option>)}</select></div><div><label className="text-xs font-bold text-gray-500">Stok Fisik (Real)</label><input type="number" value={opnameForm.actual_stock} onChange={e=>setOpnameForm({...opnameForm, actual_stock: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border font-bold text-lg" placeholder="0"/></div><div><label className="text-xs font-bold text-gray-500">Alasan Selisih</label><textarea value={opnameForm.reason} onChange={e=>setOpnameForm({...opnameForm, reason: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border" placeholder="Contoh: Barang rusak, hilang, atau salah input sebelumnya" rows={2}></textarea></div><button disabled={loading} className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl">{loading ? <Loader2 className="animate-spin mx-auto"/> : 'Sesuaikan Stok'}</button></form></div>)}
        </div>
      </main>

      {/* MODALS SAMA SEPERTI SEBELUMNYA */}
      {showInvoice && invoiceData && (<div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4"><div className="bg-white w-full max-w-md p-6 rounded-xl shadow-2xl relative"><button onClick={()=>setShowInvoice(false)} className="absolute top-4 right-4 bg-gray-100 p-1 rounded-full"><X size={20}/></button><div className="text-center mb-4"><h2 className="text-xl font-bold text-gray-800">Cetak Struk</h2><p className="text-sm text-gray-500">Pilih printer thermal (58mm) saat print dialog muncul.</p></div><div className="border p-4 bg-gray-50 font-mono text-xs mb-4 rounded-lg"><div className="text-center font-bold mb-2">KASIR KILATQU</div><div className="text-center mb-2">{new Date(invoiceData.created_at).toLocaleString()}</div><div className="border-b border-dashed border-gray-300 mb-2"></div><div className="space-y-1 mb-2">{invoiceData.items_summary.split(', ').map((item:string, i:number)=>(<div key={i}>{item}</div>))}</div><div className="border-b border-dashed border-gray-300 mb-2"></div><div className="flex justify-between font-bold"><span>Total Akhir</span><span>Rp {(invoiceData.final_amount || invoiceData.total_amount).toLocaleString()}</span></div></div><button onClick={() => handlePrintStruk('thermal')} className="w-full bg-black text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-800"><Printer size={18}/> Print Struk Thermal</button></div></div>)}
      {showHistory && selectedProductHistory && (<div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4"><div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-2xl relative max-h-[80vh] flex flex-col"><button onClick={()=>setShowHistory(false)} className="absolute top-4 right-4 bg-gray-100 p-1 rounded-full"><X size={20}/></button><div className="mb-4"><h3 className="text-lg font-bold">Kartu Stok: {selectedProductHistory.name}</h3><p className="text-sm text-gray-500">Sisa Stok Saat Ini: <span className="font-bold text-black">{selectedProductHistory.stock}</span></p></div><div className="flex-1 overflow-y-auto border rounded-xl"><table className="w-full text-left text-sm"><thead className="bg-gray-50 border-b"><tr><th className="p-3">Tanggal</th><th className="p-3">Tipe</th><th className="p-3">Qty</th><th className="p-3">Ket</th></tr></thead><tbody className="divide-y">{historyLogs.length === 0 ? <tr><td colSpan={4} className="p-4 text-center text-gray-400">Belum ada riwayat</td></tr> : historyLogs.map(log => (<tr key={log.id}><td className="p-3 text-gray-500">{new Date(log.created_at).toLocaleDateString()}</td><td className={`p-3 font-bold ${log.type==='IN'?'text-emerald-600':'text-red-500'}`}>{log.movement_type || (log.type==='IN'?'MASUK':'KELUAR')}</td><td className="p-3 font-mono">{log.qty}</td><td className="p-3 text-gray-600 text-xs">{log.note}</td></tr>))}</tbody></table></div></div></div>)}
      {showCategoryModal && (<div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4"><div className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-xl relative"><button onClick={()=>setShowCategoryModal(false)} className="absolute top-4 right-4 bg-gray-100 p-1 rounded-full"><X size={18}/></button><h3 className="font-bold text-lg mb-4">Kelola Kategori</h3><form onSubmit={handleAddCategory} className="flex gap-2 mb-6"><input type="text" value={newCategoryName} onChange={e=>setNewCategoryName(e.target.value)} placeholder="Nama Kategori Baru" className="flex-1 p-2 border border-gray-200 rounded-lg text-sm outline-emerald-500"/><button disabled={loading || !newCategoryName.trim()} className="bg-gray-900 text-white p-2 rounded-lg hover:bg-black"><Plus size={20}/></button></form><div className="max-h-60 overflow-y-auto space-y-2">{categories.map(cat => (<div key={cat.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-100"><span className={`text-sm font-medium ${cat.id < 0 ? 'text-gray-400' : 'text-gray-800'}`}>{cat.name} {cat.id < 0 && '(Bawaan)'}</span>{cat.id > 0 && <button onClick={()=>handleDeleteCategory(cat.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>}</div>))}</div></div></div>)}
      {showCustomerEditModal && editingCustomer && (<div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4 backdrop-blur-sm"><div className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-2xl relative"><button onClick={()=>setShowCustomerEditModal(false)} className="absolute top-4 right-4 bg-gray-100 p-1 rounded-full"><X size={18}/></button><h3 className="font-bold text-lg mb-4 flex items-center gap-2"><UserCog size={20} className="text-emerald-600"/> Edit Data Pelanggan</h3><form onSubmit={handleCustomerUpdate} className="space-y-4"><div><label className="text-xs font-bold text-gray-500">Nama</label><input type="text" value={customerForm.name} onChange={e=>setCustomerForm({...customerForm, name: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold" required/></div><div><label className="text-xs font-bold text-gray-500">No WhatsApp</label><input type="text" value={customerForm.phone} onChange={e=>setCustomerForm({...customerForm, phone: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold" required/></div><div><label className="text-xs font-bold text-gray-500 block mb-1">Poin Pelanggan (Manual)</label><div className="relative"><Gift size={16} className="absolute left-3 top-3.5 text-blue-500"/><input type="number" value={customerForm.points} onChange={e=>setCustomerForm({...customerForm, points: e.target.value})} className="w-full pl-9 p-3 bg-blue-50 border border-blue-200 rounded-xl font-bold text-blue-700" placeholder="0"/></div><p className="text-[10px] text-gray-400 mt-1">*Edit manual jika ada pembatalan transaksi.</p></div><button disabled={loading} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition">{loading ? <Loader2 className="animate-spin mx-auto"/> : 'Simpan Perubahan'}</button></form></div></div>)}
      
      {/* NEW: LOCATION MODAL */}
      {showLocationModal && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4">
              <div className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-xl relative">
                  <button onClick={()=>setShowLocationModal(false)} className="absolute top-4 right-4 bg-gray-100 p-1 rounded-full"><X size={18}/></button>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><MapPin size={20} className="text-blue-600"/> Kelola Lokasi Gudang</h3>
                  <form onSubmit={handleAddLocation} className="flex gap-2 mb-6">
                      <input type="text" value={newLocationName} onChange={e=>setNewLocationName(e.target.value)} placeholder="Nama Lokasi (ex: Rak A1, Gudang X)" className="flex-1 p-2 border border-gray-200 rounded-lg text-sm outline-blue-500"/>
                      <button disabled={loading || !newLocationName.trim()} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"><Plus size={20}/></button>
                  </form>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                      {locations.length === 0 ? <p className="text-center text-xs text-gray-400">Belum ada lokasi tersimpan.</p> : locations.map(loc => (
                          <div key={loc.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                              <span className="text-sm font-medium text-gray-800">{loc.name}</span>
                              <button onClick={()=>handleDeleteLocation(loc.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}