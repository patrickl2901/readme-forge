import Link from 'next/link'
import { Sparkles, Zap, FileText, Star, ArrowRight } from 'lucide-react'
import { LandingHero } from '@/components/landing-hero'

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Generate professional READMEs in seconds, not hours.',
  },
  {
    icon: FileText,
    title: 'AI-Powered',
    description: 'Powered by Google Gemini for intelligent, context-aware content.',
  },
  {
    icon: Star,
    title: 'Professional Quality',
    description: 'Beautiful, well-structured READMEs that impress.',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-[#030305] relative overflow-hidden">
      <div className="absolute inset-0 dark:opacity-100 opacity-0 transition-opacity duration-500">
        <div className="absolute inset-0 dark:bg-[#030305]" />
        
        <div className="absolute inset-0 opacity-60 dark:opacity-60">
          <div 
            className="absolute top-0 left-1/4 w-[800px] h-[800px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
              filter: 'blur(80px)',
              animation: 'pulse 8s ease-in-out infinite',
            }}
          />
          <div 
            className="absolute top-1/2 right-0 w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(6,78,59,0.2) 0%, transparent 70%)',
              filter: 'blur(100px)',
              animation: 'pulse 10s ease-in-out infinite reverse',
            }}
          />
          <div 
            className="absolute bottom-0 left-1/3 w-[700px] h-[700px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 70%)',
              filter: 'blur(90px)',
              animation: 'pulse 12s ease-in-out infinite',
            }}
          />
        </div>
        
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        
        <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-[40%] right-[10%] w-64 h-64 bg-teal-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[20%] left-[40%] w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10">
        <LandingHero />

        <section className="py-32 px-4 sm:px-6 lg:px-8 border-t border-zinc-200 dark:border-zinc-800/50 bg-gradient-to-b dark:bg-none from-zinc-50/80 to-transparent dark:from-transparent dark:to-[rgba(3,3,5,0.8)]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white text-center mb-4">
              Why ReadmeForge?
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-center mb-16 max-w-xl mx-auto text-lg">
              Everything you need to create stunning documentation that stands out.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group p-8 rounded-2xl bg-white dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/50 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-500 hover:-translate-y-2 shadow-sm dark:shadow-none"
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                    style={{
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)',
                    }}
                  >
                    <feature.icon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-32 px-4 sm:px-6 lg:px-8 border-t border-zinc-200 dark:border-zinc-800/50 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-[600px] h-[300px] rounded-full blur-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
              }}
            />
          </div>
          
          <div className="max-w-2xl mx-auto text-center relative z-10">
            <div 
              className="inline-flex items-center justify-center p-4 rounded-2xl mb-8"
              style={{
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.2)',
              }}
            >
              <Sparkles className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
              Ready to level up your documentation?
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-md mx-auto text-lg">
              Join thousands of developers who use ReadmeForge to create beautiful READMEs.
            </p>
            <Link
              href="/login"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white shadow-lg shadow-emerald-500/25 dark:shadow-emerald-500/40"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              }}
            >
              <span className="flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </section>

        <footer className="py-8 px-4 border-t border-zinc-200 dark:border-zinc-800/50">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-zinc-500 dark:text-zinc-500 text-sm">
              © {new Date().getFullYear()} ReadmeForge. Built with Next.js & Gemini.
            </p>
          </div>
        </footer>
      </div>
    </main>
  )
}
