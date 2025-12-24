'use client';

import { useState, useMemo } from 'react';
import {
  X,
  Mail,
  MessageCircle,
  Sparkles,
  Copy,
  Check,
  Send,
  FileText,
  ChevronRight,
  RefreshCw,
  User,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EvidenceSlot } from '@/types';

type Channel = 'email' | 'whatsapp';

interface RequestDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlots: EvidenceSlot[];
  applicantName: string;
  applicantEmail?: string;
  applicantPhone?: string;
  caseReference: string;
  onSend: (channel: Channel, message: string) => void;
}

// AI Message Generator - Mock implementation
function generateMessage(
  channel: Channel,
  slots: EvidenceSlot[],
  applicantName: string,
  caseReference: string
): string {
  const firstName = applicantName.split(' ')[0];
  const documentList = slots.map(slot => {
    const requirements = slot.acceptableTypes[0]?.requirements || [];
    return {
      name: slot.name,
      types: slot.acceptableTypes.map(t => t.label).slice(0, 2),
      requirements: requirements.slice(0, 2),
    };
  });

  if (channel === 'whatsapp') {
    // WhatsApp style: concise, casual, uses emojis sparingly
    let msg = `Hi ${firstName}! 👋\n\n`;
    msg += `Quick update on your visa application (Ref: ${caseReference}).\n\n`;
    msg += `We need the following documents:\n\n`;

    documentList.forEach((doc, i) => {
      msg += `${i + 1}. *${doc.name}*\n`;
      if (doc.types.length > 0) {
        msg += `   Accepted: ${doc.types.join(' or ')}\n`;
      }
      if (doc.requirements.length > 0) {
        msg += `   ⚠️ ${doc.requirements[0]}\n`;
      }
      msg += '\n';
    });

    msg += `Please upload via your client portal or reply to this message with photos/scans.\n\n`;
    msg += `Questions? Just reply here! 📱`;

    return msg;
  } else {
    // Email style: formal, detailed, professional
    let msg = `Dear ${applicantName},\n\n`;
    msg += `I hope this email finds you well. I am writing regarding your visa application (Reference: ${caseReference}).\n\n`;
    msg += `To proceed with your application, we require the following documentation:\n\n`;

    documentList.forEach((doc, i) => {
      msg += `${i + 1}. ${doc.name}\n`;
      if (doc.types.length > 0) {
        msg += `   Acceptable formats: ${doc.types.join(', ')}\n`;
      }
      if (doc.requirements.length > 0) {
        doc.requirements.forEach(req => {
          msg += `   • ${req}\n`;
        });
      }
      msg += '\n';
    });

    msg += `Please upload these documents through your secure client portal at your earliest convenience. If you have any questions or require clarification on any of the requirements, please do not hesitate to contact me.\n\n`;
    msg += `Kind regards,\n`;
    msg += `[Your Name]\n`;
    msg += `Immigration Advisor`;

    return msg;
  }
}

export function RequestDocumentsModal({
  isOpen,
  onClose,
  selectedSlots,
  applicantName,
  applicantEmail,
  applicantPhone,
  caseReference,
  onSend,
}: RequestDocumentsModalProps) {
  const [channel, setChannel] = useState<Channel>('email');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Generate message based on channel
  const [customMessage, setCustomMessage] = useState<string | null>(null);

  const generatedMessage = useMemo(() => {
    return generateMessage(channel, selectedSlots, applicantName, caseReference);
  }, [channel, selectedSlots, applicantName, caseReference]);

  const message = customMessage ?? generatedMessage;

  const handleRegenerate = () => {
    setIsGenerating(true);
    // Simulate AI regeneration
    setTimeout(() => {
      setCustomMessage(null);
      setIsGenerating(false);
    }, 800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      onSend(channel, message);
      setIsSending(false);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          animation: 'modalSlideIn 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Request Documents</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {selectedSlots.length} document{selectedSlots.length !== 1 ? 's' : ''} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Recipient Info */}
          <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#0E4369]/10 flex items-center justify-center">
                <User className="w-5 h-5 text-[#0E4369]" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{applicantName}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                  {applicantEmail && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {applicantEmail}
                    </span>
                  )}
                  {applicantPhone && (
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {applicantPhone}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Case Ref</span>
                <p className="text-sm font-mono text-gray-700">{caseReference}</p>
              </div>
            </div>
          </div>

          {/* Channel Selector */}
          <div className="px-6 py-4 border-b border-gray-100">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 block">
              Send via
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setChannel('email');
                  setCustomMessage(null);
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all',
                  channel === 'email'
                    ? 'border-[#0E4369] bg-[#0E4369]/5 text-[#0E4369]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <Mail className="w-5 h-5" />
                <span className="font-medium">Email</span>
                {applicantEmail && (
                  <span className="text-xs opacity-60">({applicantEmail.split('@')[0]}...)</span>
                )}
              </button>
              <button
                onClick={() => {
                  setChannel('whatsapp');
                  setCustomMessage(null);
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all',
                  channel === 'whatsapp'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">WhatsApp</span>
                {applicantPhone && (
                  <span className="text-xs opacity-60">({applicantPhone.slice(-4)})</span>
                )}
              </button>
            </div>
          </div>

          {/* Document Requirements Summary */}
          <div className="px-6 py-4 border-b border-gray-100">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 block">
              Requested Documents
            </label>
            <div className="space-y-2">
              {selectedSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{slot.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {slot.acceptableTypes.map(t => t.label).slice(0, 2).join(', ')}
                      {slot.acceptableTypes.length > 2 && ` +${slot.acceptableTypes.length - 2} more`}
                    </p>
                    {slot.acceptableTypes[0]?.requirements?.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5 text-[10px] text-amber-600">
                        <Clock className="w-3 h-3" />
                        {slot.acceptableTypes[0].requirements[0]}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* AI-Generated Message */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                AI-Drafted Message
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all disabled:opacity-50"
                >
                  <RefreshCw className={cn('w-3 h-3', isGenerating && 'animate-spin')} />
                  Regenerate
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Message Preview */}
            <div
              className={cn(
                'relative rounded-xl border overflow-hidden transition-all',
                channel === 'whatsapp'
                  ? 'bg-[#e5ddd5] border-[#d1c8be]'
                  : 'bg-white border-gray-200'
              )}
            >
              {/* WhatsApp-style chat bubble */}
              {channel === 'whatsapp' ? (
                <div className="p-4">
                  <div className="bg-[#dcf8c6] rounded-lg rounded-tr-none p-3 max-w-[90%] ml-auto shadow-sm">
                    <textarea
                      value={message}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="w-full bg-transparent text-sm text-gray-800 resize-none outline-none min-h-[200px]"
                      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                    />
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-500">
                      <span>Now</span>
                      <Check className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  {/* Email header mock */}
                  <div className="pb-3 mb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <span className="font-medium text-gray-700">To:</span>
                      {applicantEmail || 'applicant@email.com'}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-medium text-gray-700">Subject:</span>
                      Document Request - {caseReference}
                    </div>
                  </div>
                  <textarea
                    value={message}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full bg-transparent text-sm text-gray-700 resize-none outline-none min-h-[250px] leading-relaxed"
                    style={{ fontFamily: 'Georgia, serif' }}
                  />
                </div>
              )}

              {/* Generating overlay */}
              {isGenerating && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Sparkles className="w-4 h-4 text-violet-500 animate-pulse" />
                    Regenerating message...
                  </div>
                </div>
              )}
            </div>

            {/* Tone hint */}
            <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {channel === 'whatsapp'
                ? 'WhatsApp messages are concise and conversational for mobile reading'
                : 'Email messages are formal and detailed for professional communication'
              }
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all',
              channel === 'whatsapp'
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-[#0E4369] text-white hover:bg-[#0B3654]',
              isSending && 'opacity-70 cursor-not-allowed'
            )}
          >
            {isSending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send via {channel === 'whatsapp' ? 'WhatsApp' : 'Email'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
