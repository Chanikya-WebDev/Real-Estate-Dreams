// components/public/MapEmbed.tsx
// Server Component — no interactivity needed for an iframe
export default function MapEmbed({
  embedUrl,
  name,
}: {
  embedUrl: string
  name: string
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 h-72">
      <iframe
        src={embedUrl}
        title={`Map of ${name}`}
        width="100%"
        height="100%"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="border-0"
      />
    </div>
  )
}
