import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  GraduationCap, 
  Globe, 
  Leaf, 
  BookOpen, 
  Shield, 
  Plane,
  Users,
  Target,
  TrendingUp,
  IndianRupee,
  ChevronRight
} from 'lucide-react';
// import { apiClient } from '@/lib/apiClient';
// import { toast } from 'sonner';

// Define service types
interface Service {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  target: number;
  raised: number;
  donors: number;
  urgency: 'low' | 'medium' | 'high';
}

interface CategoryStats {
  category_name: string;
  total_donations: number;
  donor_count: number;
  target_amount?: number;
}


// Static service definitions
const staticServices: Service[] = [
    {
      id: 'health-for-all',
      name: 'Health For All',
      description: 'Providing essential healthcare services to underserved communities',
      icon: <Heart className="w-6 h-6" />,
      color: 'text-red-600',
      bgGradient: 'from-red-50 to-red-100',
      target: 1000000,
      raised: 30000,
      donors: 10,
      urgency: 'high'
    },
    {
      id: 'education-festival',
      name: 'Education Festival',
      description: 'Organizing educational events and workshops for children',
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'text-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      target: 500000,
      raised: 10000,
      donors: 5,
      urgency: 'medium'
    },
    {
      id: 'foreign-language',
      name: 'Foreign Language',
      description: 'Teaching foreign languages to expand global opportunities',
      icon: <Globe className="w-6 h-6" />,
      color: 'text-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      target: 300000,
      raised: 5000,
      donors: 2,
      urgency: 'low'
    },
    {
      id: 'environment-sustainability',
      name: 'Environment Sustainability',
      description: 'Promoting eco-friendly practices and environmental conservation',
      icon: <Leaf className="w-6 h-6" />,
      color: 'text-green-600',
      bgGradient: 'from-green-50 to-green-100',
      target: 750000,
      raised: 20000,
      donors: 8 ,
      urgency: 'high'
    },
    {
      id: 'sau-library-campaign',
      name: 'Sau Library Campaign',
      description: 'Building and supporting libraries for community education',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'text-amber-600',
      bgGradient: 'from-amber-50 to-amber-100',
      target: 400000,
      raised: 15000,
      donors: 3,
      urgency: 'medium'
    },
    {
      id: 'disaster-aid-fund',
      name: 'Disaster Aid Fund',
      description: 'Emergency response and relief for disaster-affected areas',
      icon: <Shield className="w-6 h-6" />,
      color: 'text-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      target: 2000000,
      raised: 0,
      donors: 0,
      urgency: 'high'
    },
    {
      id: 'scholarship-support-overseas',
      name: 'Scholarship Support For Overseas',
      description: 'Supporting students with international education opportunities',
      icon: <Plane className="w-6 h-6" />,
      color: 'text-indigo-600',
      bgGradient: 'from-indigo-50 to-indigo-100',
      target: 800000,
      raised: 10000,
      donors: 2,
      urgency: 'medium'
    }
];

const Services: React.FC = () => {
  const [services] = useState<Service[]>(staticServices);
  const [donatingService, setDonatingService] = useState<string | null>(null);

  // No backend API integration, only static data

  // No payment handler, just a placeholder
  const handleDonate = (service: Service, amount: number = 1000) => {
    window.location.href = `/donate?amount=${amount}&cause=${encodeURIComponent(service.name)}`;
  };


  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateProgress = (raised: number, target: number) => {
    return Math.min((raised / target) * 100, 100);
  };

  // No loading state needed

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our <span className="text-blue-600">Services</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join us in making a difference across various causes that matter most to our communities
          </p>
          <Separator className="w-24 mx-auto mt-6 bg-blue-600" />
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-center mb-3">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-blue-900">
              {services.reduce((sum, service) => sum + service.donors, 0).toLocaleString()}
            </h3>
            <p className="text-blue-700">Total Donors</p>
          </Card>
          
          <Card className="text-center p-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-center mb-3">
              <IndianRupee className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-900">
              ₹{services.reduce((sum, service) => sum + service.raised, 0).toLocaleString()}
            </h3>
            <p className="text-green-700">Total Raised</p>
          </Card>
          
          <Card className="text-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-center mb-3">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-purple-900">
              {services.length}
            </h3>
            <p className="text-purple-700">Active Campaigns</p>
          </Card>
          
          <Card className="text-center p-6 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-center mb-3">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-orange-900">
              {Math.round(services.reduce((sum, service) => sum + calculateProgress(service.raised, service.target), 0) / services.length)}%
            </h3>
            <p className="text-orange-700">Avg. Progress</p>
          </Card>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const progress = calculateProgress(service.raised, service.target);
            
            return (
              <Card key={service.id} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${service.bgGradient}`}></div>
                
                <CardHeader className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${service.bgGradient} ${service.color} transition-transform group-hover:scale-110`}>
                      {service.icon}
                    </div>
                    <Badge className={`${getUrgencyColor(service.urgency)} text-white text-xs px-2 py-1`}>
                      {service.urgency.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {service.name}
                  </CardTitle>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress Section */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-gray-900">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>₹{service.raised.toLocaleString()}</span>
                      <span>₹{service.target.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between pt-3 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{service.donors}</div>
                      <div className="text-xs text-gray-500">Donors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        ₹{(service.raised / Math.max(service.donors, 1)).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Avg. Donation</div>
                    </div>
                  </div>

                  {/* Donation Buttons */}
                  <div className="space-y-3 pt-4">
                    <div className="grid grid-cols-3 gap-2">
                      {[500, 1000, 2000].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => handleDonate(service, amount)}
                          disabled={donatingService === service.id}
                          className="text-xs hover:bg-blue-50 hover:border-blue-300"
                        >
                          ₹{amount}
                        </Button>
                      ))}
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 group"
                      onClick={() => handleDonate(service, 1000)}
                      disabled={donatingService === service.id}
                    >
                      {donatingService === service.id ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <Heart className="w-4 h-4" />
                          <span>Donate Now</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

      
      </div>
    </section>
  );
};

export default Services;
