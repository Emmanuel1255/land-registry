import { useState } from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';

const PropertyImageUpload = ({ onImageSelect, onImageRemove, existingImages = [] }) => {
  const [previewImages, setPreviewImages] = useState([]);

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    
    // Create preview URLs
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setPreviewImages(prev => [...prev, ...newPreviews]);
    onImageSelect(files);
  };

  const removeImage = (index) => {
    setPreviewImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
    onImageRemove(index);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Property Images
        </label>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {previewImages.length} of 5 images
          </span>
          <label className="cursor-pointer bg-primary-600 text-white px-3 py-1 rounded-md text-sm hover:bg-primary-700">
            Add Images
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              disabled={previewImages.length >= 5}
            />
          </label>
        </div>
      </div>

      {previewImages.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12">
          <div className="text-center">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Add up to 5 images of your property
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previewImages.map((image, index) => (
            <div key={index} className="relative rounded-lg overflow-hidden h-48">
              <img
                src={image.preview}
                alt={`Property preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
              >
                <XMarkIcon className="h-4 w-4 text-gray-600" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                  Main Image
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      
      <p className="text-xs text-gray-500">
        Supported formats: JPG, PNG. Maximum file size: 5MB
      </p>
    </div>
  );
};

export default PropertyImageUpload;