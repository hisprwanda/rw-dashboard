import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-4 mt-10 z-1000">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} HISP Rwanda. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
