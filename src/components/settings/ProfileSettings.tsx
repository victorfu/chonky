import { useState } from 'react';
import { User, Mail, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuthStore } from '@/stores/useAuthStore';

export function ProfileSettings() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) return;

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate save
    updateUser({ displayName: displayName.trim() });
    setIsSaving(false);
  };

  const hasChanges = displayName !== user?.displayName;

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-semibold mb-4">{t('settings.profile.profileInfo')}</h3>

        <div className="flex items-center gap-4 mb-6">
          <Avatar
            src={user?.avatarUrl}
            name={user?.displayName || t('settings.profile.unknown')}
            size="lg"
          />
          <div>
            <p className="font-medium">{user?.displayName}</p>
            <p className="text-sm text-base-content/60">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label={t('settings.profile.displayName')}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
          />

          <Input
            label={t('settings.profile.email')}
            value={user?.email || ''}
            disabled
            leftIcon={<Mail className="w-4 h-4" />}
          />
        </div>

        <div className="mt-6">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!hasChanges}
            loading={isSaving}
          >
            {t('settings.profile.saveChanges')}
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">{t('settings.profile.account')}</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg">
            <div>
              <p className="font-medium">{t('settings.profile.accountId')}</p>
              <p className="text-sm text-base-content/60 font-mono">{user?.id}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg">
            <div>
              <p className="font-medium">{t('settings.profile.memberSince')}</p>
              <p className="text-sm text-base-content/60">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : t('settings.profile.unknown')}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-error/20">
        <h3 className="font-semibold mb-4 text-error">{t('settings.profile.dangerZone')}</h3>

        <div className="flex items-center justify-between p-3 bg-error/5 rounded-lg">
          <div>
            <p className="font-medium">{t('settings.profile.logOut')}</p>
            <p className="text-sm text-base-content/60">
              {t('settings.profile.logOutDesc')}
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<LogOut className="w-4 h-4" />}
            onClick={() => setIsLogoutOpen(true)}
          >
            {t('settings.profile.logOut')}
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={logout}
        title={t('settings.profile.logOutConfirm.title')}
        message={t('settings.profile.logOutConfirm.message')}
        confirmText={t('settings.profile.logOut')}
        variant="danger"
      />
    </div>
  );
}
