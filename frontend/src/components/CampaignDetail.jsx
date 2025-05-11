import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaEdit, 
  FaChartLine, 
  FaUsers, 
  FaPaperPlane, 
  FaExclamationTriangle, 
  FaCalendar,
  FaArrowLeft,
  FaTrash
} from 'react-icons/fa';
import { 
  fetchCampaignById, 
  executeCampaign, 
  deleteCampaign,
  updateExistingCampaign
} from '../utils/campaignApi';

import api from '../utils/api';
import CampaignDetailsModal from './CampaignDetailsModal';

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const campaign = useSelector(state => state.campaigns.currentCampaign);
  const loading = useSelector(state => state.campaigns.loading);
  const error = useSelector(state => state.campaigns.error);
  
  const [insight, setInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [delivering, setDelivering] = useState(false);

  useEffect(() => {
    dispatch(fetchCampaignById(id));
  }, [dispatch, id]);

  // Generate AI insight for the campaign performance
  const generateInsight = async () => {
    if (!campaign) return;
    
    try {
      setLoadingInsight(true);
      const response = await api.post('/ai/generate-insight', { 
        campaign: campaign 
      });
      
      setInsight(response.data.insight || '');
    } catch (error) {
      console.error('Error generating insight:', error);
    } finally {
      setLoadingInsight(false);
    }
  };

  useEffect(() => {
    if (campaign && (campaign.status === 'completed' || campaign.status === 'active')) {
      generateInsight();
    }
  }, [campaign]);

  if (loading) return <div className="text-center my-5">Loading...</div>;

  if (error) return <div className="alert alert-danger">{error}</div>;

  if (!campaign) return <div className="text-center my-5">Campaign not found</div>;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-200 text-green-800';
      case 'active':
        return 'bg-blue-200 text-blue-800';
      case 'draft':
        return 'bg-gray-200 text-gray-800';
      case 'scheduled':
        return 'bg-purple-200 text-purple-800';
      case 'failed':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const handleExecute = async () => {
    setDelivering(true);
    try {
      await dispatch(executeCampaign(id));
    } finally {
      setDelivering(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      const success = await dispatch(deleteCampaign(id));
      if (success) {
        navigate('/campaigns');
      }
    }
  };

  const handleEdit = () => {
    navigate(`/campaigns/edit/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Link to="/campaigns" className="text-blue-600 hover:underline flex items-center mr-4">
          <FaArrowLeft className="mr-2" /> Back to Campaigns
        </Link>
        <h1 className="text-3xl font-bold flex-grow">{campaign.name}</h1>
        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md mr-2"
          >
            View Details
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(campaign.status)}`}>
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </span>
          </div>
          <div className="flex space-x-2">
            {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
              <button 
                onClick={handleExecute}
                disabled={delivering}
                className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center ${delivering ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FaPaperPlane className="mr-2" />
                {delivering ? 'Executing...' : 'Execute Now'}
              </button>
            )}
            <button
              onClick={handleEdit}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FaEdit className="mr-2" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FaTrash className="mr-2" />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Campaign Information</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Segment:</span> {campaign.segment}
              </div>
              <div>
                <span className="font-medium">Message:</span> {campaign.message}
              </div>
              <div>
                <span className="font-medium">Description:</span> {campaign.description || <span className="text-gray-400 italic">(No description)</span>}
              </div>
              <div>
                <span className="font-medium">Created:</span> {formatDate(campaign.createdAt)}
              </div>
              {campaign.scheduledDate && (
                <div>
                  <span className="font-medium">Scheduled for:</span> {formatDate(campaign.scheduledDate)}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Audience & Delivery</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <FaUsers className="mr-2 text-blue-500" />
                <span className="font-medium">Audience Size:</span> {campaign.audienceSize}
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Delivery Progress:</span>
                  <span>{campaign.deliveryStats.sent} / {campaign.audienceSize}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${campaign.audienceSize > 0 ? (campaign.deliveryStats.sent / campaign.audienceSize) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              {campaign.deliveryStats.failed > 0 && (
                <div className="flex items-center text-red-500">
                  <FaExclamationTriangle className="mr-2" />
                  <span className="font-medium">Failed Deliveries:</span> {campaign.deliveryStats.failed}
                </div>
              )}
            </div>
          </div>
        </div>

        {campaign.tags && campaign.tags.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {campaign.tags.map((tag, index) => (
                <span key={index} className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {campaign.aiGeneratedTags && campaign.aiGeneratedTags.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">AI Generated Tags</h3>
            <div className="flex flex-wrap gap-2">
              {campaign.aiGeneratedTags.map((tag, index) => (
                <span key={index} className="bg-purple-100 dark:bg-purple-900 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {(campaign.status === 'completed' || campaign.status === 'active') && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <FaChartLine className="mr-2 text-purple-500" />
              AI Insights
            </h3>
            {loadingInsight ? (
              <div className="text-center py-4">
                <Spinner size="sm" />
                <p className="mt-2 text-gray-500">Generating insights...</p>
              </div>
            ) : insight ? (
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <p>{insight}</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No insights available</p>
                <button 
                  onClick={generateInsight}
                  className="mt-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md"
                >
                  Generate Insights
                </button>
              </div>
            )}
          </div>
        )}

        {campaign.segmentRules && campaign.segmentRules.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">Segment Rules</h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <ul className="space-y-2">
                {campaign.segmentRules.map((rule, index) => (
                  <li key={index} className="flex items-center">
                    <span className="font-medium">{rule.field}</span>
                    <span className="mx-2">{rule.operator.replace('_', ' ')}</span>
                    <span>
                      {Array.isArray(rule.value) 
                        ? rule.value.join(', ') 
                        : String(rule.value)}
                    </span>
                    {index < campaign.segmentRules.length - 1 && (
                      <span className="ml-2 font-semibold text-blue-500">{rule.logicalOperator}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Campaign Details Modal */}
      <CampaignDetailsModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={campaign}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDeliver={handleExecute}
        delivering={delivering}
      />
    </div>
  );
};

export default CampaignDetail;