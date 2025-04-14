import { observer } from 'mobx-react-lite';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { myQuicaModel } from './model/QuicaModel.js';
import ProtectedRoute from './components/common/ProtectedRoute';
import AuthPresenter from './presenters/AuthPresenter';
import ProfileSetupPresenter from './presenters/ProfileSetupPresenter';
import HomePage from './presenters/HomePage';
import OrderTrackingPresenter from './presenters/OrderTrackingPresenter';

const App = observer(() => {
  const location = useLocation();
  const currentlyTrackedOrder = myQuicaModel.currentlyTrackedOrder;

  // If there's a tracked order and we're not already on the tracking page,
  // redirect to the tracking page
  if (currentlyTrackedOrder && !location.pathname.startsWith('/track-order')) {
    return <Navigate to={`/track-order/${currentlyTrackedOrder.id}`} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            <AuthPresenter />
          } 
        />

        {/* Protected routes that require auth but not profile */}
        <Route
          path="/setup-profile"
          element={
            <ProtectedRoute requiresProfile={false}>
              <ProfileSetupPresenter />
            </ProtectedRoute>
          }
        />

        {/* Order tracking route */}
        <Route
          path="/track-order/:orderId"
          element={
            <ProtectedRoute>
              <OrderTrackingPresenter />
            </ProtectedRoute>
          }
        />

        {/* Main application routes - require auth only */}
        <Route
          path="/*"
          element={
            <ProtectedRoute requiresAuth={true} requiresProfile={false}>
              <HomePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
});

export default App;
