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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : !terms ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No terms and conditions found</p>
              </div>
            </div>
          ) : (
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="p-6 overflow-y-auto h-full max-h-[60vh] space-y-6"
            >
              {/* Terms Header */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900">{terms.name}</h3>
                {terms.description && (
                  <p className="text-gray-600 mt-2">{terms.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span>Version {terms.version}</span>
                  {terms.updatedAt && (
                    <span>Updated {new Date(terms.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              {/* Terms Sections */}
              <div className="space-y-6">
                {terms.subSections.map((section, index) => (
                  <div key={index} className="space-y-3">
                    <h4 className="text-md font-semibold text-gray-900 flex items-center">
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full mr-3">
                        {index + 1}
                      </span>
                      {section.title}
                    </h4>
                    <div className="space-y-2 ml-8">
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
                <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-8 pb-4">
                  <div className="text-center text-sm text-gray-500">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Scroll down to read all terms and conditions
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          {/* Status Indicators */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Scroll Status */}
              <div className={`flex items-center gap-2 text-sm ${hasScrolledToBottom ? 'text-green-600' : 'text-blue-600'}`}>
                {hasScrolledToBottom ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Fully read</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>Ready to accept</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onDecline}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {declineButtonText}
            </button>
            <button
              onClick={handleAccept}
              disabled={!canAccept || loading}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                canAccept && !loading
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {acceptButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}