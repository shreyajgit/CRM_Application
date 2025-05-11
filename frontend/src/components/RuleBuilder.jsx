import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

const RuleBuilder = ({ rules, setRules, customerFields, previewAudienceSize }) => {
  const [audienceSize, setAudienceSize] = useState(0);

  // Field options based on customer data structure
  const fieldOptions = [
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'totalSpend', label: 'Total Spend' },
    { value: 'orderCount', label: 'Order Count' },
    { value: 'lastOrderDate', label: 'Last Order Date' },
    { value: 'segment', label: 'Segment' },
    { value: 'createdAt', label: 'Customer Since' },
    { value: 'tags', label: 'Tags' },
    ...(customerFields || [])
  ];

  // Different operator options based on field type
  const getOperatorOptions = (fieldName) => {
    const field = fieldOptions.find(f => f.value === fieldName);
    
    // Default operators
    const defaultOperators = [
      { value: 'equals', label: 'Equals' },
      { value: 'not_equals', label: 'Not Equals' }
    ];
    
    // Numeric operators
    const numericOperators = [
      ...defaultOperators,
      { value: 'greater_than', label: 'Greater Than' },
      { value: 'less_than', label: 'Less Than' },
      { value: 'between', label: 'Between' }
    ];
    
    // String operators
    const stringOperators = [
      ...defaultOperators,
      { value: 'contains', label: 'Contains' },
      { value: 'not_contains', label: 'Does Not Contain' }
    ];
    
    // Date operators
    const dateOperators = [
      ...defaultOperators,
      { value: 'greater_than', label: 'After' },
      { value: 'less_than', label: 'Before' },
      { value: 'between', label: 'Between' }
    ];
    
    // Array operators
    const arrayOperators = [
      { value: 'contains', label: 'Contains' },
      { value: 'not_contains', label: 'Does Not Contain' },
      { value: 'in', label: 'In' },
      { value: 'not_in', label: 'Not In' }
    ];
    
    switch (fieldName) {
      case 'totalSpend':
      case 'orderCount':
        return numericOperators;
      case 'lastOrderDate':
      case 'createdAt':
        return dateOperators;
      case 'tags':
      case 'segment':
        return arrayOperators;
      default:
        return stringOperators;
    }
  };

  // Add new rule
  const addRule = () => {
    setRules([
      ...rules,
      {
        field: fieldOptions[0].value,
        operator: getOperatorOptions(fieldOptions[0].value)[0].value,
        value: '',
        logicalOperator: rules.length > 0 ? 'AND' : undefined
      }
    ]);
  };

  // Remove rule
  const removeRule = (index) => {
    const newRules = [...rules];
    newRules.splice(index, 1);
    setRules(newRules);
  };

  // Update rule
  const updateRule = (index, field, value) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    
    // If field is changed, update operator to first valid option for that field
    if (field === 'field') {
      newRules[index].operator = getOperatorOptions(value)[0].value;
      newRules[index].value = ''; // Reset value when field changes
    }
    
    setRules(newRules);
  };

  // Update logical operator
  const updateLogicalOperator = (index, value) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], logicalOperator: value };
    setRules(newRules);
  };

  // Generate preview of audience size
  const handlePreviewAudience = async () => {
    if (rules.length === 0) {
      setAudienceSize(0);
      return;
    }
    
    const size = await previewAudienceSize(rules);
    setAudienceSize(size);
  };

  // Update audience preview when rules change
  useEffect(() => {
    if (previewAudienceSize) {
      const timer = setTimeout(() => {
        handlePreviewAudience();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [rules, previewAudienceSize]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Audience Rules</h3>
        <div>
          {previewAudienceSize && (
            <span className="mr-4 text-sm text-gray-600">
              Estimated audience size: <strong>{audienceSize}</strong> customers
            </span>
          )}
          <button
            type="button"
            onClick={addRule}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center text-sm"
          >
            <FaPlus className="mr-2" /> Add Rule
          </button>
        </div>
      </div>

      {rules.length === 0 && (
        <div className="p-8 border-2 border-dashed border-gray-300 rounded-md text-center text-gray-500">
          No rules defined. Add a rule to define your audience.
        </div>
      )}

      <div className="space-y-4">
        {rules.map((rule, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
            {index > 0 && (
              <div className="mb-3 pl-2">
                <select
                  className="bg-gray-100 border border-gray-300 text-gray-700 py-1 px-3 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                  value={rule.logicalOperator || 'AND'}
                  onChange={(e) => updateLogicalOperator(index, e.target.value)}
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>
              </div>
            )}
            
            <div className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-3">
                <select
                  className="w-full border border-gray-300 rounded p-2"
                  value={rule.field}
                  onChange={(e) => updateRule(index, 'field', e.target.value)}
                >
                  {fieldOptions.map(field => (
                    <option key={field.value} value={field.value}>
                      {field.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-span-3">
                <select
                  className="w-full border border-gray-300 rounded p-2"
                  value={rule.operator}
                  onChange={(e) => updateRule(index, 'operator', e.target.value)}
                >
                  {getOperatorOptions(rule.field).map(op => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-span-5">
                {rule.operator === 'between' ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type={rule.field.includes('Date') ? 'date' : 'text'}
                      className="w-full border border-gray-300 rounded p-2"
                      placeholder="Min value"
                      value={Array.isArray(rule.value) ? rule.value[0] || '' : ''}
                      onChange={(e) => updateRule(index, 'value', [e.target.value, Array.isArray(rule.value) ? rule.value[1] || '' : ''])}
                    />
                    <span>to</span>
                    <input
                      type={rule.field.includes('Date') ? 'date' : 'text'}
                      className="w-full border border-gray-300 rounded p-2"
                      placeholder="Max value"
                      value={Array.isArray(rule.value) ? rule.value[1] || '' : ''}
                      onChange={(e) => updateRule(index, 'value', [Array.isArray(rule.value) ? rule.value[0] || '' : '', e.target.value])}
                    />
                  </div>
                ) : (
                  <input
                    type={rule.field.includes('Date') ? 'date' : 'text'}
                    className="w-full border border-gray-300 rounded p-2"
                    placeholder="Value"
                    value={rule.value}
                    onChange={(e) => updateRule(index, 'value', e.target.value)}
                  />
                )}
              </div>
              
              <div className="col-span-1 text-right">
                <button
                  type="button"
                  onClick={() => removeRule(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RuleBuilder;