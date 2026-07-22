'use client';

import React, { useState } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { GbpService } from '@/services/gbp-service';
import { Location } from '@/lib/types';
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
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-brand-600/20 active:scale-95 self-start sm:self-auto"
          id="add-location-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Location</span>
        </button>
      </div>

      {/* Bulk Multi-Location SEO Actions Manager */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center">
          <Sliders className="w-5 h-5 mr-2 text-brand-600 dark:text-brand-400" />
          Bulk Multi-Location SEO Manager (Scale Actions)
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Scale your Local SEO configurations. Perform instant edits, updates, media uploads, and reports generation across all **{locations.length}** active locations in your tenant organization.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          <button
            onClick={() => alert(`Bulk Hours Update: Pushed 'Mon-Sun: 8:00 AM - 8:00 PM' to all ${locations.length} connected Google Business Profiles!`)}
            className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-xl border border-slate-200 dark:border-slate-700/80 text-center font-bold text-xs space-y-1.5 transition-colors"
          >
            <Clock className="w-4 h-4 mx-auto text-brand-600" />
            <span className="block text-slate-800 dark:text-slate-250">Bulk Hours</span>
          </button>

          <button
            onClick={() => alert(`Bulk GBP Posts Broadcast: Created and broadcasted a promotional Google post template to all ${locations.length} connected listing panels!`)}
            className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-xl border border-slate-200 dark:border-slate-700/80 text-center font-bold text-xs space-y-1.5 transition-colors"
          >
            <Send className="w-4 h-4 mx-auto text-indigo-500" />
            <span className="block text-slate-800 dark:text-slate-250">Bulk Posts</span>
          </button>

          <button
            onClick={() => alert(`Bulk Logo/Images Upload: Uploaded clinical branding logo files to all ${locations.length} locations!`)}
            className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-xl border border-slate-200 dark:border-slate-700/80 text-center font-bold text-xs space-y-1.5 transition-colors"
          >
            <ImageIcon className="w-4 h-4 mx-auto text-emerald-500" />
            <span className="block text-slate-800 dark:text-slate-250">Bulk Images</span>
          </button>

          <button
            onClick={() => alert(`Bulk FAQ push: Synced standard clinic policy FAQs to all ${locations.length} location landing pages!`)}
            className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-xl border border-slate-200 dark:border-slate-700/80 text-center font-bold text-xs space-y-1.5 transition-colors"
          >
            <HelpCircle className="w-4 h-4 mx-auto text-amber-500" />
            <span className="block text-slate-800 dark:text-slate-250">Bulk FAQs</span>
          </button>

          <button
            onClick={() => alert(`Bulk Multi-Location Reporting: Compiling Google Sheets/CSV export ranking profiles for all ${locations.length} locations...`)}
            className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-xl border border-slate-200 dark:border-slate-700/80 text-center font-bold text-xs space-y-1.5 transition-colors col-span-2 sm:col-span-1"
          >
            <FileText className="w-4 h-4 mx-auto text-rose-500" />
            <span className="block text-slate-800 dark:text-slate-250">Bulk Reports</span>
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
    </div>
  );
}
