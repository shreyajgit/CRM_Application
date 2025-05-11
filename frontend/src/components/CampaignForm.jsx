import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaSave, FaPlay, FaClock, FaTags, FaLightbulb } from 'react-icons/fa';
import api from '../utils/api';
import RuleBuilder from './RuleBuilder';
import { 
  createNewCampaign, 
  updateExistingCampaign, 
  executeCampaign, 
  scheduleCampaign,
  fetchCampaignById
} from '../utils/campaignApi';
import MessageTemplate from './MessageTemplate';

const CampaignForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditing = Boolean(id);
  const currentCampaign = useSelector(state => state.campaigns.currentCampaign);
  const loading = useSelector(state => state.campaigns.loading);
  const error = useSelector(state => state.campaigns.error);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    segment: '',
    message: '',
    segmentRules: [],
    status: 'draft',
    tags: [],
    customerSize: 0 // Added customerSize field with default value of 0
  });
  
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('12:00');
  const [savingStatus, setSavingStatus] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiTagSuggestions, setAiTagSuggestions] = useState([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Load campaign data if editing
  useEffect(() => {
    if (isEditing) {
      dispatch(fetchCampaignById(id));
    }
  }, [dispatch, id, isEditing]);

  // Set form data when campaign is loaded
  useEffect(() => {
    if (isEditing && currentCampaign) {
      setFormData({
        name: currentCampaign.name || '',
        description: currentCampaign.description || '',
        segment: currentCampaign.segment || '',
        message: currentCampaign.message || '',
        segmentRules: currentCampaign.segmentRules || [],
        status: currentCampaign.status || 'draft',
        tags: currentCampaign.tags || [],
        customerSize: currentCampaign.audienceSize || 0 // Load audience size from backend
      });
      
      if (currentCampaign.scheduledDate) {
        const date = new Date(currentCampaign.scheduledDate);
        setScheduledDate(date.toISOString().split('T')[0]);
        
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        setScheduledTime(`${hours}:${minutes}`);
      }
    }
  }, [currentCampaign, isEditing]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle numeric input changes (for customerSize)
  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    // Convert to number and ensure it's not negative
    const numValue = Math.max(0, parseInt(value) || 0);
    setFormData(prev => ({ ...prev, [name]: numValue }));
  };

  // Handle tag input
  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      e.target.value = '';
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Add AI suggested tag
  const addAiTag = (tag) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  // Generate message suggestions based on segment and rules
  const generateAiSuggestions = async () => {
    try {
      setIsGeneratingAi(true);
      setSavingStatus('Generating suggestions...');
      
      // Mock delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate suggestions based on segment and rules
      const suggestions = [];
      
      if (formData.segment.toLowerCase().includes('inactive')) {
        suggestions.push(
          `Hi {{firstName}}, we've missed you! It's been a while since you've used our service. Come back today and enjoy 20% off your next purchase with code WELCOME20.`,
          `{{firstName}}, we noticed you haven't logged in recently. We've added some exciting new features we think you'll love. Sign in now to check them out!`,
          `We miss you, {{firstName}}! Your account has been inactive, and we'd love to have you back. Return today and receive a special loyalty bonus.`
        );
      } else if (formData.segment.toLowerCase().includes('high value')) {
        suggestions.push(
          `{{firstName}}, as one of our most valued customers, we want to thank you for your loyalty with an exclusive offer just for you. Use code VIP15 for an additional 15% off your next premium purchase.`,
          `Thank you for being a premium customer, {{firstName}}! We've prepared a special VIP-only collection that's available to you 48 hours before general release. Check it out now!`,
          `{{firstName}}, your loyalty means everything to us. As a token of our appreciation, we've added a complimentary gift to your account. Log in to claim it today!`
        );
      } else {
        suggestions.push(
          `Hi {{firstName}}, we hope you're enjoying our products! We wanted to let you know about our latest collection that just arrived. Check it out now for early-bird pricing!`,
          `{{firstName}}, thank you for being a customer! We've got some exciting news to share: we're launching a new feature based on customer feedback. Be among the first to try it out!`,
          `We appreciate your business, {{firstName}}! As a special thank you, we're offering you free shipping on your next order when you use code THANKS at checkout.`
        );
      }

      // If there are segment rules with contains/equals operations, use them for more targeted suggestions
      const hasAgeRule = formData.segmentRules.some(rule => 
        rule.field === 'age' || rule.field === 'ageGroup' || rule.field === 'dateOfBirth'
      );
      
      if (hasAgeRule) {
        suggestions.push(
          `{{firstName}}, we've selected some age-appropriate items we think you'll love. Check out our personalized recommendations just for you!`,
          `Based on your profile, {{firstName}}, we've curated a special collection that matches your preferences and age group. Take a look now!`
        );
      }

      const hasLocationRule = formData.segmentRules.some(rule => 
        rule.field === 'location' || rule.field === 'city' || rule.field === 'state' || rule.field === 'country'
      );
      
      if (hasLocationRule) {
        suggestions.push(
          `{{firstName}}, we're hosting special events in your area soon! Check your member dashboard for exclusive local offers.`,
          `Great news, {{firstName}}! We've just opened a new location near you. Stop by and mention this message for a special welcome gift!`
        );
      }
      
      setAiSuggestions(suggestions);
      setShowAiSuggestions(true);
      setSavingStatus('');
    } catch (error) {
      setSavingStatus('Failed to generate suggestions');
      console.error('Error generating AI suggestions:', error);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Generate AI tag suggestions
  const generateAiTagSuggestions = async () => {
    try {
      setIsGeneratingAi(true);
      setSavingStatus('Generating tag suggestions...');
      
      // Mock delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate tags based on segment, message and rules
      const tagSuggestions = [];
      
      // Add tags based on segment name
      if (formData.segment.toLowerCase().includes('inactive')) {
        tagSuggestions.push('reactivation', 'win-back', 'churn-prevention');
      } else if (formData.segment.toLowerCase().includes('high value')) {
        tagSuggestions.push('vip', 'loyalty', 'premium');
      } else if (formData.segment.toLowerCase().includes('new')) {
        tagSuggestions.push('welcome', 'onboarding', 'new-user');
      }
      
      // Add tags based on message content
      const message = formData.message.toLowerCase();
      if (message.includes('discount') || message.includes('off') || message.includes('code') || message.includes('sale')) {
        tagSuggestions.push('promotion', 'discount', 'offer');
      }
      
      if (message.includes('new') && (message.includes('product') || message.includes('feature') || message.includes('launch'))) {
        tagSuggestions.push('product-launch', 'new-feature', 'announcement');
      }
      
      if (message.includes('thank') || message.includes('appreciation') || message.includes('grateful')) {
        tagSuggestions.push('appreciation', 'gratitude', 'thank-you');
      }
      
      if (message.includes('event') || message.includes('webinar') || message.includes('workshop')) {
        tagSuggestions.push('event', 'invitation', 'webinar');
      }
      
      // Add general purpose tags
      tagSuggestions.push('campaign-2025', 'automation');
      
      // Remove duplicates
      const uniqueTags = [...new Set(tagSuggestions)];
      
      // Filter out tags that are already applied
      const filteredTags = uniqueTags.filter(tag => !formData.tags.includes(tag));
      
      setAiTagSuggestions(filteredTags);
      setShowTagSuggestions(true);
      setSavingStatus('');
    } catch (error) {
      setSavingStatus('Failed to generate tag suggestions');
      console.error('Error generating AI tag suggestions:', error);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Use AI suggestion
  const useAiSuggestion = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      message: suggestion
    }));
    setShowAiSuggestions(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSavingStatus('Saving...');
      
      // Use the customerSize directly from the form data for audienceSize
      const payload = {
        ...formData,
        audienceSize: formData.customerSize // Use customerSize for audienceSize
      };
      
      let result;
      if (isEditing) {
        result = await dispatch(updateExistingCampaign(id, payload));
      } else {
        result = await dispatch(createNewCampaign(payload));
      }
      
      if (result) {
        setSavingStatus('Saved!');
        setTimeout(() => {
          navigate('/campaigns');
        }, 1000);
      } else {
        setSavingStatus('Failed to save');
      }
    } catch (error) {
      setSavingStatus('Error saving campaign');
      console.error('Error saving campaign:', error);
    }
  };

  // Handle campaign execution
  const handleExecute = async () => {
    try {
      setSavingStatus('Executing campaign...');
      
      // If we're creating a new campaign, save it first
      let campaignId = id;
      if (!isEditing) {
        const payload = {
          ...formData,
          audienceSize: formData.customerSize // Use customerSize for audienceSize
        };
        const newCampaign = await dispatch(createNewCampaign(payload));
        if (newCampaign) {
          campaignId = newCampaign._id;
        } else {
          setSavingStatus('Failed to create campaign');
          return;
        }
      }
      
      const result = await dispatch(executeCampaign(campaignId));
      
      if (result) {
        setSavingStatus('Campaign executed!');
        setTimeout(() => {
          navigate('/campaigns');
        }, 1000);
      } else {
        setSavingStatus('Failed to execute campaign');
      }
    } catch (error) {
      setSavingStatus('Error executing campaign');
      console.error('Error executing campaign:', error);
    }
  };

  // Handle campaign scheduling
  const handleSchedule = async () => {
    try {
      if (!scheduledDate) {
        setSavingStatus('Please select a date');
        return;
      }
      
      // If we're creating a new campaign, save it first
      let campaignId = id;
      if (!isEditing) {
        const payload = {
          ...formData,
          audienceSize: formData.customerSize // Use customerSize for audienceSize
        };
        const newCampaign = await dispatch(createNewCampaign(payload));
        if (newCampaign) {
          campaignId = newCampaign._id;
        } else {
          setSavingStatus('Failed to create campaign');
          return;
        }
      }
      
      const scheduleDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      
      const result = await dispatch(scheduleCampaign(campaignId, scheduleDateTime));
      
      if (result) {
        setScheduleModalOpen(false);
        setSavingStatus('Campaign scheduled!');
        setTimeout(() => {
          navigate('/campaigns');
        }, 1000);
      } else {
        setSavingStatus('Failed to schedule campaign');
      }
    } catch (error) {
      setSavingStatus('Error scheduling campaign');
      console.error('Error scheduling campaign:', error);
    }
  };

  if (loading && !currentCampaign && isEditing) {
    return <div className="text-center my-5"><FaClock className="animate-spin mx-auto" size={24} /></div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Edit Campaign' : 'Create New Campaign'}
          </h2>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
              disabled={loading}
            >
              <FaSave className="mr-2" /> Save Draft
            </button>
            
            <button
              type="button"
              onClick={handleExecute}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center"
              disabled={loading}
            >
              <FaPlay className="mr-2" /> Execute Now
            </button>
            
            <button
              type="button"
              onClick={() => setScheduleModalOpen(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded flex items-center"
              disabled={loading}
            >
              <FaClock className="mr-2" /> Schedule
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {savingStatus && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            {savingStatus}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Campaign Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="segment">
                Segment Name *
              </label>
              <input
                type="text"
                id="segment"
                name="segment"
                value={formData.segment}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
                placeholder="E.g., High Value Customers, Inactive Users"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="2"
              placeholder="Campaign objective or notes"
            ></textarea>
          </div>

          {/* Customer Size Input */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customerSize">
              Audience Size *
            </label>
            <input
              type="number"
              id="customerSize"
              name="customerSize"
              value={formData.customerSize}
              onChange={handleNumericChange}
              min="0"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter the estimated number of customers who will receive this campaign
            </p>
          </div>

          <div className="mb-8">
            <RuleBuilder
              rules={formData.segmentRules}
              setRules={(rules) => setFormData(prev => ({ ...prev, segmentRules: rules }))}
              // Removed previewAudienceSize prop since we're not calculating it
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 text-sm font-bold" htmlFor="message">
                Message Content *
              </label>
              <button
                type="button"
                onClick={generateAiSuggestions}
                disabled={isGeneratingAi}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm flex items-center"
              >
                <FaLightbulb className="mr-1" /> AI Suggestions
              </button>
            </div>
            
            {showAiSuggestions && aiSuggestions.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-yellow-800">AI Message Suggestions</h4>
                  <button 
                    type="button" 
                    onClick={() => setShowAiSuggestions(false)}
                    className="text-yellow-800 text-sm hover:text-yellow-900"
                  >
                    Close
                  </button>
                </div>
                <div className="space-y-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="bg-white border border-yellow-100 p-2 rounded">
                      <p className="text-sm mb-1">{suggestion}</p>
                      <button
                        type="button"
                        onClick={() => useAiSuggestion(suggestion)}
                        className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                      >
                        Use This
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="5"
              required
              placeholder="Enter your campaign message here. You can use {{firstName}} for personalization."
            ></textarea>
            
            <div className="mt-2 text-sm text-gray-600">
              Available personalization variables: {'{'}{'{'}'firstName'{'}'}{'}'},  {'{'}{'{'}'lastName'{'}'}{'}'}, {'{'}{'{'}email{'}'}{'}'} 
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 text-sm font-bold">
                Tags
              </label>
              <button
                type="button"
                onClick={generateAiTagSuggestions}
                disabled={isGeneratingAi}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm flex items-center"
              >
                <FaTags className="mr-1" /> Suggest Tags
              </button>
            </div>
            
            {showTagSuggestions && aiTagSuggestions.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-md p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-indigo-800">AI Tag Suggestions</h4>
                  <button 
                    type="button" 
                    onClick={() => setShowTagSuggestions(false)}
                    className="text-indigo-800 text-sm hover:text-indigo-900"
                  >
                    Close
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {aiTagSuggestions.map((tag, index) => (
                    <span 
                      key={index} 
                      onClick={() => addAiTag(tag)}
                      className="bg-white text-indigo-700 border border-indigo-300 px-2 py-1 rounded text-sm cursor-pointer hover:bg-indigo-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-sm flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    className="ml-1 text-gray-600 hover:text-red-600"
                    onClick={() => removeTag(tag)}
                  >
                    &times;
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Add tag and press Enter"
                className="border border-gray-300 px-3 py-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={handleTagInput}
              />
            </div>
            <p className="text-sm text-gray-500">Tags help organize your campaigns (e.g., "win-back", "promotion")</p>
          </div>
        </form>
      </div>

      {/* Schedule Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Schedule Campaign</h3>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Time
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSchedule}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignForm;