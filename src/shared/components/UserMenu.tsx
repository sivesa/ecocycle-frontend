import { useRef } from 'react';
import type { ComponentType, MouseEvent } from 'react';
import { IonPopover } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { UserRound, Settings2, LifeBuoy, LogOut } from 'lucide-react';
import { COLORS, DISPLAY_FONT } from '../theme/tokens';
import { useAuth } from '../context/AuthContext';
import type { AppUser } from '../types/user';

export interface UserMenuProps {
  user: AppUser;
}

interface MenuItem {
  label: string;
  icon: ComponentType<{ size?: number | string; color?: string }>;
  onClick: () => void;
  danger?: boolean;
}

function getInitials({ firstName, lastName }: AppUser): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function UserMenu({ user }: UserMenuProps) {
  const history = useHistory();
  const { logout } = useAuth();
  const popoverRef = useRef<HTMLIonPopoverElement>(null);
  const initials = getInitials(user);

  const go = (path: string) => {
    popoverRef.current?.dismiss();
    history.push(path);
  };

  const signOut = () => {
    popoverRef.current?.dismiss();
    logout();
    history.replace('/login');
  };

  const openMenu = (e: MouseEvent<HTMLButtonElement>) => {
    popoverRef.current?.present(e.nativeEvent);
  };

  const items: MenuItem[] = [
    { label: 'Edit Profile', icon: UserRound, onClick: () => go('/account/edit-profile') },
    { label: 'Account Settings', icon: Settings2, onClick: () => go('/account/settings') },
    { label: 'Support', icon: LifeBuoy, onClick: () => go('/support') },
    { label: 'Sign Out', icon: LogOut, onClick: signOut, danger: true },
  ];

  return (
    <>
      <button
        aria-label="Account menu"
        onClick={openMenu}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold shrink-0 transition-all duration-200 active:scale-95"
        style={{
          backgroundColor: COLORS.moss,
          color: '#fff',
          border: `1px solid ${COLORS.moss}DD`,
          ...DISPLAY_FONT,
        }}
      >
        {initials}
      </button>

      <IonPopover ref={popoverRef} side="bottom" alignment="end">
        <div className="w-64">
          {/* Profile header */}
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{
                  backgroundColor: `${COLORS.moss}1A`,
                  color: COLORS.moss,
                  border: `2px solid ${COLORS.moss}33`,
                  ...DISPLAY_FONT,
                }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p
                  className="text-[14px] font-semibold truncate leading-tight"
                  style={{ color: COLORS.text }}
                >
                  {user.firstName} {user.lastName}
                </p>
                <p
                  className="text-[12px] truncate mt-0.5"
                  style={{ color: COLORS.textMuted }}
                >
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px mx-4" style={{ backgroundColor: COLORS.border }} />

          {/* Menu items */}
          <div className="py-2 px-3">
            {items.map(({ label, icon: Icon, onClick: handler, danger }) => (
              <button
                key={label}
                onClick={handler}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-left transition-all duration-150"
                style={{
                  color: danger ? COLORS.danger : COLORS.text,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = danger
                    ? `${COLORS.danger}10`
                    : `${COLORS.moss}0A`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </IonPopover>
    </>
  );
}