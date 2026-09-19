import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ComparisonSection from '../components/ComparisonSection';
import Footer from '../components/Footer';
import { useScrollReveal } from '../hooks/useScrollReveal';

const Home = () => {
  useScrollReveal();

  return (
    <div className="home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <HeroSection />
      <ComparisonSection />
      <Footer />
    </div>
  );
};

export default Home;
