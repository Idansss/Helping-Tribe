'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    question: 'Who is this program for?',
    answer: 'The HELP Foundations Training is designed for anyone interested in developing foundational counseling and helping skills. This includes community workers, teachers, healthcare workers, religious leaders, and individuals who want to support others in their communities. No prior counseling experience is required.',
  },
  {
    question: 'How long does the program take?',
    answer: 'The program is structured as a 9-week course. Each week focuses on a specific module, with approximately 4-5 hours of content, activities, and practice. The program is designed to be flexible and can be completed at your own pace within the 9-week timeframe.',
  },
  {
    question: 'Is the program fully online?',
    answer: 'Yes, the program is 100% online and accessible through our Learning Management System. You can access all materials, participate in discussions, submit assignments, and join peer learning circles from anywhere with an internet connection.',
  },
  {
    question: 'What certification will I receive?',
    answer: 'Upon successful completion of all 9 modules, assignments, and the final project, you will receive a Certificate of Completion from HELP Foundations Training. This certificate recognizes your competency in foundational counseling, ethics, and trauma support skills.',
  },
  {
    question: 'What is a Peer Learning Circle?',
    answer: 'Peer Learning Circles are small groups of 6 learners who meet weekly to discuss course content, practice skills, and support each other. These circles create a safe space for collaborative learning and peer feedback, mirroring real-world support networks.',
  },
  {
    question: 'Do I need any special equipment or software?',
    answer: 'You only need a computer or smartphone with internet access and a modern web browser. All course materials are accessible through our online platform. For voice note reflections (optional), you can use your device\'s built-in microphone.',
  },
  {
    question: 'What happens after I complete the program?',
    answer: 'After graduation, you\'ll have lifetime access to the resource directory and quick reference tools. You can also join our alumni network to continue learning and connecting with other helping professionals. Many graduates go on to serve their communities or pursue further training.',
  },
  {
    question: 'Is there financial assistance available?',
    answer: 'We offer limited scholarships for individuals who demonstrate financial need and a strong commitment to serving their communities. Please contact us at support@helpingtribe.com to learn more about scholarship opportunities.',
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="py-16 md:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#4c1d95] mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-700">
            Everything you need to know about the program
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`faq-${index}`}
              className="bg-[#f3e8ff]/50 rounded-lg border-2 border-[#f3e8ff] px-6"
            >
              <AccordionTrigger className="hover:no-underline text-left">
                <span className="font-semibold text-[#4c1d95]">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700 leading-relaxed">
                  {faq.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
