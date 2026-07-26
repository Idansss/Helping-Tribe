import { BookOpen, HeartHandshake, MessageCircle, Sparkles } from 'lucide-react'

const nodes = [
  { label: 'Learn', icon: BookOpen, className: 'left-[7%] top-[44%]' },
  { label: 'Reflect', icon: Sparkles, className: 'right-[8%] top-[18%]' },
  { label: 'Connect', icon: MessageCircle, className: 'right-[3%] bottom-[18%]' },
  { label: 'Practise', icon: HeartHandshake, className: 'left-[16%] bottom-[8%]' },
] as const

export function OrbitOfCare() {
  return (
    <div className="orbit-stage" aria-label="Learning, reflection, practice and community connected around learner growth">
      <div className="orbit-grid" aria-hidden="true" />
      <div className="orbit-ring orbit-ring-one" aria-hidden="true" />
      <div className="orbit-ring orbit-ring-two" aria-hidden="true" />
      <div className="orbit-core">
        <span className="orbit-core-kicker">HELP Foundations</span>
        <strong>Grow with care.</strong>
        <span>Learn with structure.</span>
      </div>
      {nodes.map(({ label, icon: Icon, className }) => (
        <div key={label} className={`orbit-node ${className}`}>
          <span className="orbit-node-icon"><Icon className="size-4" aria-hidden="true" /></span>
          <span>{label}</span>
        </div>
      ))}
      <p className="orbit-caption">A nine-week journey from knowledge to supported practice.</p>
    </div>
  )
}
