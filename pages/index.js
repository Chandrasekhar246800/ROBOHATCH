import Head from 'next/head'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import ProductsSection from '@/components/ProductsSection'
import Services from '@/components/Services'
import Highlights from '@/components/Highlights'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-light-gray">
      <Head>
        <title>ROBOHATCH - Custom 3D Printed Products</title>
        <meta name="description" content="Discover unique, handcrafted 3D-printed lamps, idols, accessories, and more." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Navbar />
      <Hero />
      <ProductsSection />
      <Services />
      <Highlights />
      <Footer />
    </div>
  )
}
