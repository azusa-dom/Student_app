import React from 'react';
import { Briefcase, Calendar, MapPin } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

const JobsPage = () => {
  const { jobFairs } = useAppContext();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6">求职招聘</h2>
        <div className="grid gap-4">
          {jobFairs.map(fair => (
            <div key={fair.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{fair.title}</h3>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      {fair.date}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {fair.location}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {fair.companies.map((company, idx) => (
                        <span key={idx} className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded">
                          {company}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm">
                  报名参加
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
