export default function Toast({ message }) {
  if (!message) return null
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-graphite-panel border border-teal text-text-primary rounded-md px-5 py-3 text-base font-semibold shadow-lg">
      {message}
    </div>
  )
}
