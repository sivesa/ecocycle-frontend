// Directory: src
/* Importing Ionic core first is required — Vite will warn otherwise. */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './shared/theme/tailwind.css';

import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';

import Tabs from './features/collector/Tabs';
import PlaceholderScreen from './features/collector/pages/PlaceholderScreen';
import CollectorSignInScreen from './features/collector/pages/CollectorSignInScreen';
import CollectorSignUpScreen from './features/collector/pages/CollectorSignUpScreen';
import CollectorPendingApprovalScreen from './features/collector/pages/CollectorPendingApprovalScreen';

setupIonicReact();

/**
 * Collector build. No household login flow here — collectors use the
 * shared AppLayout directly (see features/collector/data/sampleCollector).
 * Authentication (PIN/SSO) for collectors will slot in as a route wrapper.
 */
function CollectorRoutes() {
  return (
    <IonRouterOutlet>
      <Route exact path="/login">
        <CollectorSignInScreen />
      </Route>
      <Route exact path="/signup" component={CollectorSignUpScreen} />
      <Route exact path="/activate">
        <Redirect to="/pending" />
      </Route>

      <Route exact path="/pending" component={CollectorPendingApprovalScreen} />

      {/* Reached from the header's account dropdown — placeholders for now */}
      <Route exact path="/account/edit-profile">
        <PlaceholderScreen title="Edit Profile" message="Collector profile screen — coming soon." backHref="/tabs/queue" />
      </Route>
      <Route exact path="/account/settings">
        <PlaceholderScreen title="Account Settings" message="Collector account settings — coming soon." backHref="/tabs/queue" />
      </Route>
      <Route exact path="/support">
        <PlaceholderScreen title="Support" message="Collector support — coming soon." backHref="/tabs/queue" />
      </Route>

      <Route path="/tabs" component={Tabs} />

      <Route exact path="/">
        <Redirect to="/tabs/queue" />
      </Route>
    </IonRouterOutlet>
  );
}

export default function CollectorApp() {
  return (
    <IonApp>
      <IonReactRouter>
        <CollectorRoutes />
      </IonReactRouter>
    </IonApp>
  );
}