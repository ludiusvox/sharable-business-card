import { useCallback, useEffect, useState } from 'react';
import { BootSetupScreen } from './components/BootSetupScreen';
import { BottomNav } from './components/BottomNav';
import { CardDetailsTab } from './components/CardDetailsTab';
import { NfcBroadcastView } from './components/NfcBroadcastView';
import { ShareSheetModal } from './components/ShareSheetModal';
import { ShareTab } from './components/ShareTab';
import { TopBar } from './components/TopBar';
import { WalletPassModal } from './components/WalletPassModal';
import { WalletSyncTab } from './components/WalletSyncTab';
import {
  createEmptyProfile,
  DEFAULT_RULES,
  DEFAULT_WALLET_STATE,
} from './data/defaults';
import {
  AppTab,
  BroadcastRules,
  CardProfile,
  RedactableField,
  WalletSyncState,
} from './types/card';
import {
  buildShareLink,
  copyText,
  downloadVCard,
  shareVCard,
} from './utils/vcard';

const STORAGE_KEYS = {
  setupComplete: 'sovereign_id_setup_complete_v2',
  profile: 'sovereign_id_profile_v2',
  rules: 'sovereign_id_rules_v2',
  wallet: 'sovereign_id_wallet_v2',
};

function readStoredObject<T>(key: string, fallbackFactory: () => T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallbackFactory();
    return { ...fallbackFactory(), ...JSON.parse(raw) };
  } catch {
    return fallbackFactory();
  }
}

function readSetupComplete(profile: CardProfile): boolean {
  try {
    return (
      localStorage.getItem(STORAGE_KEYS.setupComplete) === 'true' &&
      Boolean(profile.fullName.trim())
    );
  } catch {
    return false;
  }
}

export default function App() {
  const [profile, setProfile] = useState<CardProfile>(() =>
    readStoredObject(STORAGE_KEYS.profile, createEmptyProfile)
  );
  const [setupComplete, setSetupComplete] = useState<boolean>(() =>
    readSetupComplete(readStoredObject(STORAGE_KEYS.profile, createEmptyProfile))
  );
  const [activeTab, setActiveTab] = useState<AppTab>('share');
  const [rules, setRules] = useState<BroadcastRules>(() =>
    readStoredObject(STORAGE_KEYS.rules, () => DEFAULT_RULES)
  );
  const [walletState, setWalletState] = useState<WalletSyncState>(() =>
    readStoredObject(STORAGE_KEYS.wallet, () => DEFAULT_WALLET_STATE)
  );

  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [nfcBroadcastOpen, setNfcBroadcastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
    } catch {
      // Ignore storage quota errors
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.rules, JSON.stringify(rules));
    } catch {
      // Ignore storage quota errors
    }
  }, [rules]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.wallet, JSON.stringify(walletState));
    } catch {
      // Ignore storage quota errors
    }
  }, [walletState]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.setupComplete, setupComplete ? 'true' : 'false');
    } catch {
      // Ignore storage quota errors
    }
  }, [setupComplete]);

  const notify = useCallback((message: string) => {
    setToastMessage(message);
    window.clearTimeout((window as unknown as { __sovToast?: number }).__sovToast);
    (window as unknown as { __sovToast?: number }).__sovToast = window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  const handleCompleteBootSetup = (createdProfile: CardProfile) => {
    setProfile(createdProfile);
    setRules((prev) => ({
      ...prev,
      includeCompanyInWallet: Boolean(createdProfile.company.trim()) || prev.includeCompanyInWallet,
    }));
    setSetupComplete(true);
    setActiveTab('share');
    notify('Your digital business card is ready to share');
  };

  const handleCopy = async (text: string, label: string) => {
    if (!text.trim()) {
      notify(`${label} is not set yet`);
      return;
    }
    const ok = await copyText(text);
    notify(ok ? `${label} copied to clipboard` : `Unable to copy ${label}`);
  };

  const handleCopyShareLink = async () => {
    const url = buildShareLink(profile);
    const ok = await copyText(url);
    notify(ok ? 'Shareable digital card link copied' : 'Unable to copy link');
  };

  const handleDownloadVCard = async () => {
    const shared = await shareVCard(profile, rules.redactedFields, rules.includeCompanyInWallet);
    if (shared) {
      notify(`Shared ${profile.fullName || 'sovereign-id'} vCard via Nearby Share`);
    } else {
      notify(`Downloaded ${profile.fullName || 'sovereign-id'} vCard (.vcf)`);
    }
  };

  const handleSyncWallet = useCallback(() => {
    setWalletState({
      status: 'syncing',
      lastSyncedLabel: 'Compiling Google Wallet pass...',
    });
    setTimeout(() => {
      setWalletState({
        status: 'linked',
        lastSyncedLabel: 'Synchronized just now',
      });
      notify('Pass synced to Google Wallet');
    }, 900);
  }, [notify]);

  const handleRemoveFromWallet = () => {
    setWalletState({
      status: 'removed',
      lastSyncedLabel: 'Removed from handset Wallet',
    });
    notify('Pass removed from Google Wallet');
  };

  const handleSaveCardDetails = (nextProfile: CardProfile, nextRules: BroadcastRules) => {
    setProfile(nextProfile);
    setRules(nextRules);
    if (nextRules.autoUpdateWallet && walletState.status === 'linked') {
      setWalletState({
        status: 'linked',
        lastSyncedLabel: 'Auto-synced with updated card details',
      });
    }
    notify('Card details saved & pass payload updated');
  };

  const handleToggleRule = (
    key: 'autoUpdateWallet' | 'lockscreenShortcut' | 'nearbyAutoTrigger'
  ) => {
    setRules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleRedact = (field: RedactableField) => {
    setRules((prev) => {
      const exists = prev.redactedFields.includes(field);
      return {
        ...prev,
        redactedFields: exists
          ? prev.redactedFields.filter((f) => f !== field)
          : [...prev.redactedFields, field],
      };
    });
  };

  const handleOpenAndroidShare = async () => {
    const shareUrl = buildShareLink(profile);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.fullName} — Digital Business Pass`,
          text: `${profile.title}${profile.company ? ` · ${profile.company}` : ''}`,
          url: shareUrl,
        });
        return;
      } catch {
        // Fall back to custom Android Fast Exchange sheet if cancelled or blocked in iframe
      }
    }
    setShareSheetOpen(true);
  };

  const handleResetSetup = () => {
    const freshProfile = createEmptyProfile();
    setProfile(freshProfile);
    setRules(DEFAULT_RULES);
    setWalletState(DEFAULT_WALLET_STATE);
    setShareSheetOpen(false);
    setWalletModalOpen(false);
    setNfcBroadcastOpen(false);
    setSetupComplete(false);
    setActiveTab('share');
  };

  // Boot-up screen loads on startup whenever no personal card has been initialized yet
  if (!setupComplete) {
    return (
      <BootSetupScreen
        initialProfile={profile}
        onComplete={handleCompleteBootSetup}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNfcBroadcast={() => setNfcBroadcastOpen(true)}
        onDownloadVCard={handleDownloadVCard}
        onCopyShareLink={handleCopyShareLink}
        onResetSetup={handleResetSetup}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto pt-18 lg:pt-24 pb-24 lg:pb-12 px-4 lg:px-8">
        {activeTab === 'share' && (
          <ShareTab
            profile={profile}
            rules={rules}
            walletState={walletState}
            onEditCard={() => setActiveTab('card')}
            onOpenShareSheet={handleOpenAndroidShare}
            onOpenNfcBeam={() => setNfcBroadcastOpen(true)}
            onSyncWallet={handleSyncWallet}
            onOpenWalletModal={() => setWalletModalOpen(true)}
            onCopyText={handleCopy}
            onDownloadVCard={handleDownloadVCard}
          />
        )}

        {activeTab === 'card' && (
          <CardDetailsTab
            profile={profile}
            rules={rules}
            onSave={handleSaveCardDetails}
          />
        )}

        {activeTab === 'wallet' && (
          <WalletSyncTab
            profile={profile}
            rules={rules}
            walletState={walletState}
            onToggleRule={handleToggleRule}
            onSyncNow={handleSyncWallet}
            onOpenWalletModal={() => setWalletModalOpen(true)}
            onRemoveFromWallet={handleRemoveFromWallet}
            onDownloadVCard={handleDownloadVCard}
          />
        )}
      </main>

      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

      <ShareSheetModal
        isOpen={shareSheetOpen}
        profile={profile}
        onClose={() => setShareSheetOpen(false)}
        onTriggerNearbyShare={() => setNfcBroadcastOpen(true)}
        onDownloadVCard={handleDownloadVCard}
        onCopyLink={handleCopyShareLink}
      />

      <WalletPassModal
        isOpen={walletModalOpen}
        profile={profile}
        includeCompany={rules.includeCompanyInWallet}
        onClose={() => setWalletModalOpen(false)}
        onDownloadVCard={handleDownloadVCard}
      />

      {nfcBroadcastOpen && (
        <NfcBroadcastView
          profile={profile}
          rules={rules}
          onBack={() => setNfcBroadcastOpen(false)}
          onToggleRedact={handleToggleRedact}
          onCopyLink={handleCopyShareLink}
          onDownloadVCard={handleDownloadVCard}
          onPushToWallet={() => {
            handleSyncWallet();
          }}
          onNotify={notify}
        />
      )}

      {/* Global Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-[60] max-w-[90vw] px-4 py-2.5 rounded-xl bg-surface-container-highest text-on-surface text-xs font-semibold shadow-2xl border border-primary/30 flex items-center gap-2 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
          <span className="truncate">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
