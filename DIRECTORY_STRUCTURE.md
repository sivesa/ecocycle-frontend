# Directory Structure

```text
.
├── android/                        # Android platform files (Capacitor)
├── ios/                            # iOS platform files (Capacitor)
├── src/                            # Source code
│   ├── features/                   # Feature-based modules
│   │   ├── collector/              # Collector-specific functionality
│   │   │   ├── data/               # Mock and sample data
│   │   │   │   ├── mockData.ts
│   │   │   │   ├── mockRequests.ts
│   │   │   │   └── sampleCollector.ts
│   │   │   ├── pages/              # Collector screens
│   │   │   │   ├── ActiveRouteScreen.tsx
│   │   │   │   ├── CollectorHomeScreen.tsx
│   │   │   │   ├── CollectorPendingApprovalScreen.tsx
│   │   │   │   ├── CollectorSignInScreen.tsx
│   │   │   │   ├── CollectorSignUpScreen.tsx
│   │   │   │   ├── EarningsScreen.tsx
│   │   │   │   ├── PickupQueueScreen.tsx
│   │   │   │   └── PlaceholderScreen.tsx
│   │   │   ├── service/            # Collector business logic
│   │   │   │   └── onboardingService.ts
│   │   │   ├── types/              # Collector type definitions
│   │   │   │   ├── collectionStatus.ts
│   │   │   │   ├── collectorApplication.ts
│   │   │   │   ├── collectorOnboarding.ts
│   │   │   │   └── vehicle.ts
│   │   │   └── Tabs.tsx            # Collector navigation tabs
│   │   └── household/              # Household-specific functionality
│   │       ├── data/               # Mock and sample data
│   │       │   └── mockData.ts
│   │       ├── pages/               # Household screens
│   │       │   ├── ActivationScreen.tsx
│   │       │   ├── EducationScreen.tsx
│   │       │   ├── HomeScreen.tsx
│   │       │   ├── LoginScreen.tsx
│   │       │   ├── PlaceholderScreen.tsx
│   │       │   ├── SignUpScreen.tsx
│   │       │   ├── WalletScreen.tsx
│   │       │   └── WasteInventoryScreen.tsx
│   │       ├── service/            # Household business logic
│   │       │   └── onboardingService.ts
│   │       ├── types/              # Household type definitions
│   │       │   ├── activation.ts
│   │       │   └── householdOnboarding.ts
│   │       └── Tabs.tsx            # Household navigation tabs
│   ├── shared/                     # Shared components and utilities
│   │   ├── assets/                 # Static assets
│   │   │   ├── banks/              # Bank logos
│   │   │   ├── icons/              # UI icons
│   │   │   ├── materials/          # Material images
│   │   │   ├── user/                # User avatars
│   │   │   └── logo.png            # Application logo
│   │   ├── components/             # Reusable UI components
│   │   │   ├── AppHeader.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── DepositInstructionsModal.tsx
│   │   │   ├── NotificationBell.tsx
│   │   │   ├── OtpModal.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── TextField.tsx
│   │   │   └── UserMenu.tsx
│   │   ├── context/                # React Context providers
│   │   │   └── AuthContext.tsx
│   │   ├── data/                   # Shared mock and sample data
│   │   │   ├── mockNotifications.ts
│   │   │   ├── mockUsers.ts
│   │   │   └── sampleUser.ts
│   │   ├── layout/                 # Shared layout components
│   │   │   ├── AppLayout.tsx
│   │   │   └── AuthLayout.tsx
│   │   ├── pages/                  # Shared pages
│   │   │   └── PlaceholderScreen.tsx
│   │   ├── payment/                # Payment related utilities
│   │   ├── service/                # Shared services
│   │   │   ├── authStorage.ts
│   │   │   ├── httpClient.ts
│   │   │   ├── onboardingService.ts
│   │   │   ├── paymentService.ts
│   │   │   ├── paystackInline.ts
│   │   │   ├── WastePayment.ts
│   │   │   └── algorandService.ts
│   │   ├── theme/                   # Styling and tokens
│   │   │   ├── tailwind.css
│   │   │   └── tokens.ts
│   │   └── types/                  # Shared type definitions
│   │       ├── activation.ts
│   │       ├── algorand.types.ts
│   │       ├── collection.ts
│   │       ├── onboarding.ts
│   │       ├── payment.ts
│   │       └── user.ts
│   ├── App.collector.tsx            # Collector app entry component
│   ├── App.household.tsx            # Household app entry component
│   ├── main.collector.tsx           # Collector app main entry point
│   ├── main.household.tsx          # Household app main entry point
│   └── vite-env.d.ts               # Vite environment declarations
├── capacitor.config.ts             # Capacitor configuration
├── index.collector.html             # Entry HTML for Collector app
├── index.household.html             # Entry HTML for Household app
├── package.json                    # Project dependencies and scripts
├── postcss.config.js                # PostCSS configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
└── vite.*.config.{ts,js}            # Vite configurations (base, collector, household)
```
