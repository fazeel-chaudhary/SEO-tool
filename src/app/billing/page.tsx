'use client';

import React, { useState } from 'react';
import { useOrg } from '@/context/org-context';
import { POLAR_PLANS } from '@/lib/polar';
import { CreditCard, CheckCircle2, Shield, Zap, Check, ArrowRight } from 'lucide-react';
import { AppStore } from '@/services/store';

type PlanType = typeof POLAR_PLANS.STARTER_BUSINESS;

export default function BillingPage() {
  const { activeOrg, refreshState } = useOrg();
  const [currentPlanId, setCurrentPlanId] = useState<string>(POLAR_PLANS.AGENCY_GROWTH.id);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<PlanType | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const activePlanObj = Object.values(POLAR_PLANS).find((p) => p.id === currentPlanId) || POLAR_PLANS.AGENCY_GROWTH;

  const handleSelectCard = (plan: PlanType) => {
    if (plan.id === currentPlanId) return;
    setPaymentError(null);
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardName('');
    setSelectedPlanForModal(plan);
  };

  const handleConfirmPlanChange = () => {
    if (!selectedPlanForModal || !activeOrg) return;

    // Payment validation
    const rawCard = cardNumber.replace(/\s/g, '');
    if (!cardName.trim()) {
      setPaymentError('Please enter the cardholder name.');
      return;
    }
    if (rawCard.length < 16) {
      setPaymentError('Please enter a valid 16-digit card number.');
      return;
    }
    if (!cardExpiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      setPaymentError('Please enter a valid expiry date (MM/YY).');
      return;
    }
    if (cardCvv.length < 3) {
      setPaymentError('Please enter a valid CVV (3 or 4 digits).');
      return;
    }

    setPaymentError(null);
    setIsProcessing(true);

    setTimeout(() => {
      setCurrentPlanId(selectedPlanForModal.id);
      setIsProcessing(false);
      setSelectedPlanForModal(null);

      setSuccessMessage(`Successfully updated to the ${selectedPlanForModal.name} Plan!`);

      AppStore.saveNotification({
        id: `notif-bill-${Date.now()}`,
        type: 'AUTOMATION',
        title: `Plan Subscription Updated`,
        message: `Your organization "${activeOrg.name}" has updated to the ${selectedPlanForModal.name} Plan (${selectedPlanForModal.price}/mo).`,
        read: false,
        locationId: AppStore.getLocations(activeOrg.id)[0]?.id || 'loc-1',
        organizationId: activeOrg.id,
        createdAt: new Date().toISOString(),
      });

      refreshState();
      setTimeout(() => setSuccessMessage(null), 4000);
    }, 800);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
          <CreditCard className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
          Subscription & Billing
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage agency plan, usage quotas, and payment methods for <span className="font-bold">{activeOrg?.name}</span>
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Current Plan Overview Banner */}
      <div className="bg-brand-600 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
            Current Subscription
          </span>
          <h2 className="text-2xl md:text-3xl font-black">{activePlanObj.name} Plan</h2>
          <p className="text-xs text-orange-100 max-w-lg leading-relaxed">
            Includes {activePlanObj.locationsAllowed} Business Locations, {activePlanObj.keywordsAllowed} Tracked Keywords, Geo-Grid Heatmaps, and Automated GBP Audits.
          </p>
        </div>

        <div className="text-left md:text-right shrink-0">
          <div className="text-3xl md:text-4xl font-black">{activePlanObj.price}</div>
          <span className="text-xs text-orange-100">Billed monthly • Active Status</span>
        </div>
      </div>

      {/* Subscription Tier Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">
            Available Subscription Tiers
          </h3>
          <span className="text-xs text-slate-500 font-medium">Click any card to upgrade or change plan</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(POLAR_PLANS).map(([key, plan]) => {
            const isCurrent = plan.id === currentPlanId;
            return (
              <div
                key={plan.id}
                onClick={() => handleSelectCard(plan)}
                className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6 transition-all duration-200 ${
                  isCurrent
                    ? 'border-brand-500 ring-2 ring-brand-500/30 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-600 hover:shadow-lg cursor-pointer active:scale-[0.99]'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xl">{plan.name}</h4>
                    {isCurrent ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center">
                        <Check className="w-3 h-3 mr-1" /> Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        Available
                      </span>
                    )}
                  </div>

                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    {plan.price} <span className="text-xs text-slate-400 font-normal">/ month</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <li className="flex items-center font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                      {plan.locationsAllowed} Business Locations
                    </li>
                    <li className="flex items-center font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                      {plan.keywordsAllowed} Tracked Keywords
                    </li>
                    <li className="flex items-center font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                      Geo-Grid Heatmaps Engine
                    </li>
                    <li className="flex items-center font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                      Automated GBP Health Check Audit
                    </li>
                    <li className="flex items-center font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                      Structured Recommendation Engine
                    </li>
                  </ul>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectCard(plan);
                  }}
                  disabled={isCurrent}
                  className={`w-full py-3 rounded-2xl font-extrabold text-xs transition-all flex items-center justify-center space-x-1.5 ${
                    isCurrent
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'
                      : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 active:scale-95'
                  }`}
                  id={`select-plan-${plan.id}`}
                >
                  <span>{isCurrent ? 'Current Active Plan' : `Select ${plan.name}`}</span>
                  {!isCurrent && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan Change Confirmation Modal */}
      {selectedPlanForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center">
                <Zap className="w-5 h-5 mr-2 text-brand-500" />
                Confirm Plan Switch
              </h2>
              <button
                onClick={() => { setSelectedPlanForModal(null); setPaymentError(null); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Plan Summary */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-2 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white text-sm">
                <span>Selected Plan:</span>
                <span className="text-brand-600 dark:text-brand-400">{selectedPlanForModal.name}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Monthly Pricing:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{selectedPlanForModal.price} / mo</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Location Limit:</span>
                <span className="font-bold">{selectedPlanForModal.locationsAllowed} Locations</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Keyword Limit:</span>
                <span className="font-bold">{selectedPlanForModal.keywordsAllowed} Keywords</span>
              </div>
            </div>

            {/* Payment Error Banner */}
            {paymentError && (
              <div className="flex items-center space-x-2.5 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl">
                <Shield className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-xs font-semibold text-red-700 dark:text-red-300">{paymentError}</p>
              </div>
            )}

            {/* Payment Details Form */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center">
                <CreditCard className="w-3.5 h-3.5 mr-1.5 text-brand-500" />
                Payment Details
              </p>

              {/* Cardholder Name */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Cardholder Name</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => { setCardName(e.target.value); setPaymentError(null); }}
                  placeholder="John Smith"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400"
                />
              </div>

              {/* Card Number */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
                    setCardNumber(formatted);
                    setPaymentError(null);
                  }}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400 font-mono tracking-widest"
                />
              </div>

              {/* Expiry + CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                      if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
                      setCardExpiry(v);
                      setPaymentError(null);
                    }}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">CVV</label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={(e) => { setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4)); setPaymentError(null); }}
                    placeholder="•••"
                    maxLength={4}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400 font-mono"
                  />
                </div>
              </div>

              <p className="text-[10px] text-slate-400 flex items-center">
                <Shield className="w-3 h-3 mr-1 text-emerald-500" />
                Secured with 256-bit SSL encryption. Your card is never stored.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-1">
              <button
                type="button"
                onClick={() => { setSelectedPlanForModal(null); setPaymentError(null); }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPlanChange}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 flex items-center space-x-2 disabled:opacity-60"
                id="confirm-plan-change-btn"
              >
                {isProcessing ? (
                  <><Zap className="w-3.5 h-3.5 animate-pulse" /><span>Processing Payment...</span></>
                ) : (
                  <><CreditCard className="w-3.5 h-3.5" /><span>Pay &amp; Activate Plan</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
