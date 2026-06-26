import { User } from '../types';
import { Settings as SettingsIcon, Bell, User as UserIcon, RefreshCw, Scale, Heart, AlertCircle, Camera, Eye, Plus, Trash2, ChevronDown, ChevronRight, Award, Briefcase, Calendar, Link as LinkIcon, Globe, ExternalLink } from 'lucide-react';
import { useState, ChangeEvent } from 'react';
import { Sun, Moon } from 'lucide-react';

interface SettingsProps {
  user: User;
  saveUserAndSync: (u: User) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (val: boolean) => void;
  onNotify: (msg: string) => void;
  onRetriggerOnboarding: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export function Settings({
  user,
  saveUserAndSync,
  notificationsEnabled,
  setNotificationsEnabled,
  onNotify,
  onRetriggerOnboarding,
  onLogout,
  onDeleteAccount
}: SettingsProps) {
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showLegalContent, setShowLegalContent] = useState<'terms' | 'privacy' | null>(null);
  const [showInternalStats, setShowInternalStats] = useState(false);
  const [dangerZoneOpen, setDangerZoneOpen] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  const [newPortfolioPlatform, setNewPortfolioPlatform] = useState('');
  const [newPortfolioUrl, setNewPortfolioUrl] = useState('');
  const [newSocialPlatform, setNewSocialPlatform] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');

  const portfolioLinks = user.portfolioLinks || [];
  const socialLinks = user.socialLinks || [];

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingPhoto(true);
      const url = URL.createObjectURL(file);
      saveUserAndSync({ ...user, photoUrl: url });
      onNotify('Profile picture updated successfully!');
    } catch (err) {
      console.error('Photo upload failed:', err);
      onNotify('Failed to upload profile picture.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const updateField = (field: string, value: any) => {
    saveUserAndSync({ ...user, [field]: value });
  };

  const addPortfolioLink = () => {
    if (!newPortfolioPlatform.trim() || !newPortfolioUrl.trim()) return;
    updateField('portfolioLinks', [...portfolioLinks, { platform: newPortfolioPlatform.trim(), url: newPortfolioUrl.trim() }]);
    setNewPortfolioPlatform('');
    setNewPortfolioUrl('');
    onNotify('Portfolio link added!');
  };

  const removePortfolioLink = (index: number) => {
    updateField('portfolioLinks', portfolioLinks.filter((_, i) => i !== index));
  };

  const addSocialLink = () => {
    if (!newSocialPlatform.trim() || !newSocialUrl.trim()) return;
    updateField('socialLinks', [...socialLinks, { platform: newSocialPlatform.trim(), url: newSocialUrl.trim() }]);
    setNewSocialPlatform('');
    setNewSocialUrl('');
    onNotify('Social link added!');
  };

  const removeSocialLink = (index: number) => {
    updateField('socialLinks', socialLinks.filter((_, i) => i !== index));
  };

  const handleDeleteConfirmed = () => {
    if (deleteConfirmInput === user.email) {
      onDeleteAccount();
      setShowDeleteConfirmModal(false);
    } else {
      onNotify('Email does not match. Account not deleted.');
    }
  };

  return (
    <div className="max-w-4xl bg-theme p-2 space-y-6 text-left">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-theme tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-theme" />
          Settings Panel
        </h1>
        <p className="text-xs text-theme-muted mt-1 font-semibold">
          Manage your coaching business profile, credentials, services, and account.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-card border-2 border-theme rounded-[24px] p-5 shadow-brutal space-y-4">
            <div className="flex items-center gap-3 relative">
              <div className="relative isolate group shrink-0">
                <img
                  src={user.photoUrl}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-theme"
                />
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={isUploadingPhoto} />
                  {isUploadingPhoto ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                </label>
              </div>
              <div className="min-w-0 font-black">
                <span className="text-[10px] font-mono bg-primary border border-theme text-theme px-1.5 py-0.5 rounded shadow-[1px_1px_0px_#191A23] uppercase tracking-widest inline-block">PROFESSIONAL PROFILE</span>
                <span className="font-extrabold text-theme text-sm truncate block leading-tight mt-1">{user.name}</span>
                <span className="text-[9px] text-theme block font-semibold truncate mt-0.5">{user.email}</span>
              </div>
            </div>

            {/* Collapsible Internal Metrics */}
            <div className="border-t-2 border-theme/10 pt-3">
              <button
                onClick={() => setShowInternalStats(!showInternalStats)}
                className="w-full flex items-center justify-between text-xs font-black text-theme-muted cursor-pointer hover:text-theme transition-colors"
              >
                <span>Internal Coach Metrics</span>
                {showInternalStats ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {showInternalStats && (
                <div className="mt-2 space-y-2 font-black">
                  <div className="flex justify-between text-xs text-theme-muted">
                    <span>Experience Level</span>
                    <span className="text-theme">Level {user.level}</span>
                  </div>
                  <div className="flex justify-between text-xs text-theme-muted">
                    <span>XP Progress</span>
                    <span className="text-theme">{user.xp} / {user.targetXp}</span>
                  </div>
                  <div className="flex justify-between text-xs text-theme-muted">
                    <span>Client Streak</span>
                    <span className="text-theme">{user.streak} Days</span>
                  </div>
                  <div className="flex justify-between text-xs text-theme-muted">
                    <span>Reward Points</span>
                    <span className="text-amber-500">{user.points} PTS</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => onNotify('Public coach profile preview coming soon!')}
              id="btn-settings-preview-profile"
              className="w-full py-2 px-3 bg-primary border-2 border-theme text-[10px] font-black text-theme rounded-xl transition-all shadow-[2px_2px_0px_#191A23] active:translate-y-0.5 active:shadow-none font-mono tracking-wider uppercase cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview Public Coach Profile
            </button>
          </div>

          {/* Quick Credentials Summary */}
          <div className="bg-card border-2 border-theme rounded-[24px] p-5 shadow-[4px_4px_0px_#191A23] space-y-3">
            <h3 className="font-extrabold text-theme text-xs flex items-center gap-2 uppercase font-mono tracking-wider">
              <Award className="w-4 h-4 text-theme" />
              Credentials at a Glance
            </h3>
            {user.certifications ? (
              <div className="text-[10px] font-semibold text-theme-muted leading-relaxed">
                <span className="font-black text-theme block text-[9px] uppercase tracking-wider mb-0.5">Certifications</span>
                {user.certifications}
              </div>
            ) : (
              <p className="text-[10px] text-theme-dim font-semibold italic">No certifications listed yet.</p>
            )}
            {user.specializations && (
              <div className="text-[10px] font-semibold text-theme-muted leading-relaxed">
                <span className="font-black text-theme block text-[9px] uppercase tracking-wider mb-0.5">Specializations</span>
                {user.specializations}
              </div>
            )}
            {user.yearsOfExperience ? (
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-theme-muted">
                <Briefcase className="w-3 h-3 text-theme" />
                <span className="font-black text-theme">{user.yearsOfExperience} years of experience</span>
              </div>
            ) : null}
          </div>

          <div className="bg-card border-2 border-theme rounded-[24px] p-5 shadow-[4px_4px_0px_#191A23]">
            <div className="flex items-start gap-2 text-theme bg-primary/20 border border-theme p-3 rounded-2xl">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-theme" />
              <div className="text-[11px] leading-relaxed font-black">
                <b className="font-black block text-theme mb-0.5">Commercial Ready Environment</b>
                Strictly white background parameters, local offline persistence models, and responsive mobile alignments activated.
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns */}
        <div className="md:col-span-2 space-y-6">

          {/* Section 1: Coach Credentials & Expertise */}
          <div className="bg-card border-2 border-theme rounded-[24px] p-6 shadow-[4px_4px_0px_#191A23] space-y-4">
            <h3 className="font-extrabold text-theme text-sm flex items-center gap-2 uppercase font-mono tracking-wider leading-none">
              <Award className="w-4 h-4 text-theme" />
              Coach Credentials & Expertise
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black text-theme-muted tracking-wider uppercase block mb-1">CERTIFICATIONS</label>
                <input
                  type="text"
                  value={user.certifications || ''}
                  id="input-settings-certifications"
                  onChange={(e) => updateField('certifications', e.target.value)}
                  placeholder="e.g. NSCA-CSCS, ACE Certified"
                  className="w-full p-3 rounded-xl border-2 border-theme outline-none text-xs font-black bg-theme-secondary focus:bg-primary/10 placeholder:text-theme-dim"
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-theme-muted tracking-wider uppercase block mb-1">YEARS OF EXPERIENCE</label>
                <input
                  type="number"
                  value={user.yearsOfExperience || 0}
                  id="input-settings-experience"
                  onChange={(e) => updateField('yearsOfExperience', parseInt(e.target.value) || 0)}
                  min={0}
                  max={100}
                  className="w-full p-3 rounded-xl border-2 border-theme outline-none text-xs font-black bg-theme-secondary focus:bg-primary/10"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black text-theme-muted tracking-wider uppercase block mb-1">SPECIALIZATIONS</label>
              <input
                type="text"
                value={user.specializations || ''}
                id="input-settings-specializations"
                onChange={(e) => updateField('specializations', e.target.value)}
                placeholder="e.g. Strength & Conditioning, Nutrition Coaching"
                className="w-full p-3 rounded-xl border-2 border-theme outline-none text-xs font-black bg-theme-secondary focus:bg-primary/10 placeholder:text-theme-dim"
              />
            </div>

            <div>
              <label className="text-[9px] font-black text-theme-muted tracking-wider uppercase block mb-1">BIO / ABOUT ME</label>
              <textarea
                value={user.bio || ''}
                id="input-settings-bio"
                onChange={(e) => updateField('bio', e.target.value)}
                placeholder="Tell potential clients about your coaching philosophy and approach..."
                rows={3}
                className="w-full p-3 rounded-xl border-2 border-theme outline-none text-xs font-black bg-theme-secondary focus:bg-primary/10 placeholder:text-theme-dim resize-none"
              />
            </div>
          </div>

          {/* Section 2: Notification Settings */}
          <div className="bg-card border-2 border-theme rounded-[24px] p-6 shadow-[4px_4px_0px_#191A23] space-y-4">
            <h3 className="font-extrabold text-theme text-sm flex items-center gap-2 uppercase font-mono tracking-wider leading-none">
              <Bell className="w-4 h-4 text-theme" />
              Notification Settings
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-black text-xs text-theme block">New client inquiry alerts</span>
                <span className="text-[9px] text-theme-muted font-bold leading-normal block max-w-sm">
                  Receive instant notifications when a potential client submits an inquiry or requests a consultation.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                id="checkbox-settings-client-inquiries"
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-5 h-5 text-theme accent-primary border-2 border-theme checked:bg-primary rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-black text-xs text-theme block">Booking & session reminders</span>
                <span className="text-[9px] text-theme-muted font-bold leading-normal block max-w-sm">
                  Get reminded about upcoming coaching sessions, consultations, and scheduled check-ins.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                id="checkbox-settings-booking-reminders"
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-5 h-5 text-theme accent-primary border-2 border-theme checked:bg-primary rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-black text-xs text-theme block">Client progress updates</span>
                <span className="text-[9px] text-theme-muted font-bold leading-normal block max-w-sm">
                  Receive summaries when your clients log new workouts, measurements, or hit milestones.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                id="checkbox-settings-client-progress"
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-5 h-5 text-theme accent-primary border-2 border-theme checked:bg-primary rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Section 3: Client Onboarding Templates */}
          <div className="bg-card border-2 border-theme rounded-[24px] p-6 shadow-[4px_4px_0px_#191A23] space-y-4">
            <h3 className="font-extrabold text-theme text-sm flex items-center gap-2 uppercase font-mono tracking-wider leading-none">
              <RefreshCw className="w-4 h-4 text-theme" />
              Client Onboarding Templates
            </h3>

            <p className="text-xs text-theme-muted font-semibold leading-relaxed">
              Send a structured onboarding flow to new clients. Choose a template below to get them started.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => onNotify('Introductory Consultation template sent!')}
                className="p-4 rounded-2xl border-2 border-theme bg-card hover:bg-primary/10 transition-all text-left cursor-pointer group"
              >
                <span className="font-black text-xs text-theme block">Intro Consultation</span>
                <span className="text-[9px] text-theme-muted font-semibold block mt-1 leading-relaxed">
                  Collect client goals, medical history, and availability.
                </span>
              </button>
              <button
                onClick={() => onNotify('Fitness Assessment template sent!')}
                className="p-4 rounded-2xl border-2 border-theme bg-card hover:bg-primary/10 transition-all text-left cursor-pointer group"
              >
                <span className="font-black text-xs text-theme block">Fitness Assessment</span>
                <span className="text-[9px] text-theme-muted font-semibold block mt-1 leading-relaxed">
                  Baseline measurements, movement screening, and goals.
                </span>
              </button>
              <button
                onClick={() => onNotify('Nutrition Setup template sent!')}
                className="p-4 rounded-2xl border-2 border-theme bg-card hover:bg-primary/10 transition-all text-left cursor-pointer group"
              >
                <span className="font-black text-xs text-theme block">Nutrition Setup</span>
                <span className="text-[9px] text-theme-muted font-semibold block mt-1 leading-relaxed">
                  Dietary preferences, restrictions, and meal planning.
                </span>
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={onRetriggerOnboarding}
                id="btn-settings-onboarding-restart"
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-card text-theme border-2 border-theme text-xs font-black rounded-xl shadow-[3px_3px_0px_#191A23] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none cursor-pointer transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Customize Onboarding Flow</span>
              </button>
            </div>
          </div>

          {/* Section 4: Services & Availability */}
          <div className="bg-card border-2 border-theme rounded-[24px] p-6 shadow-[4px_4px_0px_#191A23] space-y-4">
            <h3 className="font-extrabold text-theme text-sm flex items-center gap-2 uppercase font-mono tracking-wider leading-none">
              <Calendar className="w-4 h-4 text-theme" />
              Services & Availability
            </h3>

            <div>
              <label className="text-[9px] font-black text-theme-muted tracking-wider uppercase block mb-1">SERVICES OFFERED</label>
              <textarea
                value={user.services || ''}
                id="input-settings-services"
                onChange={(e) => updateField('services', e.target.value)}
                placeholder="e.g. 1-on-1 Coaching, Group Sessions, Nutrition Planning, Program Design"
                rows={2}
                className="w-full p-3 rounded-xl border-2 border-theme outline-none text-xs font-black bg-theme-secondary focus:bg-primary/10 placeholder:text-theme-dim resize-none"
              />
            </div>

            <div>
              <label className="text-[9px] font-black text-theme-muted tracking-wider uppercase block mb-1">AVAILABILITY HOURS</label>
              <input
                type="text"
                value={user.availability || ''}
                id="input-settings-availability"
                onChange={(e) => updateField('availability', e.target.value)}
                placeholder="e.g. Mon-Fri 6AM-8PM, Sat 8AM-12PM"
                className="w-full p-3 rounded-xl border-2 border-theme outline-none text-xs font-black bg-theme-secondary focus:bg-primary/10 placeholder:text-theme-dim"
              />
            </div>

            <div>
              <label className="text-[9px] font-black text-theme-muted tracking-wider uppercase block mb-1">BOOKING LINK</label>
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-theme-dim shrink-0" />
                <input
                  type="url"
                  value={user.bookingLink || ''}
                  id="input-settings-booking-link"
                  onChange={(e) => updateField('bookingLink', e.target.value)}
                  placeholder="https://calendly.com/your-link"
                  className="w-full p-3 rounded-xl border-2 border-theme outline-none text-xs font-black bg-theme-secondary focus:bg-primary/10 placeholder:text-theme-dim"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Portfolio & Social Links */}
          <div className="bg-card border-2 border-theme rounded-[24px] p-6 shadow-[4px_4px_0px_#191A23] space-y-4">
            <h3 className="font-extrabold text-theme text-sm flex items-center gap-2 uppercase font-mono tracking-wider leading-none">
              <Globe className="w-4 h-4 text-theme" />
              Portfolio & Social Links
            </h3>

            {/* Portfolio Links */}
            <div>
              <label className="text-[9px] font-black text-theme-muted tracking-wider uppercase block mb-2">PORTFOLIO LINKS</label>
              <div className="space-y-2">
                {portfolioLinks.map((link, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-xl border border-theme bg-theme-secondary">
                    <ExternalLink className="w-3.5 h-3.5 text-theme-dim shrink-0" />
                    <span className="text-[10px] font-black text-theme min-w-[80px]">{link.platform}</span>
                    <span className="text-[10px] text-theme-muted truncate flex-1">{link.url}</span>
                    <button onClick={() => removePortfolioLink(i)} className="p-1 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={newPortfolioPlatform}
                  onChange={(e) => setNewPortfolioPlatform(e.target.value)}
                  placeholder="Platform"
                  className="w-[120px] p-2 rounded-xl border-2 border-theme outline-none text-[10px] font-black bg-theme-secondary focus:bg-primary/10 placeholder:text-theme-dim"
                />
                <input
                  type="url"
                  value={newPortfolioUrl}
                  onChange={(e) => setNewPortfolioUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 p-2 rounded-xl border-2 border-theme outline-none text-[10px] font-black bg-theme-secondary focus:bg-primary/10 placeholder:text-theme-dim"
                />
                <button onClick={addPortfolioLink} className="p-2 bg-primary border-2 border-theme rounded-xl hover:bg-[#a8e85c] transition-colors cursor-pointer shrink-0">
                  <Plus className="w-3.5 h-3.5 text-theme" />
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div className="border-t-2 border-theme/10 pt-4">
              <label className="text-[9px] font-black text-theme-muted tracking-wider uppercase block mb-2">SOCIAL LINKS</label>
              <div className="space-y-2">
                {socialLinks.map((link, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-xl border border-theme bg-theme-secondary">
                    <ExternalLink className="w-3.5 h-3.5 text-theme-dim shrink-0" />
                    <span className="text-[10px] font-black text-theme min-w-[80px]">{link.platform}</span>
                    <span className="text-[10px] text-theme-muted truncate flex-1">{link.url}</span>
                    <button onClick={() => removeSocialLink(i)} className="p-1 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={newSocialPlatform}
                  onChange={(e) => setNewSocialPlatform(e.target.value)}
                  placeholder="Platform"
                  className="w-[120px] p-2 rounded-xl border-2 border-theme outline-none text-[10px] font-black bg-theme-secondary focus:bg-primary/10 placeholder:text-theme-dim"
                />
                <input
                  type="url"
                  value={newSocialUrl}
                  onChange={(e) => setNewSocialUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 p-2 rounded-xl border-2 border-theme outline-none text-[10px] font-black bg-theme-secondary focus:bg-primary/10 placeholder:text-theme-dim"
                />
                <button onClick={addSocialLink} className="p-2 bg-primary border-2 border-theme rounded-xl hover:bg-[#a8e85c] transition-colors cursor-pointer shrink-0">
                  <Plus className="w-3.5 h-3.5 text-theme" />
                </button>
              </div>
            </div>
          </div>

          {/* Section 6: Help & Feedback */}
          <div className="bg-card border-2 border-theme rounded-[24px] p-6 shadow-[4px_4px_0px_#191A23] space-y-4">
            <h3 className="font-extrabold text-theme text-sm flex items-center gap-2 uppercase font-mono tracking-wider leading-none">
              <Heart className="w-4 h-4 text-theme" />
              Help & Feedback
            </h3>
            <p className="text-xs text-theme-muted font-semibold leading-relaxed">
              Have a suggestion, feature request, or need assistance? Our team is here to help you get the most out of FitSphere Pro. Reach out and we'll respond promptly.
            </p>
            <div className="pt-2">
              <a href="mailto:kundansaduyashwanth@gmail.com" className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-card text-theme border-2 border-theme text-xs font-black rounded-xl shadow-[3px_3px_0px_#191A23] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none cursor-pointer transition-all">
                Submit Feedback
              </a>
            </div>
          </div>

          {/* Section 7: Legal & Privacy */}
          <div className="bg-card border-2 border-theme rounded-[24px] p-6 shadow-[4px_4px_0px_#191A23] space-y-4">
            <h3 className="font-extrabold text-theme text-sm flex items-center gap-2 uppercase font-mono tracking-wider leading-none">
              <Scale className="w-4 h-4 text-theme" />
              Terms & Privacy Policies
            </h3>
            <div className="space-y-3">
              <button onClick={() => setShowLegalContent('terms')} className="w-full flex items-center justify-between p-3 rounded-xl border border-theme hover:bg-theme-secondary transition-colors cursor-pointer group">
                <span className="text-xs font-black text-theme group-hover:text-indigo-600 transition-colors">Terms and Conditions</span>
                <span className="font-black text-theme">→</span>
              </button>
              <button onClick={() => setShowLegalContent('privacy')} className="w-full flex items-center justify-between p-3 rounded-xl border border-theme hover:bg-theme-secondary transition-colors cursor-pointer group">
                <span className="text-xs font-black text-theme group-hover:text-indigo-600 transition-colors">Privacy Policy</span>
                <span className="font-black text-theme">→</span>
              </button>
            </div>
          </div>

          {/* Section 8: About FitSphere Pro */}
          <div className="bg-card border-2 border-theme rounded-[24px] p-6 shadow-[4px_4px_0px_#191A23] space-y-4">
             <h3 className="font-extrabold text-theme text-sm flex items-center gap-2 uppercase font-mono tracking-wider leading-none">
              <UserIcon className="w-4 h-4 text-theme" />
              About FitSphere Pro
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-theme-muted tracking-wider uppercase mb-0.5">DEVELOPER</span>
                <span className="font-extrabold text-theme text-sm">KUNDAN SADHU YASWANTH</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-theme-muted tracking-wider uppercase mb-0.5">CONTACT</span>
                <a href="mailto:kundansaduyashwanth@gmail.com" className="font-extrabold text-indigo-600 hover:underline">kundansaduyashwanth@gmail.com</a>
              </div>
              <p className="text-[10px] text-theme-muted font-semibold leading-relaxed pt-1 border-t border-theme">
                FitSphere Pro — AI-powered coaching platform for fitness professionals. Empowering trainers to manage clients, deliver programs, and grow their business.
              </p>
            </div>
          </div>

          {/* Section 9: Account Actions */}
          <div className="bg-card border-2 border-theme rounded-[24px] p-6 shadow-[4px_4px_0px_#191A23] space-y-4">
            <h3 className="font-extrabold text-theme text-sm flex items-center gap-2 uppercase font-mono tracking-wider leading-none">
              <UserIcon className="w-4 h-4 text-theme" />
              Account Management
            </h3>

            <div className="pt-2 space-y-4 flex flex-col">
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-theme hover:bg-theme-secondary transition-colors cursor-pointer group"
              >
                <span className="text-xs font-black text-theme">Sign Out</span>
                <span className="font-black text-theme">→</span>
              </button>
            </div>
          </div>

          {/* Section 10: Danger Zone */}
          <div className="bg-card border-2 border-rose-600 rounded-[24px] p-6 shadow-brutal space-y-4">
            <button
              onClick={() => setDangerZoneOpen(!dangerZoneOpen)}
              className="w-full flex items-center justify-between cursor-pointer"
            >
              <h3 className="font-extrabold text-sm flex items-center gap-2 uppercase font-mono tracking-wider leading-none text-rose-600">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Danger Zone
              </h3>
              {dangerZoneOpen ? <ChevronDown className="w-4 h-4 text-rose-600" /> : <ChevronRight className="w-4 h-4 text-rose-600" />}
            </button>

            {dangerZoneOpen && (
              <div className="space-y-4 pt-2 border-t-2 border-rose-600/20">
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-xs text-rose-700 block">Delete Account</span>
                      <span className="text-[10px] text-rose-600 font-semibold block mt-0.5 leading-relaxed">
                        This action is irreversible. All your data, client information, and settings will be permanently removed. Please proceed with caution.
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowDeleteConfirmModal(true)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border-2 border-rose-600 bg-rose-50 hover:bg-rose-600 group transition-all cursor-pointer"
                >
                  <span className="text-xs font-black text-rose-600 group-hover:text-white transition-colors">Delete Account</span>
                  <span className="font-black text-rose-600 group-hover:text-white transition-colors">⚠</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Legal Content Modal */}
      {showLegalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191A23]/50 p-4 backdrop-blur-sm">
          <div className="bg-card border-2 border-theme rounded-[24px] shadow-brutal-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-slide-up">
            <div className="p-5 border-b-2 border-theme bg-primary/20 flex justify-between items-center">
              <h2 className="text-lg font-black text-theme uppercase tracking-wider font-mono">
                {showLegalContent === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
              </h2>
              <button 
                onClick={() => setShowLegalContent(null)}
                className="p-1 hover:bg-[#191A23]/10 rounded-lg transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 flex items-center justify-center text-theme font-bold text-xl leading-none">×</div>
              </button>
            </div>
            <div className="p-6 overflow-y-auto font-medium text-sm text-theme space-y-4 leading-relaxed">
              {showLegalContent === 'terms' && (
                <>
                  <p className="font-black text-base">Welcome to FitSphere</p>
                  <p>By accessing or using the FitSphere application, you agree to comply with and be bound by these Terms and Conditions.</p>
                  <p className="font-black mt-4">1. Acceptance of Terms</p>
                  <p>You must be at least 13 years old to use this Service. By creating an account, you confirm that the information provided is accurate and complete.</p>
                  <p className="font-black mt-4">2. Health and Safety Disclaimer</p>
                  <p>FitSphere provides fitness and tracking features. The information provided is NOT medical advice. Always consult with a qualified healthcare professional before starting any new diet or exercise regiment.</p>
                  <p className="font-black mt-4">3. User Data and Accounts</p>
                  <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. We reserve the right to suspend or terminate accounts that violate our community standards.</p>
                  <p className="font-black mt-4">4. Limitation of Liability</p>
                  <p>In no event shall FitSphere, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
                </>
              )}
              {showLegalContent === 'privacy' && (
                <>
                  <p className="font-black text-base">FitSphere Privacy Policy</p>
                  <p>Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the FitSphere application.</p>
                  <p className="font-black mt-4">Information Collection</p>
                  <p>We may collect personal data such as your name, email address, weight, age, and fitness goals when you register on our platform. We also collect usage data to help us improve the application architecture and user experience.</p>
                  <p className="font-black mt-4">Data Security</p>
                  <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.</p>
                  <p className="font-black mt-4">Data Sharing</p>
                  <p>We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.</p>
                  <p className="font-black mt-4">Your Rights</p>
                  <p>Depending on your location, you may have rights under privacy laws regarding your personal data, including the right to request deletion of your data. You can delete your account and associated data using the "Delete Account" button in Settings.</p>
                </>
              )}
            </div>
            <div className="p-5 border-t-2 border-theme bg-theme-secondary flex justify-end">
              <button 
                onClick={() => setShowLegalContent(null)}
                className="px-6 py-2.5 bg-[#191A23] text-white border-2 border-theme font-black rounded-xl shadow-[3px_3px_0px_#B9FF66] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none cursor-pointer transition-all uppercase tracking-wider text-xs"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191A23]/50 p-4 backdrop-blur-sm">
          <div className="bg-card border-2 border-rose-600 rounded-[24px] shadow-brutal-xl max-w-md w-full overflow-hidden animate-slide-up">
            <div className="p-5 border-b-2 border-rose-600 bg-rose-50">
              <h2 className="text-lg font-black text-rose-700 uppercase tracking-wider font-mono flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Confirm Deletion
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs font-semibold text-theme-muted leading-relaxed">
                This action cannot be undone. All your data, client information, and settings will be permanently deleted.
              </p>
              <div>
                <label className="text-[10px] font-black text-theme-muted uppercase tracking-wider block mb-1">
                  Type your email <span className="text-rose-600">{user.email}</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  placeholder={user.email}
                  className="w-full p-3 rounded-xl border-2 border-rose-600 outline-none text-xs font-black bg-theme-secondary focus:bg-rose-50 placeholder:text-theme-dim"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => { setShowDeleteConfirmModal(false); setDeleteConfirmInput(''); }}
                  className="flex-1 py-2.5 px-4 bg-card border-2 border-theme text-xs font-black rounded-xl shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  disabled={deleteConfirmInput !== user.email}
                  className="flex-1 py-2.5 px-4 bg-rose-600 border-2 border-rose-700 text-white text-xs font-black rounded-xl shadow-[2px_2px_0px_#191A23] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Permanently Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
