import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { User, Search, Tag, Filter, ChevronDown } from 'lucide-react';

const CustomerList = ({ onSelectCustomer }) => {
  const { list: customers, segments, tags } = useSelector(state => state.customers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    segments: [],
    tags: []
  });
  const [showFilters, setShowFilters] = useState(false);

  // Filter customers when search term or filters change
  useEffect(() => {
    if (!Array.isArray(customers)) {
      setFilteredCustomers([]);
      return;
    }

    let result = [...customers];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(customer => 
        (customer.name && customer.name.toLowerCase().includes(term)) || 
        (customer.email && customer.email.toLowerCase().includes(term))
      );
    }
    
    // Apply segment filters
    if (activeFilters.segments.length > 0) {
      result = result.filter(customer => {
        if (!customer.segment) return false;
        
        if (Array.isArray(customer.segment)) {
          return customer.segment.some(seg => activeFilters.segments.includes(seg));
        }
        
        return activeFilters.segments.includes(customer.segment);
      });
    }
    
    // Apply tag filters
    if (activeFilters.tags.length > 0) {
      result = result.filter(customer => {
        if (!customer.tags || !Array.isArray(customer.tags)) return false;
        return customer.tags.some(tag => activeFilters.tags.includes(tag));
      });
    }
    
    setFilteredCustomers(result);
  }, [customers, searchTerm, activeFilters]);
  
  const toggleFilter = (type, value) => {
    setActiveFilters(prev => {
      const current = [...prev[type]];
      const index = current.indexOf(value);
      
      if (index === -1) {
        current.push(value);
      } else {
        current.splice(index, 1);
      }
      
      return {
        ...prev,
        [type]: current
      };
    });
  };
  
  const clearFilters = () => {
    setActiveFilters({
      segments: [],
      tags: []
    });
    setSearchTerm('');
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center mb-2">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customers..."
            className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm text-gray-600 hover:text-blue-500"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
            <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showFilters ? 'transform rotate-180' : ''}`} />
          </button>
          
          {(activeFilters.segments.length > 0 || activeFilters.tags.length > 0) && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Clear filters
            </button>
          )}
        </div>
        
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            {Array.isArray(segments) && segments.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Segments</h4>
                <div className="flex flex-wrap gap-1">
                  {segments.map(segment => (
                    <button
                      key={segment}
                      onClick={() => toggleFilter('segments', segment)}
                      className={`text-xs px-2 py-1 rounded-full ${
                        activeFilters.segments.includes(segment)
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {segment}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {Array.isArray(tags) && tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {tags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleFilter('tags', tag)}
                      className={`text-xs px-2 py-1 rounded-full ${
                        activeFilters.tags.includes(tag)
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="divide-y divide-gray-100">
        {Array.isArray(filteredCustomers) && filteredCustomers.length > 0 ? (
          filteredCustomers.map(customer => (
            <div
              key={customer._id}
              onClick={() => onSelectCustomer(customer._id)}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{customer.name}</h3>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                  </div>
                </div>
                
                {customer.segment && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                    {customer.segment}
                  </span>
                )}
              </div>
              
              {Array.isArray(customer.tags) && customer.tags.length > 0 && (
                <div className="mt-2 flex items-center">
                  <Tag className="h-3 w-3 text-gray-400 mr-1" />
                  <div className="flex flex-wrap gap-1">
                    {customer.tags.map(tag => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            {searchTerm || activeFilters.segments.length > 0 || activeFilters.tags.length > 0 ? (
              <p>No customers match your filters.</p>
            ) : (
              <p>No customers found. Add your first customer with the form above.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;