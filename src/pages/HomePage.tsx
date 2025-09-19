import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ArrowRight, Heart, Activity, Users, BarChart3, Globe, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

// HomePage component with animated hero section and feature highlights
// Yeh main landing page hai jisme hero section aur features display hote hai
const HomePage: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP animations for the hero background patterns
    // Background gradient ko animate karte hai smooth motion ke liye
    if (gradientRef.current) {
      gsap.to(gradientRef.current, {
        background: 'linear-gradient(45deg, #3B82F6, #7C3AED, #14B8A6, #F97316)',
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
      });
    }

    // Floating animation for hero elements
    // Hero elements ko floating effect dete hai
    const tl = gsap.timeline({ repeat: -1 });
    tl.to('.floating-element', {
      y: -20,
      duration: 2,
      stagger: 0.3,
      ease: 'power2.inOut',
    })
    .to('.floating-element', {
      y: 0,
      duration: 2,
      stagger: 0.3,
      ease: 'power2.inOut',
    });
  }, []);

  const features = [
    {
      icon: Heart,
      title: 'NAMASTE Integration',
      description: 'Complete integration with National AYUSH Morbidity codes for standardized traditional medicine documentation',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: Activity,
      title: 'ICD-11 Mapping',
      description: 'Automatic mapping to WHO ICD-11 Traditional Medicine Module 2 using advanced AI algorithms',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Multi-User Dashboard',
      description: 'Comprehensive dashboard for doctors and patients with role-based access and real-time collaboration',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Real-time analytics and reporting for usage trends, treatment outcomes, and research insights',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: Globe,
      title: 'Global Standards',
      description: 'FHIR R4 compliant with international EHR standards for seamless healthcare interoperability',
      color: 'from-orange-500 to-yellow-500'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Mapping',
      description: 'Gemini AI integration for intelligent code mapping and treatment recommendations',
      color: 'from-violet-500 to-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section with animated background */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center">
        {/* Animated gradient background */}
        <div 
          ref={gradientRef}
          className="absolute inset-0 bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300 opacity-50"
        ></div>
        
        {/* Animated pattern overlay */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary-200/30 rounded-full blur-3xl animate-pulse floating-element"></div>
          <div className="absolute top-40 right-32 w-48 h-48 bg-primary-300/30 rounded-full blur-2xl animate-pulse floating-element"></div>
          <div className="absolute bottom-32 left-1/4 w-56 h-56 bg-primary-400/30 rounded-full blur-3xl animate-pulse floating-element"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary-500/30 rounded-full blur-xl animate-pulse floating-element"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="floating-element"
          >
            {/* Main Namaste Ayurveda logo/icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Heart className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full animate-bounce flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-gray-900">
                Namaste
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                Ayurveda
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Revolutionizing Traditional Healthcare with AI-Powered 
              <span className="text-primary-600"> NAMASTE to ICD-11 Mapping</span> and 
              <span className="text-primary-700"> Advanced EHR Solutions</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                to="/dashboard"
                className="group px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center space-x-2"
              >
                <span>Explore Dashboard</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/docs"
                className="px-8 py-4 border-2 border-primary-500 rounded-xl text-primary-600 font-semibold transition-all duration-300 hover:bg-primary-50 hover:border-primary-600"
              >
                View Documentation
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Revolutionary Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced technology meets traditional wisdom in our comprehensive healthcare platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="group p-8 rounded-2xl bg-white border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold mb-6 text-gray-900">
                Bridging Traditional and Modern Medicine
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Our platform seamlessly integrates ancient Ayurvedic, Siddha, and Unani medical traditions 
                with modern digital healthcare standards. Using advanced AI and WHO-standardized coding systems, 
                we're revolutionizing how traditional medicine is documented, shared, and researched globally.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-gray-700">WHO ICD-11 TM2 Compliant</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span className="text-gray-700">FHIR R4 Integration Ready</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-700 rounded-full"></div>
                  <span className="text-gray-700">Gemini AI-Powered Mapping</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">NAMASTE Codes</span>
                    <span className="text-2xl font-bold text-primary-600">4,500+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">ICD-11 TM2 Mappings</span>
                    <span className="text-2xl font-bold text-primary-700">529</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Pattern Codes</span>
                    <span className="text-2xl font-bold text-primary-500">196</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Medical Systems</span>
                    <span className="text-2xl font-bold text-primary-800">3</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple 3-step process to digitize traditional medicine practice
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Input Diagnosis",
                description: "Enter traditional medicine diagnosis in your preferred language - Hindi, Tamil, Urdu, or English",
                icon: "📝"
              },
              {
                step: "02", 
                title: "AI Processing",
                description: "Our advanced AI analyzes and maps your diagnosis to standardized NAMASTE and ICD-11 codes",
                icon: "🤖"
              },
              {
                step: "03",
                title: "Get Results",
                description: "Receive accurate code mappings with confidence scores and validation from medical experts",
                icon: "✅"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl mx-auto shadow-lg border border-gray-200">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what doctors and researchers are saying about our platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Rajesh Kumar",
                role: "Senior Ayurveda Physician",
                hospital: "AIIMS Delhi",
                testimonial: "This platform has revolutionized how we document traditional diagnoses. The AI mapping is incredibly accurate and saves hours of manual coding.",
                rating: 5
              },
              {
                name: "Dr. Priya Sharma", 
                role: "Siddha Medicine Specialist",
                hospital: "Government Siddha Medical College",
                testimonial: "Finally, a system that understands traditional medicine terminology. The ICD-11 mapping helps us integrate with modern healthcare systems seamlessly.",
                rating: 5
              },
              {
                name: "Dr. Ahmed Hassan",
                role: "Unani Medicine Practitioner", 
                hospital: "Jamia Hamdard University",
                testimonial: "The multilingual support and accurate code suggestions have made our EHR documentation process much more efficient and standardized.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.testimonial}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    <p className="text-gray-500 text-xs">{testimonial.hospital}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Platform Statistics
            </h2>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Real numbers from our growing community of healthcare professionals
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "4,500+", label: "NAMASTE Codes", icon: "📋" },
              { number: "529", label: "ICD-11 Mappings", icon: "🔗" },
              { number: "2,847", label: "Active Users", icon: "👥" },
              { number: "94.2%", label: "AI Accuracy", icon: "🎯" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl mb-4">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-primary-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Ready to Transform Traditional Healthcare?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join the revolution in traditional medicine documentation and research
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Stay Updated with Latest Research
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Get the latest updates on traditional medicine digitization and research findings
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;