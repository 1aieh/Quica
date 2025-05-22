import UserProfileWidget from './common/UserProfileWidget';
import { NavLink } from 'react-router-dom';
import { TabGroup, TabList, Tab } from '@headlessui/react';

const TopBar = ({ address, userName, onSignOut, userEmail }) => {
  const adminEmails = ['laiehjwella@gmail.com', 'bhavyasehgal2010@gmail.com'];
  const isAdmin = adminEmails.includes(userEmail);
  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo and Address Widget */}
          <div className="flex items-center">
            <img src="/quica-red-whitebg.png" alt="Quica" className="h-8 mr-3 object-contain" />
            <div className="text-sm">
              <span className="text-gray-500">Delivering to </span>
              <span className="font-medium">{address || 'No address set'}</span>
            </div>
          </div>

          {/* Middle: Navigation */}
          <TabGroup as="div" className="flex" manual>
            <TabList className="flex space-x-1 bg-transparent p-0 rounded-none border-b border-gray-200">
              <Tab as={NavLink} to="/order" className={({ selected }) =>
                `px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-150 focus:outline-none
                ${selected
                  ? 'border-blue-600 text-blue-700 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'}
                `
              }>
                Order
              </Tab>
              <Tab as={NavLink} to="/deliver" className={({ selected }) =>
                `px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-150 focus:outline-none
                ${selected
                  ? 'border-blue-600 text-blue-700 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'}
                `
              }>
                Deliver
              </Tab>
              {isAdmin && (
                <Tab as={NavLink} to="/admin" className={({ selected }) =>
                  `px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-150 focus:outline-none
                  ${selected
                    ? 'border-blue-600 text-blue-700 font-semibold'
                    : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'}
                  `
                }>
                  Admin
                </Tab>
              )}
            </TabList>
          </TabGroup>

          {/* Right: User Profile Widget */}
          <UserProfileWidget userName={userName} onSignOut={onSignOut} />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
