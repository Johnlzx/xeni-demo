'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  Send,
  MessageCircle,
  Mail,
  Sparkles,
  Copy,
  Check,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  Info,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Issue } from '@/types';

type Channel = 'whatsapp' | 'email';

interface ClientNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  issues: Issue[];
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  onSend?: (channel: Channel, message: string, subject?: string) => void;
}

// Mock client data for demo
const MOCK_CLIENT = {
  name: 'James Chen',
  email: 'james.chen@email.com',
  phone: '+44 7700 900123',
};

// AI message templates for different scenarios
const MESSAGE_TEMPLATES = {
  whatsapp: {
    single: {
      quality: [
        `Hi {name},

Hope you're doing well! I've been reviewing your application documents and noticed a small issue with one of the files.

📋 {issueTitle}

{issueDescription}

Could you please send over an updated version when you get a chance? If you have any questions about what's needed, just reply here and I'll help sort it out.

Thanks!
Best regards`,
        `Hi {name},

Quick update on your case - I spotted something that needs your attention:

⚠️ {issueTitle}

{issueDescription}

Would you be able to provide an updated document? Let me know if you need any clarification.

Cheers`,
      ],
      compliance: [
        `Hi {name},

I've completed the initial review of your application and there's one compliance item we need to address:

🔍 {issueTitle}

{issueDescription}

{conflictNote}

This is important for your application to proceed smoothly. Please get back to me with the required information at your earliest convenience.

Best regards`,
        `Hi {name},

Just reviewing your case and noticed something we need to clarify:

📌 {issueTitle}

{issueDescription}

{conflictNote}

Could you help me understand this better or provide the correct documentation?

Thanks!`,
      ],
    },
    multiple: [
      `Hi {name},

I've been going through your application materials and found a few items that need your attention:

{issueList}

Could you please address these when you have a moment? It will help us move your application forward more quickly.

If anything's unclear, just reply here and I'll explain further.

Best regards`,
      `Hi {name},

Quick update - I've identified {count} items that require your input:

{issueList}

Please review and get back to me with the necessary updates. Happy to clarify anything if needed!

Thanks`,
    ],
  },
  email: {
    single: {
      quality: [
        `Dear {name},

I hope this email finds you well.

Following our review of your application documents, I am writing to bring to your attention an item that requires your action:

Subject: {issueTitle}

{issueDescription}

To ensure the smooth progression of your application, kindly provide an updated document addressing the above matter at your earliest convenience.

Should you have any questions or require further clarification, please do not hesitate to contact me.

Kind regards`,
        `Dear {name},

Thank you for your continued cooperation with your application.

During our quality review, we identified the following matter requiring your attention:

{issueTitle}

{issueDescription}

We would appreciate it if you could provide the necessary updated documentation to allow us to proceed with your case.

Please feel free to reach out if you require any assistance.

Yours sincerely`,
      ],
      compliance: [
        `Dear {name},

I am writing regarding your ongoing application.

Our compliance review has identified the following matter that requires your immediate attention:

{issueTitle}

{issueDescription}

{conflictNote}

This matter is essential for the progression of your application. We kindly request that you provide the required clarification or documentation at your earliest convenience.

Should you have any questions, please do not hesitate to contact our office.

Kind regards`,
        `Dear {name},

Further to our ongoing review of your application, I wish to draw your attention to a compliance matter that has been identified:

Issue: {issueTitle}

Details: {issueDescription}

{conflictNote}

Your prompt response to this matter will enable us to continue processing your application without delay.

Please contact me should you require any clarification.

Yours faithfully`,
      ],
    },
    multiple: [
      `Dear {name},

I hope this email finds you well.

Following a comprehensive review of your application materials, I am writing to inform you that we have identified {count} items requiring your attention:

{issueList}

To ensure the timely progression of your application, we kindly request that you address these matters at your earliest convenience.

Should you have any questions or require clarification on any of the above points, please do not hesitate to contact our office.

Kind regards`,
      `Dear {name},

Thank you for your patience as we review your application.

Our assessment has identified the following matters that require your input:

{issueList}

We would be grateful if you could review and respond to each item listed above. Your cooperation will greatly assist us in moving forward with your application.

Please feel free to reach out if you need any assistance or clarification.

Yours sincerely`,
    ],
  },
};

// Generate AI message based on issues with template variation
function generateClientMessage(
  issues: Issue[],
  channel: Channel,
  clientName: string,
  variation: number = 0
): { subject?: string; body: string } {
  // Guard: return empty if no issues
  if (!issues || issues.length === 0) {
    return { subject: '', body: '' };
  }

  const issueCount = issues.length;
  const hasMultiple = issueCount > 1;
  const name = clientName || MOCK_CLIENT.name;

  if (hasMultiple) {
    // Multiple issues
    const templates = MESSAGE_TEMPLATES[channel].multiple;
    const template = templates[variation % templates.length];

    let issueList = '';
    issues.forEach((issue, index) => {
      const emoji = issue.severity === 'error' ? '🔴' : issue.severity === 'warning' ? '🟡' : '🔵';
      const typeLabel = issue.type === 'quality' ? 'Quality' : 'Compliance';
      issueList += `\n${index + 1}. ${emoji} [${typeLabel}] ${issue.title}\n   ${issue.description}\n`;

      if (issue.conflictDetails) {
        issueList += `   ℹ️ We found "${issue.conflictDetails.valueA}" in ${issue.conflictDetails.sourceA} but "${issue.conflictDetails.valueB}" in ${issue.conflictDetails.sourceB}.\n`;
      }
    });

    const body = template
      .replace(/{name}/g, name)
      .replace(/{count}/g, String(issueCount))
      .replace(/{issueList}/g, issueList);

    const subject = channel === 'email'
      ? `Action Required: ${issueCount} Items for Your Immigration Application [Ref: XN-2024-0892]`
      : undefined;

    return { subject, body };
  } else {
    // Single issue
    const issue = issues[0];
    const issueType = issue.type === 'quality' ? 'quality' : 'compliance';
    const templates = MESSAGE_TEMPLATES[channel].single[issueType];
    const template = templates[variation % templates.length];

    let conflictNote = '';
    if (issue.conflictDetails) {
      conflictNote = channel === 'whatsapp'
        ? `ℹ️ Note: We found "${issue.conflictDetails.valueA}" in ${issue.conflictDetails.sourceA} but "${issue.conflictDetails.valueB}" in ${issue.conflictDetails.sourceB}.`
        : `For your reference: Our records indicate "${issue.conflictDetails.valueA}" from ${issue.conflictDetails.sourceA}, however ${issue.conflictDetails.sourceB} shows "${issue.conflictDetails.valueB}". Kindly clarify which is correct.`;
    }

    const body = template
      .replace(/{name}/g, name)
      .replace(/{issueTitle}/g, issue.title)
      .replace(/{issueDescription}/g, issue.description)
      .replace(/{conflictNote}/g, conflictNote);

    const subject = channel === 'email'
      ? `Action Required: ${issue.type === 'quality' ? 'Document Update' : 'Compliance Matter'} for Your Application [Ref: XN-2024-0892]`
      : undefined;

    return { subject, body };
  }
}

// Severity icon component
function SeverityIcon({ severity }: { severity: Issue['severity'] }) {
  switch (severity) {
    case 'error':
      return <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />;
    case 'warning':
      return <AlertCircle className="w-3.5 h-3.5 text-amber-500" />;
    default:
      return <Info className="w-3.5 h-3.5 text-sky-500" />;
  }
}

export function ClientNoteModal({
  isOpen,
  onClose,
  issues,
  clientName,
  clientEmail,
  clientPhone,
  onSend,
}: ClientNoteModalProps) {
  const [channel, setChannel] = useState<Channel>('whatsapp');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [templateVariation, setTemplateVariation] = useState(0);

  // Use mock data if not provided
  const displayName = clientName || MOCK_CLIENT.name;
  const displayEmail = clientEmail || MOCK_CLIENT.email;
  const displayPhone = clientPhone || MOCK_CLIENT.phone;

  // Generate message when modal opens or issues/channel change
  const generatedContent = useMemo(() => {
    return generateClientMessage(issues, channel, displayName, templateVariation);
  }, [issues, channel, displayName, templateVariation]);

  // Set message immediately when modal opens or content changes
  useEffect(() => {
    if (!isOpen || !issues || issues.length === 0) {
      return;
    }

    // Set content immediately - no typing animation
    setMessage(generatedContent.body);
    setSubject(generatedContent.subject || '');
  }, [isOpen, issues, channel, generatedContent]);

  // Handle visibility animation
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleCopy = useCallback(async () => {
    const textToCopy = channel === 'email' ? `Subject: ${subject}\n\n${message}` : message;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [channel, subject, message]);

  const handleRegenerate = useCallback(() => {
    // Increment variation to get a different template
    const newVariation = templateVariation + 1;
    setTemplateVariation(newVariation);

    // Generate and set new content immediately
    const content = generateClientMessage(issues, channel, displayName, newVariation);
    setMessage(content.body);
    setSubject(content.subject || '');
  }, [issues, channel, displayName, templateVariation]);

  const handleSend = useCallback(() => {
    onSend?.(channel, message, channel === 'email' ? subject : undefined);
    onClose();
  }, [channel, message, subject, onSend, onClose]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-2xl mx-4 transition-all duration-300 ease-out',
          isVisible
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        )}
      >
        {/* Main container - Light theme with fixed height */}
        <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/10 overflow-hidden h-[680px] flex flex-col">

          {/* Header */}
          <div className="relative px-6 pt-6 pb-5 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  {/* Sparkle accent */}
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center">
                    <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
                    Draft Client Message
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    AI-generated for {issues.length} issue{issues.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={handleClose}
                className="p-2 -m-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Issues Preview */}
            <div className="mt-4 flex flex-wrap gap-2">
              {issues.slice(0, 3).map((issue) => (
                <div
                  key={issue.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <SeverityIcon severity={issue.severity} />
                  <span className="text-xs text-slate-700 max-w-[180px] truncate font-medium">
                    {issue.title}
                  </span>
                </div>
              ))}
              {issues.length > 3 && (
                <div className="inline-flex items-center px-3 py-1.5 text-xs text-slate-500 font-medium">
                  +{issues.length - 3} more
                </div>
              )}
            </div>
          </div>

          {/* Channel Selector */}
          <div className="px-6 py-5 bg-slate-50/50 flex-shrink-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Send via
            </p>
            <div className="flex gap-3">
              {/* WhatsApp */}
              <button
                onClick={() => setChannel('whatsapp')}
                className={cn(
                  'flex-1 relative group rounded-xl p-4 transition-all duration-200',
                  'border-2',
                  channel === 'whatsapp'
                    ? 'bg-emerald-50 border-emerald-500'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                )}
              >
                {/* Active indicator */}
                {channel === 'whatsapp' && (
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500" />
                )}

                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                    channel === 'whatsapp'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-500'
                  )}>
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className={cn(
                      'text-sm font-semibold',
                      channel === 'whatsapp' ? 'text-emerald-700' : 'text-slate-700'
                    )}>
                      WhatsApp
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {displayPhone}
                    </p>
                  </div>
                </div>
              </button>

              {/* Email */}
              <button
                onClick={() => setChannel('email')}
                className={cn(
                  'flex-1 relative group rounded-xl p-4 transition-all duration-200',
                  'border-2',
                  channel === 'email'
                    ? 'bg-sky-50 border-sky-500'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                )}
              >
                {/* Active indicator */}
                {channel === 'email' && (
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-sky-500" />
                )}

                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                    channel === 'email'
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-100 text-slate-500'
                  )}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className={cn(
                      'text-sm font-semibold',
                      channel === 'email' ? 'text-sky-700' : 'text-slate-700'
                    )}>
                      Email
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {displayEmail}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Message Preview */}
          <div className="px-6 py-4 flex-1 overflow-hidden min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {channel === 'whatsapp' ? 'WhatsApp Preview' : 'Email Preview'}
              </p>
              <button
                onClick={handleRegenerate}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Regenerate with different style"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* WhatsApp Style Preview */}
            {channel === 'whatsapp' && (
              <div className="flex-1 rounded-xl overflow-hidden flex flex-col" style={{ backgroundColor: '#e5ddd5' }}>
                {/* WhatsApp header bar */}
                <div className="px-4 py-2 flex items-center gap-3 flex-shrink-0" style={{ backgroundColor: '#075e54' }}>
                  <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-xs font-semibold text-slate-600">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{displayName}</p>
                    <p className="text-[10px] text-emerald-200">{displayPhone}</p>
                  </div>
                </div>

                {/* Chat area */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {/* Message bubble */}
                  <div className="max-w-[85%] ml-auto">
                    <div
                      className="rounded-lg px-3 py-2 shadow-sm relative"
                      style={{ backgroundColor: '#dcf8c6' }}
                    >
                      {/* Bubble tail */}
                      <div
                        className="absolute -right-1 top-0 w-3 h-3"
                        style={{
                          backgroundColor: '#dcf8c6',
                          clipPath: 'polygon(0 0, 100% 0, 0 100%)'
                        }}
                      />
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-transparent text-[13px] text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none leading-relaxed min-h-[180px]"
                        placeholder="Your message will appear here..."
                        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                      />
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] text-slate-500">
                          {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                        <Check className="w-3 h-3 text-sky-500" />
                        <Check className="w-3 h-3 text-sky-500 -ml-2" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Character count */}
                <div className="px-4 py-2 flex-shrink-0" style={{ backgroundColor: '#f0f0f0' }}>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{message.length} characters</span>
                    {message.length > 4096 && (
                      <span className="text-amber-600 font-medium">Message may be split</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Email Style Preview */}
            {channel === 'email' && (
              <div className="flex-1 rounded-xl border border-slate-200 overflow-hidden flex flex-col bg-white">
                {/* Email header */}
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-slate-400 w-12">To:</span>
                      <span className="text-sm text-slate-700">{displayEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-slate-400 w-12">Subject:</span>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                        placeholder="Email subject..."
                      />
                    </div>
                  </div>
                </div>

                {/* Email body */}
                <div className="flex-1 p-5 overflow-y-auto bg-white">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none leading-relaxed min-h-[180px]"
                    placeholder="Your message will appear here..."
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                  />
                </div>

                {/* Character count */}
                <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex-shrink-0">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{message.length} characters</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex-shrink-0">
            <div className="flex items-center justify-between">
              {/* Copy button */}
              <button
                onClick={handleCopy}
                disabled={!message}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy to Clipboard
                  </>
                )}
              </button>

              {/* Send Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSend}
                  disabled={!message}
                  className={cn(
                    'group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    channel === 'whatsapp'
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20'
                  )}
                >
                  <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  Send via {channel === 'whatsapp' ? 'WhatsApp' : 'Email'}
                  <ChevronRight className="w-4 h-4 -ml-1 opacity-70 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
