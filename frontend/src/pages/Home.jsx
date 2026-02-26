import React from 'react'
import HeroSection from '../components/HeroSection'
import AboutSection from './Aboutus'
import Products from './Products'
import WhyChooseUs from '../components/WhyChosseUs'

function Home() {
  return (
    <div>
      <HeroSection />
      <AboutSection />
      <Products limit={15} showViewMore={true} />
      <WhyChooseUs />
    </div>
  )
}

export default Home
