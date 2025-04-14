import { observer } from 'mobx-react-lite';
import { Navigate } from 'react-router-dom';
import { myQuicaModel } from '../../model/QuicaModel';

const ProtectedRoute = observer(({ children, requiresAuth = true, requiresProfile = true }) => {
  const { user, authInitialized, isProfileSetupComplete } = myQuicaModel;

  // Show loading state until Firebase has initialized
  if (!authInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Only check auth requirements after Firebase has initialized
  if (requiresAuth) {
    // Not logged in - redirect to auth
    if (user === null) {
      return <Navigate to="/login" replace />;
    }

    // Logged in but profile incomplete - redirect to setup
    if (requiresProfile && !isProfileSetupComplete) {
      return <Navigate to="/setup-profile" replace />;
    }
  }

  // All conditions met - render children
  return children;
});

export default ProtectedRoute;
