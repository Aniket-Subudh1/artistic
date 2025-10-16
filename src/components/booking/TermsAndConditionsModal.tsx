'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TermsAndConditions } from '@/services/terms-and-conditions.service';
import { X, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
  terms: TermsAndConditions | null;
  loading?: boolean;
  title?: string;
  subtitle?: string;
  acceptButtonText?: string;
  declineButtonText?: string;
}

export function TermsAndConditionsModal({
  isOpen,
  onClose,
  onAccept,
  onDecline,
  terms,
  loading = false,
  title = "Terms and Conditions",
  subtitle = "Please read and accept the terms and conditions to proceed with your booking.",
  acceptButtonText = "Accept & Continue",
  declineButtonText = "Decline"
}: TermsAndConditionsModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [canAccept, setCanAccept] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false);
      setCanAccept(true); // Allow immediate acceptance
    }
  }, [isOpen]);

  // Update scroll status but don't require it for acceptance
  useEffect(() => {
    // Keep track of scroll status for UI indication only
  }, [hasScrolledToBottom]);

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold

    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = () => {
    if (canAccept) {
      onAccept();
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 max-w-4xl w-full max-h-[90vh] flex flex-col relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#391C71]/10 to-transparent rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100/50 to-transparent rounded-tr-full"></div>
        
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-8 border-b border-white/20">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-2xl p-3 shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-3 hover:bg-white/50 backdrop-blur-sm rounded-2xl transition-all duration-200 shadow-lg border border-white/20"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#391C71] mx-auto mb-4"></div>
                <p className="text-[#391C71] font-semibold">Loading terms...</p>
              </div>
            </div>
          ) : !terms ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center bg-white/50 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg">
                <div className="bg-red-100 rounded-full p-3 w-fit mx-auto mb-4">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                <p className="text-gray-700 font-semibold">No terms and conditions found</p>
              </div>
            </div>
          ) : (
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="p-8 overflow-y-auto h-full max-h-[60vh] space-y-8"
            >
              {/* Terms Header */}
              <div className="bg-gradient-to-r from-[#391C71]/10 to-purple-100 rounded-3xl p-6 border border-[#391C71]/20">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{terms.name}</h3>
                {terms.description && (
                  <p className="text-gray-700 leading-relaxed mb-4">{terms.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                    <span className="text-[#391C71] font-semibold">Version {terms.version}</span>
                  </div>
                  {terms.updatedAt && (
                    <div className="bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                      <span className="text-gray-600">Updated {new Date(terms.updatedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Terms Sections */}
              <div className="space-y-6">
                {terms.subSections.map((section, index) => (
                  <div key={index} className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-lg">
                    <h4 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                      <span className="bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white text-sm font-bold px-3 py-1 rounded-full mr-4 min-w-[32px] text-center">
                        {index + 1}
                      </span>
                      {section.title}
                    </h4>
                    <div className="space-y-3 ml-12">
                      {section.descriptions.map((description, descIndex) => (
                        <p key={descIndex} className="text-gray-700 leading-relaxed">
                          {description}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Scroll indicator */}
              {!hasScrolledToBottom && (
                <div className="sticky bottom-0 bg-gradient-to-t from-white/90 via-white/80 to-transparent backdrop-blur-sm pt-8 pb-4">
                  <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl p-3 border border-white/20 shadow-lg mx-4">
                    <div className="flex items-center justify-center text-sm text-[#391C71] font-semibold">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Scroll down to read all terms and conditions
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative z-10 border-t border-white/20 p-8">
          {/* Status Indicators */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Scroll Status */}
              <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border ${
                hasScrolledToBottom 
                  ? 'bg-green-50 text-green-600 border-green-200' 
                  : 'bg-blue-50 text-[#391C71] border-[#391C71]/20'
              }`}>
                {hasScrolledToBottom ? (
                  <>
                    <div className="bg-green-100 rounded-full p-1">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="font-semibold">Fully read</span>
                  </>
                ) : (
                  <>
                    <div className="bg-[#391C71]/10 rounded-full p-1">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <span className="font-semibold">Ready to accept</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              onClick={onDecline}
              className="px-8 py-3 bg-white/50 backdrop-blur-sm border border-white/20 text-gray-700 rounded-2xl hover:bg-white/70 transition-all duration-200 font-semibold shadow-lg"
            >
              {declineButtonText}
            </button>
            <button
              onClick={handleAccept}
              disabled={!canAccept || loading}
              className={`px-8 py-3 rounded-2xl font-bold transition-all duration-300 shadow-lg relative overflow-hidden group ${
                canAccept && !loading
                  ? 'bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white hover:from-[#5B2C87] hover:to-[#391C71] hover:shadow-xl hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {canAccept && !loading && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              )}
              <span className="relative z-10">{acceptButtonText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}