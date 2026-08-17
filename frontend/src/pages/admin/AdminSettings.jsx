import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, CheckCircle2, Upload, Camera, Plus, Trash2, User } from 'lucide-react';
import { MOCK_LAWYER_SETTINGS } from '../../data/adminMockData';

export default function AdminSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('siteSettings');
    return saved ? JSON.parse(saved) : MOCK_LAWYER_SETTINGS;
  });

  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const saveAllSettings = (msg) => {
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    window.dispatchEvent(new Event('siteSettingsUpdated'));
    showToast(msg);
  };

  const handleProfileChange = (field, val) => {
    setSettings(prev => ({ ...prev, profile: { ...prev.profile, [field]: val } }));
  };

  const handleOfficeChange = (field, val) => {
    setSettings(prev => ({ ...prev, office: { ...prev.office, [field]: val } }));
  };

  const handleAboutChange = (field, val) => {
    setSettings(prev => ({
      ...prev,
      aboutPage: { ...(prev.aboutPage || MOCK_LAWYER_SETTINGS.aboutPage), [field]: val }
    }));
  };

  const handleImageUpload = (e, fieldKey) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        handleAboutChange(fieldKey, dataUrl);
        showToast('Photo selected! Click "Save About Details"');
      }
    };
    reader.readAsDataURL(file);
  };

  // Team Members CRUD
  const handleTeamMemberChange = (index, field, val) => {
    const currentMembers = [...(settings.aboutPage?.teamMembers || MOCK_LAWYER_SETTINGS.aboutPage.teamMembers)];
    currentMembers[index] = { ...currentMembers[index], [field]: val };
    handleAboutChange('teamMembers', currentMembers);
  };

  const handleAddTeamMember = () => {
    const currentMembers = [...(settings.aboutPage?.teamMembers || MOCK_LAWYER_SETTINGS.aboutPage.teamMembers)];
    const newMember = {
      id: `team-${Date.now()}`,
      name: "New Editorial Member",
      role: "Legal Research Associate",
      qual: "LL.B | Advocate",
      focus: "Ratio Decidendi Extraction & Precedent Analysis"
    };
    handleAboutChange('teamMembers', [...currentMembers, newMember]);
    showToast('New team member added! Click "Save About Details"');
  };

  const handleDeleteTeamMember = (indexToDelete) => {
    const currentMembers = [...(settings.aboutPage?.teamMembers || MOCK_LAWYER_SETTINGS.aboutPage.teamMembers)];
    const filtered = currentMembers.filter((_, idx) => idx !== indexToDelete);
    handleAboutChange('teamMembers', filtered);
    showToast('Team member removed! Click "Save About Details"');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin');
  };

  const about = settings.aboutPage || MOCK_LAWYER_SETTINGS.aboutPage;
  const teamMembers = about.teamMembers || MOCK_LAWYER_SETTINGS.aboutPage.teamMembers;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 font-jakarta text-[#0B1727]">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-200/80">
        <h1 className="text-3xl font-extrabold tracking-tight font-cinzel text-[#0B1727]">
          Settings
        </h1>
        <p className="text-slate-500 text-xs font-medium mt-1">
          Manage Admin Profile, Contact Page details, and About Page leadership, photos & team members.
        </p>
      </div>

      {/* Form Sections */}
      <div className="space-y-8">
        
        {/* SECTION 1: PROFILE */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#0B1727]">1. Admin Profile Settings</h2>
              <p className="text-xs text-slate-500">Administrator user details</p>
            </div>
            <button
              onClick={() => saveAllSettings('Profile settings saved')}
              className="px-3.5 py-1.5 bg-[#0B1727] hover:bg-slate-800 text-white font-bold text-xs rounded transition-colors cursor-pointer"
            >
              Save Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Admin Name</label>
              <input
                type="text"
                value={settings.profile.adminName}
                onChange={(e) => handleProfileChange('adminName', e.target.value)}
                placeholder="Enter Admin Name"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-primary-600 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
              <input
                type="text"
                value={settings.profile.mobileNumber}
                onChange={(e) => handleProfileChange('mobileNumber', e.target.value)}
                placeholder="Enter Mobile Number"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-primary-600 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={settings.profile.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                placeholder="Enter Email Address"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-primary-600 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">System Role</label>
              <input
                type="text"
                readOnly
                value={settings.profile.role}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded text-slate-500 font-bold cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: CONTACT PAGE & OFFICE INFORMATION */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#0B1727]">2. Contact Page Details</h2>
              <p className="text-xs text-slate-500">Updates the public Contact & Support page in real time</p>
            </div>
            <button
              onClick={() => saveAllSettings('Contact page details updated')}
              className="px-3.5 py-1.5 bg-[#0B1727] hover:bg-slate-800 text-white font-bold text-xs rounded transition-colors cursor-pointer"
            >
              Save Contact Details
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Support Number #1</label>
              <input
                type="text"
                value={settings.office.contactNumber || ''}
                onChange={(e) => handleOfficeChange('contactNumber', e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-primary-600 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Support Number #2</label>
              <input
                type="text"
                value={settings.office.contactNumber2 || ''}
                onChange={(e) => handleOfficeChange('contactNumber2', e.target.value)}
                placeholder="e.g. +91 98765 43211"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-primary-600 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Support Email #1</label>
              <input
                type="email"
                value={settings.office.officeEmail || ''}
                onChange={(e) => handleOfficeChange('officeEmail', e.target.value)}
                placeholder="e.g. support@digilawreporter.in"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-primary-600 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Support Email #2</label>
              <input
                type="email"
                value={settings.office.officeEmail2 || ''}
                onChange={(e) => handleOfficeChange('officeEmail2', e.target.value)}
                placeholder="e.g. editorial@digilawreporter.in"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-primary-600 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Lawyer / Senior Partner Name</label>
              <input
                type="text"
                value={settings.office.lawyerName || ''}
                onChange={(e) => handleOfficeChange('lawyerName', e.target.value)}
                placeholder="e.g. Adv. Senior Partner Name"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-primary-600 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Office / Chamber Name</label>
              <input
                type="text"
                value={settings.office.officeName || ''}
                onChange={(e) => handleOfficeChange('officeName', e.target.value)}
                placeholder="e.g. Supreme Court Bar Chambers Block"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-primary-600 font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Office Address (Headquarters)</label>
              <input
                type="text"
                value={settings.office.officeAddress || ''}
                onChange={(e) => handleOfficeChange('officeAddress', e.target.value)}
                placeholder="e.g. Supreme Court Bar Chambers Block, New Delhi, Delhi 110001"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-primary-600 font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Working Hours</label>
              <input
                type="text"
                value={settings.office.workingHours || ''}
                onChange={(e) => handleOfficeChange('workingHours', e.target.value)}
                placeholder="e.g. Mon - Sat: 9:00 AM - 7:00 PM IST"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-primary-600 font-medium"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: ABOUT PAGE LEADERSHIP & EDITORIAL TEAM */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#0B1727]">3. About Page Details & Editorial Team</h2>
              <p className="text-xs text-slate-500">Updates founder photos, details & editorial board members in real time</p>
            </div>
            <button
              onClick={() => saveAllSettings('About page details & team updated')}
              className="px-3.5 py-1.5 bg-[#0B1727] hover:bg-slate-800 text-white font-bold text-xs rounded transition-colors cursor-pointer"
            >
              Save About Details
            </button>
          </div>

          <div className="space-y-8 text-xs">
            
            {/* SUB-SECTION 3A: FOUNDERS */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
                Senior Advocates & Founders
              </h3>

              {/* Founder 1 Card */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Founder / Senior Partner #1</h4>
                  {about.founder1Image && (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      Photo Attached
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1.5">Advocate Photo (File Upload or Image URL)</label>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      {about.founder1Image ? (
                        <img 
                          src={about.founder1Image} 
                          alt="Founder 1 Preview" 
                          className="w-12 h-12 rounded-lg object-cover border border-slate-300 shadow-xs shrink-0" 
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 border border-slate-300">
                          <Camera size={20} />
                        </div>
                      )}

                      <input
                        type="text"
                        value={about.founder1Image || ''}
                        onChange={(e) => handleAboutChange('founder1Image', e.target.value)}
                        placeholder="Paste Image URL or select local file..."
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded text-slate-900 font-medium focus:outline-none focus:border-primary-600"
                      />

                      <label className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-2xs">
                        <Upload size={13} />
                        <span>Select Photo</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleImageUpload(e, 'founder1Image')} 
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={about.founder1Name || ''}
                      onChange={(e) => handleAboutChange('founder1Name', e.target.value)}
                      placeholder="Senior Advocate Name"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded text-slate-900 font-medium focus:outline-none focus:border-primary-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Title / Role</label>
                    <input
                      type="text"
                      value={about.founder1Title || ''}
                      onChange={(e) => handleAboutChange('founder1Title', e.target.value)}
                      placeholder="Senior Advocate & Managing Founder"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded text-slate-900 font-medium focus:outline-none focus:border-primary-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Court</label>
                    <input
                      type="text"
                      value={about.founder1Court || ''}
                      onChange={(e) => handleAboutChange('founder1Court', e.target.value)}
                      placeholder="Supreme Court of India"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded text-slate-900 font-medium focus:outline-none focus:border-primary-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Experience</label>
                    <input
                      type="text"
                      value={about.founder1Experience || ''}
                      onChange={(e) => handleAboutChange('founder1Experience', e.target.value)}
                      placeholder="25+ Years Bar Practice"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded text-slate-900 font-medium focus:outline-none focus:border-primary-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Biography / Overview</label>
                    <textarea
                      rows={3}
                      value={about.founder1Bio || ''}
                      onChange={(e) => handleAboutChange('founder1Bio', e.target.value)}
                      placeholder="Enter biography overview..."
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded text-slate-900 font-medium focus:outline-none focus:border-primary-600"
                    />
                  </div>
                </div>
              </div>

              {/* Founder 2 Card */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Founder / Partner #2</h4>
                  {about.founder2Image && (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      Photo Attached
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1.5">Advocate Photo (File Upload or Image URL)</label>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      {about.founder2Image ? (
                        <img 
                          src={about.founder2Image} 
                          alt="Founder 2 Preview" 
                          className="w-12 h-12 rounded-lg object-cover border border-slate-300 shadow-xs shrink-0" 
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 border border-slate-300">
                          <Camera size={20} />
                        </div>
                      )}

                      <input
                        type="text"
                        value={about.founder2Image || ''}
                        onChange={(e) => handleAboutChange('founder2Image', e.target.value)}
                        placeholder="Paste Image URL or select local file..."
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded text-slate-900 font-medium focus:outline-none focus:border-primary-600"
                      />

                      <label className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-2xs">
                        <Upload size={13} />
                        <span>Select Photo</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleImageUpload(e, 'founder2Image')} 
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={about.founder2Name || ''}
                      onChange={(e) => handleAboutChange('founder2Name', e.target.value)}
                      placeholder="Co-Founder & Advocate Name"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded text-slate-900 font-medium focus:outline-none focus:border-primary-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Title / Role</label>
                    <input
                      type="text"
                      value={about.founder2Title || ''}
                      onChange={(e) => handleAboutChange('founder2Title', e.target.value)}
                      placeholder="Advocate-on-Record (AoR) & Co-Founder"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded text-slate-900 font-medium focus:outline-none focus:border-primary-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Court</label>
                    <input
                      type="text"
                      value={about.founder2Court || ''}
                      onChange={(e) => handleAboutChange('founder2Court', e.target.value)}
                      placeholder="Supreme Court of India"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded text-slate-900 font-medium focus:outline-none focus:border-primary-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Experience</label>
                    <input
                      type="text"
                      value={about.founder2Experience || ''}
                      onChange={(e) => handleAboutChange('founder2Experience', e.target.value)}
                      placeholder="18+ Years Litigation"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded text-slate-900 font-medium focus:outline-none focus:border-primary-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Biography / Overview</label>
                    <textarea
                      rows={3}
                      value={about.founder2Bio || ''}
                      onChange={(e) => handleAboutChange('founder2Bio', e.target.value)}
                      placeholder="Enter biography overview..."
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded text-slate-900 font-medium focus:outline-none focus:border-primary-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SUB-SECTION 3B: EDITORIAL & RESEARCH BOARD TEAM MEMBERS (DYNAMIC CRUD) */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                    Legal Research & Editorial Board Team Members ({teamMembers.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">Add, edit, or remove board member cards shown on About page</p>
                </div>

                <button
                  type="button"
                  onClick={handleAddTeamMember}
                  className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus size={14} />
                  <span>Add Team Member</span>
                </button>
              </div>

              {teamMembers.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-slate-500">
                  No editorial board members added yet. Click "+ Add Team Member" to add one.
                </div>
              ) : (
                <div className="space-y-4">
                  {teamMembers.map((member, mIdx) => (
                    <div key={member.id || mIdx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative group">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                          <User size={14} className="text-primary-600" />
                          <span>Board Member #{mIdx + 1}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteTeamMember(mIdx)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Delete Member"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Member Full Name</label>
                          <input
                            type="text"
                            value={member.name || ''}
                            onChange={(e) => handleTeamMemberChange(mIdx, 'name', e.target.value)}
                            placeholder="Full Name"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-slate-900 font-medium focus:outline-none focus:border-primary-600"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Role / Position</label>
                          <input
                            type="text"
                            value={member.role || ''}
                            onChange={(e) => handleTeamMemberChange(mIdx, 'role', e.target.value)}
                            placeholder="e.g. Senior Legal Editor"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-slate-900 font-medium focus:outline-none focus:border-primary-600"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Qualifications / Bar</label>
                          <input
                            type="text"
                            value={member.qual || ''}
                            onChange={(e) => handleTeamMemberChange(mIdx, 'qual', e.target.value)}
                            placeholder="e.g. LL.M | Senior Bar Practice"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-slate-900 font-medium focus:outline-none focus:border-primary-600"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Domain Focus / Specialization</label>
                          <input
                            type="text"
                            value={member.focus || ''}
                            onChange={(e) => handleTeamMemberChange(mIdx, 'focus', e.target.value)}
                            placeholder="e.g. Ratio Decidendi Extraction"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-slate-900 font-medium focus:outline-none focus:border-primary-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* SECTION 4: ACCOUNT & SECURITY */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="pb-3 border-b border-slate-200">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#0B1727]">Account Security</h2>
            <p className="text-xs text-slate-500">Change password & sign out</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-primary-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordForm.newPass}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-primary-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-primary-600"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => showToast('Password updated')}
              className="w-full sm:w-auto px-4 py-2 bg-[#0B1727] hover:bg-slate-800 text-white font-bold text-xs rounded transition-colors cursor-pointer"
            >
              Update Password
            </button>

            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs rounded transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>

      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1727] text-white font-bold text-xs px-5 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}