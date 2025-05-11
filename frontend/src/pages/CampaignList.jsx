import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCampaigns, deleteCampaign, executeCampaign } from '../utils/campaignApi';

import { FaPlay, FaEdit, FaTrash, FaClock, FaPlus, FaSpinner } from 'react-icons/fa';

const CampaignList = () => {
  const dispatch = useDispatch();
  const { list: allCampaigns, loading, error } = useSelector((state) => state.campaigns);
  const { user } = useSelector((state) => state.user); // Get current user from Redux state
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [executingCampaigns, setExecutingCampaigns] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    dispatch(fetchCampaigns());
  }, [dispatch]);

  // Filter campaigns to only show those belonging to the current user
  // console.log(allCampaigns)
  const campaigns = allCampaigns?.filter(campaign => {
    if (!user) return false;
   
    // Use the user ID from the Redux state to match with campaign user ID
    return campaign.creator._id === user.id || campaign.creator._id === user._id;
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      const result = await dispatch(deleteCampaign(id));
      if (result) {
        showNotification('Campaign deleted successfully');
      } else {
        showNotification('Failed to delete campaign', 'error');
      }
    }
  };

  const handleExecute = async (id) => {
    // Set executing state for this specific campaign
    setExecutingCampaigns(prev => ({ ...prev, [id]: true }));
    
    try {
      const result = await dispatch(executeCampaign(id));
      
      if (result) {
        showNotification(`Campaign "${result.name}" execution started`);
        // Refresh the campaign list to get updated status
        dispatch(fetchCampaigns());
      } else {
        showNotification('Failed to execute campaign. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Execute campaign error:', err);
      showNotification('An error occurred while executing the campaign', 'error');
    } finally {
      // Clear executing state
      setExecutingCampaigns(prev => ({ ...prev, [id]: false }));
    }
  };

  // Sort campaigns
  const sortedCampaigns = [...(campaigns || [])].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (sortField === 'createdAt' || sortField === 'scheduledDate') {
      return sortOrder === 'asc' 
        ? new Date(aValue) - new Date(bValue) 
        : new Date(bValue) - new Date(aValue);
    }

    if (sortField === 'audienceSize' || sortField === 'deliveryStats.sent') {
      const aNum = sortField === 'audienceSize' ? aValue : a.deliveryStats?.sent || 0;
      const bNum = sortField === 'audienceSize' ? bValue : b.deliveryStats?.sent || 0;
      return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Function to get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-200 text-green-800';
      case 'active': return 'bg-blue-200 text-blue-800';
      case 'draft': return 'bg-gray-200 text-gray-800';
      case 'scheduled': return 'bg-purple-200 text-purple-800';
      case 'failed': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  if (loading && !allCampaigns) return <div className="text-center my-5"><FaClock className="animate-spin inline-block" size={24} /></div>;

  return (
    <div className="container mx-auto px-4">
      {notification.show && (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded shadow-lg z-50 ${
          notification.type === 'error' ? 'bg-red-100 border-l-4 border-red-500 text-red-700' : 
          'bg-green-100 border-l-4 border-green-500 text-green-700'
        }`}>
          {notification.message}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Campaigns</h1>
        <div className="flex items-center">
          {loading && <FaSpinner className="animate-spin mr-3" />}
          <Link 
            to="/campaigns/create" 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
          >
            <FaPlus className="mr-2" /> Create Campaign
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {!campaigns?.length ? (
        <div className="text-center my-12 py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl mb-4">No campaigns found</h3>
          <p className="text-gray-600 mb-6">Create your first campaign to get started</p>
          <Link 
            to="/campaigns/create" 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg inline-flex items-center"
          >
            <FaPlus className="mr-2" /> Create Campaign
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th 
                  className="py-3 px-4 cursor-pointer" 
                  onClick={() => handleSort('name')}
                >
                  Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="py-3 px-4 cursor-pointer" 
                  onClick={() => handleSort('segment')}
                >
                  Segment {sortField === 'segment' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="py-3 px-4 cursor-pointer" 
                  onClick={() => handleSort('audienceSize')}
                >
                  Audience Size {sortField === 'audienceSize' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="py-3 px-4 cursor-pointer" 
                  onClick={() => handleSort('deliveryStats.sent')}
                >
                  Sent {sortField === 'deliveryStats.sent' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="py-3 px-4 cursor-pointer" 
                  onClick={() => handleSort('status')}
                >
                  Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="py-3 px-4 cursor-pointer" 
                  onClick={() => handleSort('createdAt')}
                >
                  Created {sortField === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedCampaigns.map((campaign) => (
                <tr key={campaign._id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-4 font-medium">
                    <Link to={`/campaigns/${campaign._id}`} className="text-blue-600 hover:underline">
                      {campaign.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4">{campaign.segment}</td>
                  <td className="py-3 px-4">{campaign.audienceSize || 0}</td>
                  <td className="py-3 px-4">
                    {campaign.deliveryStats?.sent || 0} / {campaign.audienceSize || 0}
                    {(campaign.audienceSize > 0) && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${((campaign.deliveryStats?.sent || 0) / (campaign.audienceSize || 1)) * 100}%` }}
                        ></div>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      getStatusBadgeClass(campaign.status)
                    }`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 space-x-2">
                    {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                      <button
                        onClick={() => handleExecute(campaign._id)}
                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full disabled:opacity-50"
                        title="Execute Campaign"
                        disabled={executingCampaigns[campaign._id] || loading}
                      >
                        {executingCampaigns[campaign._id] ? (
                          <FaSpinner size={14} className="animate-spin" />
                        ) : (
                          <FaPlay size={14} />
                        )}
                      </button>
                    )}
                    <Link
                      to={`/campaigns/edit/${campaign._id}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full inline-block"
                      title="Edit Campaign"
                    >
                      <FaEdit size={14} />
                    </Link>
                    <button
                      onClick={() => handleDelete(campaign._id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full disabled:opacity-50"
                      title="Delete Campaign"
                      disabled={executingCampaigns[campaign._id] || loading}
                    >
                      <FaTrash size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CampaignList;