// Directory: src/shared/layout
import type { PropsWithChildren, CSSProperties } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { COLORS } from '../theme/tokens';
import logo from '../assets/logo.png';

export interface AuthLayoutProps extends PropsWithChildren {
  heading: string;
  subheading?: string;
}

/**
 * Auth screens (login/signup) share this layout: a soft, greenhouse-like
 * atmosphere built from layered radial gradients, a film-grain overlay and
 * an oversized leaf frond watermark. Editorial Fraunces serif on the
 * heading gives the entry flow its own character vs. the in-app UI.
 */
export default function AuthLayout({ heading, subheading, children }: AuthLayoutProps) {
  return (
    <IonPage>
      <IonContent fullscreen scrollY={true} style={{ '--background': 'transparent' } as CSSProperties}>
        <div
          className="relative min-h-full w-full overflow-hidden"
          style={{ backgroundColor: COLORS.bg }}
        >
          {/* Atmosphere: layered green glows */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: [
                `radial-gradient(120% 90% at 85% -10%, rgba(79,143,99,0.35) 0%, transparent 55%)`,
                `radial-gradient(90% 70% at -10% 30%, rgba(201,138,59,0.16) 0%, transparent 55%)`,
                `radial-gradient(110% 80% at 50% 115%, rgba(51,92,64,0.18) 0%, transparent 60%)`,
              ].join(', '),
            }}
          />

          {/* Oversized frond watermark */}
          <svg
            aria-hidden
            viewBox="0 0 200 340"
            className="absolute -right-10 -top-2 w-56 h-96 text-moss opacity-[0.16] pointer-events-none"
            fill="currentColor"
          >
            <path d="M196 8C154 34 118 74 96 126c-14 33-21 68-22 102h-2c-2-30 2-64 12-96 20-64 60-112 112-124z" />
            <path d="M176 18c-8 30-22 56-42 80 6-32 16-60 32-82l10 2zM150 54c-3 24-12 46-26 66 4-24 12-46 24-66h2zM120 96c-1 16-6 32-14 46 2-16 6-32 12-46h2z" />
          </svg>

          {/* Film grain */}
          <div aria-hidden className="noise-overlay" />

          {/* Content */}
          <div className="relative z-10 min-h-full flex flex-col justify-center px-6 py-10 max-w-sm mx-auto w-full">
            <img
              src={logo}
              alt="EcoCycle logo"
              className="w-14 h-14 mb-6 animate-[logoIn_0.6s_cubic-bezier(0.22,1,0.36,1)]"
            />
            <h1
              className="font-serif-display text-[1.9rem] leading-tight font-semibold mb-2 animate-[authFade_0.6s_ease_0.1s_both]"
              style={{ color: COLORS.text }}
            >
              {heading}
            </h1>
            {subheading && (
              <p
                className="text-sm mb-7 animate-[authFade_0.6s_ease_0.18s_both]"
                style={{ color: COLORS.textMuted }}
              >
                {subheading}
              </p>
            )}
            <div className="animate-[authFade_0.6s_ease_0.26s_both]">{children}</div>
          </div>

          <style>{`
            @keyframes authFade {
              from { opacity: 0; transform: translateY(14px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes logoIn {
              from { opacity: 0; transform: scale(0.85) rotate(-6deg); }
              to { opacity: 1; transform: scale(1) rotate(0); }
            }
          `}</style>
        </div>
      </IonContent>
    </IonPage>
  );
}