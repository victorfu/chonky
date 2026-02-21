import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/hooks/useToast';

export function ProfileSettings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);
  const { success, error } = useToast();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) return;

    setIsSaving(true);
    try {
      await updateUser({ displayName: displayName.trim() });
      success(t('settings.profile.saveSuccess', 'Profile updated successfully'));
    } catch (err) {
      error(err instanceof Error ? err.message : t('settings.profile.saveError', 'Failed to save profile'));
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = displayName !== user?.displayName;
  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (err) {
      error(err instanceof Error ? err.message : t('settings.profile.logOutError', 'Failed to log out'));
    } finally {
      setIsLoggingOut(false);
      setIsLogoutOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card surface="surface">
        <h3 className="mb-4 text-base font-semibold">{t('settings.profile.profileInfo')}</h3>

        <div className="mb-6 flex items-center gap-4">
          <Avatar
            src={user?.avatarUrl}
            name={user?.displayName || t('settings.profile.unknown')}
            size="lg"
          />
          <div>
            <p className="font-medium">{user?.displayName}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
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

      <Card surface="surface">
        <h3 className="mb-4 text-base font-semibold">{t('settings.profile.account')}</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-border-hairline bg-background-elevated/60 p-3">
            <div>
              <p className="font-medium">{t('settings.profile.accountId')}</p>
              <p className="text-sm text-muted-foreground font-mono">{user?.id}</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border-hairline bg-background-elevated/60 p-3">
            <div>
              <p className="font-medium">{t('settings.profile.memberSince')}</p>
              <p className="text-sm text-muted-foreground">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : t('settings.profile.unknown')}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card surface="surface">
        <div className="flex items-center justify-between rounded-xl border border-border-hairline bg-background-elevated/60 p-3">
          <div>
            <p className="font-medium">{t('settings.profile.logOut')}</p>
            <p className="text-sm text-muted-foreground">
              {t('settings.profile.logOutDesc')}
            </p>
          </div>
          <Button
            variant="secondary"
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
        onClose={() => !isLoggingOut && setIsLogoutOpen(false)}
        onConfirm={handleLogout}
        title={t('settings.profile.logOutConfirm.title')}
        message={t('settings.profile.logOutConfirm.message')}
        confirmText={t('settings.profile.logOut')}
        variant="default"
        loading={isLoggingOut}
      />
    </div>
  );
}
