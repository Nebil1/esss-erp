import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { signInWithGoogle, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [navigate, isAuthenticated]);
  
  const handleGoogleSignIn = async () => {
    setError("");
    setIsGoogleLoading(true);

    try {
      await signInWithGoogle();
      navigate("/home");
    } catch (error) {
      console.error("Login Failed:", error);
      // Display the specific error message from the context
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 py-8">
      <div className="w-[350px] sm:w-[380px] h-[450px] sm:h-[500px] bg-gray-900/50 backdrop-blur-sm px-4 py-12 sm:px-6 lg:px-8 space-y-8 rounded-xl border border-gray-700/50 custom-shadow flex flex-col">
        <div className="text-center flex-1 flex flex-col justify-center">
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto bg-orange-500/10 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Please sign in to continue to{" "}
              <span className="text-orange-500 uppercase">ESSS-ERP</span>
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="group relative flex w-full items-center justify-center gap-3 rounded-lg border border-gray-600 bg-white/5 px-6 py-3 text-white backdrop-blur-sm transition-all hover:bg-white/10 focus:outline-none disabled:opacity-70 cursor-pointer hover:border-orange-500/50"
            >
              {isGoogleLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.5l3.13-3.13C17.46 2.03 14.97.98 12 .98c-4.29 0-8.01 2.47-9.45 5.93l2.88 2.26c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="text-sm">Sign in with Google</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
