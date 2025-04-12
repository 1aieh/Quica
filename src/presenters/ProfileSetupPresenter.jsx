import React from 'react';
import { observer } from 'mobx-react-lite';
import ProfileSetupView from '../components/auth/ProfileSetupView';
import { myQuicaModel } from '../model/QuicaModel';
import { updateUserProfile } from '../firebase/persistence';

const ProfileSetupPresenter = observer(() => {
  const handleSaveProfile = async ({ rolePreference, address, phone }) => {
    if (!myQuicaModel.user) {
      myQuicaModel.setError('User not logged in');
      return;
    }

    myQuicaModel.setLoading(true);
    myQuicaModel.setError(null);

    try {
      const updateData = {
        role: rolePreference === 'both' ? 'both' : 'requester',
        delivererStatus: rolePreference === 'both' ? 'inactive' : null,
        address,
        phone,
        profileComplete: true
      };

      const result = await updateUserProfile(myQuicaModel.user.uid, updateData);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update profile');
      }

      // No need to manually set isProfileSetupComplete here
      // It will be automatically set when the Firestore listener updates the profile
    } catch (error) {
      console.error('Error saving profile:', error);
      myQuicaModel.setError(error.message);
    } finally {
      myQuicaModel.setLoading(false);
    }
  };

  return (
    <ProfileSetupView
      onSaveProfile={handleSaveProfile}
      isLoading={myQuicaModel.isLoading}
      error={myQuicaModel.errorMessage}
    />
  );
});

export default ProfileSetupPresenter;
