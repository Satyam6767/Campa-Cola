import React from 'react'
import HeroSection from '../components/HeroSection'
import AboutSection from './Aboutus'
import Products from './Products'
import Footer from '../components/Footer'

function Home() {
  return (
    <div>
      <HeroSection />
      <AboutSection />
      <Products />
      <Footer />
    </div>
  )
}

export default Home
