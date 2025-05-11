import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CustomerList from './CustomerList';
import CustomerForm from '../pages/CustomerForm';
import CustomerDetail from '../pages/CustomerDetail';
import { Users, Plus, ChevronRight, AlertCircle } from 'lucide-react';
import { fetchCustomers } from '../utils/customerApi';
import { setCustomers } from '../slices/customersSlice';

const CustomerDashboard = () => {
  const dispatch = useDispatch();
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'detail', 'form'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load customers when component mounts
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        const customers = await fetchCustomers();
        // Make sure customers is an array before dispatching
        dispatch(setCustomers(Array.isArray(customers) ? customers : []));
        setError(null);
      } catch (err) {
        console.error('Error loading customers:', err);
        setError(err.toString());
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, [dispatch]);

  const handleCustomerSelect = (id) => {
    setSelectedCustomerId(id);
    setViewMode('detail');
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setViewMode('list');
  };

  const handleDetailClose = () => {
    setSelectedCustomerId(null);
    setViewMode('list');
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    if (!showForm) {
      setViewMode('form');
      setSelectedCustomerId(null);
    } else {
      setViewMode('list');
    }
  };

  const handleRetry = async () => {
    try {
      setLoading(true);
      setError(null);
      const customers = await fetchCustomers();
      dispatch(setCustomers(Array.isArray(customers) ? customers : []));
    } catch (err) {
      console.error('Error loading customers:', err);
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Users className="mr-2" /> Customer Management
            </h1>
            <div className="text-sm text-gray-500 flex items-center mt-1">
              <span>Dashboard</span>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span>Customers</span>
            </div>
          </div>
          <button
            onClick={toggleForm}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            {showForm ? 'Hide Form' : 'Add Customer'}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <div>
              <h3 className="font-medium">Error loading customers</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={handleRetry}
            className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Mobile View */}
      <div className="block md:hidden">
        {viewMode === 'form' && (
          <div className="mb-4">
            <CustomerForm onSuccess={handleFormSuccess} />
          </div>
        )}
        
        {viewMode === 'detail' && selectedCustomerId && (
          <div className="mb-4">
            <CustomerDetail 
              customerId={selectedCustomerId} 
              onClose={handleDetailClose} 
            />
          </div>
        )}
        
        {viewMode === 'list' && !loading && !error && (
          <CustomerList onSelectCustomer={handleCustomerSelect} />
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        <div className={`${selectedCustomerId ? 'col-span-2' : 'col-span-3'}`}>
          {showForm && (
            <div className="mb-6">
              <CustomerForm onSuccess={handleFormSuccess} />
            </div>
          )}
          {!loading && !error && (
            <CustomerList onSelectCustomer={handleCustomerSelect} />
          )}
        </div>

        {selectedCustomerId && (
          <div className="col-span-1">
            <CustomerDetail 
              customerId={selectedCustomerId} 
              onClose={handleDetailClose} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;