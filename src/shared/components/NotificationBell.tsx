// Directory: src/shared/components
import { useRef } from 'react';
import { Bell } from 'lucide-react';
import { IonPopover } from '@ionic/react';
import { MOCK_NOTIFICATIONS } from '../data/mockNotifications';
import { COLORS, DISPLAY_FONT } from '../theme/tokens';
import type { NotificationType } from '../data/mockNotifications';

const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  pickup: '🚛',
  payout: '💰',
  alert: '⚠️',
  system: '✨',
};

const NOTIFICATION_ACCENT: Record<NotificationType, string> = {
  pickup: COLORS.sky,
  payout: COLORS.mossLight,
  alert: COLORS.kraft,
  system: COLORS.moss,
};

export default function NotificationBell() {
  const popoverRef = useRef<HTMLIonPopoverElement>(null);
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <>
      <button
        aria-label={`Notifications — ${unreadCount} unread`}
        onClick={(e) => popoverRef.current?.present(e.nativeEvent)}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95"
        style={{
          backgroundColor: `${COLORS.moss}12`,
          border: `1px solid ${COLORS.moss}22`,
        }}
      >
        <Bell size={18} color={COLORS.moss} strokeWidth={2.2} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{
              backgroundColor: COLORS.danger,
              color: '#fff',
              border: `2px solid ${COLORS.bg}`,
              ...DISPLAY_FONT,
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      <IonPopover ref={popoverRef} side="bottom" alignment="end">
        <div className="w-80 max-h-[70vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <h3
              className="text-[15px] font-semibold"
              style={{ color: COLORS.text, ...DISPLAY_FONT }}
            >
              Notifications
            </h3>
            <button
              type="button"
              onClick={() => {
                popoverRef.current?.dismiss();
              }}
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: COLORS.moss }}
            >
              Mark all read
            </button>
          </div>

          <div className="h-px" style={{ backgroundColor: COLORS.border }} />

          {/* Notification list */}
          <div className="overflow-y-auto overscroll-contain">
            {MOCK_NOTIFICATIONS.map((n, i) => (
              <div
                key={n.id}
                className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-black/[0.02]"
                style={{
                  borderBottom: i < MOCK_NOTIFICATIONS.length - 1 ? `1px solid ${COLORS.border}` : undefined,
                  backgroundColor: n.read ? undefined : `${COLORS.moss}06`,
                }}
              >
                <span className="text-lg leading-none mt-0.5 shrink-0">
                  {NOTIFICATION_ICONS[n.type]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p
                      className="text-[13px] font-semibold leading-tight truncate"
                      style={{ color: COLORS.text }}
                    >
                      {n.title}
                    </p>
                    {!n.read && (
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: NOTIFICATION_ACCENT[n.type] }}
                      />
                    )}
                  </div>
                  <p
                    className="text-[12px] leading-snug mb-1 line-clamp-2"
                    style={{ color: COLORS.textMuted }}
                  >
                    {n.body}
                  </p>
                  <p
                    className="text-[11px]"
                    style={{ color: `${COLORS.textMuted}AA` }}
                  >
                    {n.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </IonPopover>
    </>
  );
}