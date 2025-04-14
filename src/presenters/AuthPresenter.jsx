import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/persistence.js';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import AuthView from '../components/auth/AuthView';
import { myQuicaModel } from '../model/QuicaModel.js';

function AuthPresenter() {
  const navigate = useNavigate();
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // The auth state change will be caught by persistence.js
      // After successful sign-in, let the router handle the redirection
      // based on profile completion status
      navigate('/');
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
