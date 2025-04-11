import { observer } from 'mobx-react-lite';
import { auth } from '../firebase/persistence.js';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
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
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h1 className="mb-8 text-2xl font-semibold">Welcome to Quica</h1>
      <GoogleSignInButton onSignIn={handleGoogleSignIn} />
    </div>
  );
}

export default observer(AuthPresenter);
