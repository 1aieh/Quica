import PropTypes from 'prop-types';

const UserProfileWidget = ({ userName, onSignOut }) => {
  return (
    <div className="flex items-center space-x-4">
      {/* User Name */}
      <span className="text-sm text-gray-600 font-medium truncate max-w-[120px]">
        {userName}
      </span>
      
      {/* Sign Out Button */}
      <button
        onClick={onSignOut}
        className="text-sm px-3 py-1.5 rounded-md text-gray-600 hover:text-red-600 
          hover:bg-red-50 transition-colors duration-150"
      >
        Sign Out
      </button>
    </div>
  );
};

UserProfileWidget.propTypes = {
  userName: PropTypes.string.isRequired,
  onSignOut: PropTypes.func.isRequired
};

export default UserProfileWidget;
