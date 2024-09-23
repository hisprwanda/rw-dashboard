import React from 'react';

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary border-solid"></div>
        <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-transparent border-opacity-50"></div>
      </div>
      <span className="ml-4 text-xl font-medium text-primary">Loading...</span>
    </div>
  );
};

export default Loading;
