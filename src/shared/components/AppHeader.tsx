import type { CSSProperties } from 'react';
import { IonHeader, IonToolbar, IonBackButton } from '@ionic/react';
import { COLORS } from '../theme/tokens';
import UserMenu from './UserMenu';
import NotificationBell from './NotificationBell';
import type { AppUser } from '../types/user';
import logo from '../assets/logo.png';

export interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  user: AppUser;
  backHref?: string;
}

export default function AppHeader({ user, backHref }: AppHeaderProps) {
  return (
    <IonHeader className="ion-no-border">
      <IonToolbar style={{ '--background': COLORS.bg, '--border-width': '0' } as CSSProperties}>
        <div className="px-5 pt-2 pb-3 flex items-center gap-3">
          {backHref ? (
            <IonBackButton
              defaultHref={backHref}
              text=""
              style={{ color: COLORS.text, '--min-height': '2.25rem' } as CSSProperties}
            />
          ) : (
            <img src={logo} alt="EcoCycle logo" className="w-16 h-16 shrink-0 object-contain" />
          )}

          <div className="flex-1 min-w-0" />

          <NotificationBell />
          <UserMenu user={user} />
        </div>
      </IonToolbar>
    </IonHeader>
  );
}