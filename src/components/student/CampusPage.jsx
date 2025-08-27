import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FileText, Phone, MapPin, Calendar, Users, ExternalLink } from 'lucide-react';

const CampusPage = () => {
  const { getThemeConfig } = useTheme();
  const themeConfig = getThemeConfig();

  const services = [
    { title: 'Academic Registry', desc: 'Transcripts, enrollment, records', icon: FileText, color: 'blue' },
    { title: 'Student Support', desc: 'Counseling, financial aid', icon: Phone, color: 'green' },
    { title: 'Campus Map', desc: 'Buildings, facilities, navigation', icon: MapPin, color: 'purple' },
    { title: 'Events Calendar', desc: 'Lectures, workshops, deadlines', icon: Calendar, color: 'orange' },
    { title: 'Student Organizations', desc: 'Clubs, societies, activities', icon: Users, color: 'pink' }
  ];

  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-light ${themeConfig.text}`}>Campus Services</h2>
      
      <div className="grid gap-4">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <div key={index} className={`${themeConfig.card} rounded-xl p-6 border border-white/20 ${themeConfig.cardHover} cursor-pointer transition-all duration-200`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-${service.color}-500/20 rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${service.color}-400`} />
                  </div>
                  <div>
                    <h3 className={`font-medium ${themeConfig.text} mb-1`}>{service.title}</h3>
                    <p className={`text-sm ${themeConfig.textSecondary}`}>{service.desc}</p>
                  </div>
                </div>
                <ExternalLink className={`w-5 h-5 ${themeConfig.textMuted}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className={`${themeConfig.card} rounded-xl p-6 border border-white/20`}>
        <h3 className={`text-lg font-medium ${themeConfig.text} mb-4`}>Quick Links</h3>
        <div className="grid grid-cols-2 gap-3">
          {['Moodle', 'Library', 'Timetable', 'Grades', 'Email', 'WiFi'].map(link => (
            <button key={link} className={`p-3 ${themeConfig.buttonSecondary} rounded-lg border border-white/20 text-sm font-medium transition-all duration-200`}>
              {link}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampusPage;
