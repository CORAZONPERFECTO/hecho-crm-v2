
import React, { useState } from 'react';
import CreateUserForm from './users/CreateUserForm';
import EditUserForm from './users/EditUserForm';
import { UserData } from './users/types';
import { useUsers } from '../../hooks/useUsers';
import UsersHeader from './users/UsersHeader';
import UsersStats from './users/UsersStats';
import UsersSearch from './users/UsersSearch';
import UsersTable from './users/UsersTable';

const UsersModule: React.FC = () => {
  const {
    filteredUsers,
    searchTerm,
    setSearchTerm,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleToggleUserStatus,
    handleResetPassword,
    stats,
    loading,
  } = useUsers();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setShowEditForm(true);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <UsersHeader onNewUserClick={() => setShowCreateForm(true)} />

      <UsersStats 
        totalUsers={stats.totalUsers}
        adminUsers={stats.adminUsers}
        activeUsers={stats.activeUsers}
        technicianUsers={stats.technicianUsers}
      />

      <UsersSearch searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />

      <UsersTable
        users={filteredUsers}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
        onToggleUserStatus={handleToggleUserStatus}
        onResetPassword={handleResetPassword}
      />

      <CreateUserForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onUserCreated={handleCreateUser}
      />

      <EditUserForm
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          setSelectedUser(null);
        }}
        onUserUpdated={handleUpdateUser}
        user={selectedUser}
      />
    </div>
  );
};

export default UsersModule;
