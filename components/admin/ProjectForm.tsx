// components/admin/ProjectForm.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { toSlug } from '@/lib/slugify'
import { revalidateProjectPages } from '@/lib/revalidate'
import MediaUploader, { type UploadedMedia } from './MediaUploader'
import type { Project } from '@/types'

type FormValues = {
  name: string
  city: string
  state: string
  address: string
  description: string
  seo_title: string
  seo_description: string
  plot_size_min: string
  plot_size_max: string
  total_plots: string
  total_area: string
  price_per_sqyd: string
  price_display: string
  project_type: 'plot' | 'villa' | 'apartment' | 'farmland'
  amenities: string        // comma-separated input
  nearby: string           // comma-separated input
  latitude: string
  longitude: string
  map_embed_url: string
  published: boolean
  featured: boolean
}

interface Props {
  project?: Project & { project_media?: UploadedMedia[] }
  mode: 'create' | 'edit'
}

export default function ProjectForm({ project, mode }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [media, setMedia] = useState<UploadedMedia[]>(
    project?.project_media ?? []
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name:            project?.name ?? '',
      city:            project?.city ?? '',
      state:           project?.state ?? 'Telangana',
      address:         project?.address ?? '',
      description:     project?.description ?? '',
      seo_title:       project?.seo_title ?? '',
      seo_description: project?.seo_description ?? '',
      plot_size_min:   project?.plot_size_min?.toString() ?? '',
      plot_size_max:   project?.plot_size_max?.toString() ?? '',
      total_plots:     project?.total_plots?.toString() ?? '',
      total_area:      project?.total_area?.toString() ?? '',
      price_per_sqyd:  project?.price_per_sqyd?.toString() ?? '',
      price_display:   project?.price_display ?? '',
      project_type:    project?.project_type ?? 'plot',
      amenities:       project?.amenities?.join(', ') ?? '',
      nearby:          project?.nearby?.join(', ') ?? '',
      latitude:        project?.latitude?.toString() ?? '',
      longitude:       project?.longitude?.toString() ?? '',
      map_embed_url:   project?.map_embed_url ?? '',
      published:       project?.published ?? false,
      featured:        project?.featured ?? false,
    },
  })

  // Live preview of slug as admin types the project name
  const projectName = watch('name')
  const projectCity = watch('city')

  async function onSubmit(data: FormValues) {
    setLoading(true)
    setError('')

    const slug     = toSlug(data.name)
    const citySlug = toSlug(data.city)

    // Parse comma-separated strings into arrays
    const amenitiesArray = data.amenities
      .split(',').map(s => s.trim()).filter(Boolean)
    const nearbyArray = data.nearby
      .split(',').map(s => s.trim()).filter(Boolean)

    const coverImage = media.find(m => m.media_type === 'image')

    const projectData = {
      name:            data.name.trim(),
      slug,
      city:            data.city.trim(),
      city_slug:       citySlug,
      state:           data.state.trim(),
      address:         data.address || null,
      description:     data.description || null,
      seo_title:       data.seo_title || null,
      seo_description: data.seo_description || null,
      plot_size_min:   data.plot_size_min   ? parseInt(data.plot_size_min)   : null,
      plot_size_max:   data.plot_size_max   ? parseInt(data.plot_size_max)   : null,
      total_plots:     data.total_plots     ? parseInt(data.total_plots)     : null,
      total_area:      data.total_area      ? parseFloat(data.total_area)    : null,
      price_per_sqyd:  data.price_per_sqyd  ? parseFloat(data.price_per_sqyd): null,
      price_display:   data.price_display || null,
      project_type:    data.project_type,
      amenities:       amenitiesArray,
      nearby:          nearbyArray,
      latitude:        data.latitude  ? parseFloat(data.latitude)  : null,
      longitude:       data.longitude ? parseFloat(data.longitude) : null,
      map_embed_url:   data.map_embed_url || null,
      cover_image_url: coverImage?.url ?? null,
      cover_image_id:  coverImage?.cloudinary_id ?? null,
      published:       data.published,
      featured:        data.featured,
    }

    try {
      let savedProject: any

      if (mode === 'create') {
        const { data: created, error: dbError } = await supabase
          .from('projects')
          .insert(projectData)
          .select()
          .single()

        if (dbError) throw dbError
        savedProject = created
      } else {
        const { data: updated, error: dbError } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', project!.id)
          .select()
          .single()

        if (dbError) throw dbError
        savedProject = updated
      }

      // Save media rows
      if (mode === 'edit') {
        // Delete old media rows first
        await supabase
          .from('project_media')
          .delete()
          .eq('project_id', project!.id)
      }

      if (media.length > 0) {
        await supabase.from('project_media').insert(
          media.map((m) => ({
            project_id:    savedProject.id,
            cloudinary_id: m.cloudinary_id,
            url:           m.url,
            thumbnail_url: m.thumbnail_url,
            media_type:    m.media_type,
            display_order: m.display_order,
          }))
        )
      }

      // Trigger ISR revalidation so CDN page is rebuilt immediately
      if (data.published) {
        await revalidateProjectPages(citySlug, slug)
      }

      router.push('/admin/projects')
      router.refresh()

    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Failed to save project. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">

      {/* URL Preview */}
      {(projectName || projectCity) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700">
          🔗 URL: <strong>/{toSlug(projectCity || 'city')}/{toSlug(projectName || 'project-name')}</strong>
        </div>
      )}

      {/* ── BASIC INFO ──────────────────────────── */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b">Basic Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="md:col-span-2">
            <label className="label">Project Name *</label>
            <input
              {...register('name', { required: 'Project name is required' })}
              className="input"
              placeholder="Sree Laxmi Balaji Township"
            />
            {errors.name && <p className="error">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">City *</label>
            <input
              {...register('city', { required: 'City is required' })}
              className="input"
              placeholder="Shadnagar"
            />
          </div>

          <div>
            <label className="label">State</label>
            <input {...register('state')} className="input" placeholder="Telangana" />
          </div>

          <div className="md:col-span-2">
            <label className="label">Full Address</label>
            <input {...register('address')} className="input" placeholder="Near Bangalore Highway, Shadnagar" />
          </div>

          <div>
            <label className="label">Project Type</label>
            <select {...register('project_type')} className="input">
              <option value="plot">Plot</option>
              <option value="villa">Villa</option>
              <option value="apartment">Apartment</option>
              <option value="farmland">Farmland</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="label">Description</label>
          <textarea
            {...register('description')}
            className="input min-h-28 resize-none"
            placeholder="Describe the project — location advantages, highlights..."
          />
        </div>
      </section>

      {/* ── PLOT DETAILS ────────────────────────── */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b">Plot Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Min Size (sq.yd)</label>
            <input {...register('plot_size_min')} type="number" className="input" placeholder="165" />
          </div>
          <div>
            <label className="label">Max Size (sq.yd)</label>
            <input {...register('plot_size_max')} type="number" className="input" placeholder="500" />
          </div>
          <div>
            <label className="label">Total Plots</label>
            <input {...register('total_plots')} type="number" className="input" placeholder="578" />
          </div>
          <div>
            <label className="label">Total Area (acres)</label>
            <input {...register('total_area')} type="number" step="0.1" className="input" placeholder="45.5" />
          </div>
          <div>
            <label className="label">Price/sq.yd (₹)</label>
            <input {...register('price_per_sqyd')} type="number" className="input" placeholder="8500" />
          </div>
          <div className="md:col-span-3">
            <label className="label">Price Display Text</label>
            <input {...register('price_display')} className="input" placeholder="₹8,500/sq.yd onwards" />
          </div>
        </div>
      </section>

      {/* ── AMENITIES + NEARBY ──────────────────── */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b">Amenities & Nearby</h2>
        <div className="space-y-4">
          <div>
            <label className="label">Amenities (comma separated)</label>
            <input
              {...register('amenities')}
              className="input"
              placeholder="Park, Clubhouse, Security, Roads, Water"
            />
            <p className="text-xs text-gray-400 mt-1">Each value separated by a comma becomes a separate tag</p>
          </div>
          <div>
            <label className="label">Nearby Landmarks (comma separated)</label>
            <input
              {...register('nearby')}
              className="input"
              placeholder="Bangalore Highway, Hyderabad Airport, IT Hub"
            />
          </div>
        </div>
      </section>

      {/* ── LOCATION ────────────────────────────── */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b">Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Latitude</label>
            <input {...register('latitude')} className="input" placeholder="17.2403" />
          </div>
          <div>
            <label className="label">Longitude</label>
            <input {...register('longitude')} className="input" placeholder="78.1391" />
          </div>
          <div className="md:col-span-2">
            <label className="label">Google Maps Embed URL</label>
            <input
              {...register('map_embed_url')}
              className="input"
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
            <p className="text-xs text-gray-400 mt-1">
              Go to Google Maps → Share → Embed → copy the src URL from the iframe code
            </p>
          </div>
        </div>
      </section>

      {/* ── SEO ─────────────────────────────────── */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b">SEO (optional)</h2>
        <div className="space-y-4">
          <div>
            <label className="label">SEO Title</label>
            <input
              {...register('seo_title')}
              className="input"
              placeholder="Sree Laxmi Balaji Township | Plots in Shadnagar"
            />
            <p className="text-xs text-gray-400 mt-1">Leave blank to auto-generate</p>
          </div>
          <div>
            <label className="label">SEO Description (150–160 chars)</label>
            <textarea
              {...register('seo_description')}
              className="input resize-none"
              rows={3}
              placeholder="578 premium plots in Shadnagar near Bangalore Highway. Park, clubhouse, security. Book free site visit."
            />
          </div>
        </div>
      </section>

      {/* ── MEDIA ───────────────────────────────── */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b">Images & Videos</h2>
        <MediaUploader media={media} onChange={setMedia} />
      </section>

      {/* ── PUBLISH OPTIONS ─────────────────────── */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b">Visibility</h2>
        <div className="flex items-center gap-8">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              {...register('published')}
              type="checkbox"
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">
              Published (visible to public)
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              {...register('featured')}
              type="checkbox"
              className="w-4 h-4 accent-yellow-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Featured (shown on homepage)
            </span>
          </label>
        </div>
      </section>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-lg">{error}</p>
      )}

      <div className="flex gap-3 pb-8">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold px-8 py-3 rounded-lg transition"
        >
          {loading
            ? 'Saving...'
            : mode === 'create'
            ? 'Create Project'
            : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-8 py-3 rounded-lg transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
