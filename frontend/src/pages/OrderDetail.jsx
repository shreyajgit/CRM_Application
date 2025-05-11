import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById } from '../utils/orderApi';

const OrderDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentOrder: order, loading, error } = useSelector((state) => state.orders);
  
  useEffect(() => {
    // Validate if id is in the correct MongoDB ObjectId format
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    if (id && isValidObjectId) {
      dispatch(fetchOrderById(id));
    } else {
      console.error('Invalid order ID format');
    }
  }, [dispatch, id]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
        <div className="mt-4">
          <Link to="/orders" className="text-blue-600 hover:underline">
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }
  
  // Order not found or not loaded yet
  if (!order) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Order Not Found</h3>
        <p className="mt-1 text-sm text-gray-500">The order you're looking for doesn't exist or couldn't be loaded.</p>
        <div className="mt-6">
          <Link to="/orders" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  // Status badge component
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link to="/orders" className="text-blue-600 hover:underline flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Orders
          </Link>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">Order Details</h2>
        </div>
        
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Order Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-sm text-gray-500">Order Number</div>
            <div className="text-sm font-medium">{order.orderNumber}</div>
            
            <div className="text-sm text-gray-500">Date Placed</div>
            <div className="text-sm">
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            
            <div className="text-sm text-gray-500">Payment Method</div>
            <div className="text-sm">{order.paymentMethod ? order.paymentMethod.toUpperCase() : 'N/A'}</div>
            
            <div className="text-sm text-gray-500">Total Amount</div>
            <div className="text-sm font-bold">₹{order.totalAmount?.toFixed(2) || '0.00'}</div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Customer Information</h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="text-sm text-gray-500">Name</div>
            <div className="text-sm font-medium">{order.customer?.name || 'N/A'}</div>
            
            <div className="text-sm text-gray-500">Email</div>
            <div className="text-sm">{order.customer?.email || 'N/A'}</div>
            
            <div className="text-sm text-gray-500">Phone</div>
            <div className="text-sm">{order.customer?.phone || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Shipping Address</h3>
          <address className="not-italic text-sm">
            {order.shippingAddress.street && <div>{order.shippingAddress.street}</div>}
            {order.shippingAddress.city && <div>{order.shippingAddress.city}</div>}
            {order.shippingAddress.state && order.shippingAddress.zipCode && (
              <div>{order.shippingAddress.state}, {order.shippingAddress.zipCode}</div>
            )}
            {order.shippingAddress.country && <div>{order.shippingAddress.country}</div>}
          </address>
        </div>
      )}

      {/* Order Items */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Order Items</h3>
        {!order.items || order.items.length === 0 ? (
          <p className="text-gray-500 italic">No items in this order</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.image && (
                          <div className="flex-shrink-0 h-10 w-10 mr-3">
                            <img className="h-10 w-10 rounded-full object-cover" src={item.image} alt={item.name} />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          {item.variant && <div className="text-sm text-gray-500">{item.variant}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.price?.toFixed(2) || '0.00'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">₹{(item.price * item.quantity)?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">Subtotal</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">₹{order.subtotal?.toFixed(2) || '0.00'}</td>
                </tr>
                {order.shippingFee !== undefined && (
                  <tr>
                    <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">Shipping</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">₹{order.shippingFee?.toFixed(2) || '0.00'}</td>
                  </tr>
                )}
                {order.tax !== undefined && (
                  <tr>
                    <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">Tax</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">₹{order.tax?.toFixed(2) || '0.00'}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan="3" className="px-6 py-3 text-right text-sm font-bold text-gray-900">Total</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-gray-900">₹{order.totalAmount?.toFixed(2) || '0.00'}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
      
      {/* Order Status History */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Order History</h3>
          <ol className="relative border-l border-gray-200 ml-3">
            {order.statusHistory.map((history, index) => (
              <li key={index} className="mb-6 ml-6">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
                  <svg className="w-3 h-3 text-blue-800" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </span>
                <h3 className="flex items-center mb-1 text-sm font-semibold text-gray-900">
                  {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                  {index === 0 && <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded ml-3">Latest</span>}
                </h3>
                <time className="block mb-2 text-xs font-normal leading-none text-gray-400">
                  {new Date(history.timestamp).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </time>
                {history.comment && <p className="text-sm font-normal text-gray-500">{history.comment}</p>}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;