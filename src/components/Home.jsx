import React from 'react'
import Header from './Header'

import mainHeroBanner from "../assets/mainHero.png";
import desktopBanner from "../assets/desktopBannerCropo.png";
import { FiShield } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
  return (
    <>
    <Header />
    <div >
        <img src={mainHeroBanner} alt="Logo" className="w-full h-auto max-h-[280px]  object-cover md:hidden" />
        <img src={desktopBanner} alt="Logo" className="w-[90%] mx-auto h-auto max-h-[300px] hidden md:block" />
    </div>
    <div className='flex flex-col md:flex-row items-center justify-center mt-4 md:mt-8'>
        <button className='border-[#A56B6B] border-1 text-[#7B0200] px-4 py-2 rounded-lg mt-4 md:mt-8 ml-4 md:ml-8 flex items-center justify-center cursor-pointer' onClick={() => navigate("/drug-complaint")} >
            <div className='flex items-center justify-center bg-[#FFEEEE] text-[#810000] p-4 rounded-full'  >
                <FiShield  className='text-xl'/>
            </div>
            <div className='flex flex-col items-start justify-center ml-2'>
            <p className='ml-2 font-bold'>Drug Complaint</p>
            <p className='ml-2 font-medium text-sm text-[#A56B6B]'>போதைப்பொருள் தொடர்பான புகார்</p>

            </div>

        </button>
    </div>

    </>
  )
}

export default Home