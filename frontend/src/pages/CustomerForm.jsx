import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addCustomer } from '../slices/customersSlice';
import { createCustomer } from '../utils/customerApi';
import { X, Plus, Save } from 'lucide-react';

const CustomerForm = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const { segments } = useSelector(state => state.customers);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    segment: '',
    tags: [],
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newSegment, setNewSegment] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleAddSegment = () => {
    if (newSegment.trim()) {
      setFormData({
        ...formData,
        segment: newSegment.trim()
      });
      setNewSegment('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      const newCustomer = await createCustomer(formData);
      dispatch(addCustomer(newCustomer));
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        segment: '',
        tags: [],
        phone: '',
        address: '',
      });
      setErrors({});
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setErrors({ 
        submit: err.toString() 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    // Add tag on Enter key
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Add New Customer</h2>
      
      {errors.submit && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {errors.submit}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Segment
            </label>
            <div className="flex gap-2">
              <select
                name="segment"
                value={formData.segment}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Segment</option>
                {segments.map(segment => (
                  <option key={segment} value={segment}>{segment}</option>
                ))}
              </select>
              
              <div className="flex">
                <input
                  type="text"
                  value={newSegment}
                  onChange={(e) => setNewSegment(e.target.value)}
                  placeholder="New segment"
                  className="p-2 border border-gray-300 rounded-l-md w-32"
                />
                <button
                  type="button"
                  onClick={handleAddSegment}
                  className="px-3 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map(tag => (
              <span 
                key={tag} 
                className="bg-gray-100 px-2 py-1 rounded-full flex items-center text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-gray-500 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add tag and press Enter"
              className="p-2 border border-gray-300 rounded-l-md flex-grow"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows="3"
            placeholder="123 Main St, City, Country"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 text-white rounded-md flex items-center justify-center ${loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {loading ? (
            <>
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Add Customer
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CustomerForm;