import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [navigate, isAuthenticated]);

  const handleLogout = async () => {
    try {
      await logout(); 
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-white">
      <nav className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">ESSS ERP</h1>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-3">
                  {user.picture && (
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm">{user.name}</span>
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                    {user.email}
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Welcome to ESSS ERP</h2>
          <p className="text-gray-300">
            You are now logged in. This is your dashboard.
          </p>
          {user && (
            <div className="mt-4 p-4 bg-gray-700/30 rounded-md">
              <h3 className="font-medium mb-2">Your Account Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-400">Name:</div>
                <div>{user.name}</div>
                <div className="text-gray-400">Email:</div>
                <div>{user.email}</div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home; 





