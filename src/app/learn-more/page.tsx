import Link from 'next/link'
import { ArrowLeft, BookOpen, GraduationCap, Users } from 'lucide-react'

export default function LearnMorePage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center">
      <nav className="w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
      </nav>

      <section className="max-w-4xl px-6 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">About EEIS</h1>
        <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          The Epsom & Ewell Islamic Society (EEIS) is a vibrant community organization dedicated to serving the religious, educational, and social needs of Muslims in the Epsom and Ewell area.
        </p>
      </section>

      <section className="max-w-6xl w-full px-6 grid md:grid-cols-3 gap-8 pb-32">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-6">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">Religious Services</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            We facilitate daily prayers, Jummah prayers, and provide religious guidance for the local community according to mainstream Sunni teachings.
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">Education</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            From children's Madrasah to adult circles, our educational programs aim to foster deep understanding and practice of Islam.
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">Community Events</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            We organize various social activities, Eid celebrations, and community outreach programs to strengthen local bonds.
          </p>
        </div>
      </section>
    </main>
  )
}
