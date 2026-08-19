import { useState, useCallback } from 'react';

export interface ModalState {
  showShareConfirm: boolean;
  sharePendingContent: string;
  showContentWarning: boolean;
  contentWarningData: any;
  showSecurityDetailsModal: boolean;
  securityDetailsData: any;
  showQrModal: boolean;
  qrModalUrl: string;
  showPasswordWarning: boolean;
  showKeyboardWarning: boolean;
  showTravelerManual: boolean;
  manualDefaultTab: 'overview' | 'shortcuts';
  showSecurityShield: boolean;
}

export function useModalManager() {
  const [showShareConfirm, setShowShareConfirm] = useState(false);
  const [sharePendingContent, setSharePendingContent] = useState<string>('');

  const [showContentWarning, setShowContentWarning] = useState(false);
  const [contentWarningData, setContentWarningData] = useState<any>(null);

  const [showSecurityDetailsModal, setShowSecurityDetailsModal] = useState(false);
  const [securityDetailsData, setSecurityDetailsData] = useState<any>(null);

  const [showQrModal, setShowQrModal] = useState(false);
  const [qrModalUrl, setQrModalUrl] = useState('');

  const [showPasswordWarning, setShowPasswordWarning] = useState(false);
  const [showKeyboardWarning, setShowKeyboardWarning] = useState(false);
  const [showTravelerManual, setShowTravelerManual] = useState(false);
  const [manualDefaultTab, setManualDefaultTab] = useState<'overview' | 'shortcuts'>('overview');
  const [showSecurityShield, setShowSecurityShield] = useState(false);

  const handleOpenTravelerManual = useCallback((tab: 'overview' | 'shortcuts' = 'overview') => {
    setManualDefaultTab(tab);
    setShowTravelerManual(true);
  }, []);

  const openShareConfirm = useCallback((content: string) => {
    setSharePendingContent(content);
    setShowShareConfirm(true);
  }, []);

  const closeShareConfirm = useCallback(() => {
    setShowShareConfirm(false);
    setSharePendingContent('');
  }, []);

  const openContentWarning = useCallback((data: any) => {
    setContentWarningData(data);
    setShowContentWarning(true);
  }, []);

  const closeContentWarning = useCallback(() => {
    setShowContentWarning(false);
    setContentWarningData(null);
  }, []);

  const openSecurityDetails = useCallback((data: any) => {
    setSecurityDetailsData(data);
    setShowSecurityDetailsModal(true);
  }, []);

  const closeSecurityDetails = useCallback(() => {
    setShowSecurityDetailsModal(false);
    setSecurityDetailsData(null);
  }, []);

  const openQrModal = useCallback((url: string) => {
    setQrModalUrl(url);
    setShowQrModal(true);
  }, []);

  const closeQrModal = useCallback(() => {
    setShowQrModal(false);
    setQrModalUrl('');
  }, []);

  return {
    showShareConfirm,
    setShowShareConfirm,
    sharePendingContent,
    setSharePendingContent,
    openShareConfirm,
    closeShareConfirm,

    showContentWarning,
    setShowContentWarning,
    contentWarningData,
    setContentWarningData,
    openContentWarning,
    closeContentWarning,

    showSecurityDetailsModal,
    setShowSecurityDetailsModal,
    securityDetailsData,
    setSecurityDetailsData,
    openSecurityDetails,
    closeSecurityDetails,

    showQrModal,
    setShowQrModal,
    qrModalUrl,
    setQrModalUrl,
    openQrModal,
    closeQrModal,

    showPasswordWarning,
    setShowPasswordWarning,
    showKeyboardWarning,
    setShowKeyboardWarning,
    showTravelerManual,
    setShowTravelerManual,
    manualDefaultTab,
    setManualDefaultTab,
    handleOpenTravelerManual,
    showSecurityShield,
    setShowSecurityShield,
  };
}
