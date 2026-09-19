import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ComparisonSection from '../components/ComparisonSection';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="home">
      <Navbar />
      <HeroSection />
      <ComparisonSection />
      <Footer />
    </div>
  );
};

export default Home;
