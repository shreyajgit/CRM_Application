import React, { useState } from 'react';
import { FaLightbulb } from 'react-icons/fa';

const MessageTemplate = ({ message, onChange, onGenerateAiSuggestions }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
  });

  // Parse template for personalization tags
  const getPreviewMessage = () => {
    let previewMessage = message;
    
    Object.keys(previewData).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      previewMessage = previewMessage.replace(regex, previewData[key]);
    });
    
    return previewMessage;
  };

  // Handle preview data update
  const handlePreviewDataChange = (e) => {
    const { name, value } = e.target;
    setPreviewData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Message Content</h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          
          {onGenerateAiSuggestions && (
            <button
              type="button"
              onClick={onGenerateAiSuggestions}
              className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded flex items-center"
            >
              <FaLightbulb className="mr-1" /> AI Suggestions
            </button>
          )}
        </div>
      </div>
      
      <textarea
        value={message}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your message here. You can use {{firstName}}, {{lastName}}, etc. for personalization."
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        rows={5}
      ></textarea>
      
      <div className="text-sm text-gray-600">
        Available personalization tags: {{firstName}}, {{lastName}}, {{email}}
      </div>
      
      {showPreview && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <h4 className="font-medium mb-3">Message Preview</h4>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-xs font-medium mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={previewData.firstName}
                onChange={handlePreviewDataChange}
                className="shadow-sm border border-gray-300 rounded w-full py-1 px-2 text-gray-700 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-xs font-medium mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={previewData.lastName}
                onChange={handlePreviewDataChange}
                className="shadow-sm border border-gray-300 rounded w-full py-1 px-2 text-gray-700 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-xs font-medium mb-1">
                Email
              </label>
              <input
                type="text"
                name="email"
                value={previewData.email}
                onChange={handlePreviewDataChange}
                className="shadow-sm border border-gray-300 rounded w-full py-1 px-2 text-gray-700 text-sm"
              />
            </div>
          </div>
          
          <div className="bg-white border border-gray-300 rounded-md p-3">
            <p className="whitespace-pre-wrap">{getPreviewMessage()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageTemplate;