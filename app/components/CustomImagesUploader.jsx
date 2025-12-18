import React, { useState, useRef, useEffect } from 'react';
import AppLock from './common/AppLock';

const CustomImagesUploader = ({ isPremium, festivalSlug }) => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedCustomImages, setSelectedCustomImages] = useState(new Set());
  const dropzoneRef = useRef(null);
  const fileInputRef = useRef(null);

  const uploadFiles = async (files) => {
    console.log('uploadFiles called with files:', files);
    for (const file of files) {
      console.log('Processing file:', file, 'type:', typeof file, 'name:', file?.name, 'size:', file?.size);
      if (!file || !file.name) {
        console.log('Skipping invalid file');
        continue;
      }
      const formData = new FormData();
      formData.append('file', file);
      try {
        console.log('Uploading file:', file.name);
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        console.log('Upload response:', data);
        if (data.success) {
          setUploadedImages(prev => [...prev, data.url]);
        } else {
          console.error('Upload failed:', data.error);
        }
      } catch (err) {
        console.error('Upload error:', err);
      }
    }
  };

  useEffect(() => {
    const dropzone = dropzoneRef.current;
    if (dropzone) {
      const handleDrop = (event) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        console.log('Drop event triggered', files);
        if (files.length > 0) {
          uploadFiles(files);
        }
      };

      const handleDragOver = (event) => {
        event.preventDefault();
      };

      dropzone.addEventListener('drop', handleDrop);
      dropzone.addEventListener('dragover', handleDragOver);

      return () => {
        dropzone.removeEventListener('drop', handleDrop);
        dropzone.removeEventListener('dragover', handleDragOver);
      };
    }
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    console.log('File input change', files);
    if (files.length > 0) {
      uploadFiles(files);
    }
  };

  const toggleCustomImage = (url) => {
    setSelectedCustomImages((prev) => {
      const newSet = new Set(prev);
      newSet.has(url) ? newSet.delete(url) : newSet.add(url);
      return newSet;
    });
  };

  if (!isPremium) {
    return <AppLock />;
  }

  return (
    <div>
      <div style={{ marginBottom: "8px", fontWeight: 600 }}>Custom Images</div>
      <div
        ref={dropzoneRef}
        onClick={handleClick}
        style={{
          border: '2px dashed #ccc',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          borderRadius: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: '8px' }}>
          <span aria-hidden="true" className="icon color-base tone-neutral size-large">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
              <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z"></path>
            </svg>
          </span>
          <div>Add images</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Drop files here or click to browse</div>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      {uploadedImages.length > 0 && (
        <div
          style={{
            marginTop: "10px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {uploadedImages.map((url, i) => (
            <s-stack
              key={i}
              direction="inline"
              gap="small"
              justifyContent="space-between"
              alignItems="center"
            >
              <s-checkbox
                checked={selectedCustomImages.has(url)}
                onChange={() => toggleCustomImage(url)}
              />
              <img
                src={url}
                width={64}
                alt={`Uploaded custom image ${i + 1}`}
              />
            </s-stack>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomImagesUploader;