import React from 'react';
import { Users } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

const ClubsPage = () => {
  const { clubs } = useAppContext();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-6">社团活动</h2>
      <div className="grid gap-4">
        {clubs.map(club => (
          <div key={club.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{club.name}</h3>
                  <p className="text-sm text-gray-600">{club.members} 名成员</p>
                  <p className="text-sm text-gray-500 mt-1">{club.nextEvent}</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
                加入社团
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClubsPage;
