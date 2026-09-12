import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet } from '@ionic/react';
import { Redirect, Route } from 'react-router-dom';
import { home, homeOutline, reload, reloadOutline, wallet, walletOutline, school, schoolOutline } from 'ionicons/icons';

import HomeScreen from './pages/HomeScreen';
import WasteInventoryScreen from './pages/WasteInventoryScreen';
import WalletScreen from './pages/WalletScreen';
import EducationScreen from './pages/EducationScreen';

interface TabDefinition {
  path: string;
  label: string;
  icon: string;
  iconActive: string;
}

const TABS: TabDefinition[] = [
  { path: '/tabs/home', label: 'Home', icon: homeOutline, iconActive: home },
  { path: '/tabs/waste-inventory', label: 'Waste Inventory', icon: reloadOutline, iconActive: reload },
  { path: '/tabs/wallet', label: 'Wallet', icon: walletOutline, iconActive: wallet },
  { path: '/tabs/education', label: 'Education', icon: schoolOutline, iconActive: school },
];

export default function Tabs() {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/tabs/home" component={HomeScreen} />
        <Route exact path="/tabs/waste-inventory" component={WasteInventoryScreen} />
        <Route exact path="/tabs/wallet" component={WalletScreen} />
        <Route exact path="/tabs/education" component={EducationScreen} />
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
