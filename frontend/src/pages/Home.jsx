import React from 'react'
import HeroSection from '../components/HeroSection'
import AboutSection from './Aboutus'
import Products from './Products'

function Home() {
  return (
    <div>
      <HeroSection />
      <AboutSection />
      <Products limit={15} showViewMore={true} />
    </div>
  )
}

export default Home
