import React from 'react';
import ApperIcon from '@/components/ApperIcon';

const Empty = ({ message = 'No data available', icon = 'Inbox' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <ApperIcon name={icon} size={32} className="text-gray-400" />
      </div>
      <p className="text-gray-500 text-lg">{message}</p>
    </div>
  );
};

export default Empty;