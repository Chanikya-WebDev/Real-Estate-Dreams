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
import AIParseButton from '@/components/admin/AIParseButton'

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
  amenities: string
  nearby: string
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
  const router   = useRouter()
  const supabase = createClient()

  const [media,   setMedia]   = useState<UploadedMedia[]>(project?.project_media ?? [])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name:            project?.name            ?? '',
      city:            project?.city            ?? '',
      state:           project?.state           ?? 'Telangana',
      address:         project?.address         ?? '',
      description:     project?.description     ?? '',
      seo_title:       project?.seo_title       ?? '',
      seo_description: project?.seo_description ?? '',
      plot_size_min:   project?.plot_size_min?.toString()  ?? '',
      plot_size_max:   project?.plot_size_max?.toString()  ?? '',
      total_plots:     project?.total_plots?.toString()    ?? '',
      total_area:      project?.total_area?.toString()     ?? '',
      price_per_sqyd:  project?.price_per_sqyd?.toString() ?? '',
      price_display:   project?.price_display  ?? '',
      project_type:    project?.project_type   ?? 'plot',
      amenities:       project?.amenities?.join(', ') ?? '',
      nearby:          project?.nearby?.join(', ')    ?? '',
      latitude:        project?.latitude?.toString()  ?? '',
      longitude:       project?.longitude?.toString() ?? '',
      map_embed_url:   project?.map_embed_url   ?? '',
      published:       project?.published       ?? false,
      featured:        project?.featured        ?? false,
    },
  })

  const projectName = watch('name')
  const projectCity = watch('city')

  // ── AI Auto-Fill handler ─────────────────────────────────
  function handleAIParsed(parsed: Record<string, any>) {
    if (parsed.name)            setValue('name',            parsed.name)
    if (parsed.city)            setValue('city',            parsed.city)
    if (parsed.state)           setValue('state',           parsed.state)
    if (parsed.address)         setValue('address',         parsed.address)
    if (parsed.project_type)    setValue('project_type',    parsed.project_type)
    if (parsed.total_area)      setValue('total_area',      String(parsed.total_area))
    if (parsed.total_plots)     setValue('total_plots',     String(parsed.total_plots))
    if (parsed.plot_size_min)   setValue('plot_size_min',   String(parsed.plot_size_min))
    if (parsed.plot_size_max)   setValue('plot_size_max',   String(parsed.plot_size_max))
    if (parsed.price_per_sqyd)  setValue('price_per_sqyd',  String(parsed.price_per_sqyd))
    if (parsed.price_display)   setValue('price_display',   parsed.price_display)
    if (parsed.description)     setValue('description',     parsed.description)
    if (parsed.seo_title)       setValue('seo_title',       parsed.seo_title)
    if (parsed.seo_description) setValue('seo_description', parsed.seo_description)
    if (parsed.latitude)        setValue('latitude',        String(parsed.latitude))
    if (parsed.longitude)       setValue('longitude',       String(parsed.longitude))
    if (parsed.map_embed_url)   setValue('map_embed_url',   parsed.map_embed_url)
    if (Array.isArray(parsed.amenities)) setValue('amenities', parsed.amenities.join(', '))
    if (Array.isArray(parsed.nearby))    setValue('nearby',    parsed.nearby.join(', '))
  }

  // ── Form submit ──────────────────────────────────────────
  async function onSubmit(data: FormValues) {
    setLoading(true)
    setError('')

    const slug     = toSlug(data.name)
    const citySlug = toSlug(data.city)

    const amenitiesArray = data.amenities.split(',').map(s => s.trim()).filter(Boolean)
    const nearbyArray    = data.nearby.split(',').map(s => s.trim()).filter(Boolean)

    // First image in media array is always the cover
    const coverImage = media.find(m => m.media_type === 'image')

    const projectData = {
      name:            data.name.trim(),
      slug,
      city:            data.city.trim(),
      city_slug:       citySlug,
      state:           data.state.trim(),
      address:         data.address         || null,
      description:     data.description     || null,
      seo_title:       data.seo_title       || null,
      seo_description: data.seo_description || null,
      // rera_number:     data.rera_number     || null,
      plot_size_min:   data.plot_size_min   ? parseInt(data.plot_size_min)    : null,
      plot_size_max:   data.plot_size_max   ? parseInt(data.plot_size_max)    : null,
      total_plots:     data.total_plots     ? parseInt(data.total_plots)      : null,
      total_area:      data.total_area      ? parseFloat(data.total_area)     : null,
      price_per_sqyd:  data.price_per_sqyd  ? parseFloat(data.price_per_sqyd) : null,
      price_display:   data.price_display   || null,
      project_type:    data.project_type,
      amenities:       amenitiesArray,
      nearby:          nearbyArray,
      latitude:        data.latitude  ? parseFloat(data.latitude)  : null,
      longitude:       data.longitude ? parseFloat(data.longitude) : null,
      map_embed_url:   data.map_embed_url || null,
      cover_image_url: coverImage?.url             ?? null,
      cover_image_id:  coverImage?.cloudinary_id   ?? null,
      published:       data.published,
      featured:        data.featured,
    }

    try {
      let savedProject: any

      if (mode === 'create') {
        const { data: created, error: dbError } = await supabase
          .from('projects').insert(projectData).select().single()
        if (dbError) throw dbError
        savedProject = created
      } else {
        const { data: updated, error: dbError } = await supabase
          .from('projects').update(projectData).eq('id', project!.id).select().single()
        if (dbError) throw dbError
        savedProject = updated
      }

      // ── Save media for BOTH create and edit ─────────────
      if (mode === 'edit') {
        // Delete old media rows first on edit
        await supabase.from('project_media').delete().eq('project_id', savedProject.id)
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

  // ── Label helper ────────────────────────────────────────
  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-sm font-semibold text-gray-700 mb-1">{children}</label>
  )
  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 transition'
  const sectionCls = 'bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4'

  return (
    <>
      <AIParseButton onParsed={handleAIParsed} />

      {/* URL Preview */}
      {(projectName || projectCity) && (
        <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 font-mono">
          🔗 URL: /{toSlug(projectCity || 'city')}/{toSlug(projectName || 'project-name')}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* ── BASIC INFO ── */}
        <div className={sectionCls}>
          <h3 className="font-bold text-gray-900 text-base">Basic Info</h3>

          <div>
            <Label>Project Name *</Label>
            <input
              {...register('name', { required: 'Project name is required' })}
              className={inputCls}
              placeholder="e.g. Sree Laxmi Balaji Township"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>City *</Label>
              <input
                {...register('city', { required: 'City is required' })}
                className={inputCls}
                placeholder="e.g. Shadnagar"
              />
              {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <Label>State</Label>
              <input {...register('state')} className={inputCls} />
            </div>
          </div>

          <div>
            <Label>Full Address</Label>
            <input
              {...register('address')}
              className={inputCls}
              placeholder="Survey No, Village, Mandal, District"
            />
          </div>

          <div>
            <Label>Project Type</Label>
            <select {...register('project_type')} className={inputCls}>
              <option value="plot">Plot</option>
              <option value="villa">Villa</option>
              <option value="apartment">Apartment</option>
              <option value="farmland">Farmland</option>
            </select>
          </div>

          

          <div>
            <Label>Description</Label>
            <textarea
              {...register('description')}
              rows={5}
              className={inputCls}
              placeholder="Project description..."
            />
          </div>
        </div>

        {/* ── PLOT DETAILS ── */}
        <div className={sectionCls}>
          <h3 className="font-bold text-gray-900 text-base">Plot Details</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Min Size (sq.yd)</Label>
              <input {...register('plot_size_min')} type="number" className={inputCls} placeholder="165" />
            </div>
            <div>
              <Label>Max Size (sq.yd)</Label>
              <input {...register('plot_size_max')} type="number" className={inputCls} placeholder="500" />
            </div>
            <div>
              <Label>Total Plots</Label>
              <input {...register('total_plots')} type="number" className={inputCls} placeholder="578" />
            </div>
            <div>
              <Label>Total Area (acres)</Label>
              <input {...register('total_area')} type="number" step="0.01" className={inputCls} placeholder="46" />
            </div>
            <div>
              <Label>Price / sq.yd (₹)</Label>
              <input {...register('price_per_sqyd')} type="number" className={inputCls} placeholder="23000" />
            </div>
            <div>
              <Label>Price Display Text</Label>
              <input {...register('price_display')} className={inputCls} placeholder="₹23,000/sq.yd onwards" />
            </div>
          </div>
        </div>

        {/* ── AMENITIES + NEARBY ── */}
        <div className={sectionCls}>
          <h3 className="font-bold text-gray-900 text-base">Amenities & Nearby</h3>

          <div>
            <Label>Amenities (comma separated)</Label>
            <textarea
              {...register('amenities')}
              rows={3}
              className={inputCls}
              placeholder="Clubhouse, Swimming Pool, 24/7 Security, Tar Roads, RERA Approved"
            />
            <p className="text-xs text-gray-400 mt-1">Each value separated by a comma becomes a separate tag</p>
          </div>

          <div>
            <Label>Nearby Landmarks (comma separated)</Label>
            <textarea
              {...register('nearby')}
              rows={3}
              className={inputCls}
              placeholder="5 min from ORR, 2 km from Shadnagar Bus Stand, Near Railway Station"
            />
          </div>
        </div>

        {/* ── LOCATION ── */}
        <div className={sectionCls}>
          <h3 className="font-bold text-gray-900 text-base">Location</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Latitude</Label>
              <input {...register('latitude')} className={inputCls} placeholder="17.0451" />
            </div>
            <div>
              <Label>Longitude</Label>
              <input {...register('longitude')} className={inputCls} placeholder="78.1642" />
            </div>
          </div>

          <div>
            <Label>Google Maps Embed URL</Label>
            <input
              {...register('map_embed_url')}
              className={inputCls}
              placeholder="https://maps.google.com/maps?q=..."
            />
            <p className="text-xs text-gray-400 mt-1">
              Google Maps → Share → Embed a map → copy the <code>src</code> URL from the iframe code
            </p>
          </div>
        </div>

        {/* ── SEO ── */}
        <div className={sectionCls}>
          <h3 className="font-bold text-gray-900 text-base">SEO <span className="text-gray-400 font-normal text-sm">(optional)</span></h3>

          <div>
            <Label>SEO Title</Label>
            <input
              {...register('seo_title')}
              className={inputCls}
              placeholder="Leave blank to auto-generate"
            />
          </div>

          <div>
            <Label>SEO Description (150–160 chars)</Label>
            <textarea
              {...register('seo_description')}
              rows={3}
              className={inputCls}
              placeholder="Buy RERA approved plots in Shadnagar from ₹23,000/sq.yd. Book a free site visit today!"
            />
          </div>
        </div>

        {/* ── MEDIA ── */}
        <div className={sectionCls}>
          <h3 className="font-bold text-gray-900 text-base">Images & Videos</h3>
          <MediaUploader media={media} onChange={setMedia} />
        </div>

        {/* ── VISIBILITY ── */}
        <div className={sectionCls}>
          <h3 className="font-bold text-gray-900 text-base">Visibility</h3>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('published')}
              className="w-4 h-4 accent-purple-600"
            />
            <span className="text-sm text-gray-700 font-medium">Published <span className="text-gray-400 font-normal">(visible to public)</span></span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('featured')}
              className="w-4 h-4 accent-purple-600"
            />
            <span className="text-sm text-gray-700 font-medium">Featured <span className="text-gray-400 font-normal">(shown on homepage)</span></span>
          </label>
        </div>

        {/* ── ERROR ── */}
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* ── ACTIONS ── */}
        <div className="flex items-center gap-4 pb-8">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-xl transition shadow"
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
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-8 py-3 rounded-xl transition"
          >
            Cancel
          </button>
        </div>

      </form>
    </>
  )
}
