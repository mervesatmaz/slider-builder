import React, { useState, useCallback } from 'react';

// SliderItem type definition
interface SliderItem {
  id: string;
  image: string;
  text: string;
  isLocalFile: boolean;
  imageFileName?: string;
}

interface SliderPreviewProps {
  sliders: SliderItem[];
  onRemoveSlider: (id: string) => void;
}

export function SliderPreview({ sliders, onRemoveSlider }: SliderPreviewProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Validate that onRemoveSlider is a function
  const safeOnRemoveSlider = useCallback((id: string) => {
    if (typeof onRemoveSlider === 'function') {
      onRemoveSlider(id);
    } else {
      console.error('onRemoveSlider is not a function:', typeof onRemoveSlider);
      alert('Silme fonksiyonu bulunamadı. Parent component\'te onRemoveSlider prop\'unu kontrol edin.');
    }
  }, [onRemoveSlider]);

  const handleImageError = useCallback((id: string) => {
    console.log('Image error for slider:', id);
    setImageErrors(prev => new Set(prev).add(id));
  }, []);

  const handleImageLoad = useCallback((id: string) => {
    console.log('Image loaded for slider:', id);
    setImageErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const handleDeleteClick = useCallback((id: string) => {
    console.log('Delete button clicked for slider:', id);
    setConfirmDelete(id);
    
    // Auto-cancel confirmation after 5 seconds
    setTimeout(() => {
      setConfirmDelete(null);
    }, 5000);
  }, []);

  const handleConfirmDelete = useCallback((id: string) => {
    console.log('Confirming delete for slider:', id);
    console.log('onRemoveSlider type:', typeof onRemoveSlider);
    console.log('onRemoveSlider value:', onRemoveSlider);
    
    try {
      safeOnRemoveSlider(id);
      console.log('safeOnRemoveSlider called successfully');
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error calling safeOnRemoveSlider:', error);
      alert('Silme işleminde hata oluştu: ' + error);
    }
  }, [safeOnRemoveSlider]);

  const handleCancelDelete = useCallback(() => {
    console.log('Delete cancelled');
    setConfirmDelete(null);
  }, []);

  return (
    <div className="w-full lg:w-1/2 bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          🎬 Canlı Önizleme ({sliders.length})
        </h2>
        {sliders.length > 0 && (
          <div className="text-xs text-gray-500">
            📁 {sliders.filter(s => s.isLocalFile).length} yerel | 
            🌐 {sliders.filter(s => !s.isLocalFile).length} URL
          </div>
        )}
      </div>

      {sliders.length === 0 ? (
        <div className="text-gray-500 text-center py-12">
          <div className="text-6xl mb-4">📸</div>
          <div className="text-lg font-medium mb-2">Henüz slider eklenmedi</div>
          <div className="text-sm">Sol taraftan yeni slider ekleyerek başlayın.</div>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 lg:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {sliders.map((item, index) => (
            <div 
              key={`slider-preview-${item.id}-${index}`} 
              className="border p-3 rounded relative group hover:shadow-md transition-all duration-200 bg-gray-50 hover:bg-white"
            >
              {/* Delete Button Area */}
              <div className="absolute top-2 right-2 flex gap-1 z-10">
                {confirmDelete === item.id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(item.id)}
                      className="bg-red-600 text-white rounded px-3 py-1 text-xs font-bold hover:bg-red-700 transition-colors shadow-lg"
                      title="Evet, sil"
                    >
                      ✓ EVET
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelDelete}
                      className="bg-gray-500 text-white rounded px-3 py-1 text-xs hover:bg-gray-600 transition-colors shadow-lg"
                      title="Hayır, iptal et"
                    >
                      ✕ HAYIR
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(item.id)}
                    className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110 shadow-lg border-2 border-white"
                    title="Slider'ı sil"
                  >
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Slide Number */}
              <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded font-bold z-10">
                #{index + 1}
              </div>

              {/* Local file indicator */}
              {item.isLocalFile && (
                <div className="absolute top-10 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded z-10">
                  📁 Yerel
                </div>
              )}

              {/* URL indicator */}
              {!item.isLocalFile && (
                <div className="absolute top-10 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded z-10">
                  🌐 URL
                </div>
              )}
              
              {/* Image Section */}
              <div className="mt-6 mb-3">
                {imageErrors.has(item.id) ? (
                  <div className="w-full h-40 bg-gradient-to-br from-gray-200 to-gray-300 rounded mb-2 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-400">
                    <div className="text-center p-4">
                      <div className="text-3xl mb-2">📷</div>
                      <div className="text-sm font-medium">Resim yüklenemedi</div>
                      {item.imageFileName && (
                        <div className="text-xs mt-1 text-gray-400 break-all">
                          📁 {item.imageFileName}
                        </div>
                      )}
                      <div className="text-xs mt-2 text-red-500 max-w-48 break-all">
                        {item.image.substring(0, 50)}...
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImageErrors(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(item.id);
                            return newSet;
                          });
                        }}
                        className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      >
                        🔄 Yeniden Dene
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={item.image} 
                      alt={`Slider ${index + 1}`}
                      className="w-full h-40 object-cover rounded border shadow-sm hover:shadow-md transition-shadow"
                      onError={() => handleImageError(item.id)}
                      onLoad={() => handleImageLoad(item.id)}
                      loading="lazy"
                    />
                    {/* Image overlay info */}
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {item.isLocalFile ? '📁' : '🌐'}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Text Content */}
              <div className="space-y-2">
                <div 
                  className="text-sm break-words leading-relaxed p-2 bg-white rounded border-l-4 border-blue-500" 
                  dangerouslySetInnerHTML={{ __html: item.text || '<em>Metin girilmemiş</em>' }} 
                />
                
                {/* File Info */}
                {item.isLocalFile && item.imageFileName && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-green-50 p-2 rounded">
                    <span className="font-medium">📁 Dosya:</span>
                    <span className="break-all">{item.imageFileName}</span>
                  </div>
                )}

                {/* URL Info */}
                {!item.isLocalFile && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 p-2 rounded">
                    <span className="font-medium">🌐 URL:</span>
                    <span className="break-all truncate max-w-xs">
                      {item.image.substring(0, 60)}
                      {item.image.length > 60 ? '...' : ''}
                    </span>
                  </div>
                )}

                {/* Character count */}
                <div className="text-xs text-gray-400 text-right">
                  {item.text.length} karakter
                </div>
              </div>

              {/* Confirmation warning */}
              {confirmDelete === item.id && (
                <div className="absolute inset-0 bg-red-50 bg-opacity-98 rounded flex items-center justify-center z-20 border-2 border-red-300">
                  <div className="text-center p-6 bg-white rounded-lg shadow-xl border">
                    <div className="text-3xl mb-3">⚠️</div>
                    <div className="text-lg font-bold text-red-700 mb-2">
                      Slider'ı Sil?
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      Bu işlem geri alınamaz!<br/>
                      ID: {item.id}
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button
                        type="button"
                        onClick={() => handleConfirmDelete(item.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition-colors"
                      >
                        ✓ EVET, SİL
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelDelete}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                      >
                        ✕ İPTAL
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
    </div>
  );
}

// Example parent component showing how to use SliderPreview correctly:
export function ExampleParentComponent() {
  const [sliders, setSliders] = useState<SliderItem[]>([
    {
      id: '1',
      image: 'https://via.placeholder.com/400x200/blue/white?text=Test+Slide+1',
      text: 'Bu bir test slider metnidir.',
      isLocalFile: false
    }
  ]);

  // THIS IS THE KEY FUNCTION THAT WAS MISSING!
  const handleRemoveSlider = useCallback((id: string) => {
    console.log('Parent: Removing slider with id:', id);
    setSliders(prevSliders => {
      const newSliders = prevSliders.filter(slider => slider.id !== id);
      console.log('Parent: New sliders array:', newSliders);
      return newSliders;
    });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Slider Yönetimi</h1>
      
      {/* This is how you use SliderPreview */}
      <SliderPreview 
        sliders={sliders}
        onRemoveSlider={handleRemoveSlider}  // Pass the function here!
      />
    </div>
  );
}