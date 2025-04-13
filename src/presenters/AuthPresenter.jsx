import { observer } from 'mobx-react-lite';
import { auth } from '../firebase/persistence.js';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import AuthView from '../components/auth/AuthView';
import { myQuicaModel } from '../model/QuicaModel.js';

function AuthPresenter() {
  console.log('AuthPresenter render - user state:', myQuicaModel.user);
  
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Note: persistence.js's onAuthStateChanged will handle the model update
    } catch (error) {
      console.error('Google Sign-in Error:', error);
    }
  };

  return (
    <AuthView
      onGoogleSignIn={handleGoogleSignIn}
      teamMembers="Laieh Jwella and Bhavya Sehgal"
    />
  );
}

export default observer(AuthPresenter);
