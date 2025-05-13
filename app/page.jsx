import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import Cards from "./components/Cards"
import Footer from "./components/Footer"

export default function Home() {
  return (
    <div className="relative w-full min-h-screen bg-[#ffff]">
      <Navbar />
      <Hero />
      <Cards />
      <Footer />
    </div>
  )
}
