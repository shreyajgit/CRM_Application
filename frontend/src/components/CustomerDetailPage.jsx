import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CustomerDetail from '../pages/CustomerDetail';

const CustomerDetailPage = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/customers');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <button 
        onClick={handleClose}
        className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Customers
      </button>
      
      <div className="max-w-3xl mx-auto">
        <CustomerDetail 
          customerId={customerId} 
          onClose={handleClose} 
        />
      </div>
    </div>
  );
};

export default CustomerDetailPage;