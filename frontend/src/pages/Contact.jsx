import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock, Compass } from 'lucide-react';
import { MOCK_LAWYER_SETTINGS } from '../data/adminMockData';

const GOOGLE_MAPS_EMBED_URL = "https://maps.google.com/maps?q=New%20Delhi,%20India&t=&z=13&ie=UTF8&iwloc=&output=embed";

export default function Contact() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('siteSettings');
    return saved ? JSON.parse(saved) : MOCK_LAWYER_SETTINGS;
  });

  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('siteSettings');
      if (saved) setSettings(JSON.parse(saved));
    };

    window.addEventListener('siteSettingsUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('siteSettingsUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const office = settings.office || MOCK_LAWYER_SETTINGS.office;

  return (
    <div className="min-h-screen bg-[#FAFBFF] font-jakarta py-10 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-primary-600 font-extrabold tracking-widest uppercase text-xs px-3.5 py-1 bg-primary-50 border border-primary-100 rounded-full inline-block">
            GET IN TOUCH WITH US
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-cinzel">
            Contact & Support
          </h1>
          <p className="text-slate-600 text-sm md:text-base font-normal">
            Have questions regarding legal data subscriptions, judgment digests, or technical assistance? We are here to assist you.
          </p>
        </div>

        {/* 1. TOP ROW: Contact Cards (Phone, Email, Address) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          {/* Card 1: Phone Card (2 Phone Numbers) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-lg hover:shadow-xl hover:border-primary-300 transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 border border-primary-100 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                <Phone size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
                  Phone Support
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">Direct helpline for advocates & firms</p>
              </div>
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <p className="text-slate-900 font-extrabold text-sm md:text-base">{office.contactNumber || "+91 98765 43210"}</p>
                <p className="text-slate-900 font-extrabold text-sm md:text-base">{office.contactNumber2 || "+91 98765 43211"}</p>
                <p className="text-slate-500 text-xs flex items-center gap-1.5 font-medium pt-1">
                  <Clock size={13} className="text-primary-600 shrink-0" />
                  <span>{office.workingHours || "Mon - Sat: 9:00 AM - 7:00 PM IST"}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Email Card (2 Email IDs) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-lg hover:shadow-xl hover:border-primary-300 transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 border border-primary-100 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                <Mail size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
                  Email Support
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">Editorial queries & subscriptions</p>
              </div>
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <p className="text-slate-900 font-extrabold text-sm md:text-base truncate">{office.officeEmail || "support@digilawreporter.in"}</p>
                <p className="text-slate-900 font-extrabold text-sm md:text-base truncate">{office.officeEmail2 || "editorial@digilawreporter.in"}</p>
              </div>
            </div>
          </div>

          {/* Card 3: Address Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-lg hover:shadow-xl hover:border-primary-300 transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 border border-primary-100 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                <MapPin size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
                  Headquarters
                </h3>
                <p className="text-slate-500 text-xs mt-0.5 truncate">{office.officeName || "Supreme Court Bar Chambers Block"}</p>
              </div>
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <p className="text-slate-900 font-bold text-sm leading-snug">{office.officeAddress || "New Delhi, Delhi 110001"}</p>
              </div>
            </div>
          </div>

        </div>

        {/* 2. BOTTOM SECTION: Responsive Embedded Google Map */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Compass size={16} className="text-primary-600" />
              <span>Office Location (Google Maps)</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Location: {office.officeAddress ? office.officeAddress.split(',')[0] : "New Delhi, India"}
            </span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xl h-80 sm:h-96 w-full relative">
            <iframe
              title="Law Chamber Office Location"
              src={GOOGLE_MAPS_EMBED_URL}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            ></iframe>
          </div>
        </div>

      </div>
    </div>
  );
}
