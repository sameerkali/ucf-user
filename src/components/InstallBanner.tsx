import usePWAInstallPrompt from "../hooks/usePWAInstallPrompt";

export default function InstallBanner() {
  const { isInstallable, promptInstall } = usePWAInstallPrompt();

  if (!isInstallable) return null;

  return (
    <div style={{ background: "#4CAF50", padding: "8px", textAlign: "center" }}>
      <button
        onClick={promptInstall}
        style={{
          background: "white",
          color: "#4CAF50",
          padding: "8px 16px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        📲 Install App
      </button>
    </div>
  );
}
