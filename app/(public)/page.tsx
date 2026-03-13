import ProjectCard from '@/components/public/ProjectCard'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getCachedFeaturedProjects, getCachedLatestProjects } from '@/lib/public-projects-cache'

export const revalidate = 3600

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_SITE_NAME ?? 'Open Plots and Villas'} in Hyderabad, Vizag, Vijayawada, Bangalore`,
  description:
    'Browse RERA & DTCP approved open plots and villas across Hyderabad, Vizag, Vijayawada and Bangalore. GEM Group Realty. Book a free site visit today.',
  keywords: [
    'open plots in Hyderabad',
    'open plots Hyderabad',
    'open plots and villas',
    'open plots near ORR',
    'open plots in Telangana',
    'open plots in Andhra Pradesh',
    'open plots Vizag',
    'open plots Vijayawada',
    'open plots Bangalore',
    'RERA approved open plots',
    'DTCP approved open plots',
    'buy open plots Hyderabad',
    'residential plots Hyderabad',
    'gated community plots Hyderabad',
    'GEM Group Realty',
    'plots for sale Hyderabad',
    'villa plots Hyderabad',
    'open plots near Hyderabad',
  ].join(', '),
  openGraph: {
    title: `${process.env.NEXT_PUBLIC_SITE_NAME ?? 'Open Plots and Villas'} | GEM Group Realty`,
    description:
      'Browse RERA & DTCP approved open plots and villas across Hyderabad, Vizag, Vijayawada and Bangalore.',
    type: 'website',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${process.env.NEXT_PUBLIC_SITE_NAME ?? 'Open Plots and Villas'} | GEM Group Realty`,
    description:
      'Browse RERA & DTCP approved open plots and villas across Hyderabad, Vizag, Vijayawada and Bangalore.',
  },
}

// JSON-LD for homepage — helps Google understand the site
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Open Plots and Villas',
  url: process.env.NEXT_PUBLIC_SITE_URL,
  description:
    'RERA & DTCP approved open plots and villas in Hyderabad, Telangana and Andhra Pradesh.',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${process.env.NEXT_PUBLIC_SITE_URL}/{search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

const CITIES = [
  { name: 'Hyderabad', slug: 'hyderabad', emoji: '🏙️' },
  { name: 'Vijayawada', slug: 'vijayawada', emoji: '🌊' },
  { name: 'Vizag', slug: 'vizag', emoji: '⛵' },
  { name: 'Shadnagar', slug: 'shadnagar', emoji: '🏡' },
]

export default async function HomePage() {
  const [featuredProjects, latestProjects] = await Promise.all([
    getCachedFeaturedProjects(),
    getCachedLatestProjects(),
  ])

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <main>
        {/* ── Hero ── Google reads H1 as the primary topic of the page */}
        <section className="bg-gradient-to-br from-purple-700 to-blue-700 text-white py-20 px-4 text-center">
          {/* ✅ H1 contains exact match search terms */}
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Open Plots and Villas in Hyderabad
          </h1>
          <p className="text-lg text-purple-100 mb-2 max-w-2xl mx-auto">
            RERA & DTCP Approved Open Plots near Hyderabad ORR, Shadnagar, Vijayawada & Vizag
          </p>
          <p className="text-sm text-purple-200 mb-8">
            Bank Loans Available · Spot Registration · Free Site Visit
          </p>
          <Link
            href="/search"
            className="bg-white text-purple-700 font-bold px-8 py-3 rounded-xl hover:bg-purple-50 transition"
          >
            Browse Open Plots & Villas →
          </Link>
        </section>

        {/* ── SEO keyword section (visible + indexable) ── */}
        <section className="bg-purple-50 py-8 px-4">
          <div className="max-w-5xl mx-auto text-center">
            {/* ✅ H2 reinforces secondary keywords */}
            <h2 className="text-2xl font-bold text-purple-900 mb-2">
              Buy Open Plots in Hyderabad &amp; Andhra Pradesh
            </h2>
            <p className="text-gray-600 text-sm max-w-3xl mx-auto">
              Discover verified open plots for sale near Hyderabad, Shadnagar, Vijayawada and Vizag.
              All projects are RERA approved, DTCP certified, with bank loan facilities and
              spot registration. GEM Group Realty offers the best open plots and villa projects
              in Telangana &amp; Andhra Pradesh.
            </p>
          </div>
        </section>

        {/* ── Browse by City ── */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse Open Plots by City</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CITIES.map((city) => (
              <Link
                key={city.slug}
                href={`/${city.slug}`}
                className="flex flex-col items-center justify-center gap-2 bg-white border border-gray-100 hover:border-purple-300 hover:shadow-md rounded-2xl p-6 transition text-center"
              >
                <span className="text-3xl">{city.emoji}</span>
                <span className="font-semibold text-gray-800">
                  Open Plots {city.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Featured Projects ── */}
        {featuredProjects.length > 0 && (
          <section className="max-w-5xl mx-auto px-4 py-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Featured Open Plots &amp; Villa Projects
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        )}

        {/* ── Latest Projects ── */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Latest Open Plots &amp; Villas
            </h2>
            <Link href="/projects" className="text-purple-600 hover:underline text-sm font-medium">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        {/* ── Popular Searches keyword block ── */}
        <section className="bg-gray-50 py-10 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Popular Searches</h2>
            <div className="flex flex-wrap gap-2">
              {[
                'Open plots in Hyderabad',
                'Open plots near ORR',
                'RERA approved plots',
                'DTCP plots Hyderabad',
                'Villas in Hyderabad',
                'Open plots Shadnagar',
                'Open plots Vijayawada',
                'Plots with bank loan',
                'Farmland near Hyderabad',
                'Open plots for sale',
                'Residential plots Telangana',
                'Cheap plots Hyderabad',
                'Plot booking near me',
                'Gated community plots',
                'Open plots Vizag',
              ].map((term) => (
                <span
                  key={term}
                  className="bg-white border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-full hover:border-purple-300 hover:text-purple-700 transition cursor-default"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Trust signals ── */}
        <section className="max-w-5xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Why Choose GEM Group Realty?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { icon: '✅', text: 'RERA & DTCP Approved' },
              { icon: '🏦', text: 'Bank Loans Available' },
              { icon: '📝', text: 'Spot Registration' },
              { icon: '🚗', text: 'Free Site Visit' },
              { icon: '🏆', text: '10+ Years of Trust' },
            ].map((item) => (
              <div key={item.text} className="bg-purple-50 rounded-2xl p-4">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-sm font-semibold text-purple-900">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
