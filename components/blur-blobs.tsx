export function BlurBlobs() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-teal-400/15 blur-[120px]" />
      <div className="absolute -right-24 top-1/3 h-[400px] w-[400px] rounded-full bg-emerald-400/10 blur-[100px]" />
      <div className="absolute bottom-0 left-1/4 h-[350px] w-[350px] rounded-full bg-teal-300/10 blur-[100px]" />
    </div>
  )
}

