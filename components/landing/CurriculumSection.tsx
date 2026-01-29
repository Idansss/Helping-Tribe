'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'

const modules = [
  {
    week: 1,
    title: 'Helping Profession, Ethics & Cultural Competence',
    description: 'Foundations of the helping profession, professional ethics, and the role of cultural competence in Nigerian contexts.',
  },
  {
    week: 2,
    title: 'Exploration & Insight Stages, Trauma-Informed Practice',
    description: 'Counselling stages focused on exploration and insight, integrating trauma-informed practice with active listening skills.',
  },
  {
    week: 3,
    title: 'Action Stage & Conflict Resolution',
    description: 'Helping clients move from awareness to action, developing coping strategies, and practicing conflict resolution.',
  },
  {
    week: 4,
    title: 'Self-Care & Supervision',
    description: 'Importance of self-care, burnout prevention, and supervision in helping practice. Design personal self-care plans.',
  },
  {
    week: 5,
    title: 'Gender & Cultural Sensitivity',
    description: 'Working with children, women, men, people with disabilities, and survivors of trauma. Culturally sensitive approaches.',
  },
  {
    week: 6,
    title: 'Crisis Intervention & Trauma Support',
    description: 'Crisis intervention frameworks and trauma counselling principles. Practice grounding, reassurance, and referral.',
  },
  {
    week: 7,
    title: 'Group Counselling & Peer Support',
    description: 'Group facilitation skills and peer support models for low-resource communities. Design peer initiatives.',
  },
  {
    week: 8,
    title: 'Practicum: Case Analysis',
    description: 'Case analysis frameworks, feedback skills, and reflective practice tools. Analyze cases and give feedback.',
  },
  {
    week: 9,
    title: 'Final Projects & Graduation',
    description: 'Capstone project presentations demonstrating integrated skills. Structured feedback and graduation activities.',
  },
]

export function CurriculumSection() {
  return (
    <section id="curriculum" className="py-16 md:py-24 bg-[#f3e8ff]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#4c1d95] mb-4">
            The Curriculum
          </h2>
          <p className="text-lg text-gray-700">
            A comprehensive 9-week journey from foundations to mastery
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {modules.map((module) => (
            <AccordionItem
              key={module.week}
              value={`module-${module.week}`}
              className="bg-white rounded-lg border-2 border-[#f3e8ff] px-6"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4 text-left">
                  <Badge className="bg-[#4c1d95] text-white text-lg px-4 py-1">
                    Week {module.week}
                  </Badge>
                  <span className="text-lg font-semibold text-[#4c1d95]">
                    {module.title}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700 leading-relaxed pl-20">
                  {module.description}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
