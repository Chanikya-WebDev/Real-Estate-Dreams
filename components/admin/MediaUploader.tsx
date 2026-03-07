// components/admin/MediaUploader.tsx
'use client'
import { useRef, useState } from 'react'
import { CldUploadWidget } from 'next-cloudinary'
import Image from 'next/image'
import { X, Upload, Star, Play, ImageIcon, GripVertical } from 'lucide-react'

export interface UploadedMedia {
  cloudinary_id: string
  url:           string
  thumbnail_url: string
  media_type:    'image' | 'video'
  display_order: number
}

interface Props {
  media:    UploadedMedia[]
  onChange: (media: UploadedMedia[]) => void
}

export default function MediaUploader({ media, onChange }: Props) {
  // ✅ Keep a ref in sync so upload callbacks always see latest media
  const mediaRef  = useRef<UploadedMedia[]>(media)
  mediaRef.current = media

  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [preview,   setPreview]   = useState<string | null>(null) // lightbox url

  function handleUploadSuccess(result: any) {
    const info = result?.info
    if (!info?.public_id) return

    const isVideo = info.resource_type === 'video'
    const newItem: UploadedMedia = {
      cloudinary_id: info.public_id,
      url:           info.secure_url,
      thumbnail_url: isVideo
        ? info.secure_url
            .replace('/upload/', '/upload/so_0/')
            .replace(/\.[^.]+$/, '.jpg')
        : info.secure_url,
      media_type:    isVideo ? 'video' : 'image',
      display_order: mediaRef.current.length,
    }

    // ✅ Use ref (not stale closure) — fixes the 1-image bug
    const updated = [...mediaRef.current, newItem]
      .map((m, i) => ({ ...m, display_order: i }))
    onChange(updated)
  }

  function removeMedia(index: number) {
    const updated = media
      .filter((_, i) => i !== index)
      .map((m, i)    => ({ ...m, display_order: i }))
    onChange(updated)
  }

  function setCover(index: number) {
    if (index === 0) return
    const item = media[index]
    const rest  = media.filter((_, i) => i !== index)
    onChange([item, ...rest].map((m, i) => ({ ...m, display_order: i })))
  }

  function onDragStart(index: number) {
    setDragIndex(index)
  }

  function onDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    const reordered       = [...media]
    const [moved]         = reordered.splice(dragIndex, 1)
    reordered.splice(index, 0, moved)
    onChange(reordered.map((m, i) => ({ ...m, display_order: i })))
    setDragIndex(index)
  }

  function onDragEnd() { setDragIndex(null) }

  return (
    <div className="space-y-4">

      {/* ── Upload Button ── */}
      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        options={{
          multiple:             true,
          resourceType:         'auto',
          maxFiles:             30,
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov'],
        }}
        onSuccess={handleUploadSuccess}
      >
        {({ open }) => (
          <button
            type="button"
            onClick={() => open()}
            className="flex items-center gap-2 border-2 border-dashed border-purple-300 hover:border-purple-500 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold px-6 py-4 rounded-xl w-full justify-center transition"
          >
            <Upload size={18} />
            Upload Images / Videos
            <span className="text-xs font-normal text-purple-400 ml-1">(select multiple at once)</span>
          </button>
        )}
      </CldUploadWidget>

      {/* ── Media Grid ── */}
      {media.length > 0 && (
        <div className="space-y-3">

          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {media.length} file{media.length !== 1 ? 's' : ''} uploaded
            </p>
            <p className="text-xs text-amber-600 font-semibold">
              ⭐ Click star to set cover · Drag to reorder
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {media.map((item, index) => (
              <div
                key={item.cloudinary_id}
                draggable
                onDragStart={() => onDragStart(index)}
                onDragOver={(e) => onDragOver(e, index)}
                onDragEnd={onDragEnd}
                className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing aspect-square bg-gray-100 ${
                  dragIndex === index
                    ? 'opacity-50 scale-95'
                    : index === 0
                    ? 'border-amber-400 shadow-lg shadow-amber-100'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                {/* Thumbnail */}
                {item.media_type === 'video' ? (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                    <Image
                      src={item.thumbnail_url}
                      alt="video thumbnail"
                      fill
                      className="object-cover opacity-60"
                      unoptimized
                    />
                    <Play size={30} className="absolute text-white drop-shadow-lg z-10" fill="white" />
                  </div>
                ) : (
                  <Image
                    src={item.thumbnail_url}
                    alt={`media ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                    onClick={() => setPreview(item.url)}
                  />
                )}

                {/* Cover badge */}
                {index === 0 && (
                  <div className="absolute top-1.5 left-1.5 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 z-10">
                    <Star size={8} fill="white" /> COVER
                  </div>
                )}

                {/* Video badge */}
                {item.media_type === 'video' && (
                  <div className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md z-10">
                    VIDEO
                  </div>
                )}

                {/* Order number */}
                <div className="absolute bottom-1.5 right-1.5 w-5 h-5 bg-black/60 text-white text-[10px] font-bold rounded-full flex items-center justify-center z-10">
                  {index + 1}
                </div>

                {/* Hover action overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                  {/* Set cover — only images not already cover */}
                  {item.media_type === 'image' && index !== 0 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setCover(index) }}
                      title="Set as cover photo"
                      className="w-9 h-9 bg-amber-400 hover:bg-amber-500 rounded-full flex items-center justify-center shadow-lg transition"
                    >
                      <Star size={15} className="text-white" fill="white" />
                    </button>
                  )}

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeMedia(index) }}
                    title="Remove"
                    className="w-9 h-9 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition"
                  >
                    <X size={15} className="text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400">
            💡 Hover any image → ⭐ set as cover or ✕ remove. Drag cards to reorder. First image is always the cover.
          </p>
        </div>
      )}

      {/* ── Empty state ── */}
      {media.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400 border border-dashed border-gray-200 rounded-xl">
          <ImageIcon size={36} className="mb-2 opacity-30" />
          <p className="text-sm font-medium">No images or videos yet</p>
          <p className="text-xs mt-1">Upload project photos and walkthrough videos above</p>
        </div>
      )}

      {/* ── Image lightbox preview ── */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-contain rounded-xl"
            />
            <button
              className="absolute top-3 right-3 w-9 h-9 bg-black/60 hover:bg-black rounded-full flex items-center justify-center"
              onClick={() => setPreview(null)}
            >
              <X size={16} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
