"use client";

import React from 'react';
import { 
 
  FaUsers, 
 
  FaPhoneAlt
} from 'react-icons/fa';
import {  IoMdClose } from 'react-icons/io';
import { MdOutlineArchitecture } from 'react-icons/md';
import Link from 'next/link';
import Image from 'next/image';
import servicesData from '../../data/online-muhuthalu.json';

const MuhurthamCard = ({ service, onClick }) => (
  <div 
    onClick={() => onClick(service)}
    className="bg-white shadow-sm border border-orange-100 p-3 flex flex-col items-center text-center transition-all hover:shadow-md cursor-pointer h-full active:scale-85"
  >
    {/* Image Section */}
    <div className="w-24 h-24 overflow-hidden mb-3 shrink-0 border-2 border-orange-100 shadow-sm relative">
      <Image 
        src={service.image} 
        alt={service.title}
        fill
        sizes="96px"
        className="object-cover"
      />
    </div>
    
    {/* Title Section */}
    <div className="flex-grow flex items-center justify-center w-full min-h-[40px]">
      <h3 className="text-gray-800 font-bold text-[13px] leading-tight px-0.5">
        {service.title}
      </h3>
    </div>
    
    {/* Pricing Section - Removed per feedback */}
    <div className="mt-1 w-full border-t border-orange-50 pt-1.5 min-h-[10px]">
    </div>
  </div>
);

const DetailModal = ({ isOpen, onClose, service }) => {
  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="bg-white w-full max-w-[420px] rounded-3xl overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200">
        {/* Header with Image */}
        <div className="relative h-48 bg-gradient-to-br from-orange-400 to-red-500">
          <Image 
            src={service.image} 
            alt={service.title}
            fill
            className="object-cover mix-blend-overlay opacity-60"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
            <h2 className="text-3xl font-black drop-shadow-md">{service.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/20 backdrop-blur-md hover:bg-black/40 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        {/* 3-Column Content Section */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {/* Importance */}
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center mb-3">
                <span className="text-orange-600 font-bold">01</span>
              </div>
              <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-wider mb-2">ప్రాముఖ్యత</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                {service.description.importance}
              </p>
            </div>

            {/* Procedure */}
            <div className="flex flex-col items-center text-center border-x border-gray-100 px-2">
              <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center mb-3">
                <span className="text-blue-600 font-bold">02</span>
              </div>
              <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-2">విధానం</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                {service.description.procedure}
              </p>
            </div>

            {/* Benefits */}
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center mb-3">
                <span className="text-green-600 font-bold">03</span>
              </div>
              <h4 className="text-[10px] font-black text-green-600 uppercase tracking-wider mb-2">ప్రయోజనాలు</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                {service.description.benefits}
              </p>
            </div>
          </div>

          {/* Highlighted Call Info */}
          <div className="mt-8 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-[length:200%_auto] animate-gradient-x p-4 rounded-2xl shadow-lg shadow-orange-200 text-white text-center">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-90"> ముహూర్తం  పెట్టడానికి కాల్ చేయండి</p>
            <div className="flex items-center justify-center space-x-2">
              <FaPhoneAlt className="animate-bounce" />
              <a href="tel:919494288900" className="text-xl font-black tracking-tighter">9494288900</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function OnlineMuhurthalu() {
  const [selectedService, setSelectedService] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleCardClick = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      {/* Centered container for mobile simulation if viewed on desktop */}
      <div className="w-full max-w-[420px] mx-auto bg-white min-h-screen shadow-xl flex flex-col">
        <main className="flex-grow p-4">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-red-600 to-orange-500 p-4 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="flex items-center space-x-3 z-10">
              <Link href="/" className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-white text-xl font-black tracking-tight">Muhurthaalu</h1>
            </div>
            <div className="flex space-x-2 z-10">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md">
                 <FaUsers className="text-sm" />
              </div>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-black italic backdrop-blur-md text-xs">i</div>
            </div>
            
            {/* Design Element */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl"></div>

            
          </div>
<div className="text-[12px] font-black uppercase tracking-widest mb-1 opacity-90">  శాస్త్రోక్తమైన ముహూర్తాలు ప్రతి శుభారంభానికి ఎంతో ముఖ్యమైనవి. పంచాంగ సిద్ధాంతాలను ఆధారంగా చేసుకొని సరైన తేదీ, సమయం నిర్ణయించడం వల్ల కార్యసిద్ధి, శుభఫలాలు కలుగుతాయని నమ్మకం. సంప్రదాయ ఆచారాలను పాటిస్తూ, ఆధునిక అవసరాలకు అనుగుణంగా రూపొందించిన మా ఆన్‌లైన్ ముహూర్తాలు సేవ ద్వారా మీరు ఎక్కడ ఉన్నా సులభంగా విశ్వసనీయమైన ముహూర్తాలను తెలుసుకోవచ్చు. జీవితంలోని ప్రతి ముఖ్యమైన సందర్భాన్ని శుభంగా ప్రారంభించేందుకు సరైన మార్గదర్శకత్వాన్ని మేము అందిస్తున్నాము. 🙏</div>
 
          <div className="grid grid-cols-3 gap-3">
            {servicesData.map((service) => (
               <MuhurthamCard 
                 key={service.id} 
                 service={service} 
                 onClick={handleCardClick}
               />
            ))}
          </div>

          <DetailModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            service={selectedService} 
          />
          
          {/* Footer Note */}
          <div className="mt-3 text-center p-4 bg-orange-50/50 rounded-2xl border border-orange-100/30 mb-8">
            <p className="text-orange-600 text-lg font-black leading-relaxed">
              "మంచి ముహూర్తం - మీ విజయానికి తొలిమెట్టు"
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

