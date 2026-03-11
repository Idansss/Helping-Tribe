import { Shield, KeyRound, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import logo from '/logo.png';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/20">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md shadow-teal-500/15 bg-white/90 ring-1 ring-teal-100">
              <img
                src={logo}
                alt="The Helping Tribe logo"
                className="w-9 h-9 rounded-full object-contain"
              />
            </div>
            <span className="font-semibold text-[17px] tracking-tight bg-gradient-to-r from-teal-700 to-emerald-700 bg-clip-text text-transparent">
              The Helping Tribe
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-slate-50/80 px-1.5 py-1 shadow-sm border border-slate-100">
            <button className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 rounded-full hover:text-teal-700 hover:bg-white transition-colors">
              Student Login
            </button>
            <button className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 rounded-full hover:text-teal-700 hover:bg-white transition-colors">
              Staff Login
            </button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-full border-teal-200 bg-white text-xs sm:text-sm font-semibold text-teal-700 hover:bg-teal-50 shadow-none"
            >
              Contact
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100/60 border border-teal-200/50 rounded-full backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span className="text-sm text-teal-700">School of Counselling &amp; Positive Psychology</span>
            </div>

            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-slate-900 via-teal-800 to-emerald-800 bg-clip-text text-transparent">
                The Helping Tribe School of Counselling &amp; Positive Psychology
              </span>
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed">
              Start with the application form below. Once approved, use the correct portal to sign in.
            </p>

            {/* Login Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/30 h-12 px-6 group rounded-full"
              >
                <KeyRound className="w-4 h-4 mr-2" />
                Students: Matric Number + Password
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="outline"
                className="border-2 border-slate-200 hover:border-teal-200 hover:bg-teal-50/50 h-12 px-6 group rounded-full"
              >
                <Shield className="w-4 h-4 mr-2" />
                Mentors/Admin: Email + Password
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Right Content - Login Portal Cards */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-slate-100 shadow-2xl shadow-slate-900/10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs lg:text-sm tracking-[0.2em] text-slate-500 font-semibold">
                  CHOOSE YOUR LOGIN PORTAL
                </h3>
                <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center shadow-sm">
                  <img
                    src={logo}
                    alt="The Helping Tribe logo"
                    className="w-7 h-7 rounded-full object-contain"
                  />
                </div>
              </div>

              {/* Student Login Card */}
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-teal-500 to-emerald-500 p-[1px] overflow-hidden rounded-2xl">
                <div className="bg-white rounded-2xl p-6 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Shield className="w-6 h-6 text-teal-700" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-teal-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h4 className="font-semibold text-lg mb-1 text-slate-900">Student Login</h4>
                  <p className="text-sm text-slate-600">Login with Matric Number</p>
                </div>
              </Card>

              {/* Mentor/Admin Login Card */}
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-200 hover:border-teal-300 rounded-2xl">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Shield className="w-6 h-6 text-slate-700" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-teal-600 transition-all" />
                  </div>
                  <h4 className="font-semibold text-lg mb-1 text-slate-900">Mentor/Admin Login</h4>
                  <p className="text-sm text-slate-600">Login with Email Address</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Steps Column */}
          <div className="lg:col-span-2">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
              <p className="mt-2 text-sm text-slate-500">
                Simple three-step process to get started.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {/* Step 1 */}
              <Card className="h-full border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                <div className="p-6 space-y-4">
                  <span className="text-2xl font-semibold text-teal-600">01</span>
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-900">Apply</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Submit your application form below.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Step 2 */}
              <Card className="h-full border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                <div className="p-6 space-y-4">
                  <span className="text-2xl font-semibold text-teal-600">02</span>
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-900">Get Approved</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Our admissions team reviews and approves qualified applicants.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Step 3 */}
              <Card className="h-full border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                <div className="p-6 space-y-4">
                  <span className="text-2xl font-semibold text-teal-600">03</span>
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-900">Set Password</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Create your secure password and access your learning portal.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Important Info */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/30 sticky lg:top-24 rounded-2xl">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-amber-700" />
                  </div>
                  <h3 className="font-semibold text-lg text-slate-900">Important</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700">
                      Students do not sign up publicly and do not use email to log in.
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700">
                      Your email on this form is for <span className="font-semibold">approval updates only</span>.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-amber-200">
                    <p className="text-sm text-slate-600">
                      Already approved?{' '}
                      <a href="#" className="font-semibold text-teal-700 hover:text-teal-800 hover:underline">
                        Use Student Login
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/40 backdrop-blur-sm mt-10">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-sm text-slate-500">
          <p>© 2026 The Helping Tribe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
