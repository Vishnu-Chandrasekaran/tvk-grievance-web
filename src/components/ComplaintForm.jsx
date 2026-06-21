import React from 'react'
import Header from './Header'
import { FaChevronLeft } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const ComplaintForm = () => {
    const nav = useNavigate();
  return (
    <>
      <Header />
      <div className="container mx-auto p-4">
        <div className="flex items-center mt-4 md:mt-8 bg-gradient-to-r from-[#780301] to-[#B10D07] text-white">
            <div className="mb-4  p-4">
            <FaChevronLeft onClick={()=> nav('/home')}/>

            </div>
          <div className="mb-4  p-4">
            <h2 className="text-md font-semiboldg">Trackable Issue</h2>
            <p className="font-medium text-xs">கண்காணிக்கக்கூடிய புகார்</p>
          </div>
        </div>
        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          {/* Form fields would go here */}
        </form>
      </div>
    </>
  );
}

export default ComplaintForm