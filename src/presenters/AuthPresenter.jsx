// TODO: Import auth object once Bhavya provides firebaseConfig.js and persistence.js
// import { auth } from '../firebase/persistence';
// import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';

const AuthPresenter = () => {
  const handleGoogleSignIn = async () => {
    // TODO: Implement once auth is available
    console.log('Google Sign-in clicked - waiting for auth implementation');
    
    // Implementation will be:
    // try {
    //   const provider = new GoogleAuthProvider();
    //   await signInWithPopup(auth, provider);
    //   // Note: persistence.js's onAuthStateChanged will handle the model update
    // } catch (error) {
    //   console.error('Google Sign-in Error:', error);
    // }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h1 className="mb-8 text-2xl font-semibold">Welcome to Quica</h1>
      <GoogleSignInButton onSignIn={handleGoogleSignIn} />
    </div>
  );
};

export default AuthPresenter;
