// SaveBarWrapper.jsx
import { SaveBar, useAppBridge } from "@shopify/app-bridge-react";

export default function SaveBarWrapper({ id = "my-save-bar", onHide, onSave, onDiscard }) {
  const shopify = useAppBridge();

  const handleSave = async () => {
    console.log("[Child] handleSave()");
    try {
      await onSave?.();
    } finally {
      shopify.saveBar.hide(id);
      onHide?.(); // parent sets dirty -> false
    }
  };

  const handleDiscard = async () => {
    console.log("[Child] handleDiscard()");
    try {
      await onDiscard?.();
    } finally {
      shopify.saveBar.hide(id);
      onHide?.(); // parent sets dirty -> false
    }
  };

  return (
    <SaveBar id={id}>
      <button variant="primary" onClick={handleSave}>Save</button>
      <button onClick={handleDiscard}>Discard</button>
    </SaveBar>
  );
}
