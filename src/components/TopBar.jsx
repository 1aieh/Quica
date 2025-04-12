import UserProfileWidget from './common/UserProfileWidget';

const TopBar = ({ address, currentMode, onModeChange, userName, onSignOut }) => {
  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Address Widget */}
          <div className="flex items-center">
            <div className="text-sm">
              <span className="text-gray-500">Delivering to </span>
              <span className="font-medium">{address || 'No address set'}</span>
            </div>
          </div>

          {/* Middle: Order/Deliver Toggle */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                currentMode === 'order'
                  ? 'bg-white shadow text-gray-800'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => onModeChange('order')}
            >
              Order
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                currentMode === 'deliver'
                  ? 'bg-white shadow text-gray-800'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => onModeChange('deliver')}
            >
              Deliver
            </button>
          </div>

          {/* Right: User Profile Widget */}
          <UserProfileWidget userName={userName} onSignOut={onSignOut} />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
