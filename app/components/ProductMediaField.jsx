import {useState} from 'react';

export default function ProductMediaField({
  label = 'Media',
  name = 'product-images',
  initialUrls = [],           // Optional: existing image URLs from your DB
  onFilesChange,             // (files: File[], previewUrls: string[]) => void
}) {
  const [previewUrls, setPreviewUrls] = useState(initialUrls);

  function handleChange(event) {
    const target = event.currentTarget;
    const files = Array.from(target.files ?? []);

    if (!files.length) return;

    // Create object URLs for client-side preview
    const urls = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    // Store only the URL strings for rendering
    const urlStrings = urls.map((item) => item.url);
    setPreviewUrls(urlStrings);

    if (onFilesChange) {
      onFilesChange(files, urlStrings);
    }
  }

  function handleDropRejected(event) {
    const target = event.currentTarget;
    console.warn('Rejected files for', name, 'value:', target.value);
    // Optionally: set some error state and show it via DropZone's `error` prop
  }

  return (
    <s-section heading={label}>
      <s-stack gap="base">
        {/* Thumbnails row */}
        {previewUrls.length > 0 && (
          <s-stack direction="inline" gap="base">
            {previewUrls.map((url, index) => (
              <s-box
                key={url + index}
                border="base"
                borderRadius="base"
                overflow="hidden"
                maxInlineSize="80px"
                maxBlockSize="80px"
              >
                <s-thumbnail
                  alt={`Image ${index + 1}`}
                  src={url}
                ></s-thumbnail>
              </s-box>
            ))}
          </s-stack>
        )}

        {/* DropZone for uploads */}
        <s-drop-zone
          accept="image/*"
          label="Add media"
          accessibilityLabel="Upload product images by dragging and dropping or clicking to select files"
          multiple
          name={name}
          onChange={handleChange}
          onDropRejected={handleDropRejected}
        ></s-drop-zone>
      </s-stack>
    </s-section>
  );
}