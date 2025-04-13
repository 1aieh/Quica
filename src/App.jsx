import { observer } from 'mobx-react-lite';
import { myQuicaModel } from './model/QuicaModel.js';
import { signOut } from 'firebase/auth';
import { auth } from './firebase/persistence.js';
import AuthPresenter from './presenters/AuthPresenter';
import ProfileSetupPresenter from './presenters/ProfileSetupPresenter';
import HomePage from './presenters/HomePage';
import OrderTrackingPresenter from './presenters/OrderTrackingPresenter';

const App = observer(() => {
  const user = myQuicaModel.user;
  const userProfile = myQuicaModel.userProfile;
  const isProfileSetupComplete = myQuicaModel.isProfileSetupComplete;

  console.log('App render - user state:', user);
  console.log('App render - userProfile:', userProfile);

  // Determine what to render based on user state and active order
  const renderContent = () => {
    // Loading state - waiting for auth
    if (user === undefined) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      );
    }

    // Not logged in - show auth
    if (user === null) {
      return <AuthPresenter />;
    }

    // Logged in but profile incomplete - show setup
    if (!isProfileSetupComplete) {
      return <ProfileSetupPresenter />;
    }

    // Check for active order - takes precedence over normal home view
    if (myQuicaModel.currentlyTrackedOrder) {
      return <OrderTrackingPresenter />;
    }

    // Default - show home page
    return <HomePage />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderContent()}
    </div>
  );
});

export default App;
