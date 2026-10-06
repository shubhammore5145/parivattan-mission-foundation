import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Eye, Heart, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OurWork = () => {
  const navigate = useNavigate();

  const workItems = [
    {
      id: 5,
      title: 'Japanese Language Learning',
      description: 'Foreign language education program helping students access global academic and career opportunities with JLPT-certified training.',
      image: '/img/japanese.jpeg',
      category: 'Language Education',
      badge: 'Flagship Program',
      date: '2024 - 2026',
      location: 'Training Centers',
      impact: '100+ Students Enrolled',
      detailsUrl: '/courses/japanese',
    },
    {
      id: 6,
      title: 'Social Awareness Program',
      description: 'A structured social awareness program committed to educating communities, amplifying important causes, and driving sustainable societal impact.',
      image: '/img/silder1.jpg',
      category: 'Community Outreach',
      badge: 'Community Initiative',
      date: '2024 - 2026',
      location: 'Community Centers',
      impact: '50+ Active Volunteers',
      detailsUrl: '/initiatives',
    }
  ];

  return (
    <section id='ourWork' className="section-padding bg-gradient-to-b from-blue-50/30 to-white relative overflow-hidden py-16 md:py-24">
      {/* Background decoration */}
      <div className="absolute top-20 left-0 w-72 h-72 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-20 right-0 w-80 h-80 bg-gradient-to-tr from-indigo-100 to-blue-100 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="section-title animate-on-scroll">Our Work in Action</h2>
          <p className="section-subtitle animate-on-scroll mt-4 max-w-2xl mx-auto text-slate-600">
            See how we're making a difference in communities through our education and grassroots initiatives.
            Every project tells a story of opportunity, growth, and empowerment.
          </p>
        </div>

        {/* Work Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {workItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border border-blue-100/60 bg-white rounded-2xl flex flex-col">
              <div className="relative overflow-hidden aspect-[16/10] bg-slate-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 shadow-md text-xs px-3 py-1 font-medium">
                    {item.category}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3 flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50/60 text-[11px] font-semibold">
                    {item.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-sm text-slate-600 line-clamp-3 mt-2 leading-relaxed">
                  {item.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-2 text-sm text-slate-500 mb-5 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>{item.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 font-semibold">
                    <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{item.impact}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl"
                    onClick={() => navigate(item.detailsUrl)}
                  >
                    <Eye className="w-4 h-4 mr-1.5" />
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl px-4"
                    onClick={() => navigate('/donate')}
                  >
                    <Heart className="w-4 h-4 mr-1.5" />
                    Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 animate-on-scroll">
          <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-3xl shadow-2xl p-8 md:p-12 max-w-3xl mx-auto text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">Want to Make a Difference?</h3>
              <p className="text-blue-200 mb-8 text-base md:text-lg max-w-xl mx-auto">
                Explore our accredited programs and community initiatives empowering students across regions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-8 py-6 text-base md:text-lg rounded-full shadow-xl text-white font-medium"
                  onClick={() => navigate("/courses")}
                >
                  View All Programs
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-6 text-base md:text-lg rounded-full font-medium"
                  onClick={() => navigate("/donate")}
                >
                  Join Our Mission
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurWork;
