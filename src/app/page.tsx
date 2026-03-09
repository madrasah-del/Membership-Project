import Link from 'next/link';
import { ArrowRight, Users, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex-grow flex flex-col items-center">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-slate-50">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-brand-100/50 blur-3xl opacity-60"></div>
        <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-100/40 blur-3xl opacity-60"></div>
      </div>

      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center animate-fade-in relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/30">
            E
          </div>
          <span className="font-semibold text-xl tracking-tight text-slate-800">EEIS</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Member Login
          </Link>
          <Link href="/apply" className="text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-full shadow-md shadow-brand-600/20 transition-all hover:shadow-lg hover:-translate-y-0.5">
            Join Society
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-sm font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
          Official Membership Portal
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 max-w-4xl leading-tight">
          Join the <span className="text-gradient">Epsom & Ewell</span> <br className="hidden md:block" /> Islamic Society
        </h1>

        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed">
          Become part of our growing community. Register your membership, manage your details securely, and stay connected with our community updates.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/apply" className="group flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full font-medium transition-all shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:-translate-y-1">
            Apply for Membership
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/learn-more" className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-full font-medium transition-all">
            Learn More
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-white py-24 relative z-10 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-6 shadow-sm border border-brand-100">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Community First</h3>
              <p className="text-slate-600 leading-relaxed">Join a vibrant community of Muslims in Epsom. Gain access to our exclusive WhatsApp groups and updates.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 shadow-sm border border-blue-100">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Secure & Private</h3>
              <p className="text-slate-600 leading-relaxed">Your data is strictly protected. Fully GDPR compliant, utilizing bank-grade encryption for all records.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6 shadow-sm border border-amber-100">
                <HeartHandshake className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Seamless Payments</h3>
              <p className="text-slate-600 leading-relaxed">Pay your £10 annual fee easily securely with a card, via direct debit, or declare a bank transfer.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
