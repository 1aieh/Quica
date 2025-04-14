import { observer } from 'mobx-react-lite';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import AuthPresenter from './presenters/AuthPresenter';
import ProfileSetupPresenter from './presenters/ProfileSetupPresenter';
import HomePage from './presenters/HomePage';

const App = observer(() => {
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
