'use client';

import { useState, useCallback } from 'react';
import { Modal, Button, Input, Select } from '@/components/ui';
import { PassportInfoCard } from './PassportInfoCard';
import { Globe, Hash, User, Mail, Upload, FileText, CheckCircle, X } from 'lucide-react';
import { VISA_TYPES } from '@/data/constants';
import { MOCK_USERS } from '@/data/users';
import { cn, formatFileSize } from '@/lib/utils';
import type { PassportInfo, VisaType } from '@/types';

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCaseData) => void;
}

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
}

interface CreateCaseData {
  visaType: VisaType;
  referenceNumber: string;
  advisorId: string;
  assistantId?: string;
  clientEmail?: string;
  passport: PassportInfo;
  supportingDocuments?: UploadedFile[];
}

// Mock passport data for demo
const MOCK_PASSPORT: PassportInfo = {
  givenNames: 'Bob',
  surname: 'Brown',
  nationality: 'British',
  countryOfBirth: 'France',
  dateOfBirth: '1990-01-23',
  sex: 'M',
  dateOfIssue: '2021-01-23',
  dateOfExpiry: '2026-01-23',
  passportNumber: 'AT38249065',
  mrzLine1: 'P<GRCKOUTSAIMANI<<ELENI<<<<<<<<<<<<<<<<<<<<<',
  mrzLine2: 'AT38249065GRC8109149F2611309<<<<<<<<<<<<<<06',
};

export function CreateCaseModal({ isOpen, onClose, onSubmit }: CreateCaseModalProps) {
  const [step, setStep] = useState<'upload' | 'confirm' | 'documents'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [passportData, setPassportData] = useState<PassportInfo | null>(null);
  const [supportingFiles, setSupportingFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState({
    visaType: '' as VisaType | '',
    referenceNumber: '',
    advisorId: MOCK_USERS[0].id,
    assistantId: '',
    clientEmail: '',
  });

  const visaOptions = Object.entries(VISA_TYPES).map(([value, config]) => ({
    value,
    label: config.label,
    description: config.description,
  }));

  const userOptions = MOCK_USERS.filter(u => u.role !== 'applicant').map(u => ({
    value: u.id,
    label: u.name,
  }));

  const handleUpload = async () => {
    setIsUploading(true);
    // Simulate AI extraction
    await new Promise(resolve => setTimeout(resolve, 1500));
    setPassportData(MOCK_PASSPORT);
    setIsUploading(false);
    setStep('confirm');
  };

  const handleSubmit = () => {
    if (!passportData || !formData.visaType) return;

    onSubmit({
      visaType: formData.visaType as VisaType,
      referenceNumber: formData.referenceNumber,
      advisorId: formData.advisorId,
      assistantId: formData.assistantId || undefined,
      clientEmail: formData.clientEmail || undefined,
      passport: passportData,
      supportingDocuments: supportingFiles,
    });
    handleClose();
  };

  const handleClose = () => {
    setStep('upload');
    setPassportData(null);
    setSupportingFiles([]);
    setFormData({
      visaType: '',
      referenceNumber: '',
      advisorId: MOCK_USERS[0].id,
      assistantId: '',
      clientEmail: '',
    });
    onClose();
  };

  // Simple file upload handlers
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }, []);

  const addFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      id: Math.random().toString(36).substring(2, 11),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setSupportingFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    setSupportingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const isFormValid = passportData && formData.visaType && formData.referenceNumber;

  const stepTitles = {
    upload: 'Step 1: Upload Passport',
    confirm: 'Step 2: Case Details',
    documents: 'Step 3: Supporting Documents',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create a New Case"
      size="lg"
      footer={
        step === 'confirm' ? (
          <>
            <Button variant="outline" onClick={() => setStep('upload')}>
              Back
            </Button>
            <Button onClick={() => setStep('documents')} disabled={!isFormValid}>
              Next
            </Button>
          </>
        ) : step === 'documents' ? (
          <>
            <Button variant="outline" onClick={() => setStep('confirm')}>
              Back
            </Button>
            <Button onClick={handleSubmit}>
              Create Case
            </Button>
          </>
        ) : undefined
      }
    >
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6 pt-2">
        {(['upload', 'confirm', 'documents'] as const).map((s, index) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step === s
                  ? 'bg-[#0E4369] text-white'
                  : ['upload', 'confirm', 'documents'].indexOf(step) > index
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {['upload', 'confirm', 'documents'].indexOf(step) > index ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < 2 && (
              <div
                className={`w-12 h-0.5 mx-1 ${
                  ['upload', 'confirm', 'documents'].indexOf(step) > index
                    ? 'bg-emerald-300'
                    : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Title */}
      <div className="text-center mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{stepTitles[step]}</h3>
      </div>

      {step === 'upload' && (
        <div className="py-4">
          {/* Upload Zone */}
          <div
            className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-primary-300 transition-colors cursor-pointer"
            onClick={handleUpload}
          >
            <div className="w-16 h-16 bg-primary-50 rounded-lg mx-auto mb-4 flex items-center justify-center">
              {isUploading ? (
                <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileText className="w-8 h-8 text-primary-600" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">
              {isUploading ? 'Analyzing passport...' : 'Click to upload passport'}
            </p>
            <p className="text-xs text-gray-400">
              PDF, JPG, or PNG (max 5MB)
            </p>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="py-4 space-y-6">
          {/* Passport Info */}
          {passportData && <PassportInfoCard passport={passportData} />}

          {/* Form Fields */}
          <div className="space-y-4">
            <Select
              label="Visa type"
              placeholder="Select a visa type"
              options={visaOptions}
              value={formData.visaType}
              onChange={(value) => setFormData({ ...formData, visaType: value as VisaType })}
              leftIcon={<Globe className="w-4 h-4" />}
            />

            <Input
              label="Reference number"
              placeholder="Enter case's reference number"
              value={formData.referenceNumber}
              onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
              leftIcon={<Hash className="w-4 h-4" />}
            />

            <Select
              label="Advisor"
              options={userOptions}
              value={formData.advisorId}
              onChange={(value) => setFormData({ ...formData, advisorId: value })}
              leftIcon={<User className="w-4 h-4" />}
            />

            <Select
              label="Assistant"
              placeholder="Select assistant"
              options={[{ value: '', label: 'None' }, ...userOptions]}
              value={formData.assistantId}
              onChange={(value) => setFormData({ ...formData, assistantId: value })}
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Client email (optional)"
              placeholder="Enter client's email address"
              value={formData.clientEmail}
              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
              leftIcon={<Mail className="w-4 h-4" />}
            />
          </div>
        </div>
      )}

      {step === 'documents' && (
        <div className="py-4">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Upload any supporting documents for this case.
            </p>

            {/* Simple Drop Zone */}
            <div
              className={cn(
                'border-2 border-dashed rounded-xl p-6 text-center transition-all',
                isDragging
                  ? 'border-[#0E4369] bg-[#0E4369]/5'
                  : 'border-gray-200 hover:border-gray-300'
              )}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
                id="document-upload"
                onChange={handleFileSelect}
              />
              <label htmlFor="document-upload" className="cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Drop files here or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  PDF, JPG, PNG, DOC (max 20MB each)
                </p>
              </label>
            </div>

            {/* File List */}
            {supportingFiles.length > 0 && (
              <div className="space-y-2 mt-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Uploaded files ({supportingFiles.length})
                </p>
                {supportingFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {supportingFiles.length === 0 && (
              <p className="text-xs text-gray-400 text-center">
                You can skip this step and add documents later
              </p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
