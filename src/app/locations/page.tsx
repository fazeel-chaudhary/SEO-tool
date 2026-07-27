'use client';

import React, { useState } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { GbpService } from '@/services/gbp-service';
import { Location } from '@/lib/types';
import { POLAR_PLANS } from '@/lib/polar';
import {
  MapPin,
  Plus,
  Building2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Globe,
  Phone,
  Tag,
  Clock,
  Image as ImageIcon,
  Edit3,
  Trash2,
  HelpCircle,
  ShoppingBag,
  ListPlus,
  Sliders,
  X,
  FileText,
  Send,
  CreditCard,
} from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

interface Product {
  name: string;
  price: string;
  description: string;
}

export default function LocationsPage() {
  const { activeOrg, locations, refreshState } = useOrg();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState<Location | null>(null);
  const [activeTab, setActiveTab] = useState<'INFO' | 'HOURS_SERVICES' | 'PRODUCTS' | 'FAQS_ATTRS'>('INFO');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [limitError, setLimitError] = useState<string | null>(null);

  // Bulk Post Modal State
  const [showBulkPostModal, setShowBulkPostModal] = useState(false);
  const [bulkPostTitle, setBulkPostTitle] = useState('');
  const [bulkPostBody, setBulkPostBody] = useState('');
  const [bulkPostType, setBulkPostType] = useState<'UPDATE' | 'OFFER' | 'EVENT'>('UPDATE');
  const [bulkPostCta, setBulkPostCta] = useState('LEARN_MORE');
  const [bulkPostCoupon, setBulkPostCoupon] = useState('');
  const [bulkPostExpiry, setBulkPostExpiry] = useState('');
  const [bulkPostSelected, setBulkPostSelected] = useState<string[]>([]);
  const [bulkPostSuccess, setBulkPostSuccess] = useState<string | null>(null);

  // Bulk Hours Modal State
  const [showBulkHoursModal, setShowBulkHoursModal] = useState(false);
  const [bulkHours, setBulkHours] = useState({ mon: '8:00 AM - 8:00 PM', tue: '8:00 AM - 8:00 PM', wed: '8:00 AM - 8:00 PM', thu: '8:00 AM - 8:00 PM', fri: '8:00 AM - 8:00 PM', sat: '9:00 AM - 5:00 PM', sun: 'Closed' });
  const [bulkHoursSelected, setBulkHoursSelected] = useState<string[]>([]);
  const [bulkHoursSuccess, setBulkHoursSuccess] = useState<string | null>(null);

  // Bulk Images Modal State
  const [showBulkImagesModal, setShowBulkImagesModal] = useState(false);
  const [bulkImagesCategory, setBulkImagesCategory] = useState<'LOGO' | 'COVER' | 'INTERIOR' | 'EXTERIOR' | 'TEAM'>('LOGO');
  const [bulkImagesUrl, setBulkImagesUrl] = useState('https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop');
  const [bulkImagesCaption, setBulkImagesCaption] = useState('Official Office Logo');
  const [bulkImagesSelected, setBulkImagesSelected] = useState<string[]>([]);
  const [bulkImagesSuccess, setBulkImagesSuccess] = useState<string | null>(null);

  // Bulk FAQs Modal State
  const [showBulkFaqsModal, setShowBulkFaqsModal] = useState(false);
  const [bulkFaqQuestion, setBulkFaqQuestion] = useState('What are your emergency service hours?');
  const [bulkFaqAnswer, setBulkFaqAnswer] = useState('We offer 24/7 emergency response support across all business locations.');
  const [bulkFaqsSelected, setBulkFaqsSelected] = useState<string[]>([]);
  const [bulkFaqsSuccess, setBulkFaqsSuccess] = useState<string | null>(null);

  // Bulk Reports Modal State
  const [showBulkReportsModal, setShowBulkReportsModal] = useState(false);
  const [bulkReportFormat, setBulkReportFormat] = useState<'CSV' | 'PDF'>('CSV');
  const [bulkReportType, setBulkReportType] = useState<'FULL_AUDIT' | 'RANK_HEATMAP' | 'CITATIONS_SUMMARY'>('FULL_AUDIT');
  const [bulkReportsSelected, setBulkReportsSelected] = useState<string[]>([]);
  const [bulkReportsSuccess, setBulkReportsSuccess] = useState<string | null>(null);

  // Plan limit helper
  const getPlanLimit = (): number => {
    if (!activeOrg) return 3;
    const plan = activeOrg.plan;
    if (plan === 'TRIAL') return 3;
    const planMap: Record<string, number> = {
      plan_starter_business: POLAR_PLANS.STARTER_BUSINESS.locationsAllowed,
      plan_agency_growth: POLAR_PLANS.AGENCY_GROWTH.locationsAllowed,
      plan_agency_scale: POLAR_PLANS.AGENCY_SCALE.locationsAllowed,
      STARTER: POLAR_PLANS.STARTER_BUSINESS.locationsAllowed,
      AGENCY: POLAR_PLANS.AGENCY_GROWTH.locationsAllowed,
      ENTERPRISE: POLAR_PLANS.AGENCY_SCALE.locationsAllowed,
    };
    return planMap[plan as string] ?? 3;
  };

  const planLimit = getPlanLimit();

  // Add Form State
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    website: '',
    category: '',
  });

  // Edit / Detail Tab Forms State
  const [editFormData, setEditFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    website: '',
    category: '',
    additionalCats: '' as string,
    gbpHours: '',
    gbpPhotoCount: 0,
    servicesList: [] as string[],
    newService: '',
    productsList: [] as Product[],
    newProdName: '',
    newProdPrice: '',
    newProdDesc: '',
    faqsList: [] as FAQ[],
    newFaqQuest: '',
    newFaqAns: '',
    attributesList: [] as string[],
    newAttribute: '',
  });

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg) return;
    setLimitError(null);

    // Enforce plan-based location limit
    if (locations.length >= planLimit) {
      setLimitError(`Your current plan allows up to ${planLimit} location${planLimit === 1 ? '' : 's'}. Please upgrade your plan to add more.`);
      setShowAddModal(false);
      return;
    }

    const newLoc: Location = {
      id: `loc-${Date.now()}`,
      name: formData.name,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      phone: formData.phone,
      website: formData.website || undefined,
      category: formData.category || 'General Business',
      gbpConnected: false,
      gbpPhotoCount: 0,
      gbpPostCount: 0,
      organizationId: activeOrg.id,
      createdAt: new Date().toISOString(),
    };

    AppStore.saveLocation(newLoc);
    refreshState();
    setShowAddModal(false);
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      website: '',
      category: '',
    });
  };

  // Bulk Post handlers
  const openBulkPostModal = () => {
    setBulkPostSelected(locations.map((l) => l.id));
    setBulkPostSuccess(null);
    setShowBulkPostModal(true);
  };
  const toggleBulkPostLocation = (id: string) => {
    setBulkPostSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const handleBulkPostPublish = () => {
    if (!bulkPostTitle.trim() || !bulkPostBody.trim()) return;
    const count = bulkPostSelected.length;
    setBulkPostSuccess(`Published "${bulkPostTitle}" to ${count} business profile${count !== 1 ? 's' : ''}!`);
    setTimeout(() => { setShowBulkPostModal(false); setBulkPostSuccess(null); setBulkPostTitle(''); setBulkPostBody(''); }, 2000);
  };

  // Bulk Hours handlers
  const openBulkHoursModal = () => {
    setBulkHoursSelected(locations.map((l) => l.id));
    setBulkHoursSuccess(null);
    setShowBulkHoursModal(true);
  };
  const toggleBulkHoursLocation = (id: string) => {
    setBulkHoursSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const handleBulkHoursPush = () => {
    const count = bulkHoursSelected.length;
    setBulkHoursSuccess(`Business hours pushed to ${count} profile${count !== 1 ? 's' : ''}!`);
    setTimeout(() => { setShowBulkHoursModal(false); setBulkHoursSuccess(null); }, 2000);
  };

  // Bulk Images handlers
  const openBulkImagesModal = () => {
    setBulkImagesSelected(locations.map((l) => l.id));
    setBulkImagesSuccess(null);
    setShowBulkImagesModal(true);
  };
  const toggleBulkImagesLocation = (id: string) => {
    setBulkImagesSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const handleBulkImagesUpload = () => {
    if (!bulkImagesUrl.trim()) return;
    const count = bulkImagesSelected.length;
    bulkImagesSelected.forEach((id) => {
      const loc = locations.find((l) => l.id === id);
      if (loc) {
        AppStore.saveLocation({
          ...loc,
          gbpPhotoCount: (loc.gbpPhotoCount || 0) + 1,
        });
      }
    });
    refreshState();
    setBulkImagesSuccess(`Uploaded ${bulkImagesCategory.toLowerCase()} photo to ${count} business location profile${count !== 1 ? 's' : ''}!`);
    setTimeout(() => {
      setShowBulkImagesModal(false);
      setBulkImagesSuccess(null);
    }, 2000);
  };

  // Bulk FAQs handlers
  const openBulkFaqsModal = () => {
    setBulkFaqsSelected(locations.map((l) => l.id));
    setBulkFaqsSuccess(null);
    setShowBulkFaqsModal(true);
  };
  const toggleBulkFaqsLocation = (id: string) => {
    setBulkFaqsSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const handleBulkFaqsSync = () => {
    if (!bulkFaqQuestion.trim() || !bulkFaqAnswer.trim()) return;
    const count = bulkFaqsSelected.length;
    setBulkFaqsSuccess(`Synced FAQ "${bulkFaqQuestion.slice(0, 30)}..." to ${count} location landing page${count !== 1 ? 's' : ''}!`);
    setTimeout(() => {
      setShowBulkFaqsModal(false);
      setBulkFaqsSuccess(null);
    }, 2000);
  };

  // Bulk Reports handlers
  const openBulkReportsModal = () => {
    setBulkReportsSelected(locations.map((l) => l.id));
    setBulkReportsSuccess(null);
    setShowBulkReportsModal(true);
  };
  const toggleBulkReportsLocation = (id: string) => {
    setBulkReportsSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const handleBulkReportsExport = () => {
    const selectedLocs = locations.filter((l) => bulkReportsSelected.includes(l.id));
    const count = selectedLocs.length;

    if (bulkReportFormat === 'CSV') {
      const headers = ['Location Name', 'Address', 'City', 'State', 'ZIP', 'Phone', 'Category', 'GBP Status', 'Photo Count', 'Post Count'];
      const rows = selectedLocs.map((l) => [
        `"${l.name}"`,
        `"${l.address}"`,
        `"${l.city}"`,
        `"${l.state}"`,
        `"${l.zip}"`,
        `"${l.phone}"`,
        `"${l.category}"`,
        `"${l.gbpConnected ? 'Active' : 'Disconnected'}"`,
        l.gbpPhotoCount || 0,
        l.gbpPostCount || 0,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `multi_location_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.print();
    }

    setBulkReportsSuccess(`Compiled & exported ${bulkReportFormat} report for ${count} location${count !== 1 ? 's' : ''}!`);
    setTimeout(() => {
      setShowBulkReportsModal(false);
      setBulkReportsSuccess(null);
    }, 2000);
  };

  const handleOpenEdit = (loc: Location) => {
    setSelectedLoc(loc);
    setEditFormData({
      name: loc.name,
      address: loc.address,
      city: loc.city,
      state: loc.state,
      zip: loc.zip,
      phone: loc.phone,
      website: loc.website || '',
      category: loc.category,
      additionalCats: loc.additionalCats ? loc.additionalCats.join(', ') : '',
      gbpHours: loc.gbpHours || 'Mon-Fri: 9:00 AM - 5:00 PM',
      gbpPhotoCount: loc.gbpPhotoCount || 0,
      // Load or fallback mockup detail lists from local mock storage/states
      servicesList: ['SEO Audit', 'NAP Cleanup', 'Review Management', 'Local Citation building'],
      newService: '',
      productsList: [
        { name: 'Local Rank Booster Pack', price: '$299', description: 'Keyword optimizer + link build' },
        { name: 'GMB Setup & Tuneup', price: '$150', description: 'Profile claims and optimization' }
      ],
      newProdName: '',
      newProdPrice: '',
      newProdDesc: '',
      faqsList: [
        { question: 'What is your service area?', answer: 'We service within a 25 mile radius.' },
        { question: 'Do you offer emergency support?', answer: 'Yes, 24/7 client ticket portal.' }
      ],
      newFaqQuest: '',
      newFaqAns: '',
      attributesList: ['Wheelchair accessible entrance', 'Wi-Fi free', 'Identifies as women-led'],
      newAttribute: '',
    });
    setActiveTab('INFO');
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoc) return;

    const updated: Location = {
      ...selectedLoc,
      name: editFormData.name,
      address: editFormData.address,
      city: editFormData.city,
      state: editFormData.state,
      zip: editFormData.zip,
      phone: editFormData.phone,
      website: editFormData.website || undefined,
      category: editFormData.category,
      additionalCats: editFormData.additionalCats
        ? editFormData.additionalCats.split(',').map((c) => c.trim()).filter(Boolean)
        : [],
      gbpHours: editFormData.gbpHours,
      gbpPhotoCount: editFormData.gbpPhotoCount,
    };

    AppStore.saveLocation(updated);
    refreshState();
    setShowEditModal(false);
  };

  const handleDeleteLocation = (locId: string) => {
    if (confirm('Are you absolutely sure you want to delete this business location? This will wipe all citations, keywords, and history.')) {
      AppStore.deleteLocation(locId);
      refreshState();
      setShowEditModal(false);
    }
  };

  const handleConnectGbp = async (locId: string) => {
    setSyncingId(locId);
    try {
      await GbpService.connectAndSyncGbp(locId);
      refreshState();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingId(null);
    }
  };

  // List updates helper
  const addService = () => {
    if (!editFormData.newService.trim()) return;
    setEditFormData({
      ...editFormData,
      servicesList: [...editFormData.servicesList, editFormData.newService.trim()],
      newService: '',
    });
  };

  const removeService = (idx: number) => {
    setEditFormData({
      ...editFormData,
      servicesList: editFormData.servicesList.filter((_, i) => i !== idx),
    });
  };

  const addProduct = () => {
    if (!editFormData.newProdName.trim()) return;
    setEditFormData({
      ...editFormData,
      productsList: [
        ...editFormData.productsList,
        {
          name: editFormData.newProdName,
          price: editFormData.newProdPrice || 'N/A',
          description: editFormData.newProdDesc,
        },
      ],
      newProdName: '',
      newProdPrice: '',
      newProdDesc: '',
    });
  };

  const removeProduct = (idx: number) => {
    setEditFormData({
      ...editFormData,
      productsList: editFormData.productsList.filter((_, i) => i !== idx),
    });
  };

  const addFaq = () => {
    if (!editFormData.newFaqQuest.trim() || !editFormData.newFaqAns.trim()) return;
    setEditFormData({
      ...editFormData,
      faqsList: [
        ...editFormData.faqsList,
        { question: editFormData.newFaqQuest, answer: editFormData.newFaqAns },
      ],
      newFaqQuest: '',
      newFaqAns: '',
    });
  };

  const removeFaq = (idx: number) => {
    setEditFormData({
      ...editFormData,
      faqsList: editFormData.faqsList.filter((_, i) => i !== idx),
    });
  };

  const addAttribute = () => {
    if (!editFormData.newAttribute.trim()) return;
    setEditFormData({
      ...editFormData,
      attributesList: [...editFormData.attributesList, editFormData.newAttribute.trim()],
      newAttribute: '',
    });
  };

  const removeAttribute = (idx: number) => {
    setEditFormData({
      ...editFormData,
      attributesList: editFormData.attributesList.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            Business Locations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage multi-tenant business locations for <span className="font-semibold">{activeOrg?.name}</span>
          </p>
        </div>

        <button
          onClick={() => {
            if (locations.length >= planLimit) {
              setLimitError(`Your plan allows up to ${planLimit} location${planLimit === 1 ? '' : 's'}. Upgrade to add more.`);
            } else {
              setLimitError(null);
              setShowAddModal(true);
            }
          }}
          className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-brand-600/20 active:scale-95 self-start sm:self-auto"
          id="add-location-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Location ({locations.length}/{planLimit})</span>
        </button>
      </div>

      {/* Plan Limit Error Banner */}
      {limitError && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-xs font-semibold text-red-700 dark:text-red-300">{limitError}</p>
          </div>
          <div className="flex items-center space-x-2">
            <a href="/billing" className="flex items-center space-x-1 text-xs font-bold bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-700">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Upgrade Plan</span>
            </a>
            <button onClick={() => setLimitError(null)} className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bulk Multi-Location SEO Actions Manager */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center">
          <Sliders className="w-5 h-5 mr-2 text-brand-600 dark:text-brand-400" />
          Bulk Multi-Location SEO Manager
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Scale your Local SEO actions across all <span className="font-bold text-slate-700 dark:text-slate-300">{locations.length} active location{locations.length !== 1 ? 's' : ''}</span>. Push updates, posts, hours, and reports in one click.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          <button
            onClick={openBulkHoursModal}
            className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-brand-50 dark:hover:bg-brand-950/30 hover:border-brand-300 rounded-xl border border-slate-200 dark:border-slate-700/80 text-center font-bold text-xs space-y-1.5 transition-all"
          >
            <Clock className="w-4 h-4 mx-auto text-brand-600" />
            <span className="block text-slate-800 dark:text-slate-200">Bulk Hours</span>
          </button>

          <button
            onClick={openBulkPostModal}
            className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-300 rounded-xl border border-slate-200 dark:border-slate-700/80 text-center font-bold text-xs space-y-1.5 transition-all"
          >
            <Send className="w-4 h-4 mx-auto text-indigo-500" />
            <span className="block text-slate-800 dark:text-slate-200">Bulk Posts</span>
          </button>

          <button
            onClick={openBulkImagesModal}
            className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-300 rounded-xl border border-slate-200 dark:border-slate-700/80 text-center font-bold text-xs space-y-1.5 transition-all"
          >
            <ImageIcon className="w-4 h-4 mx-auto text-emerald-500" />
            <span className="block text-slate-800 dark:text-slate-200">Bulk Images</span>
          </button>

          <button
            onClick={openBulkFaqsModal}
            className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:border-amber-300 rounded-xl border border-slate-200 dark:border-slate-700/80 text-center font-bold text-xs space-y-1.5 transition-all"
          >
            <HelpCircle className="w-4 h-4 mx-auto text-amber-500" />
            <span className="block text-slate-800 dark:text-slate-200">Bulk FAQs</span>
          </button>

          <button
            onClick={openBulkReportsModal}
            className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-300 rounded-xl border border-slate-200 dark:border-slate-700/80 text-center font-bold text-xs space-y-1.5 transition-all col-span-2 sm:col-span-1"
          >
            <FileText className="w-4 h-4 mx-auto text-rose-500" />
            <span className="block text-slate-800 dark:text-slate-200">Bulk Reports</span>
          </button>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {locations.map((loc) => (
          <div
            key={loc.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{loc.name}</h3>
                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    <span>
                      {loc.address}, {loc.city}, {loc.state} {loc.zip}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      loc.gbpConnected
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {loc.gbpConnected ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                        GBP Active
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 mr-1 text-amber-500" />
                        Disconnected
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Details breakdown */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                  <Tag className="w-3.5 h-3.5 text-brand-500" />
                  <span className="font-medium">{loc.category}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-brand-500" />
                  <span>{loc.phone}</span>
                </div>
                {loc.website && (
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 col-span-2">
                    <Globe className="w-3.5 h-3.5 text-brand-500" />
                    <a
                      href={loc.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-600 dark:text-brand-400 hover:underline truncate"
                    >
                      {loc.website}
                    </a>
                  </div>
                )}
              </div>

              {/* GBP Stats bar */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Hours</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {loc.gbpHours ? 'Set' : 'Missing'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Photos</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {loc.gbpPhotoCount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Posts</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {loc.gbpPostCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => handleConnectGbp(loc.id)}
                disabled={syncingId === loc.id}
                className="flex-1 flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingId === loc.id ? 'animate-spin' : ''}`} />
                <span>{syncingId === loc.id ? 'Syncing...' : 'Sync GBP'}</span>
              </button>

              <button
                onClick={() => handleOpenEdit(loc)}
                className="flex-1 flex items-center justify-center space-x-1.5 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Configure & Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Location Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Add Business Location
            </h2>

            <form onSubmit={handleAddLocation} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Downtown Dental Care"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. 501 W 6th St"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Austin"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="TX"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    placeholder="78701"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(512) 555-0192"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Dentist"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-sm shadow-brand-600/20"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed Configure / Edit Location Modal */}
      {showEditModal && selectedLoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Configure Business — {selectedLoc.name}
                </h2>
                <p className="text-[10px] text-slate-500">Edit business details, services, hours, photos, FAQs & attributes</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-150 dark:border-slate-800 text-[11px] font-bold text-slate-500 overflow-x-auto py-1">
              <button
                onClick={() => setActiveTab('INFO')}
                className={`px-4 py-2 flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'INFO' ? 'text-brand-600 border-b-2 border-brand-600' : 'hover:text-slate-950'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Info & NAP</span>
              </button>
              <button
                onClick={() => setActiveTab('HOURS_SERVICES')}
                className={`px-4 py-2 flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'HOURS_SERVICES' ? 'text-brand-600 border-b-2 border-brand-600' : 'hover:text-slate-950'
                }`}
              >
                <ListPlus className="w-3.5 h-3.5" />
                <span>Hours & Services</span>
              </button>
              <button
                onClick={() => setActiveTab('PRODUCTS')}
                className={`px-4 py-2 flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'PRODUCTS' ? 'text-brand-600 border-b-2 border-brand-600' : 'hover:text-slate-950'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Products & Photos</span>
              </button>
              <button
                onClick={() => setActiveTab('FAQS_ATTRS')}
                className={`px-4 py-2 flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'FAQS_ATTRS' ? 'text-brand-600 border-b-2 border-brand-600' : 'hover:text-slate-950'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>FAQs & Attributes</span>
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
              
              {activeTab === 'INFO' && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Business Name</label>
                    <input
                      type="text"
                      required
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={editFormData.address}
                      onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={editFormData.city}
                        onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={editFormData.state}
                        onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">ZIP</label>
                      <input
                        type="text"
                        required
                        value={editFormData.zip}
                        onChange={(e) => setEditFormData({ ...editFormData, zip: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                      <input
                        type="text"
                        required
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Website</label>
                      <input
                        type="url"
                        value={editFormData.website}
                        onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary Category</label>
                      <input
                        type="text"
                        required
                        value={editFormData.category}
                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Additional Categories (comma separated)</label>
                      <input
                        type="text"
                        value={editFormData.additionalCats}
                        onChange={(e) => setEditFormData({ ...editFormData, additionalCats: e.target.value })}
                        placeholder="e.g. Urgent Care Dental, Cosmetic Dentist"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'HOURS_SERVICES' && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">GBP Business Hours</label>
                    <input
                      type="text"
                      required
                      value={editFormData.gbpHours}
                      onChange={(e) => setEditFormData({ ...editFormData, gbpHours: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center">
                      <ListPlus className="w-4 h-4 mr-1 text-brand-500" />
                      Manage Services
                    </h3>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editFormData.newService}
                        onChange={(e) => setEditFormData({ ...editFormData, newService: e.target.value })}
                        placeholder="Add service (e.g. Teeth Whitening)"
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={addService}
                        className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-3 py-2 rounded-xl"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {editFormData.servicesList.map((service, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                        >
                          <span>{service}</span>
                          <button
                            type="button"
                            onClick={() => removeService(idx)}
                            className="text-red-500 font-bold hover:text-red-700 text-[10px]"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'PRODUCTS' && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">GBP Photo Count</label>
                    <input
                      type="number"
                      value={editFormData.gbpPhotoCount}
                      onChange={(e) => setEditFormData({ ...editFormData, gbpPhotoCount: parseInt(e.target.value) || 0 })}
                      className="w-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center">
                      <ShoppingBag className="w-4 h-4 mr-1 text-brand-500" />
                      Manage Products
                    </h3>

                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editFormData.newProdName}
                          onChange={(e) => setEditFormData({ ...editFormData, newProdName: e.target.value })}
                          placeholder="Product Name"
                          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={editFormData.newProdPrice}
                          onChange={(e) => setEditFormData({ ...editFormData, newProdPrice: e.target.value })}
                          placeholder="Price (e.g. $99)"
                          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                        />
                      </div>
                      <input
                        type="text"
                        value={editFormData.newProdDesc}
                        onChange={(e) => setEditFormData({ ...editFormData, newProdDesc: e.target.value })}
                        placeholder="Description"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={addProduct}
                        className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-3 py-2 rounded-xl"
                      >
                        Add Product
                      </button>
                    </div>

                    <div className="space-y-2 pt-2">
                      {editFormData.productsList.map((prod, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center"
                        >
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white">{prod.name}</span>
                            <span className="text-brand-600 font-bold ml-2">({prod.price})</span>
                            <p className="text-[10px] text-slate-400 mt-0.5">{prod.description}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeProduct(idx)}
                            className="text-red-500 font-bold hover:text-red-700 text-base px-2"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'FAQS_ATTRS' && (
                <div className="space-y-4">
                  {/* FAQs */}
                  <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center">
                      <HelpCircle className="w-4 h-4 mr-1 text-brand-500" />
                      Manage FAQs
                    </h3>

                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editFormData.newFaqQuest}
                        onChange={(e) => setEditFormData({ ...editFormData, newFaqQuest: e.target.value })}
                        placeholder="Question"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={editFormData.newFaqAns}
                        onChange={(e) => setEditFormData({ ...editFormData, newFaqAns: e.target.value })}
                        placeholder="Answer"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={addFaq}
                        className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-3 py-2 rounded-xl"
                      >
                        Add FAQ
                      </button>
                    </div>

                    <div className="space-y-2 pt-2">
                      {editFormData.faqsList.map((faq, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center"
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">Q: {faq.question}</span>
                            <p className="text-[10px] text-slate-400 mt-0.5">A: {faq.answer}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFaq(idx)}
                            className="text-red-500 font-bold hover:text-red-700 text-base px-2"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attributes */}
                  <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center">
                      <Sliders className="w-4 h-4 mr-1 text-brand-500" />
                      Manage Attributes
                    </h3>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editFormData.newAttribute}
                        onChange={(e) => setEditFormData({ ...editFormData, newAttribute: e.target.value })}
                        placeholder="Add attribute (e.g. Free Wi-Fi)"
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={addAttribute}
                        className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-3 py-2 rounded-xl"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {editFormData.attributesList.map((attr, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                        >
                          <span>{attr}</span>
                          <button
                            type="button"
                            onClick={() => removeAttribute(idx)}
                            className="text-red-500 font-bold hover:text-red-700 text-[10px]"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons footer inside scrollable or bottom */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0 z-10">
                <button
                  type="button"
                  onClick={() => handleDeleteLocation(selectedLoc.id)}
                  className="flex items-center space-x-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 px-3 py-2 rounded-xl text-[11px] font-bold transition-all border border-red-200/50 dark:border-red-900/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Location</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-sm shadow-brand-600/20"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ BULK POST MODAL ═══ */}
      {showBulkPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center">
                  <Send className="w-5 h-5 mr-2 text-indigo-500" />
                  Bulk GBP Posts
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Create a post and publish to selected business profiles</p>
              </div>
              <button onClick={() => setShowBulkPostModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
            </div>

            {bulkPostSuccess ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <p className="font-bold text-slate-800 dark:text-white text-sm">{bulkPostSuccess}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Post Type</label>
                  <div className="flex space-x-2">
                    {(['UPDATE', 'OFFER', 'EVENT'] as const).map((t) => (
                      <button key={t} onClick={() => setBulkPostType(t)} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${bulkPostType === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        {t === 'UPDATE' ? 'Update' : t === 'OFFER' ? 'Offer / Promo' : 'Event'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Post Title / Headline *</label>
                  <input value={bulkPostTitle} onChange={(e) => setBulkPostTitle(e.target.value)} placeholder="e.g. Summer Sale — 20% Off All Services" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Post Body *</label>
                  <textarea value={bulkPostBody} onChange={(e) => setBulkPostBody(e.target.value)} rows={3} placeholder="Write your post content here..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                </div>
                {bulkPostType === 'OFFER' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Coupon Code</label>
                      <input value={bulkPostCoupon} onChange={(e) => setBulkPostCoupon(e.target.value)} placeholder="e.g. SUMMER20" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Expiry Date</label>
                      <input type="date" value={bulkPostExpiry} onChange={(e) => setBulkPostExpiry(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Call-to-Action Button</label>
                  <select value={bulkPostCta} onChange={(e) => setBulkPostCta(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="LEARN_MORE">Learn More</option>
                    <option value="BOOK">Book</option>
                    <option value="CALL">Call Now</option>
                    <option value="SIGN_UP">Sign Up</option>
                    <option value="BUY">Buy</option>
                    <option value="GET_OFFER">Get Offer</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Publish To ({bulkPostSelected.length}/{locations.length} profiles)</label>
                    <div className="flex space-x-2">
                      <button onClick={() => setBulkPostSelected(locations.map((l) => l.id))} className="text-[10px] font-bold text-brand-600 hover:underline">Select All</button>
                      <span className="text-slate-300 dark:text-slate-600">|</span>
                      <button onClick={() => setBulkPostSelected([])} className="text-[10px] font-bold text-slate-500 hover:underline">Deselect All</button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {locations.map((loc) => (
                      <label key={loc.id} className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-400 transition-all">
                        <input type="checkbox" checked={bulkPostSelected.includes(loc.id)} onChange={() => toggleBulkPostLocation(loc.id)} className="w-4 h-4 rounded accent-indigo-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{loc.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{loc.city}, {loc.state}</p>
                        </div>
                        {loc.gbpConnected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2 pt-1">
                  <button onClick={() => setShowBulkPostModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs">Cancel</button>
                  <button onClick={handleBulkPostPublish} disabled={!bulkPostTitle.trim() || !bulkPostBody.trim() || bulkPostSelected.length === 0} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-indigo-600/20">
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish to {bulkPostSelected.length} Profile{bulkPostSelected.length !== 1 ? 's' : ''}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ BULK HOURS MODAL ═══ */}
      {showBulkHoursModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-brand-600" />
                  Bulk Business Hours Update
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Set hours and push to selected business profiles</p>
              </div>
              <button onClick={() => setShowBulkHoursModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
            </div>

            {bulkHoursSuccess ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <p className="font-bold text-slate-800 dark:text-white text-sm">{bulkHoursSuccess}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">Business Hours per Day</label>
                  <div className="space-y-2">
                    {([
                      { key: 'mon', label: 'Monday' },
                      { key: 'tue', label: 'Tuesday' },
                      { key: 'wed', label: 'Wednesday' },
                      { key: 'thu', label: 'Thursday' },
                      { key: 'fri', label: 'Friday' },
                      { key: 'sat', label: 'Saturday' },
                      { key: 'sun', label: 'Sunday' },
                    ] as { key: keyof typeof bulkHours; label: string }[]).map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-3">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 w-20 shrink-0">{label}</span>
                        <input value={bulkHours[key]} onChange={(e) => setBulkHours((prev) => ({ ...prev, [key]: e.target.value }))} placeholder="e.g. 8:00 AM - 6:00 PM or Closed" className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Push To ({bulkHoursSelected.length}/{locations.length} profiles)</label>
                    <div className="flex space-x-2">
                      <button onClick={() => setBulkHoursSelected(locations.map((l) => l.id))} className="text-[10px] font-bold text-brand-600 hover:underline">Select All</button>
                      <span className="text-slate-300 dark:text-slate-600">|</span>
                      <button onClick={() => setBulkHoursSelected([])} className="text-[10px] font-bold text-slate-500 hover:underline">Deselect All</button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {locations.map((loc) => (
                      <label key={loc.id} className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-brand-400 transition-all">
                        <input type="checkbox" checked={bulkHoursSelected.includes(loc.id)} onChange={() => toggleBulkHoursLocation(loc.id)} className="w-4 h-4 rounded accent-orange-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{loc.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{loc.city}, {loc.state}</p>
                        </div>
                        {loc.gbpConnected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2 pt-1">
                  <button onClick={() => setShowBulkHoursModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs">Cancel</button>
                  <button onClick={handleBulkHoursPush} disabled={bulkHoursSelected.length === 0} className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-brand-600/20">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Push to {bulkHoursSelected.length} Profile{bulkHoursSelected.length !== 1 ? 's' : ''}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ BULK IMAGES MODAL ═══ */}
      {showBulkImagesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-emerald-500" />
                  Bulk Logo & Photo Upload
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Upload branding or location media across selected business profiles</p>
              </div>
              <button onClick={() => setShowBulkImagesModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
            </div>

            {bulkImagesSuccess ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <p className="font-bold text-slate-800 dark:text-white text-sm">{bulkImagesSuccess}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Photo Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['LOGO', 'COVER', 'INTERIOR', 'EXTERIOR', 'TEAM'] as const).map((cat) => (
                      <button key={cat} onClick={() => setBulkImagesCategory(cat)} className={`py-2 rounded-xl text-xs font-bold border transition-all ${bulkImagesCategory === cat ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Image URL / Asset Link *</label>
                  <input value={bulkImagesUrl} onChange={(e) => setBulkImagesUrl(e.target.value)} placeholder="https://example.com/logo.png" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Image Caption / Alt Text</label>
                  <input value={bulkImagesCaption} onChange={(e) => setBulkImagesCaption(e.target.value)} placeholder="e.g. Modern Dental Clinic Entrance" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Upload To ({bulkImagesSelected.length}/{locations.length} profiles)</label>
                    <div className="flex space-x-2">
                      <button onClick={() => setBulkImagesSelected(locations.map((l) => l.id))} className="text-[10px] font-bold text-emerald-600 hover:underline">Select All</button>
                      <span className="text-slate-300 dark:text-slate-600">|</span>
                      <button onClick={() => setBulkImagesSelected([])} className="text-[10px] font-bold text-slate-500 hover:underline">Deselect All</button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {locations.map((loc) => (
                      <label key={loc.id} className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-400 transition-all">
                        <input type="checkbox" checked={bulkImagesSelected.includes(loc.id)} onChange={() => toggleBulkImagesLocation(loc.id)} className="w-4 h-4 rounded accent-emerald-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{loc.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{loc.city}, {loc.state}</p>
                        </div>
                        {loc.gbpConnected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2 pt-1">
                  <button onClick={() => setShowBulkImagesModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs">Cancel</button>
                  <button onClick={handleBulkImagesUpload} disabled={!bulkImagesUrl.trim() || bulkImagesSelected.length === 0} className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-emerald-600/20">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Upload to {bulkImagesSelected.length} Location{bulkImagesSelected.length !== 1 ? 's' : ''}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ BULK FAQS MODAL ═══ */}
      {showBulkFaqsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center">
                  <HelpCircle className="w-5 h-5 mr-2 text-amber-500" />
                  Bulk FAQs Sync
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Push standard FAQ pairs across selected location landing pages</p>
              </div>
              <button onClick={() => setShowBulkFaqsModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
            </div>

            {bulkFaqsSuccess ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <p className="font-bold text-slate-800 dark:text-white text-sm">{bulkFaqsSuccess}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Question *</label>
                  <input value={bulkFaqQuestion} onChange={(e) => setBulkFaqQuestion(e.target.value)} placeholder="e.g. Do you accept emergency walk-ins?" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Answer *</label>
                  <textarea value={bulkFaqAnswer} onChange={(e) => setBulkFaqAnswer(e.target.value)} rows={3} placeholder="Provide a helpful answer..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Push To ({bulkFaqsSelected.length}/{locations.length} profiles)</label>
                    <div className="flex space-x-2">
                      <button onClick={() => setBulkFaqsSelected(locations.map((l) => l.id))} className="text-[10px] font-bold text-amber-600 hover:underline">Select All</button>
                      <span className="text-slate-300 dark:text-slate-600">|</span>
                      <button onClick={() => setBulkFaqsSelected([])} className="text-[10px] font-bold text-slate-500 hover:underline">Deselect All</button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {locations.map((loc) => (
                      <label key={loc.id} className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-amber-400 transition-all">
                        <input type="checkbox" checked={bulkFaqsSelected.includes(loc.id)} onChange={() => toggleBulkFaqsLocation(loc.id)} className="w-4 h-4 rounded accent-amber-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{loc.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{loc.city}, {loc.state}</p>
                        </div>
                        {loc.gbpConnected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2 pt-1">
                  <button onClick={() => setShowBulkFaqsModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs">Cancel</button>
                  <button onClick={handleBulkFaqsSync} disabled={!bulkFaqQuestion.trim() || !bulkFaqAnswer.trim() || bulkFaqsSelected.length === 0} className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-amber-600/20">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Sync to {bulkFaqsSelected.length} Location{bulkFaqsSelected.length !== 1 ? 's' : ''}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ BULK REPORTS MODAL ═══ */}
      {showBulkReportsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-rose-500" />
                  Bulk Multi-Location Export & Reports
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Export data & audit reports for selected locations</p>
              </div>
              <button onClick={() => setShowBulkReportsModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
            </div>

            {bulkReportsSuccess ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <p className="font-bold text-slate-800 dark:text-white text-sm">{bulkReportsSuccess}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Report Type</label>
                  <select value={bulkReportType} onChange={(e) => setBulkReportType(e.target.value as any)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500">
                    <option value="FULL_AUDIT">Full SEO Audit & Performance Summary</option>
                    <option value="RANK_HEATMAP">Local Rank Tracking & Heatmaps Report</option>
                    <option value="CITATIONS_SUMMARY">Directory Citations & NAP Consistency Report</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Export Format</label>
                  <div className="flex space-x-3">
                    <button onClick={() => setBulkReportFormat('CSV')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${bulkReportFormat === 'CSV' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                      Spreadsheet (.CSV)
                    </button>
                    <button onClick={() => setBulkReportFormat('PDF')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${bulkReportFormat === 'PDF' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                      Printable PDF (.PDF)
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Include Locations ({bulkReportsSelected.length}/{locations.length} profiles)</label>
                    <div className="flex space-x-2">
                      <button onClick={() => setBulkReportsSelected(locations.map((l) => l.id))} className="text-[10px] font-bold text-rose-600 hover:underline">Select All</button>
                      <span className="text-slate-300 dark:text-slate-600">|</span>
                      <button onClick={() => setBulkReportsSelected([])} className="text-[10px] font-bold text-slate-500 hover:underline">Deselect All</button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {locations.map((loc) => (
                      <label key={loc.id} className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-rose-400 transition-all">
                        <input type="checkbox" checked={bulkReportsSelected.includes(loc.id)} onChange={() => toggleBulkReportsLocation(loc.id)} className="w-4 h-4 rounded accent-rose-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{loc.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{loc.city}, {loc.state}</p>
                        </div>
                        {loc.gbpConnected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2 pt-1">
                  <button onClick={() => setShowBulkReportsModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs">Cancel</button>
                  <button onClick={handleBulkReportsExport} disabled={bulkReportsSelected.length === 0} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-rose-600/20">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Export {bulkReportsSelected.length} Location{bulkReportsSelected.length !== 1 ? 's' : ''}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

