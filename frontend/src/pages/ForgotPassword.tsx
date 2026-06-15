import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to send reset link. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">JobTracker</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <div className="bg-blue-300 dark:bg-gray-800 rounded-2xl shadow-sm border border-stone-200 dark:border-gray-700 p-8">
          {sent ? (
            <div className="text-center">
              <div className="mb-4 text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-800 rounded-lg px-4 py-2">
                Reset link sent! Check your email.
              </div>
              <Link
                to="/login"
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline text-sm"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 rounded-lg px-4 py-2">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-stone-100 border border-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-400 transition disabled:opacity-60 mt-2"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                <Link
                  to="/login"
                  className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                >
                  Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
