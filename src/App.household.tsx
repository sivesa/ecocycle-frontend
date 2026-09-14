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

import { AuthProvider, useAuth } from './shared/context/AuthContext';
import LoginScreen from './features/household/pages/LoginScreen';
import SignUpScreen from './features/household/pages/SignUpScreen';
import ActivationScreen from './features/household/pages/ActivationScreen';
import PlaceholderScreen from './features/household/pages/PlaceholderScreen';
import Tabs from './features/household/Tabs';

setupIonicReact();

/**
 * Guards the household tabs behind the mock auth flow. Users who aren't
 * signed in (and have no stored session) are sent back to /login.
 */
function ProtectedTabs() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Tabs /> : <Redirect to="/login" />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <IonRouterOutlet>
      <Route exact path="/login">
        {isAuthenticated ? <Redirect to="/tabs/home" /> : <LoginScreen />}
      </Route>
      <Route exact path="/signup" component={SignUpScreen} />
      <Route exact path="/activate">
        <ActivationScreen successHref="/tabs/home" />
      </Route>

      {/* Reached from the header's account dropdown — placeholders for now */}
      <Route exact path="/account/edit-profile">
        <PlaceholderScreen title="Edit Profile" message="Edit profile screen — coming next." backHref="/tabs/home" />
      </Route>
      <Route exact path="/account/settings">
        <PlaceholderScreen title="Account Settings" message="Account settings screen — coming next." backHref="/tabs/home" />
      </Route>
      <Route exact path="/support">
        <PlaceholderScreen title="Support" message="Support screen — coming next." backHref="/tabs/home" />
      </Route>

      <Route path="/tabs" component={ProtectedTabs} />

      <Route exact path="/">
        <Redirect to={isAuthenticated ? '/tabs/home' : '/login'} />
      </Route>
    </IonRouterOutlet>
  );
}

export default function HouseholdApp() {
  return (
    <IonApp>
      <AuthProvider>
        <IonReactRouter>
          <AppRoutes />
        </IonReactRouter>
      </AuthProvider>
    </IonApp>
  );
}