import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchOrders } from '../utils/orderApi';

const OrderList = () => {
  const dispatch = useDispatch();
  const { list: orders, loading, error } = useSelector((state) => state.orders);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch orders when component mounts
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Get status count for badges (memoized to prevent recalculation)
  const statusCounts = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return {
      all: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };
    return {
      all: orders.length,
      pending: orders.filter(order => order.status === 'pending').length,
      processing: orders.filter(order => order.status === 'processing').length,
      shipped: orders.filter(order => order.status === 'shipped').length,
      delivered: orders.filter(order => order.status === 'delivered').length,
      cancelled: orders.filter(order => order.status === 'cancelled').length
    };
  }, [orders]);

  // Filter and sort orders (memoized for performance)
  const filteredAndSortedOrders = useMemo(() => {
    // Ensure orders is an array before filtering
    if (!orders || !Array.isArray(orders)) return [];
    
    try {
      // Filter orders based on status and search term
      const filtered = orders.filter(order => {
        if (!order) return false;
        
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        const matchesSearch = searchTerm === '' || 
          (order.orderNumber && order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (order.customer?.name && order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (order.customer?.email && order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return matchesStatus && matchesSearch;
      });

      // Sort orders by date (newest first)
      return [...filtered].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });
    } catch (error) {
      console.error("Error processing orders:", error);
      return [];
    }
  }, [orders, filterStatus, searchTerm]);

  // Handle search input with debounce
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Empty state when no orders exist
  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
        <p className="mt-1 text-sm text-gray-500">No orders are available in the system.</p>
      </div>
    );
  }

  // Loading state
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  // Error state
  if (error) return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
      <p className="font-bold">Error</p>
      <p>{error}</p>
    </div>
  );

  // Status filter button component for DRY code
  const StatusFilterButton = ({ status, label }) => (
    <button
      onClick={() => setFilterStatus(status)}
      className={`px-3 py-1 rounded-full text-sm font-medium ${
        filterStatus === status 
          ? status === 'pending' ? 'bg-yellow-100 text-yellow-800' 
          : status === 'processing' ? 'bg-purple-100 text-purple-800'
          : status === 'shipped' ? 'bg-blue-100 text-blue-800'
          : status === 'delivered' ? 'bg-green-100 text-green-800'
          : status === 'cancelled' ? 'bg-red-100 text-red-800'
          : 'bg-blue-100 text-blue-800'
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      } transition-colors duration-200`}
    >
      {label} ({statusCounts[status] || 0})
    </button>
  );

  // Status badge component for DRY code
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      delivered: { bgColor: 'bg-green-100', textColor: 'text-green-800', dotColor: 'text-green-400' },
      shipped: { bgColor: 'bg-blue-100', textColor: 'text-blue-800', dotColor: 'text-blue-400' },
      processing: { bgColor: 'bg-purple-100', textColor: 'text-purple-800', dotColor: 'text-purple-400' },
      pending: { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', dotColor: 'text-yellow-400' },
      cancelled: { bgColor: 'bg-red-100', textColor: 'text-red-800', dotColor: 'text-red-400' },
      default: { bgColor: 'bg-gray-100', textColor: 'text-gray-800', dotColor: 'text-gray-400' }
    };
    
    const config = statusConfig[status] || statusConfig.default;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
        <svg className={`-ml-0.5 mr-1.5 h-2 w-2 ${config.dotColor}`} fill="currentColor" viewBox="0 0 8 8">
          <circle cx="4" cy="4" r="3" />
        </svg>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Orders</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search input */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search orders by number, customer name or email..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        {/* Status filter */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <StatusFilterButton status="all" label="All" />
          <StatusFilterButton status="pending" label="Pending" />
          <StatusFilterButton status="processing" label="Processing" />
          <StatusFilterButton status="shipped" label="Shipped" />
          <StatusFilterButton status="delivered" label="Delivered" />
          <StatusFilterButton status="cancelled" label="Cancelled" />
        </div>
      </div>

      {filteredAndSortedOrders.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No orders match your filters. Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    <Link to={`/orders/${order._id}`} className="hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.customer?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.customer?.email || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.paymentMethod ? order.paymentMethod.toUpperCase() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    ₹{order.totalAmount?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-4">
                      <Link
                        to={`/orders/${order._id}`}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                      >
                        View
                      </Link>
                    </div>
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

export default OrderList;