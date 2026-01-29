'use client'

import { Card, CardContent } from '@/components/ui/card'

const faculty = [
  {
    name: 'Dr. Amina Bello',
    title: 'Clinical Psychologist',
    bio: '15+ years of experience in trauma-informed care and community mental health. Specializes in culturally-sensitive counseling approaches for Nigerian contexts.',
  },
  {
    name: 'Prof. Chukwuemeka Okafor',
    title: 'Counseling Education Specialist',
    bio: 'Expert in group counseling and peer support models. Has trained over 500 helping professionals across West Africa.',
  },
  {
    name: 'Dr. Fatima Ibrahim',
    title: 'Ethics & Professional Practice',
    bio: 'Leading authority on professional ethics in helping professions. Author of "Ethical Practice in Low-Resource Settings".',
  },
]

export function FacultySection() {
  return (
    <section id="faculty" className="py-16 md:py-24 bg-[#f3e8ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#4c1d95] mb-4">
            Our Faculty
          </h2>
          <p className="text-lg text-gray-700">
            Learn from experienced practitioners and educators
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {faculty.map((member, index) => (
            <Card
              key={index}
              className="bg-white border-2 border-[#f3e8ff] hover:border-[#4c1d95] transition-colors"
            >
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto rounded-full bg-[#4c1d95] flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#4c1d95] mb-1">
                      {member.name}
                    </h3>
                    <p className="text-sm text-gray-600 font-medium mb-3">
                      {member.title}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
