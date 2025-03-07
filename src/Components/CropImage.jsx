'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function CustomImageCropper() {
  const [image, setImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const imageRef = useRef(null);
  const cropRef = useRef(null);

  useEffect(() => {
    if (image) {
      const img = new Image();
      img.onload = () => {
        imageRef.current.src = image;
        imageRef.current.style.maxWidth = '100%';
        imageRef.current.style.height = 'auto';
        // Reset crop to center of the image
        setCrop({
          x: (img.width - 200) / 2,
          y: (img.height - 200) / 2,
          width: 200,
          height: 200
        });
      };
      img.src = image;
    }
  }, [image]);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImage(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = crop.x;
    const startTop = crop.y;

    const handleMouseMove = (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      setCrop((prevCrop) => ({
        ...prevCrop,
        x: Math.max(0, Math.min(imageRef.current.width - prevCrop.width, startLeft + dx)),
        y: Math.max(0, Math.min(imageRef.current.height - prevCrop.height, startTop + dy)),
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResize = (e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = crop.width;
    const startHeight = crop.height;
    const startLeft = crop.x;
    const startTop = crop.y;

    const handleMouseMove = (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (direction === 'se') {
        setCrop((prevCrop) => ({
          ...prevCrop,
          width: Math.max(50, Math.min(imageRef.current.width - prevCrop.x, startWidth + dx)),
          height: Math.max(50, Math.min(imageRef.current.height - prevCrop.y, startHeight + dy)),
        }));
      } else if (direction === 'nw') {
        setCrop((prevCrop) => ({
          x: Math.max(0, Math.min(startLeft + startWidth - 50, startLeft + dx)),
          y: Math.max(0, Math.min(startTop + startHeight - 50, startTop + dy)),
          width: Math.max(50, startWidth - dx),
          height: Math.max(50, startHeight - dy),
        }));
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleCrop = () => {
    if (!imageRef.current) return;

    const canvas = document.createElement('canvas');
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      imageRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        return;
      }
      setCroppedImage(URL.createObjectURL(blob));
    }, 'image/jpeg');
  };

  const handleDownload = () => {
    if (!croppedImage) return;
    const link = document.createElement('a');
    link.href = croppedImage;
    link.download = 'cropped-image.jpeg';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
            Artistic Image Cropper
          </h2>
        </div>
        <div className="px-6 py-8 bg-gray-50">
          <div className="mb-8">
            <label htmlFor="file-upload" className="block text-lg font-medium text-gray-700 mb-4">
              Upload your masterpiece
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-500 transition-colors duration-300">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={onSelectFile} accept="image/*" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>
          {image && (
            <div className="mb-8 relative">
              <img
                ref={imageRef}
                src={image || "/placeholder.svg"}
                alt="Original"
                className="max-w-full h-auto rounded-lg shadow-lg"
              />
              <div
                ref={cropRef}
                style={{
                  position: 'absolute',
                  left: `${crop.x}px`,
                  top: `${crop.y}px`,
                  width: `${crop.width}px`,
                  height: `${crop.height}px`,
                  boxSizing: 'border-box',
                  cursor: 'move'
                }}
                onMouseDown={handleMouseDown}
                className="transition-all duration-200 ease-in-out"
              >
                <div className="absolute inset-0 border-2 border-white opacity-75"></div>
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                <div className="absolute -inset-2 border-2 border-white border-dashed opacity-75"></div>
                <div
                  className="absolute right-0 bottom-0 w-6 h-6 bg-white rounded-full shadow-lg cursor-se-resize flex items-center justify-center transform translate-x-1/2 translate-y-1/2"
                  onMouseDown={(e) => handleResize(e, 'se')}
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
                </div>
                <div
                  className="absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow-lg cursor-nw-resize flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
                  onMouseDown={(e) => handleResize(e, 'nw')}
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
                </div>
              </div>
            </div>
          )}
          {image && (
            <div className="mb-8">
              <button
                className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:scale-105"
                onClick={handleCrop}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                Crop Image
              </button>
            </div>
          )}
          {croppedImage && (
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Masterpiece</h3>
              <img src={croppedImage || "/placeholder.svg"} alt="Cropped" className="max-w-full h-auto rounded-lg shadow-lg mb-6" />
              <button
                onClick={handleDownload}
                className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download Cropped Image
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

