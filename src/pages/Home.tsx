import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Rocket,
  Shield,
  Zap,
  Globe,
  Cpu,
  Code2,
  Users,
  Star,
  CheckCircle2,
  PlayCircle,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: Zap,
    title: 'Instant Performance',
    description: 'Lightning-fast load times with optimized rendering and lazy loading built-in.'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption and advanced threat protection for your peace of mind.'
  },
  {
    icon: Sparkles,
    title: 'Smart Automation',
    description: 'AI-powered workflows that adapt to your habits and boost productivity.'
  },
  {
    icon: Globe,
    title: 'Global Network',
    description: 'Accessible from anywhere with 99.99% uptime across 30+ global regions.'
  },
  {
    icon: Cpu,
    title: 'Scalable Architecture',
    description: 'Grows seamlessly from small startup to massive enterprise deployments.'
  },
  {
    icon: Code2,
    title: 'Developer Friendly',
    description: 'Clean APIs, comprehensive docs, and SDKs for all major platforms.'
  }
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'CTO, TechFlow',
    quote: 'This platform transformed our entire workflow. The speed and reliability are unmatched.',
    rating: 5
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Product Lead, CloudScale',
    quote: 'Best decision we made this year. Our team productivity increased by 400%.',
    rating: 5
  },
  {
    name: 'Emma Thompson',
    role: 'Founder, InnovateLab',
    quote: 'The attention to detail and user experience is simply outstanding. Highly recommended.',
    rating: 5
  }
];

const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '2M+', label: 'Daily Actions' },
  { value: '99.9%', label: 'Uptime Rate' },
  { value: '150+', label: 'Countries' }
];

const animations = {
  fadeInUp: {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  },
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  }
};

const Home: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 text-gray-900 dark:text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <a href="/" className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                  NovaTech
                </span>
              </a>
              <div className="hidden md:flex space-x-1">
                <button className="px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                  Features
                </button>
                <button className="px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                  Pricing
                </button>
                <button className="px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                  Documentation
                </button>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Log In
              </button>
              <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:scale-105">
                Get Started
              </button>
            </div>
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700/50 px-4 py-4 space-y-2 animate-slideIn">
            <button className="block w-full text-left px-4 py-2 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
              Features
            </button>
            <button className="block w-full text-left px-4 py-2 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
              Pricing
            </button>
            <button className="block w-full text-left px-4 py-2 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
              Documentation
            </button>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <button className="w-full px-4 py-2 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                Log In
              </button>
              <button className="w-full mt-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 md:pt-36 pb-20 md:pb-28 px-4">
        {/* Animated background blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-10 w-80 h-80 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-pink-400/10 dark:bg-pink-600/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial="initial"
            animate="animate"
            variants={animations.stagger}
            className="flex flex-col items-center"
          >
            <motion.div
              variants={animations.fadeInUp}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-5 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Rocket className="w-4 h-4" />
              Introducing NovaTech 3.0
              <span className="ml-2 bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">NEW</span>
            </motion.div>

            <motion.h1
              variants={animations.fadeInUp}
              className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8"
            >
              Revolutionize Your
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
                Digital Workflow
              </span>
            </motion.h1>

            <motion.p
              variants={animations.fadeInUp}
              className="text-lg md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10"
            >
              The all-in-one platform that combines cutting-edge AI, seamless collaboration,
              and enterprise-grade security to supercharge your entire team.
            </motion.p>

            <motion.div
              variants={animations.fadeInUp}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full text-lg shadow-lg shadow-blue-600/20 transition-all hover:shadow-xl hover:shadow-blue-600/30 hover:scale-105 flex items-center justify-center gap-2">
                Try NovaTech Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white font-semibold rounded-full text-lg hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <PlayCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Watch Demo
              </button>
            </motion.div>

            <motion.div
              variants={animations.fadeInUp}
              className="flex items-center gap-3 text-sm md:text-base text-gray-600 dark:text-gray-300 bg-white/60 dark:bg-slate-800/60 backdrop-blur px-5 py-2.5 rounded-full border border-gray-200 dark:border-gray-700"
            >
              <span className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 ring-2 ring-white dark:ring-slate-800"></div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 ring-2 ring-white dark:ring-slate-800"></div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 ring-2 ring-white dark:ring-slate-800"></div>
              </span>
              <span>
                Trusted by <strong className="text-gray-900 dark:text-white">10,000+</strong> teams worldwide
              </span>
              <span className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-1">4.9/5</span>
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 px-4 relative">
        <div className="max-w-7xl mx-auto bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl px-6 py-8 md:px-12 md:py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base font-medium text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14 md:mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything you need,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                nothing you don't
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Packed with powerful features designed to make your life easier
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What's New Section */}
      <section className="py-12 md:py-20 px-4 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14 md:mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                What's New in NovaTech 3.0
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We've been busy building the future of work
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="aspect-square max-w-lg mx-auto bg-gradient-to-br from-blue-400/30 via-purple-400/30 to-pink-400/30 dark:from-blue-700/30 dark:via-purple-700/30 dark:to-pink-700/30 rounded-full relative overflow-hidden animate-float shadow-2xl shadow-blue-500/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-3xl p-8 md:p-10 shadow-2xl">
                    <User className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-4" />
                    <div className="text-3xl font-bold mb-2">AI Copilot</div>
                    <div className="text-gray-600 dark:text-gray-300 mb-6">
                      Your intelligent assistant for everything
                    </div>
                    <div className="space-y-2">
                      {['Automated workflow suggestions', 'Real-time meeting summaries', 'Smart task prioritization'].map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:p-6"
            >
              <h3 className="text-3xl md:text-4xl font-bold mb-6">
                A complete platform redesign focused on you
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                We listened to our community and rebuilt every single pixel. The result is
                an interface that's more intuitive, faster, and more beautiful than ever before.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold">40% faster interface</span>
                    <p className="text-gray-600 dark:text-gray-300">Optimized rendering for instant response in every action.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold">Enhanced collaboration</span>
                    <p className="text-gray-600 dark:text-gray-300">Share, comment, and work together in real-time.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold">Advanced privacy controls</span>
                    <p className="text-gray-600 dark:text-gray-300">Granular permissions and end-to-end encryption.</p>
                  </div>
                </li>
              </ul>
              <button className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:scale-105 inline-flex items-center gap-2">
                Explore All Features
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14 md:mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Loved by{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                thousands of
              </span>
              <span className="block">teams worldwide</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our amazing customers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 hover:shadow-xl transition-shadow flex flex-col"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="flex-1 text-gray-700 dark:text-gray-200 text-lg mb-6 italic leading-relaxed">
                  "{testimonial.quote}"
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 md:p-14 text-center text-white relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to supercharge your productivity?
            </h2>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join over 10,000 companies building faster, smarter, and more efficiently with NovaTech.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-blue-700 font-bold rounded-full text-lg hover:bg-blue-100 transition-all shadow-xl hover:shadow-white/20 hover:scale-105">
                Start Free Trial
              </button>
              <button className="px-8 py-4 bg-transparent border-2 border-white/50 text-white font-bold rounded-full text-lg hover:bg-white/10 hover:border-white transition-all">
                Contact Sales
              </button>
            </div>
            <p className="text-sm mt-6 text-blue-200">
              No credit card required · Free 14-day trial · Cancel anytime
            </p>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                  NovaTech
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                The future of work, built today. Empowering teams to achieve more.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</button></li>
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pricing</button></li>
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Integrations</button></li>
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Changelog</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</button></li>
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</button></li>
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Careers</button></li>
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</button></li>
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</button></li>
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Security</button></li>
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">GDPR</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2024 NovaTech Inc. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <button className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">
                Twitter
              </button>
              <button className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">
                LinkedIn
              </button>
              <button className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">
                GitHub
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;