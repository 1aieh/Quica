import React, { useState } from 'react';

const ProfileSetupView = ({ onSaveProfile, isLoading, error }) => {
  const [rolePreference, setRolePreference] = useState('requester');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveProfile({
      rolePreference,
      address,
      phone
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          Tell us about yourself
        </h1>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">I'm interested in...</h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <input
                    id="requester"
                    name="role"
                    type="radio"
                    className="h-4 w-4 text-blue-600 border-gray-300"
                    checked={rolePreference === 'requester'}
                    onChange={() => setRolePreference('requester')}
                  />
                  <label htmlFor="requester" className="ml-3">
                    <span className="block text-sm font-medium text-gray-900">Ordering Only</span>
                    <span className="block text-sm text-gray-500">I want to request deliveries</span>
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="both"
                    name="role"
                    type="radio"
                    className="h-4 w-4 text-blue-600 border-gray-300"
                    checked={rolePreference === 'both'}
                    onChange={() => setRolePreference('both')}
                  />
                  <label htmlFor="both" className="ml-3">
                    <span className="block text-sm font-medium text-gray-900">Ordering & Delivering</span>
                    <span className="block text-sm text-gray-500">I want to request and make deliveries</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="address"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  type="tel"
                  id="phone"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupView;
