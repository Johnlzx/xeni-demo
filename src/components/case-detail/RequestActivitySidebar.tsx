'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Eye,
  MessageCircle,
  Check,
  Clock,
  RefreshCw,
  Bell,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Mail,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for request tracking
export type RequestChannel = 'whatsapp' | 'email';
export type RequestStatus = 'sending' | 'sent' | 'delivered' | 'viewed' | 'responded' | 'expired';

export interface RequestEvent {
  id: string;
  type: 'sent' | 'delivered' | 'viewed' | 'responded' | 'reminder_sent' | 'expired';
  timestamp: Date;
  message?: string;
  channel?: RequestChannel;
}

export interface ClientRequest {
  id: string;
  issueId: string;
  channel: RequestChannel;
  message: string;
  status: RequestStatus;
  createdAt: Date;
  events: RequestEvent[];
  clientResponse?: {
    message: string;
    receivedAt: Date;
    attachments?: string[];
  };
}

interface RequestActivitySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  request: ClientRequest | null;
  onResend: () => void;
  onSendReminder: () => void;
  className?: string;
}

// Status configuration
function getStatusConfig(status: RequestStatus) {
  switch (status) {
    case 'sending':
      return {
        icon: Loader2,
        label: 'Sending...',
        color: 'text-slate-500',
        bg: 'bg-slate-100',
        pulse: false,
        spin: true,
      };
    case 'sent':
      return {
        icon: Send,
        label: 'Sent',
        color: 'text-sky-600',
        bg: 'bg-sky-50',
        pulse: true,
        spin: false,
      };
    case 'delivered':
      return {
        icon: Check,
        label: 'Delivered',
        color: 'text-sky-600',
        bg: 'bg-sky-50',
        pulse: true,
        spin: false,
      };
    case 'viewed':
      return {
        icon: Eye,
        label: 'Viewed by Client',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        pulse: true,
        spin: false,
      };
    case 'responded':
      return {
        icon: CheckCircle2,
        label: 'Client Responded',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        pulse: false,
        spin: false,
      };
    case 'expired':
      return {
        icon: AlertCircle,
        label: 'No Response',
        color: 'text-rose-500',
        bg: 'bg-rose-50',
        pulse: false,
        spin: false,
      };
    default:
      return {
        icon: Clock,
        label: 'Pending',
        color: 'text-slate-500',
        bg: 'bg-slate-100',
        pulse: false,
        spin: false,
      };
  }
}

// Format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// Timeline Event Item
function TimelineEvent({
  event,
  isLast,
  index,
}: {
  event: RequestEvent;
  isLast: boolean;
  index: number;
}) {
  const getEventConfig = (type: RequestEvent['type']) => {
    switch (type) {
      case 'sent':
        return { icon: Send, label: 'Request sent', color: 'bg-sky-500' };
      case 'delivered':
        return { icon: Check, label: 'Delivered', color: 'bg-sky-500' };
      case 'viewed':
        return { icon: Eye, label: 'Viewed by client', color: 'bg-amber-500' };
      case 'responded':
        return { icon: MessageCircle, label: 'Client responded', color: 'bg-emerald-500' };
      case 'reminder_sent':
        return { icon: Bell, label: 'Reminder sent', color: 'bg-slate-400' };
      case 'expired':
        return { icon: AlertCircle, label: 'Request expired', color: 'bg-rose-400' };
      default:
        return { icon: Clock, label: 'Event', color: 'bg-slate-400' };
    }
  };

  const config = getEventConfig(event.type);
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.3 }}
      className="relative flex gap-3"
    >
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-gradient-to-b from-slate-200 to-transparent" />
      )}

      {/* Dot */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15 + index * 0.08, type: 'spring', stiffness: 500, damping: 25 }}
        className={cn(
          'relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
          config.color
        )}
      >
        <Icon className="w-3 h-3 text-white" />
      </motion.div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <p className="text-sm font-medium text-slate-700">{config.label}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {formatRelativeTime(event.timestamp)}
        </p>
        {event.message && (
          <p className="text-xs text-slate-500 mt-1 italic">"{event.message}"</p>
        )}
      </div>
    </motion.div>
  );
}

// Message Preview Component
function MessagePreview({
  channel,
  message,
  timestamp,
}: {
  channel: RequestChannel;
  message: string;
  timestamp: Date;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = message.length > 120;
  const displayMessage = isExpanded ? message : message.slice(0, 120) + (isLong ? '...' : '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative"
    >
      {/* Channel indicator */}
      <div className="flex items-center gap-2 mb-2">
        {channel === 'whatsapp' ? (
          <>
            <div className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center">
              <Smartphone className="w-3 h-3 text-white" />
            </div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              WhatsApp Message
            </span>
          </>
        ) : (
          <>
            <div className="w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center">
              <Mail className="w-3 h-3 text-white" />
            </div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Email
            </span>
          </>
        )}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          'relative p-3 rounded-xl text-sm leading-relaxed',
          channel === 'whatsapp'
            ? 'bg-[#DCF8C6] text-slate-800'
            : 'bg-white border border-slate-200 text-slate-700'
        )}
      >
        {/* Decorative tail for WhatsApp */}
        {channel === 'whatsapp' && (
          <div className="absolute -right-1 top-2 w-3 h-3 bg-[#DCF8C6] transform rotate-45" />
        )}

        <p className="whitespace-pre-wrap">{displayMessage}</p>

        {isLong && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 mt-2 text-[11px] font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                Show more
              </>
            )}
          </button>
        )}

        {/* Timestamp */}
        <p className="text-[10px] text-slate-400 mt-2 text-right">
          {timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
}

// Client Response Component
function ClientResponse({
  response,
}: {
  response: NonNullable<ClientRequest['clientResponse']>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 25 }}
      className="relative"
    >
      {/* Glow effect for new response */}
      <div className="absolute inset-0 bg-emerald-400/10 rounded-xl blur-xl" />

      <div className="relative bg-white border-2 border-emerald-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <span className="text-xs font-semibold text-emerald-700">Client Response</span>
          <span className="text-[10px] text-slate-400 ml-auto">
            {formatRelativeTime(response.receivedAt)}
          </span>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed">{response.message}</p>

        {response.attachments && response.attachments.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Attachments ({response.attachments.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {response.attachments.map((attachment, i) => (
                <button
                  key={i}
                  className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 hover:bg-slate-100 rounded text-xs text-slate-600 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  {attachment}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Quick Action Button
function QuickAction({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
  disabled,
}: {
  icon: typeof Send;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary';
  disabled?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all',
        variant === 'primary'
          ? 'bg-[#0E4369] text-white hover:bg-[#0c3a5a] shadow-sm'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </motion.button>
  );
}

/**
 * Empty State - No request sent yet
 */
function EmptyActivityState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Clock className="w-7 h-7 text-slate-400" />
      </div>
      <h4 className="text-sm font-semibold text-slate-700 mb-1">No Activity Yet</h4>
      <p className="text-xs text-slate-400 leading-relaxed max-w-[200px]">
        Send a request to the client to start tracking activity here.
      </p>
    </motion.div>
  );
}

/**
 * Default Timeline - Shows basic issue activity
 */
function DefaultTimeline() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Issue Timeline
      </h4>
      <div className="space-y-4 pl-1">
        <div className="relative flex gap-3">
          <div className="absolute left-[11px] top-6 bottom-0 w-px bg-gradient-to-b from-slate-200 to-transparent" />
          <div className="relative z-10 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-2.5 h-2.5 text-slate-400" />
          </div>
          <div>
            <p className="text-[13px] text-slate-600">Issue detected by AI</p>
            <p className="text-[10px] text-slate-400 mt-0.5">2 hours ago</p>
          </div>
        </div>
        <div className="relative flex gap-3">
          <div className="relative z-10 w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Clock className="w-2.5 h-2.5 text-amber-500" />
          </div>
          <div>
            <p className="text-[13px] text-slate-600">Awaiting action</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Current</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * RequestActivitySidebar - Tracks client request progress and logs
 */
export function RequestActivitySidebar({
  isOpen,
  onClose,
  request,
  onResend,
  onSendReminder,
  className,
}: RequestActivitySidebarProps) {
  const statusConfig = request ? getStatusConfig(request.status) : null;
  const StatusIcon = statusConfig?.icon || Clock;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 340, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 35,
            opacity: { duration: 0.2 },
          }}
          className={cn(
            'h-full bg-gradient-to-b from-slate-50 to-white border-l border-slate-200 overflow-hidden flex flex-col',
            className
          )}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white"
          >
            <h3 className="text-sm font-semibold text-slate-800">Activity</h3>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </motion.div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {request ? (
              <div className="p-5 space-y-6">
                {/* Status Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 25 }}
                  className="flex items-center gap-3"
                >
                  <div className="relative">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        statusConfig?.bg
                      )}
                    >
                      <StatusIcon
                        className={cn(
                          'w-6 h-6',
                          statusConfig?.color,
                          statusConfig?.spin && 'animate-spin'
                        )}
                      />
                    </div>
                    {/* Pulse animation for active states */}
                    {statusConfig?.pulse && (
                      <motion.div
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 1.8, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                        className={cn(
                          'absolute inset-0 rounded-xl',
                          statusConfig.bg
                        )}
                      />
                    )}
                  </div>
                  <div>
                    <p className={cn('text-sm font-semibold', statusConfig?.color)}>
                      {statusConfig?.label}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Sent {formatRelativeTime(request.createdAt)}
                    </p>
                  </div>
                </motion.div>

                {/* Timeline */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Timeline
                  </h4>
                  <div className="pl-1">
                    {request.events.map((event, index) => (
                      <TimelineEvent
                        key={event.id}
                        event={event}
                        isLast={index === request.events.length - 1}
                        index={index}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Message Preview */}
                <div>
                  <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Message Sent
                  </h4>
                  <MessagePreview
                    channel={request.channel}
                    message={request.message}
                    timestamp={request.createdAt}
                  />
                </div>

                {/* Client Response */}
                {request.clientResponse && (
                  <div>
                    <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      Response Received
                    </h4>
                    <ClientResponse response={request.clientResponse} />
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5">
                <DefaultTimeline />
              </div>
            )}
          </div>

          {/* Footer Actions - Only show when there's a request */}
          {request && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-4 border-t border-slate-100 bg-white"
            >
              <div className="grid grid-cols-2 gap-2">
                <QuickAction
                  icon={Bell}
                  label="Send Reminder"
                  onClick={onSendReminder}
                  disabled={request.status === 'responded'}
                />
                <QuickAction
                  icon={RefreshCw}
                  label="Resend"
                  onClick={onResend}
                  variant="primary"
                  disabled={request.status === 'responded'}
                />
              </div>
            </motion.div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
