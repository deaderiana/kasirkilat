"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, 
  Menu, Loader2, User, Users, X, Save, TrendingUp, Lock, Wallet, Percent, Gift, Key, QrCode, Banknote, LogOut, LayoutDashboard, Crown, ChevronRight, Zap, Eye, EyeOff, ShieldAlert, Settings, ShieldCheck, FileText, 
  ClipboardList, MessageCircle, DollarSign, Calculator, Tag, ChevronUp, ChevronDown, History, Printer, AlertTriangle, UserCheck, CheckCircle, ArrowRightLeft
} from 'lucide-react';
import Logo from '@/components/Logo';

export default function CashierPage() {
  const router = useRouter();
  
  // --- AUTH & USER STATE ---
  const [user, setUser] = useState<any>(null);
  const [isPro, setIsPro] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [storeName, setStoreName] = useState('KASIR KILATQU');
  
  // --- SECURITY & MENU STATE ---
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false); 
  const [showPinModal, setShowPinModal] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [savedPin, setSavedPin] = useState<string | null>(null); 
  
  // --- SECURITY ACTION STATE ---
  const [pendingAuth, setPendingAuth] = useState<{type: 'VOID'|'DISC_GLOBAL'|'DISC_ITEM'|'LOGIN', payload?: any} | null>(null);

  // --- SHIFT STATE ---
  const [activeShift, setActiveShift] = useState<any>(null); 
  const [showShiftModal, setShowShiftModal] = useState(false); 
  const [showEndShiftModal, setShowEndShiftModal] = useState(false); 
  const [startCashInput, setStartCashInput] = useState('');
  const [cashierNameInput, setCashierNameInput] = useState(''); 
  const [endCashInput, setEndCashInput] = useState('');
  const [shiftSummary, setShiftSummary] = useState<any>(null); 
  
  // --- SUCCESS CLOSE STATE ---
  const [shiftClosedData, setShiftClosedData] = useState<any>(null);
  const [showSuccessCloseModal, setShowSuccessCloseModal] = useState(false);

  // --- HISTORY STATE ---
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [recentTrx, setRecentTrx] = useState<any[]>([]);

  // --- UI STATE ---
  const [revealMargin, setRevealMargin] = useState(false); 
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // --- ITEM DISCOUNT STATE ---
  const [showItemDiscModal, setShowItemDiscModal] = useState(false);
  const [discItem, setDiscItem] = useState<any>(null); 
  const [discValueInput, setDiscValueInput] = useState('');
  const [discType, setDiscType] = useState<'RP' | 'PERCENT'>('RP');

  // --- DATA STATE ---
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // --- CRM STATE ---
  const [customers, setCustomers] = useState<any[]>([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendWaAfterSave, setSendWaAfterSave] = useState(false); 

  // --- PAYMENT STATE ---
  const [discountPercent, setDiscountPercent] = useState<string>(''); 
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [change, setChange] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'QRIS' | 'HUTANG'>('CASH');

  const POINT_RATE = 10000; 

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    const initData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      setUser(session.user);

      const sessionStatus = sessionStorage.getItem('is_admin_unlocked');
      const { data: profile } = await supabase.from('profiles').select('is_pro, pro_expires_at, tax_rate, admin_pin, store_name').eq('id', session.user.id).single();
      
      let userIsPro = false;
      if (profile) {
         if (profile.is_pro) {
             if (!profile.pro_expires_at || new Date(profile.pro_expires_at) > new Date()) userIsPro = true;
         }
         setTaxRate(profile.tax_rate || 0);
         const dbPin = profile.admin_pin || '';
         setSavedPin(dbPin);
         if(profile.store_name) setStoreName(profile.store_name);

         if (!dbPin) {
             setIsAdminUnlocked(true);
             sessionStorage.setItem('is_admin_unlocked', 'true');
         } else {
             if (sessionStatus === 'true') setIsAdminUnlocked(true);
             else setIsAdminUnlocked(false); 
         }
      }
      setIsPro(userIsPro);

      const { data: shift } = await supabase.from('cash_shifts').select('*').eq('user_id', session.user.id).eq('status', 'OPEN').single();
      if (shift) setActiveShift(shift);
      else setShowShiftModal(true);

      const { data: prodData } = await supabase.from('products').select('*').order('name');
      if (prodData) {
        setProducts(prodData);
        setFilteredProducts(prodData);
        const cats = Array.from(new Set(prodData.map((p: any) => p.category))).filter(Boolean) as string[];
        setCategories(['All', ...cats]);
      }

      if (userIsPro) {
          const { data: custData } = await supabase.from('customers').select('*').order('name');
          if (custData) setCustomers(custData);
      }

      setAuthLoading(false);
    };
    initData();
  }, [router]);

  // --- FILTER LOGIC ---
  useEffect(() => {
    let result = products;
    if (activeCategory !== 'All') result = result.filter(p => p.category === activeCategory);
    if (searchQuery) result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredProducts(result);
  }, [activeCategory, searchQuery, products]);

  // --- CART LOGIC ---
  const resetPaymentState = () => { setPaymentAmount(''); setChange(0); setDiscountPercent(''); setPaymentMethod('CASH'); };
  
  const addToCart = (product: any) => { 
      const existingItem = cart.find(item => item.id === product.id);
      const currentQty = existingItem ? existingItem.qty : 0;
      if (product.stock <= 0 || currentQty + 1 > product.stock) { alert(`🚫 Stok Habis/Tidak Cukup! Tersisa: ${product.stock}`); return; }
      setCart(prev => { 
          if (existingItem) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item); 
          return [...prev, { ...product, qty: 1, item_discount: 0 }]; 
      }); 
      setPaymentAmount(''); setChange(0); 
  };
  
  const removeFromCart = (productId: number) => { setCart(prev => prev.filter(item => item.id !== productId)); setPaymentAmount(''); setChange(0); };
  
  const updateQty = (productId: number, delta: number) => { 
      const product = products.find(p => p.id === productId);
      const itemInCart = cart.find(i => i.id === productId);
      if (product && itemInCart) {
          if (delta > 0 && itemInCart.qty + delta > product.stock) { alert(`🚫 Stok Mentok! Tersisa: ${product.stock}`); return; }
      }
      setCart(prev => prev.map(item => { if (item.id === productId) { const newQty = item.qty + delta; return newQty > 0 ? { ...item, qty: newQty } : item; } return item; })); setPaymentAmount(''); setChange(0); 
  };

  const openItemDiscount = (item: any) => { setDiscItem(item); setDiscValueInput(''); setDiscType('RP'); setShowItemDiscModal(true); };
  
  const saveItemDiscount = (e: React.FormEvent) => {
      e.preventDefault(); if (!discItem) return;
      const val = Number(discValueInput) || 0;
      let calculatedPercent = 0;
      if (discType === 'PERCENT') calculatedPercent = val; else calculatedPercent = (val / discItem.price) * 100;
      if (calculatedPercent > 50) {
          setPendingAuth({ type: 'DISC_ITEM', payload: { id: discItem.id, val: val, type: discType } });
          setPinInput(''); setShowPinModal(true); setShowItemDiscModal(false);
      } else { applyItemDiscount(discItem.id, val, discType); setShowItemDiscModal(false); }
  };

  const applyItemDiscount = (id: number, val: number, type: 'RP'|'PERCENT') => {
      let finalDiscountRp = 0; const item = cart.find(i => i.id === id); if(!item) return;
      if (type === 'PERCENT') { const safePercent = Math.min(val, 100); finalDiscountRp = Math.floor((item.price * safePercent) / 100); } else { finalDiscountRp = Math.min(val, item.price); }
      setCart(prev => prev.map(i => i.id === id ? { ...i, item_discount: finalDiscountRp } : i)); setPaymentAmount(''); setChange(0); 
  };

  // --- CALCULATIONS ---
  const subTotal = cart.reduce((acc, item) => acc + ((item.price - (item.item_discount || 0)) * item.qty), 0);
  const discountRate = Math.min(100, Math.max(0, Number(discountPercent) || 0));
  const discountValue = Math.floor((subTotal * discountRate) / 100); 
  const taxableAmount = Math.max(0, subTotal - discountValue);
  const taxValue = Math.floor(taxableAmount * (taxRate / 100));
  const grandTotal = taxableAmount + taxValue;
  const totalCost = cart.reduce((acc, item) => acc + ((item.buy_price || 0) * item.qty), 0);
  const marginValue = subTotal - totalCost - discountValue;

  const handlePaymentInput = (val: string) => { setPaymentAmount(val); const num = Number(val); if (!isNaN(num)) setChange(num - grandTotal); };
  const handleDiscountInput = (val: string) => { 
      let num = Number(val); if (num > 100) num = 100; if (num < 0) num = 0;
      if (num > 50) { setPendingAuth({ type: 'DISC_GLOBAL', payload: val }); setPinInput(''); setShowPinModal(true); } else { applyGlobalDiscount(val); }
  };
  const applyGlobalDiscount = (val: string) => { setDiscountPercent(val); const num = Number(val); const newDiscVal = Math.floor((subTotal * num) / 100); const newTaxable = Math.max(0, subTotal - newDiscVal); const newTax = Math.floor(newTaxable * (taxRate / 100)); const newGrandTotal = newTaxable + newTax; const numPay = Number(paymentAmount) || 0; if (numPay > 0) setChange(numPay - newGrandTotal); };

  // --- CHECKOUT ---
  const handleCheckoutClick = async (shouldSendWA: boolean) => {
    if (cart.length === 0) return alert("Keranjang kosong!");
    if (!activeShift) return alert("Shift Kasir Belum Dibuka! Refresh halaman."); 
    if (!isPro) { const { count } = await supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('user_id', user.id); if (count !== null && count >= 1000) return alert("MAAF! Kuota Transaksi Free Plan Habis."); }
    if (paymentMethod === 'HUTANG') { if (!isPro) return alert("Fitur Kasbon hanya untuk akun PRO!"); if (!selectedCustomer) { alert("⚠️ WAJIB pilih Pelanggan untuk mencatat HUTANG."); setShowCustomerModal(true); return; } }
    setSendWaAfterSave(shouldSendWA); 
    if (isPro && !selectedCustomer) setShowCustomerModal(true); else { processTransaction(selectedCustomer?.phone || "", selectedCustomer?.name || "Pelanggan Umum", selectedCustomer?.id || null); }
  };

  const processTransaction = async (phone: string, customerName: string, customerId: number | null = null) => {
    setIsSubmitting(true);
    const pointsEarned = paymentMethod === 'HUTANG' ? 0 : Math.floor(grandTotal / POINT_RATE);
    const cashierDisplayName = activeShift?.cashier_name || user?.email?.split('@')[0] || 'Admin';

    let message = `*${storeName}*\n--------------------------------\n`;
    message += `Tgl: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\nKasir: ${cashierDisplayName}\nPlg: ${customerName}\n\n`;
    cart.forEach(item => { const actualPrice = item.price - (item.item_discount || 0); message += `${item.name} x${item.qty}`; if(item.item_discount > 0) message += ` (Disc)`; message += ` = ${actualPrice * item.qty}\n`; });
    message += `--------------------------------\nTotal: Rp ${grandTotal.toLocaleString()}\n`;
    if(paymentMethod === 'HUTANG') message += `Status: BELUM LUNAS\n`; else message += `Bayar: ${paymentMethod}\n`;
    message += `\nTerima kasih!`;

    try {
        const itemsSummary = cart.map(i => `${i.name} (${i.qty})`).join(', ');
        const trxPayload = { total_amount: subTotal, discount: discountValue, tax: taxValue, final_amount: grandTotal, items_summary: itemsSummary, customer_name: customerName, payment_method: paymentMethod, status: paymentMethod === 'HUTANG' ? 'UNPAID' : 'PAID', payment_status: paymentMethod === 'HUTANG' ? 'DEBT' : 'PAID', debt_amount: paymentMethod === 'HUTANG' ? grandTotal : 0, user_id: user.id };
        const { data: trxData, error: trxError } = await supabase.from('transactions').insert([trxPayload]).select().single();
        if (trxError) throw new Error(trxError.message);
        
        const itemsPayload = cart.map(item => ({ user_id: user.id, transaction_id: trxData.id, product_id: item.id, qty: item.qty, price: item.price, product_name: item.name, item_discount: item.item_discount || 0 }));
        await supabase.from('transaction_items').insert(itemsPayload);
        for (const item of cart) { const currentProd = products.find(p => p.id === item.id); if (currentProd) await supabase.from('products').update({ stock: currentProd.stock - item.qty }).eq('id', item.id); }
        if (customerId && isPro) { const currentCust = customers.find(c => c.id === customerId); await supabase.from('customers').update({ total_transactions: (currentCust?.total_transactions || 0) + 1, points: (currentCust?.points || 0) + pointsEarned }).eq('id', customerId); setCustomers(prev => prev.map(c => c.id === customerId ? {...c, total_transactions: c.total_transactions + 1, points: c.points + pointsEarned} : c)); }
        
        if (sendWaAfterSave && phone) { const waLink = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`; window.open(waLink, '_blank'); } 
        else { alert(paymentMethod === 'HUTANG' ? "Hutang Tercatat! 📝" : "Transaksi Sukses! ✅"); }
        
        setCart([]); resetPaymentState(); setShowCustomerModal(false); setNewCustomerForm({name:'', phone:''}); setSelectedCustomer(null);
        const { data: refreshedProds } = await supabase.from('products').select('*').order('name'); if(refreshedProds) { setProducts(refreshedProds); setFilteredProducts(refreshedProds); }
        setIsMobileCartOpen(false);
    } catch (err: any) { console.error(err); alert("Gagal: " + err.message); } finally { setIsSubmitting(false); }
  };

  const handleProSubmit = async () => { if (selectedCustomer) processTransaction(selectedCustomer.phone, selectedCustomer.name, selectedCustomer.id); else { if (!newCustomerForm.name || (sendWaAfterSave && !newCustomerForm.phone)) return alert("Nama pelanggan wajib diisi!"); const { data, error } = await supabase.from('customers').insert([{ user_id: user.id, name: newCustomerForm.name, phone: newCustomerForm.phone || '-', points: 0 }]).select().single(); if (error) return alert("Gagal: " + error.message); processTransaction(newCustomerForm.phone || '', newCustomerForm.name, data.id); setCustomers(prev => [...prev, data]); } };

  // --- SHIFT LOGIC ---
  const handleOpenShift = async (e: React.FormEvent) => {
      e.preventDefault(); const modal = Number(startCashInput.replace(/[^0-9]/g,'')); const name = cashierNameInput.trim() || 'Admin'; 
      const { data, error } = await supabase.from('cash_shifts').insert([{ user_id: user.id, start_cash: modal, status: 'OPEN', cashier_name: name }]).select().single();
      if(error) return alert("Gagal: " + error.message); setActiveShift(data); setShowShiftModal(false); alert(`Shift Dibuka. Selamat bertugas, ${name}!`);
  };
  const prepareEndShift = async () => { if(!activeShift) return; const { data: trxs } = await supabase.from('transactions').select('*').gte('created_at', activeShift.start_time).eq('user_id', user.id); const totalSales = trxs?.reduce((a,c) => a + c.final_amount, 0) || 0; const cashSales = trxs?.filter(t => t.payment_method === 'CASH' && t.payment_status === 'PAID').reduce((a,c) => a + c.final_amount, 0) || 0; const nonCashSales = totalSales - cashSales; const expected = (activeShift.start_cash || 0) + cashSales; setShiftSummary({ totalSales, cashSales, nonCashSales, expected }); setShowMainMenu(false); setShowEndShiftModal(true); };
  const handlePrintShift = (actual: number, diff: number) => { const w = window.open('', '', 'width=400,height=600'); if (!w) return alert("Popup blocked!"); const cashierName = activeShift?.cashier_name || 'Admin'; const content = `<html><body style="font-family:'Courier New';font-size:10px;width:48mm"><div style="text-align:center;font-weight:bold">${storeName}<br/>LAPORAN TUTUP KASIR</div><hr/><div>Kasir: ${cashierName}</div><div>Buka: ${new Date(activeShift.start_time).toLocaleString()}</div><div>Tutup: ${new Date().toLocaleString()}</div><hr/><div style="display:flex;justify-content:space-between"><span>Modal Awal:</span><span>${activeShift.start_cash.toLocaleString()}</span></div><div style="display:flex;justify-content:space-between"><span>Omzet Tunai:</span><span>${shiftSummary.cashSales.toLocaleString()}</span></div><div style="display:flex;justify-content:space-between"><span>Omzet Lain:</span><span>${shiftSummary.nonCashSales.toLocaleString()}</span></div><hr/><div style="display:flex;justify-content:space-between;font-weight:bold"><span>Target Fisik:</span><span>${shiftSummary.expected.toLocaleString()}</span></div><div style="display:flex;justify-content:space-between;font-weight:bold"><span>Uang Fisik:</span><span>${actual.toLocaleString()}</span></div><div style="display:flex;justify-content:space-between;font-weight:bold"><span>Selisih:</span><span>${diff.toLocaleString()}</span></div><hr/><div style="text-align:center;margin-top:20px;margin-bottom:30px">( Tanda Tangan ${cashierName} )</div><div style="text-align:center;">--- END SHIFT ---</div><script>window.print()</script></body></html>`; w.document.write(content); w.document.close(); };
  const handleCloseShift = async (e: React.FormEvent) => { e.preventDefault(); const actual = Number(endCashInput.replace(/[^0-9]/g,'')); const diff = actual - shiftSummary.expected; const { error } = await supabase.from('cash_shifts').update({ end_time: new Date().toISOString(), end_cash_actual: actual, expected_cash: shiftSummary.expected, difference: diff, total_sales: shiftSummary.totalSales, total_cash_sales: shiftSummary.cashSales, status: 'CLOSED' }).eq('id', activeShift.id); if(error) return alert("Gagal: " + error.message); setShiftClosedData({ activeShift, shiftSummary, actual, diff, cashierName: activeShift?.cashier_name || 'Admin', closeTime: new Date().toLocaleString() }); setShowEndShiftModal(false); setShowSuccessCloseModal(true); };
  const printClosedShiftReport = () => { if (!shiftClosedData) return; const w = window.open('', '', 'width=400,height=600'); if (!w) return alert("Popup blocked!"); const content = `<html><body style="font-family:'Courier New';font-size:10px;width:48mm"><div style="text-align:center;font-weight:bold">${storeName}<br/>LAPORAN TUTUP KASIR</div><hr/><div>Kasir: ${shiftClosedData.cashierName}</div><div>Buka: ${new Date(shiftClosedData.activeShift.start_time).toLocaleString()}</div><div>Tutup: ${shiftClosedData.closeTime}</div><hr/><div style="display:flex;justify-content:space-between"><span>Modal Awal:</span><span>${shiftClosedData.activeShift.start_cash.toLocaleString()}</span></div><div style="display:flex;justify-content:space-between"><span>Omzet Tunai:</span><span>${shiftClosedData.shiftSummary.cashSales.toLocaleString()}</span></div><div style="display:flex;justify-content:space-between"><span>Omzet Lain:</span><span>${shiftClosedData.shiftSummary.nonCashSales.toLocaleString()}</span></div><hr/><div style="display:flex;justify-content:space-between;font-weight:bold"><span>Target Fisik:</span><span>${shiftClosedData.shiftSummary.expected.toLocaleString()}</span></div><div style="display:flex;justify-content:space-between;font-weight:bold"><span>Uang Fisik:</span><span>${shiftClosedData.actual.toLocaleString()}</span></div><div style="display:flex;justify-content:space-between;font-weight:bold"><span>Selisih:</span><span>${shiftClosedData.diff.toLocaleString()}</span></div><hr/><div style="text-align:center;margin-top:20px;margin-bottom:30px">( Tanda Tangan )</div><div style="text-align:center;">--- END SHIFT ---</div><script>window.print()</script></body></html>`; w.document.write(content); w.document.close(); };

  // --- SECURITY AUTH ---
  const initVoid = (id: number) => { setPendingAuth({ type: 'VOID', payload: id }); setPinInput(''); setShowPinModal(true); };
  const handlePinSubmit = (e: React.FormEvent) => { e.preventDefault(); if (pinInput === savedPin) { if (pendingAuth) { if (pendingAuth.type === 'VOID') executeVoid(pendingAuth.payload); if (pendingAuth.type === 'DISC_GLOBAL') applyGlobalDiscount(pendingAuth.payload); if (pendingAuth.type === 'DISC_ITEM') applyItemDiscount(pendingAuth.payload.id, pendingAuth.payload.val, pendingAuth.payload.type); setPendingAuth(null); setShowPinModal(false); } else { sessionStorage.setItem('is_admin_unlocked', 'true'); setIsAdminUnlocked(true); setShowPinModal(false); alert("Mode Owner Terbuka! ✅"); } } else { alert("PIN Salah! ❌"); } };
  const executeVoid = async (id: number) => { try { const { data: items } = await supabase.from('transaction_items').select('*').eq('transaction_id', id); if (items) { for (const item of items) { const { data: prod } = await supabase.from('products').select('stock').eq('id', item.product_id).single(); if(prod) await supabase.from('products').update({ stock: prod.stock + item.qty }).eq('id', item.product_id); } } await supabase.from('transactions').delete().eq('id', id); alert("Transaksi Dibatalkan."); fetchRecentHistory(); } catch(e) { alert("Gagal Void"); } };

  // --- HELPERS ---
  const fetchRecentHistory = async () => { if(!activeShift) return; setAuthLoading(true); const { data } = await supabase.from('transactions').select('*').gte('created_at', activeShift.start_time).eq('user_id', user.id).order('created_at', { ascending: false }).limit(20); setRecentTrx(data || []); setAuthLoading(false); setShowHistoryModal(true); };
  const handleReprint = (trx: any) => { const w = window.open('', '', 'width=400,height=600'); if (!w) return alert("Popup blocked!"); const items = trx.items_summary.split(', ').map((i: string) => `<div>${i}</div>`).join(''); const cashierName = activeShift?.cashier_name || 'Admin'; const content = `<html><body style="font-family:'Courier New';font-size:10px;width:48mm"><div style="text-align:center;font-weight:bold">${storeName}<br/>(REPRINT)</div><hr/><div>Kasir: ${cashierName}</div><div>${new Date(trx.created_at).toLocaleString()}</div><hr/>${items}<hr/><div style="display:flex;justify-content:space-between"><span>TOTAL</span><span>${trx.final_amount.toLocaleString()}</span></div><div style="text-align:center;margin-top:10px">Terima Kasih</div><script>window.print()</script></body></html>`; w.document.write(content); w.document.close(); };
  const handleAdminClick = () => { if (isAdminUnlocked) { router.push('/admin'); } else { setPendingAuth(null); setPinInput(''); setShowMainMenu(false); setShowPinModal(true); } };
  const handleLogout = async () => { await supabase.auth.signOut(); sessionStorage.clear(); router.push('/login'); };
  const handleLockApp = () => { if (!savedPin) return alert("PIN belum ditemukan."); if (confirm("Kunci Mode Kasir?")) { sessionStorage.setItem('is_admin_unlocked', 'false'); setIsAdminUnlocked(false); setShowMainMenu(false); setTimeout(() => alert("Aplikasi Terkunci."), 100); } };
  const handleUpgradeClick = () => { window.open(`https://wa.me/6282177771224?text=${encodeURIComponent("Halo, saya ingin upgrade PRO.")}`, '_blank'); };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-emerald-600" size={40}/></div>;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 font-sans font-inter text-gray-800 overflow-hidden relative">
      
      {/* HEADER */}
      <div className="flex-1 flex flex-col h-full relative z-0">
        <header className="bg-white p-3 border-b border-gray-200 flex items-center gap-3 shadow-sm z-10 sticky top-0">
          <button onClick={() => setShowMainMenu(true)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-800 transition flex-shrink-0"><Menu size={24}/></button>
          <div className="hidden sm:block"><Logo /></div>
          <button onClick={fetchRecentHistory} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition" title="Riwayat Transaksi Hari Ini"><History size={20}/></button>
          <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
              <input type="text" placeholder="Cari produk..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition text-sm"/>
          </div>
        </header>

        <div className="bg-white px-4 py-3 border-b border-gray-200 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <div className="flex gap-2">{categories.map(cat => (<button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${activeCategory === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{cat}</button>))}</div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32 md:pb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {filteredProducts.map(product => (
                    <div key={product.id} onClick={() => addToCart(product)} className="bg-white rounded-2xl p-2 md:p-3 border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition flex flex-col h-full group active:scale-95 duration-100">
                        <div className="bg-gray-100 rounded-xl h-28 md:h-32 w-full mb-2 md:mb-3 overflow-hidden relative">
                            <img src={product.image || "https://via.placeholder.com/150"} className="w-full h-full object-cover"/>
                            {product.stock <= (product.min_stock || 10) && <div className="absolute top-1 left-1 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold animate-pulse">Low Stock</div>}
                            <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1.5 rounded backdrop-blur">Stok: {product.stock}</div>
                        </div>
                        <h3 className="font-bold text-gray-800 text-xs md:text-sm line-clamp-2 mb-1 flex-1 leading-tight">{product.name}</h3>
                        <div className="flex justify-between items-center mt-1">
                            <span className="text-emerald-600 font-extrabold text-xs md:text-sm">Rp {product.price.toLocaleString()}</span>
                            <div className="bg-gray-900 text-white p-1 rounded-lg"><Plus size={12}/></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* KERANJANG */}
      <div className={`bg-white border-t md:border-l border-gray-200 flex flex-col z-30 transition-all duration-300 ease-in-out shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-none fixed bottom-0 left-0 right-0 md:static md:w-96 md:h-full rounded-t-3xl md:rounded-none ${isMobileCartOpen ? 'h-[90vh]' : 'h-20'} md:h-auto`}>
        <div onClick={() => window.innerWidth < 768 && setIsMobileCartOpen(!isMobileCartOpen)} className="p-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-3xl md:rounded-none sticky top-0 z-20 cursor-pointer md:cursor-default">
            <div className="flex items-center gap-2">
                <div className="md:hidden text-gray-400">{isMobileCartOpen ? <ChevronDown size={20}/> : <ChevronUp size={20}/>}</div>
                <h2 className="font-bold text-lg flex items-center gap-2"><ShoppingCart className="text-emerald-600"/> Keranjang</h2>
            </div>
            <div className="flex gap-2 items-center">
                {selectedCustomer && (<div onClick={(e)=>{e.stopPropagation(); setShowCustomerModal(true)}} className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer border border-blue-100"><User size={12}/> {selectedCustomer.name.split(' ')[0]}</div>)}
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-lg">{cart.length} Item</span>
                {!isMobileCartOpen && (<span className="md:hidden font-extrabold text-gray-900 ml-2">Rp {grandTotal.toLocaleString()}</span>)}
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[100px]">
            {cart.length === 0 ? (<div className="flex flex-col items-center justify-center h-20 md:h-full text-gray-400 text-sm"><p>Keranjang Kosong</p></div>) : (cart.map(item => (
                <div key={item.id} className="flex gap-2 items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"><img src={item.image || "https://via.placeholder.com/150"} className="w-full h-full object-cover"/></div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{item.name}</h4>
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500">Rp {item.price.toLocaleString()}</p>
                            {item.item_discount > 0 && <span className="text-[10px] text-red-500 font-bold bg-red-50 px-1 rounded">-Rp{item.item_discount.toLocaleString()}</span>}
                        </div>
                    </div>
                    <button onClick={()=>openItemDiscount(item)} className={`w-6 h-6 flex items-center justify-center rounded shadow-sm border ${item.item_discount > 0 ? 'bg-red-100 text-red-600 border-red-200' : 'bg-white text-gray-400 border-gray-200'}`}><Tag size={10}/></button>
                    <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                        <button onClick={()=>updateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600"><Minus size={12}/></button>
                        <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                        <button onClick={()=>updateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600"><Plus size={12}/></button>
                    </div>
                    <button onClick={()=>removeFromCart(item.id)} className="text-red-300 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
            )))}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3 pb-6 md:pb-4 safe-area-pb">
            {isPro && isAdminUnlocked && cart.length > 0 && (
                <div onClick={() => setRevealMargin(!revealMargin)} className="bg-emerald-50 border border-emerald-100 p-2 rounded-lg flex justify-between items-center text-xs cursor-pointer select-none">
                    <span className="font-bold text-emerald-800 flex items-center gap-1"><TrendingUp size={12}/> Margin</span>
                    <div className="flex items-center gap-2 font-bold text-emerald-600">{revealMargin ? `Rp ${marginValue.toLocaleString()}` : 'Rp *****'} {revealMargin ? <EyeOff size={12}/> : <Eye size={12}/>}</div>
                </div>
            )}
            {cart.length > 0 && (<div className="flex justify-between items-center gap-2"><label className="text-xs font-bold text-gray-500 flex items-center gap-1"><Percent size={12}/> Diskon Total (%)</label><input type="number" max={100} value={discountPercent} onChange={e => handleDiscountInput(e.target.value)} className="w-16 p-1.5 border border-gray-300 rounded-lg text-xs font-bold text-right outline-none focus:border-emerald-500 text-red-500" placeholder="0"/></div>)}
            <div className="space-y-1">
                {(discountValue > 0 || taxValue > 0) && (<div className="flex justify-between items-center text-xs text-gray-500"><span>Subtotal (Net)</span><span>Rp {subTotal.toLocaleString()}</span></div>)}
                <div className="flex justify-between items-center"><span className="text-gray-500 text-sm font-medium">Total Tagihan</span><span className="text-xl font-extrabold text-gray-900">Rp {grandTotal.toLocaleString()}</span></div>
            </div>
            {isPro && (
                <div className="grid grid-cols-4 gap-2">
                    <button onClick={()=>setPaymentMethod('CASH')} className={`py-1.5 rounded-lg text-[9px] font-bold border flex flex-col items-center justify-center gap-0.5 ${paymentMethod==='CASH'?'bg-emerald-600 text-white border-emerald-600':'bg-white text-gray-500 border-gray-200'}`}><Wallet size={14}/> Tunai</button>
                    <button onClick={()=>setPaymentMethod('TRANSFER')} className={`py-1.5 rounded-lg text-[9px] font-bold border flex flex-col items-center justify-center gap-0.5 ${paymentMethod==='TRANSFER'?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-500 border-gray-200'}`}><Banknote size={14}/> Trf</button>
                    <button onClick={()=>setPaymentMethod('QRIS')} className={`py-1.5 rounded-lg text-[9px] font-bold border flex flex-col items-center justify-center gap-0.5 ${paymentMethod==='QRIS'?'bg-purple-600 text-white border-purple-600':'bg-white text-gray-500 border-gray-200'}`}><QrCode size={14}/> QRIS</button>
                    <button onClick={()=>setPaymentMethod('HUTANG')} className={`py-1.5 rounded-lg text-[9px] font-bold border flex flex-col items-center justify-center gap-0.5 ${paymentMethod==='HUTANG'?'bg-red-600 text-white border-red-600':'bg-white text-gray-500 border-gray-200'}`}><ClipboardList size={14}/> Bon</button>
                </div>
            )}
            {isPro && paymentMethod !== 'HUTANG' && (
                <div className="relative">
                    <Wallet className="absolute left-3 top-3 text-gray-400" size={16}/>
                    <input type="number" value={paymentAmount} onChange={e => handlePaymentInput(e.target.value)} placeholder="Nominal diterima..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"/>
                    {Number(paymentAmount) > 0 && (<span className={`absolute right-3 top-2.5 text-xs font-bold ${change >= 0 ? 'text-blue-600' : 'text-red-500'}`}>{change >= 0 ? 'Kembali' : 'Kurang'} Rp {Math.abs(change).toLocaleString()}</span>)}
                </div>
            )}
            <div className="flex gap-2">
                <button onClick={()=>handleCheckoutClick(false)} className={`flex-1 py-3 font-bold rounded-xl flex items-center justify-center gap-2 border text-sm ${paymentMethod==='HUTANG' ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}>{isSubmitting ? <Loader2 className="animate-spin"/> : (paymentMethod==='HUTANG' ? <><ClipboardList size={16}/> Catat Bon</> : <><Save size={16}/> Simpan</>)}</button>
                <button onClick={()=>handleCheckoutClick(true)} className="flex-[2] py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg text-sm">{isSubmitting ? <Loader2 className="animate-spin"/> : (paymentMethod==='HUTANG' ? <><MessageCircle size={16}/> Tagih WA</> : <><CreditCard size={16}/> Bayar & WA</>)}</button>
            </div>
        </div>
      </div>

      {/* --- MENU & MODALS --- */}
      {showMainMenu && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex justify-start">
              <div className="bg-white w-72 h-full shadow-2xl p-6 flex flex-col animate-in slide-in-from-left duration-300">
                  <div className="flex justify-between items-center mb-8"><h2 className="font-bold text-xl text-gray-800">Menu Utama</h2><button onClick={()=>setShowMainMenu(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24}/></button></div>
                  <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500"><User size={20}/></div><div><p className="font-bold text-sm text-gray-900 line-clamp-1">{activeShift?.cashier_name || user?.email?.split('@')[0]}</p><span className={`text-[10px] px-2 py-0.5 rounded font-bold ${isPro ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-500'}`}>{isPro ? 'PRO PLAN' : 'FREE PLAN'}</span></div></div></div>
                  <div className="space-y-2 flex-1">
                      <button onClick={prepareEndShift} className="w-full flex items-center justify-between p-3 rounded-xl bg-red-600 text-white shadow-lg hover:bg-red-700 transition"><div className="flex items-center gap-3 font-bold"><LogOut size={20}/> Tutup Kasir / Rekap</div><ChevronRight size={16}/></button>
                      <button onClick={handleAdminClick} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-200"><div className="flex items-center gap-3 font-bold text-gray-700"><LayoutDashboard size={20} className="text-emerald-600"/> Dashboard Admin</div>{isAdminUnlocked ? <ChevronRight size={16} className="text-gray-400"/> : <Lock size={14} className="text-gray-400"/>}</button>
                      <button onClick={() => isPro ? setShowCustomerModal(true) : handleUpgradeClick()} className={`w-full flex items-center justify-between p-3 rounded-xl transition border border-transparent ${isPro ? 'hover:bg-gray-50 hover:border-gray-200' : 'opacity-70 hover:bg-gray-50'}`}><div className="flex items-center gap-3 font-bold text-gray-700"><Users size={20} className={isPro ? "text-blue-600" : "text-gray-400"}/> Cek Member/Poin</div>{isPro ? <ChevronRight size={16} className="text-gray-400"/> : <Lock size={14} className="text-orange-500"/>}</button>
                      {isPro && isAdminUnlocked && savedPin && (<button onClick={handleLockApp} className="w-full flex items-center justify-between p-3 rounded-xl bg-red-50 hover:bg-red-100 transition border border-red-100"><div className="flex items-center gap-3 font-bold text-red-600"><ShieldAlert size={20}/> Kunci (Mode Kasir)</div><Lock size={16} className="text-red-400"/></button>)}
                      {!isPro && (<button onClick={handleUpgradeClick} className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-100 hover:shadow-sm transition"><div className="flex items-center gap-3 font-bold text-orange-700"><Crown size={20}/> Upgrade PRO</div><Zap size={16} className="text-orange-400 animate-pulse"/></button>)}
                  </div>
                  <div className="border-t border-gray-100 pt-4"><button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition"><LogOut size={20}/> Keluar Aplikasi</button><p className="text-[10px] text-center text-gray-300 mt-4">Versi 2.2.0 (Force Scroll)</p></div>
              </div>
              <div className="flex-1" onClick={()=>setShowMainMenu(false)}></div>
          </div>
      )}
      {showPinModal && (<div className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-center p-4 backdrop-blur-sm"><div className="bg-white w-full max-w-xs p-6 rounded-2xl shadow-2xl relative text-center"><div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600"><Lock size={24}/></div><h3 className="font-bold text-lg text-gray-800">Otorisasi Diperlukan</h3><p className="text-sm text-gray-500 mb-4">Masukkan PIN Admin untuk konfirmasi tindakan ini.</p><form onSubmit={handlePinSubmit}><input type="password" autoFocus maxLength={6} value={pinInput} onChange={e => setPinInput(e.target.value)} className="w-full p-3 bg-gray-100 rounded-xl text-center font-bold text-xl tracking-widest outline-emerald-500 mb-4" placeholder="••••••"/><div className="flex gap-2"><button type="button" onClick={()=>{setShowPinModal(false); setPendingAuth(null);}} className="flex-1 py-2 bg-gray-200 text-gray-600 font-bold rounded-xl">Batal</button><button type="submit" className="flex-1 py-2 bg-gray-900 text-white font-bold rounded-xl">Konfirmasi</button></div></form></div></div>)}
      {showShiftModal && (<div className="fixed inset-0 bg-black/80 z-[100] flex justify-center items-center p-4 backdrop-blur-md"><div className="bg-white w-full max-w-sm p-8 rounded-3xl shadow-2xl text-center"><div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600"><Wallet size={32}/></div><h2 className="text-2xl font-extrabold text-gray-900 mb-2">Buka Kasir</h2><p className="text-gray-500 mb-6">Siapkan laci kasir Anda.</p><form onSubmit={handleOpenShift}><div className="space-y-4"><div className="relative"><UserCheck className="absolute left-4 top-3.5 text-gray-400" size={18}/><input type="text" required value={cashierNameInput} onChange={e=>setCashierNameInput(e.target.value)} className="w-full pl-12 p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold text-gray-800" placeholder="Nama Kasir Bertugas"/></div><div className="relative"><DollarSign className="absolute left-4 top-3.5 text-gray-400" size={18}/><input type="number" required autoFocus value={startCashInput} onChange={e=>setStartCashInput(e.target.value)} className="w-full pl-12 p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold text-gray-800" placeholder="Modal Awal (Rp)"/></div></div><button className="w-full py-4 mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg transition text-lg">Buka Shift</button></form></div></div>)}
      {showEndShiftModal && shiftSummary && (<div className="fixed inset-0 bg-black/80 z-[100] flex justify-center items-center p-4 backdrop-blur-md"><div className="bg-white w-full max-w-md p-0 rounded-3xl shadow-2xl overflow-hidden"><div className="bg-gray-900 p-6 text-white text-center"><h2 className="text-xl font-bold">Rekapitulasi Kasir</h2><p className="text-sm opacity-80">{new Date().toLocaleDateString()}</p></div><div className="p-6 space-y-4"><div className="flex justify-between text-sm"><span>Modal Awal</span><span className="font-bold">Rp {activeShift.start_cash.toLocaleString()}</span></div><div className="flex justify-between text-sm"><span>Penjualan Tunai</span><span className="font-bold text-emerald-600">+ Rp {shiftSummary.cashSales.toLocaleString()}</span></div><div className="flex justify-between text-sm"><span>Non-Tunai (QRIS/Trf)</span><span className="font-bold text-blue-600">Rp {shiftSummary.nonCashSales.toLocaleString()}</span></div><hr/><div className="flex justify-between text-lg font-bold bg-gray-50 p-3 rounded-xl border border-gray-200"><span>Target Uang Fisik</span><span>Rp {shiftSummary.expected.toLocaleString()}</span></div><div className="pt-2"><label className="text-xs font-bold text-gray-500 block mb-2 text-center">Hitung & Masukkan Uang Fisik Aktual</label><input type="number" required autoFocus value={endCashInput} onChange={e=>setEndCashInput(e.target.value)} className="w-full p-4 bg-yellow-50 border-2 border-yellow-200 rounded-2xl text-2xl font-bold text-center outline-none text-yellow-800" placeholder="0"/></div><div className="flex gap-3 pt-2"><button type="button" onClick={()=>setShowEndShiftModal(false)} className="flex-1 py-3 bg-gray-100 font-bold rounded-xl">Batal</button><button onClick={handleCloseShift} className="flex-[2] py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg">Cetak & Tutup</button></div></div></div></div>)}
      {showSuccessCloseModal && (<div className="fixed inset-0 bg-black/90 z-[110] flex justify-center items-center p-4 backdrop-blur-md"><div className="bg-white w-full max-w-sm p-8 rounded-3xl shadow-2xl text-center animate-in zoom-in duration-300"><div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} className="text-green-600"/></div><h2 className="text-2xl font-extrabold text-gray-900 mb-2">Shift Berhasil Ditutup!</h2><p className="text-gray-500 mb-8">Data keuangan telah diamankan.</p><div className="space-y-3"><button onClick={printClosedShiftReport} className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition"><Printer size={20}/> Cetak Laporan</button><button onClick={() => { setShowSuccessCloseModal(false); handleLogout(); }} className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition">Keluar (Logout)</button></div></div></div>)}

      {/* HISTORY MODAL (THE FORCE SCROLL FIX) */}
      {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="flex flex-col w-full max-w-md bg-white shadow-2xl rounded-2xl max-h-[85vh]">
                  {/* Header */}
                  <div className="flex-none p-4 border-b flex justify-between items-center">
                      <h3 className="flex items-center gap-2 font-bold text-gray-800"><History size={20}/> Riwayat Hari Ini</h3>
                      <button onClick={()=>setShowHistoryModal(false)} className="bg-gray-200 p-1.5 rounded-full hover:bg-gray-300"><X size={18}/></button>
                  </div>
                  
                  {/* Content Container */}
                  <div className="flex-1 overflow-y-auto p-4">
                      
                      {/* 1. SCROLL WRAPPER (HORIZONTAL) */}
                      <div className="w-full overflow-x-auto pb-4 border rounded-xl border-gray-200 bg-gray-50" style={{ WebkitOverflowScrolling: 'touch' }}>
                          
                          {/* 2. FORCE WIDTH CONTAINER (700px) */}
                          <div className="min-w-[700px] bg-white">
                              
                              {/* Header Tabel */}
                              <div className="flex bg-gray-100 p-3 font-bold text-xs text-gray-500 uppercase border-b border-gray-200">
                                  <div className="w-32">Total</div>
                                  <div className="flex-1">Detail Transaksi</div>
                                  <div className="w-32 text-right">Aksi</div>
                              </div>

                              {/* Body Tabel */}
                              <div className="divide-y divide-gray-100">
                                  {recentTrx.length === 0 ? (
                                      <div className="p-8 text-center text-gray-400 text-sm">Belum ada transaksi shift ini.</div>
                                  ) : recentTrx.map(trx => (
                                      <div key={trx.id} className="flex p-3 hover:bg-gray-50 transition items-start">
                                          {/* Kolom 1: Total */}
                                          <div className="w-32">
                                              <p className="font-bold text-gray-900 text-sm">Rp {trx.final_amount.toLocaleString()}</p>
                                              <p className="text-[10px] text-gray-500 mt-1">{new Date(trx.created_at).toLocaleTimeString()}</p>
                                              <span className="inline-block mt-1 text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase">{trx.payment_method}</span>
                                          </div>

                                          {/* Kolom 2: Detail */}
                                          <div className="flex-1 px-4">
                                              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{trx.items_summary}</p>
                                              {trx.customer_name && <p className="text-[10px] text-emerald-600 font-bold mt-1">Plg: {trx.customer_name}</p>}
                                          </div>

                                          {/* Kolom 3: Aksi */}
                                          <div className="w-32 text-right flex justify-end gap-2">
                                              <button onClick={()=>handleReprint(trx)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-200"><Printer size={16}/></button>
                                              <button onClick={()=>initVoid(trx.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200"><Trash2 size={16}/></button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                      
                      {/* Hint untuk user baru */}
                      <p className="mt-3 text-[10px] text-center text-gray-400 flex items-center justify-center gap-1 animate-pulse"><ArrowRightLeft size={12}/> Geser tabel ke samping untuk tombol aksi</p>
                  </div>
              </div>
          </div>
      )}
      
      {/* OTHER MODALS */}
      {showItemDiscModal && discItem && (<div className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-center p-4 backdrop-blur-sm"><div className="bg-white w-full max-w-xs p-6 rounded-2xl shadow-xl relative"><button onClick={()=>setShowItemDiscModal(false)} className="absolute top-4 right-4 bg-gray-100 p-1 rounded-full"><X size={18}/></button><h3 className="font-bold text-lg mb-1">Diskon Produk</h3><p className="text-sm text-gray-500 mb-4 truncate">{discItem.name}</p><div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl"><button onClick={()=>setDiscType('RP')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${discType==='RP'?'bg-white shadow text-gray-900':'text-gray-500'}`}>Rupiah (Rp)</button><button onClick={()=>setDiscType('PERCENT')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${discType==='PERCENT'?'bg-white shadow text-gray-900':'text-gray-500'}`}>Persen (%)</button></div><form onSubmit={saveItemDiscount}><div className="mb-4 relative"><input type="number" autoFocus required value={discValueInput} onChange={e=>setDiscValueInput(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-center font-bold text-xl outline-emerald-500" placeholder="0"/><span className="absolute right-4 top-4 text-gray-400 font-bold">{discType === 'RP' ? '' : '%'}</span></div><button className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition">Simpan Diskon</button></form></div></div>)}
      {showCustomerModal && (<div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm"><div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"><div className="p-5 border-b bg-gray-50 flex justify-between items-center"><div><h3 className="font-bold text-lg flex items-center gap-2 text-gray-800"><Users className="text-emerald-600"/> Pilih Pelanggan</h3><p className="text-xs text-gray-500">Wajib pilih untuk mencatat Poin / Hutang</p></div><button onClick={()=>setShowCustomerModal(false)} className="bg-gray-200 p-1.5 rounded-full hover:bg-gray-300"><X size={18}/></button></div><div className="p-5 overflow-y-auto"><div className="mb-6"><label className="text-xs font-bold text-gray-500 mb-2 block">Cari Pelanggan Lama</label><div className="relative"><Search className="absolute left-3 top-3 text-gray-400" size={16}/><input type="text" placeholder="Ketik nama / no WA..." value={customerSearch} onChange={e => {setCustomerSearch(e.target.value); setSelectedCustomer(null);}} className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"/></div>{customerSearch && (<div className="mt-2 border border-gray-100 rounded-xl max-h-40 overflow-y-auto shadow-sm">{customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch)).map(c => (<div key={c.id} onClick={()=>{ setSelectedCustomer(c); setCustomerSearch(c.name); }} className="p-3 hover:bg-emerald-50 cursor-pointer border-b border-gray-50 last:border-0 flex justify-between items-center"><div><p className="font-bold text-sm text-gray-800">{c.name}</p><p className="text-xs text-gray-500">{c.phone}</p></div><div className="text-right"><span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 block mb-1">{c.total_transactions}x Belanja</span><span className="text-[10px] text-blue-600 font-bold flex items-center gap-1 justify-end"><Gift size={8}/> {c.points || 0} Poin</span></div></div>))}</div>)}</div><div className="flex items-center gap-3 mb-6"><div className="h-px bg-gray-200 flex-1"></div><span className="text-xs text-gray-400 font-bold">ATAU INPUT BARU</span><div className="h-px bg-gray-200 flex-1"></div></div><div className={`space-y-3 transition ${selectedCustomer ? 'opacity-50 pointer-events-none grayscale' : ''}`}><div><label className="text-xs font-bold text-gray-500">Nama Pelanggan Baru</label><input type="text" value={newCustomerForm.name} onChange={e=>setNewCustomerForm({...newCustomerForm, name: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium" placeholder="Contoh: Budi Santoso"/></div><div><label className="text-xs font-bold text-gray-500">Nomor WhatsApp</label><input type="number" value={newCustomerForm.phone} onChange={e=>setNewCustomerForm({...newCustomerForm, phone: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium" placeholder="Contoh: 62812345678"/></div></div></div><div className="p-5 border-t bg-gray-50"><button onClick={handleProSubmit} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition flex justify-center items-center gap-2">{isSubmitting ? <Loader2 className="animate-spin"/> : <><Save size={18}/> {selectedCustomer ? 'Pilih & Lanjut' : 'Simpan & Lanjut'}</>}</button></div></div></div>)}
    </div>
  );
}