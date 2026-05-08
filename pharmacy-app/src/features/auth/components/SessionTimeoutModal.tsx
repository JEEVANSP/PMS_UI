import Modal from "@components/common/Modal/Modal";

type Props = {
  open: boolean;
  countdown: number;
  onContinue: () => void;
  onLogout: () => void;
};

export default function SessionTimeoutModal({
  open,
  countdown,
  onContinue,
  onLogout,
}: Props) {
  if (!open) return null;

  return (
    <Modal isOpen={open} onClose={onContinue}>
      <div className="space-y-4">
        {/* Header with countdown badge */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Session Expiring</h2>
          <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
            {countdown}s
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed">
          You've been inactive for a while. Your session will expire soon.
        </p>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onContinue}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            Continue Session
          </button>
          <button
            onClick={onLogout}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </Modal>
  );
}
