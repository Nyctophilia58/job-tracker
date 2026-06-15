const ErrorBanner = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) => (
  <div className="mb-4 text-sm text-red-700 bg-red-200 border border-red-400 rounded-lg px-4 py-3 flex items-center justify-between dark:text-red-300 dark:bg-red-900/30 dark:border-red-800">
    <div>{message}</div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="ml-4 text-sm font-medium text-red-700 hover:underline dark:text-red-300"
      >
        Retry
      </button>
    )}
  </div>
);

export default ErrorBanner;
