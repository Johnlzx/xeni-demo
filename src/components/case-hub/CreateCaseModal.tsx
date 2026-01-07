'use client';

import { useState } from 'react';
import { Modal, Button, Input, Select } from '@/components/ui';
import { PassportInfoCard } from './PassportInfoCard';
import { Globe, Hash, User, FileText } from 'lucide-react';
import { VISA_TYPES } from '@/data/constants';
import { MOCK_USERS } from '@/data/users';
import type { PassportInfo, VisaType } from '@/types';

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCaseData) => void;
}

interface CreateCaseData {
  visaType: VisaType;
  referenceNumber: string;
  advisorId: string;
  assistantId?: string;
  passport: PassportInfo;
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
  const [step, setStep] = useState<'upload' | 'confirm'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [passportData, setPassportData] = useState<PassportInfo | null>(null);
  const [formData, setFormData] = useState({
    visaType: '' as VisaType | '',
    referenceNumber: '',
    advisorId: MOCK_USERS[0].id,
    assistantId: '',
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
      passport: passportData,
    });
    handleClose();
  };

  const handleClose = () => {
    setStep('upload');
    setPassportData(null);
    setFormData({
      visaType: '',
      referenceNumber: '',
      advisorId: MOCK_USERS[0].id,
      assistantId: '',
    });
    onClose();
  };

  const isFormValid = passportData && formData.visaType && formData.referenceNumber;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New Application"
      size="lg"
      footer={
        step === 'confirm' ? (
          <>
            <Button variant="outline" onClick={() => setStep('upload')}>
              Back
            </Button>
            <Button onClick={handleSubmit} disabled={!isFormValid}>
              Create Application
            </Button>
          </>
        ) : undefined
      }
    >
      {step === 'upload' && (
        <div className="py-6">
          {/* Upload Zone */}
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center hover:border-primary-300 hover:bg-primary-50/30 transition-all cursor-pointer"
            onClick={handleUpload}
          >
            <div className="w-16 h-16 bg-primary-50 rounded-xl mx-auto mb-4 flex items-center justify-center">
              {isUploading ? (
                <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileText className="w-8 h-8 text-primary-600" />
              )}
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {isUploading ? 'Analyzing passport...' : 'Upload passport to begin'}
            </p>
            <p className="text-xs text-gray-400">
              Click to browse or drag and drop
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
              placeholder="Enter application reference"
              value={formData.referenceNumber}
              onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
              leftIcon={<Hash className="w-4 h-4" />}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Advisor"
                options={userOptions}
                value={formData.advisorId}
                onChange={(value) => setFormData({ ...formData, advisorId: value })}
                leftIcon={<User className="w-4 h-4" />}
              />

              <Select
                label="Assistant"
                placeholder="None"
                options={[{ value: '', label: 'None' }, ...userOptions]}
                value={formData.assistantId}
                onChange={(value) => setFormData({ ...formData, assistantId: value })}
                leftIcon={<User className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
