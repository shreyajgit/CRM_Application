import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateCustomer } from '../slices/customersSlice';
import { getCustomerById, updateCustomer as updateCustomerApi } from '../utils/customerApi';
import { X, Save, Edit, User } from 'lucide-react';

const CustomerDetail = ({ customerId, onClose }) => {
  const dispatch = useDispatch();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    segment: '',
    tags: [],
    phone: '',
    address: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      try {
        const data = await getCustomerById(customerId);
        setCustomer(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          segment: data.segment || '',
          tags: data.tags || [],
          phone: data.phone || '',
          address: data.address || '',
        });
      } catch (err) {
        setError(err.toString());
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateCustomerApi(customerId, formData);
      dispatch(updateCustomer(updated)); // Use the updateCustomer action from Redux
      setCustomer(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err.toString());
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-50 p-4 rounded-lg text-center text-red-600">
          <p className="font-medium">Error loading customer</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8 text-gray-500">
          <p>Customer not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b bg-gray-50">
        <h2 className="text-xl font-semibold flex items-center">
          <User className="mr-2 h-5 w-5" /> 
          Customer Details
        </h2>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-3 py-1 rounded flex items-center ${
                  saving ? 'bg-green-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {saving ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                    Saving
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" /> Save
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data to original customer data
                  setFormData({
                    name: customer.name || '',
                    email: customer.email || '',
                    segment: customer.segment || '',
                    tags: customer.tags || [],
                    phone: customer.phone || '',
                    address: customer.address || '',
                  });
                }}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 flex items-center"
              >
                <X className="h-4 w-4 mr-1" /> Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 flex items-center"
              >
                <X className="h-4 w-4 mr-1" /> Close
              </button>
            </>
          )}
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {isEditing ? (
          <form className="space-y-4">
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Segment
                </label>
                <input
                  type="text"
                  name="segment"
                  value={formData.segment}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
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
                  Add
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
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows="3"
              />
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <span className="text-sm text-gray-500">Name</span>
                <p className="font-medium">{customer.name}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <span className="text-sm text-gray-500">Email</span>
                <p className="font-medium break-all">{customer.email}</p>
              </div>
              
              {customer.phone && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <span className="text-sm text-gray-500">Phone</span>
                  <p className="font-medium">{customer.phone}</p>
                </div>
              )}
              
              {customer.segment && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <span className="text-sm text-gray-500">Segment</span>
                  <p className="font-medium">
                    {Array.isArray(customer.segment) 
                      ? customer.segment.join(', ')
                      : customer.segment}
                  </p>
                </div>
              )}
            </div>
            
            {customer.tags && customer.tags.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-md">
                <span className="text-sm text-gray-500">Tags</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {customer.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {customer.address && (
              <div className="bg-gray-50 p-3 rounded-md">
                <span className="text-sm text-gray-500">Address</span>
                <p className="font-medium whitespace-pre-line">{customer.address}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetail;