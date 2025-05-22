import React from 'react';
import GoogleSignInButton from './GoogleSignInButton';
import quicaLogo from '../../assets/Quica Black Full Logo.png';
import authIllustration from '../../assets/order illustration.png';

function AuthView({ onGoogleSignIn, teamMembers }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5] p-4 sm:p-8 lg:p-12 font-inter">
      <div className="max-w-[1400px] mx-auto w-full">
        {/* Top Bar */}
        <div className="flex justify-between items-center w-full mb-6 sm:mb-10 lg:mb-16">
          <img src={quicaLogo} alt="Quica Logo" className="h-8 sm:h-[2.6rem] lg:h-[3.25rem]" />
          <p className="text-gray-500 text-xs sm:text-sm lg:text-base">
            Made by {teamMembers}
          </p>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col lg:flex-row items-start justify-center lg:justify-between gap-8 sm:gap-12 lg:gap-16">
          {/* Left Side: Text and Button */}
          <div className="flex flex-col items-start justify-start gap-4 sm:gap-6 max-w-xs sm:max-w-xl w-full">
            <h1 className="text-3xl sm:text-5xl lg:text-[5.625rem] font-normal tracking-[-0.03em] leading-tight">
              <span className="relative inline-block z-5">
                Skip
                <span className="absolute bottom-2 left-0 w-full h-[8px] bg-yellow-400 -z-1"></span>
              </span> the ICA trip.
            </h1>
            <p className="text-base sm:text-lg lg:text-[1.3125rem] font-light tracking-[-0.02em] text-gray-600 leading-2">
              Need groceries? Let someone grab them from ICA for 15 SEK
            </p>
            <div className="mt-4 w-full">
              <GoogleSignInButton onSignIn={onGoogleSignIn} />
            </div>
          </div>

          {/* Right Side: Illustration */}
          <div className="w-full max-w-xs sm:max-w-md md:max-w-[30rem] lg:max-w-[40rem]">
            <img 
              src={authIllustration} 
              alt="Grocery delivery illustration" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthView;
