import React from 'react';
import { useDispatch } from 'react-redux';
import { FaEdit, FaTrash, FaPlay, FaClock, FaTags } from 'react-icons/fa';
import { executeCampaign } from '../utils/campaignApi';

export default function CampaignDetailsModal({ open, onClose, campaign, onEdit, onDelete, onDeliver, delivering }) {
  if (!open || !campaign) return null;
  
  const dispatch = useDispatch();
  
  // Handle execute campaign
  const handleExecute = async () => {
    if (window.confirm('Are you sure you want to execute this campaign now?')) {
      await dispatch(executeCampaign(campaign._id));
      onDeliver && onDeliver(campaign._id);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };
  
  // Get progress percentage for progress bar
  const getProgressPercentage = () => {
    if (!campaign.audienceSize) return 0;
    return Math.round((campaign.deliveryStats.sent / campaign.audienceSize) * 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 w-full max-w-2xl relative">
        <button 
          type="button" 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl"
        >×</button>
        
        <h2 className="text-2xl font-bold mb-4">Campaign Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-2">
            <b>Name:</b> {campaign.name}
          </div>
          
          <div className="mb-2">
            <b>Segment:</b> {campaign.segment}
          </div>
          
          <div className="mb-2">
            <b>Message:</b> {campaign.message}
          </div>
          
          <div className="mb-2">
            <b>Description:</b> {campaign.description || <span className="text-gray-400">(none)</span>}
          </div>
          
          <div className="mb-2">
            <b>Tags:</b> {campaign.tags?.length ? campaign.tags.join(', ') : <span className="text-gray-400">(none)</span>}
          </div>
          
          <div className="mb-2">
            <b>AI Tags:</b> {campaign.aiGeneratedTags?.length ? campaign.aiGeneratedTags.join(', ') : <span className="text-gray-400">(none)</span>}
          </div>
          
          <div className="mb-2">
            <b>Status:</b> 
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ml-2 ${
              campaign.status === 'completed' ? 'bg-green-200 text-green-800' :
              campaign.status === 'active' ? 'bg-blue-200 text-blue-800' :
              campaign.status === 'draft' ? 'bg-gray-200 text-gray-800' :
              campaign.status === 'scheduled' ? 'bg-purple-200 text-purple-800' :
              campaign.status === 'failed' ? 'bg-red-200 text-red-800' : ''
            }`}>
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </span>
          </div>
          
          <div className="mb-2">
            <b>Created:</b> {formatDate(campaign.createdAt)}
          </div>
          
          <div className="mb-2">
            <b>Updated:</b> {formatDate(campaign.updatedAt)}
          </div>

          {campaign.scheduledDate && (
            <div className="mb-2">
              <b>Scheduled:</b> {formatDate(campaign.scheduledDate)}
            </div>
          )}
          
          <div className="mb-2 col-span-2">
            <b>Audience Size:</b> {campaign.audienceSize}
          </div>
          
          <div className="mb-2 col-span-2">
            <b>Delivery Progress:</b> {campaign.deliveryStats.sent} / {campaign.audienceSize} 
            ({getProgressPercentage()}%)
            
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
          
          {campaign.deliveryStats.failed > 0 && (
            <div className="mb-2 col-span-2 text-red-500">
              <b>Failed Deliveries:</b> {campaign.deliveryStats.failed}
            </div>
          )}
          
          {campaign.segmentRules && campaign.segmentRules.length > 0 && (
            <div className="mb-2 col-span-2">
              <b>Segment Rules:</b>
              <ul className="list-disc pl-5 mt-1">
                {campaign.segmentRules.map((rule, index) => (
                  <li key={index}>
                    {rule.field} {rule.operator.replace('_', ' ')} {
                      Array.isArray(rule.value) 
                        ? rule.value.join(', ') 
                        : String(rule.value)
                    }
                    {index < campaign.segmentRules.length - 1 && (
                      <span className="font-semibold"> {rule.logicalOperator}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
            <button
              onClick={handleExecute}
              disabled={delivering}
              className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 ${delivering ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaPlay size={14} />
              <span>{delivering ? 'Executing...' : 'Execute Now'}</span>
            </button>
          )}
          
          <button
            onClick={() => onEdit && onEdit(campaign._id)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          >
            <FaEdit size={14} />
            <span>Edit</span>
          </button>
          
          <button
            onClick={() => onDelete && onDelete(campaign._id)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          >
            <FaTrash size={14} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}