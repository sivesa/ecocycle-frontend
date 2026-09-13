/**
 * Shared notifications mock data. Used by the shared NotificationBell
 * (rendered inside the shared AppHeader) for both the household and
 * collector builds.
 */

export type NotificationType = 'pickup' | 'payout' | 'alert' | 'system';

export interface MockNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: 'n1',
    type: 'pickup',
    title: 'Pickup Scheduled',
    body: 'Your aluminium can collection has been scheduled for tomorrow at 09:00.',
    time: '2 min ago',
    read: false,
  },
  {
    id: 'n2',
    type: 'payout',
    title: 'Payout Received',
    body: 'R24.50 credited to your wallet for the Cardboard Box collection.',
    time: '1 hr ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'alert',
    title: 'Verification Required',
    body: 'Collector Sipho is on the way to verify your PET Bottle waste.',
    time: '3 hrs ago',
    read: false,
  },
  {
    id: 'n4',
    type: 'system',
    title: 'New Recycling Tier',
    body: 'Congratulations! You have been promoted to Gold Recycler status.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 'n5',
    type: 'pickup',
    title: 'Pickup Complete',
    body: 'Your glass bottle pickup was completed. R18.00 will be credited shortly.',
    time: '2 days ago',
    read: true,
  },
  {
    id: 'n6',
    type: 'payout',
    title: 'Withdrawal Processed',
    body: 'R150.00 has been sent to your FNB account ending in 4821.',
    time: '3 days ago',
    read: true,
  },
  {
    id: 'n7',
    type: 'alert',
    title: 'Withdrawal Reuired',
    body: 'Collector from EcoCycle (pty) is on its way to verify you materials.',
    time: '3 min ago',
    read: false,
  },
];