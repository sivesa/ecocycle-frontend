import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet } from '@ionic/react';
import { Redirect, Route } from 'react-router-dom';
import { home, homeOutline, list, listOutline, navigate, navigateOutline, cash, cashOutline } from 'ionicons/icons';

import CollecthomeScreen from './pages/CollectorHomeScreen';
import PickupQueueScreen from './pages/PickupQueueScreen';
import ActiveRouteScreen from './pages/ActiveRouteScreen';
import EarningsScreen from './pages/EarningsScreen';

interface TabDefinition {
  path: string;
  label: string;
  icon: string;
  iconActive: string;
}

const TABS: TabDefinition[] = [
  { path: '/tabs/home', label: 'Home', icon: homeOutline, iconActive: home },
  { path: '/tabs/queue', label: 'Queue', icon: listOutline, iconActive: list },
  { path: '/tabs/route', label: 'Route', icon: navigateOutline, iconActive: navigate },
  { path: '/tabs/earnings', label: 'Earnings', icon: cashOutline, iconActive: cash },
];

export default function CollectoTabs() {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/tabs/home" component={CollecthomeScreen} />
        <Route exact path="/tabs/queue" component={PickupQueueScreen} />
        <Route exact path="/tabs/route" component={ActiveRouteScreen} />
        <Route exact path="/tabs/earnings" component={EarningsScreen} />
        <Route exact path="/tabs">
          <Redirect to="/tabs/home" />
        </Route>
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        {TABS.map((tab) => (
          <IonTabButton key={tab.path} tab={tab.path} href={tab.path}>
            <IonIcon icon={tab.icon} />
            <IonLabel>{tab.label}</IonLabel>
          </IonTabButton>
        ))}
      </IonTabBar>
    </IonTabs>
  );
}