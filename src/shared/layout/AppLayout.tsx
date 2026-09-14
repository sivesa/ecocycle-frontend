// Directory: src/shared/layout
import type { PropsWithChildren } from 'react';
import type { CSSProperties } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import AppHeader from '../components/AppHeader';
import { COLORS } from '../theme/tokens';
import { SAMPLE_USER } from '../data/sampleUser';
import { useAuth } from '../context/AuthContext';
import type { AppUser } from '../types/user';

export interface AppLayoutProps extends PropsWithChildren {
  title?: string;
  subtitle?: string;
  backHref?: string;
  user?: AppUser;
}

/**
 * Every tab's page content goes inside this. AppHeader now operates
 * without a title/subtitle — the page header (if any) lives in the
 * page content area instead.
 */
export default function AppLayout({ backHref, user, children }: AppLayoutProps) {
  const { user: authedUser } = useAuth();
  const headerUser = user ?? authedUser ?? SAMPLE_USER;
  return (
    <IonPage>
      <AppHeader user={headerUser} backHref={backHref} />
      <IonContent fullscreen style={{ '--background': COLORS.bg } as CSSProperties}>
        <div className="px-5 pb-6 space-y-3">{children}</div>
      </IonContent>
    </IonPage>
  );
}