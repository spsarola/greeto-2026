import {SaveBar} from '@shopify/app-bridge-react';

export default function MySaveBar() {
  const shopify = useAppBridge();

  const handleSave = () => {
    console.log('Saving');
    shopify.saveBar.hide('my-save-bar');
  };

  const handleDiscard = () => {
    console.log('Discarding');
    shopify.saveBar.hide('my-save-bar');
  };

  return (
    <>
      <button onClick={() => shopify.saveBar.show('my-save-bar')}>
        Show Save Bar
      </button>
      <SaveBar id="my-save-bar">
        <button variant="primary" onClick={handleSave}></button>
        <button onClick={handleDiscard}></button>
      </SaveBar>
    </>
  );
}
