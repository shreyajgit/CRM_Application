import React from 'react';
import { useSelector } from 'react-redux';
import { Users, Megaphone, BrainCog, LineChart } from 'lucide-react';

export default function Dashboard() {
  const user = useSelector((state) => state?.user?.user);

  const features = [
    {
      title: 'Manage Customers',
      description: 'View, add, and update customer details with ease.',
      icon: <Users className="h-6 w-6 text-blue-600" />,
    },
    {
      title: 'Create Campaigns',
      description: 'Design targeted campaigns and track performance.',
      icon: <Megaphone className="h-6 w-6 text-green-600" />,
    },
    {
      title: 'AI Suggestions',
      description: 'Use Gemini AI to generate messages and segment rules.',
      icon: <BrainCog className="h-6 w-6 text-purple-600" />,
    },
    {
      title: 'Analytics',
      description: 'Monitor key metrics to improve customer engagement.',
      icon: <LineChart className="h-6 w-6 text-orange-600" />,
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome back{user ? `, ${user.name}` : ''}!</h1>
      <p className="text-gray-600 mb-8">
        This is your command center for customer management, campaigns, AI insights, and more.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white shadow hover:shadow-md transition-shadow rounded-2xl p-5 border border-gray-100"
          >
            <div className="flex items-center mb-3">
              <div className="mr-3">{feature.icon}</div>
              <h2 className="text-xl font-semibold text-gray-800">{feature.title}</h2>
            </div>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
