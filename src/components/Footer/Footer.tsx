import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-gray-900 text-white text-center py-4 fixed bottom-0 left-0">
      <p>&copy; {new Date().getFullYear()} HISP Rwanda. All rights reserved.</p>
    </footer>
  );
};

export default Footer;