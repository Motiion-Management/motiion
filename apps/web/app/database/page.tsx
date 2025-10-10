import { TalentGrid } from '../talent-grid'
import { Header } from '../header'
import { Hero } from '../hero'
import { SearchBar } from '../search-bar'
// import { Footer } from './footer'

export default function HomePage() {
  return (
    <div className="relative -z-20 min-h-screen bg-black text-white">
      {/* Talent Grid */}
      <TalentGrid />
      <div className="absolute inset-0 left-0 top-0 -z-10 flex h-screen w-screen items-center justify-center bg-gradient-to-l from-black/90 via-black/60 to-black/95" />
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-16">
        <Hero />
        <SearchBar />
      </main>
      {/* <Footer /> */}
    </div>
  )
}
