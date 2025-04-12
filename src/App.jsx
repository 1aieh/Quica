import { observer } from 'mobx-react-lite';
import { myQuicaModel } from './model/QuicaModel.js';
import { signOut } from 'firebase/auth';
import { auth } from './firebase/persistence.js';
import AuthPresenter from './presenters/AuthPresenter';
import ProfileSetupPresenter from './presenters/ProfileSetupPresenter';
import HomePage from './presenters/HomePage';

const App = observer(() => {
  const user = myQuicaModel.user;
  const userProfile = myQuicaModel.userProfile;
  const isProfileSetupComplete = myQuicaModel.isProfileSetupComplete;

  console.log('App render - user state:', user);
  console.log('App render - userProfile:', userProfile);

  return (
    <div className="container mx-auto px-4 py-8">
      {user === undefined ? (
        <div>Loading...</div>
      ) : user === null ? (
        <AuthPresenter />
      ) : !isProfileSetupComplete ? (
        <ProfileSetupPresenter />
      ) : (
        <HomePage />
      )}
    </div>
  );
});

export default App;
