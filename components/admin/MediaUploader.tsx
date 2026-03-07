// components/admin/MediaUploader.tsx
// 'use client' — Cloudinary widget only works in browser [web:133]
'use client'
import { CldUploadWidget } from 'next-cloudinary'
import Image from 'next/image'
import { X, Upload, ImageIcon } from 'lucide-react'

export interface UploadedMedia {
  cloudinary_id: string
  url: string
  thumbnail_url: string
  media_type: 'image' | 'video'
  display_order: number
}

interface Props {
  media: UploadedMedia[]
  onChange: (media: UploadedMedia[]) => void
}

export default function MediaUploader({ media, onChange }: Props) {

  function handleUploadSuccess(result: any) {
    const info = result.info
    const isVideo = info.resource_type === 'video'

    const newItem: UploadedMedia = {
      cloudinary_id: info.public_id,
      url: info.secure_url,
      // For videos: use the thumbnail URL
      // For images: use the same URL
      thumbnail_url: isVideo
        ? info.secure_url.replace('/upload/', '/upload/so_0/').replace(/\.[^.]+$/, '.jpg')
        : info.secure_url,
      media_type: isVideo ? 'video' : 'image',
      display_order: media.length, // append to end
    }

    onChange([...media, newItem])
  }

  function removeMedia(index: number) {
    const updated = media
      .filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, display_order: i }))
    onChange(updated)
  }

  function setCover(index: number) {
    // Move selected image to index 0 (cover image)
    const item = media[index]
    const rest = media.filter((_, i) => i !== index)
    onChange([item, ...rest].map((m, i) => ({ ...m, display_order: i })))
  }

  return (
    <div className="space-y-4">

      {/* Upload Button */}
      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!}
        options={{
          multiple: true,                           // allow uploading multiple files at once
          maxFiles: 20,
          resourceType: 'auto',                     // auto-detects image vs video
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov'],
          maxFileSize: 50000000,                    // 50MB limit per file
          folder: 'real-estate',
          sources: ['local'],    
          maxChunkSize: 6000000,         // only local + camera (no unsplash/google photos)
        }}
        onSuccess={handleUploadSuccess}
      >
        {({ open }) => (
          <button
            type="button"
            onClick={() => open()}
            className="flex items-center gap-2 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl px-6 py-4 text-gray-500 hover:text-blue-600 transition w-full justify-center"
          >
            <Upload size={18} />
            <span className="text-sm">Upload Images or Videos (max 20 files)</span>
          </button>
        )}
      </CldUploadWidget>

      {/* Media Preview Grid */}
      {media.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">
            Click ⭐ to set as cover image. First item is always the cover.
          </p>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {media.map((item, index) => (
              <div key={item.cloudinary_id} className="relative group">

                {/* Thumbnail */}
                <div className="relative h-24 bg-gray-100 rounded-lg overflow-hidden">
                  {item.media_type === 'image' ? (
                    <Image
                      src={item.url}
                      alt={`upload ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="20vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <span className="text-white text-xs">▶ Video</span>
                    </div>
                  )}

                  {/* Cover badge */}
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">
                      Cover
                    </span>
                  )}
                </div>

                {/* Actions — show on hover */}
                <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                  {index !== 0 && item.media_type === 'image' && (
                    <button
                      type="button"
                      onClick={() => setCover(index)}
                      className="bg-yellow-400 text-yellow-900 rounded w-5 h-5 flex items-center justify-center text-xs"
                      title="Set as cover"
                    >
                      ★
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="bg-red-500 text-white rounded w-5 h-5 flex items-center justify-center"
                    title="Remove"
                  >
                    <X size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {media.length === 0 && (
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <ImageIcon size={16} />
          No media uploaded yet
        </div>
      )}
    </div>
  )
}
