'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Globe, Award } from 'lucide-react'

export function WhySection() {
  return (
    <section id="program" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
          {/* Left: Who We Are, Vision, Mission */}
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-[#4c1d95]">
                Who We Are
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                A premier learning community for emerging and practicing
                therapists, counsellors, and mental health professionals.
                Powered by BlakMoh Consulting, we bridge the gap between theory
                &amp; practice with training, mentorship, and collaborative
                growth.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl md:text-2xl font-bold text-[#4c1d95]">
                Our Vision
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                To revolutionize the helping profession by cultivating a
                generation of skilled, compassionate, and ethically grounded
                therapists who transform lives through evidence-based practice.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl md:text-2xl font-bold text-[#4c1d95]">
                Our Mission
              </h3>
              <ul className="list-disc list-inside text-sm md:text-base text-gray-700 space-y-1.5">
                <li>Holistic professional development.</li>
                <li>Supportive peer ecosystem.</li>
                <li>Innovative mental health solutions.</li>
              </ul>
            </div>
          </div>

          {/* Right: Why Join Us & Stats */}
          <div className="space-y-6">
            <Card className="border-2 border-[#f3e8ff] bg-[#f3e8ff]/40">
              <CardContent className="pt-6 pb-4">
                <h3 className="text-xl font-bold text-[#4c1d95] mb-3">
                  Why Join Us?
                </h3>
                <ul className="list-disc list-inside text-sm md:text-base text-gray-700 space-y-1.5">
                  <li>Career growth &amp; CPD opportunities.</li>
                  <li>Exclusive networking with fellow helpers.</li>
                  <li>Therapist well-being support.</li>
                  <li>Access to resources &amp; research.</li>
                  <li>Member discounts &amp; perks.</li>
                </ul>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card className="border-2 border-[#f3e8ff] bg-[#f3e8ff]/50">
                <CardContent className="pt-6 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-[#4c1d95]" />
                  <div className="text-3xl font-bold text-[#4c1d95] mb-2">9</div>
                  <div className="text-sm text-gray-700 font-medium">
                    Weeks of Training
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-[#f3e8ff] bg-[#f3e8ff]/50">
                <CardContent className="pt-6 text-center">
                  <Globe className="h-12 w-12 mx-auto mb-4 text-[#4c1d95]" />
                  <div className="text-3xl font-bold text-[#4c1d95] mb-2">100%</div>
                  <div className="text-sm text-gray-700 font-medium">
                    Online &amp; Flexible
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-[#f3e8ff] bg-[#f3e8ff]/50">
                <CardContent className="pt-6 text-center">
                  <Award className="h-12 w-12 mx-auto mb-4 text-[#4c1d95]" />
                  <div className="text-3xl font-bold text-[#4c1d95] mb-2">✓</div>
                  <div className="text-sm text-gray-700 font-medium">
                    Recognized Certification
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
