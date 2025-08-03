import React, { useState } from 'react';
import { SliderItem } from '../types';
import { FileManager } from '../utils/filemanager';
import JSZip from 'jszip';

interface ExportButtonProps {
  sliders: SliderItem[];
}

export function ExportButton({ sliders }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const generateCurvedSliderHTML = (sliders: SliderItem[]) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Curved Scroll Transition</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: #f5f5f5;
            min-height: 100vh;
            overflow: hidden;
        }

        .container {
            height: 100vh;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .content-wrapper {
            position: relative;
            height: 100vh;
            width: 100%;
            perspective: 2000px;
            transform-style: preserve-3d;
        }

        .content-slide {
            position: absolute;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6rem;
            padding: 2rem;
            transition: all 1.2s cubic-bezier(0.645, 0.045, 0.355, 1);
            transform-origin: center center;
            backface-visibility: hidden;
        }

        .content-slide.active {
            transform: translateX(0) rotateY(0) scale(1);
            opacity: 1;
            z-index: 2;
        }

        .content-slide.prev {
            transform: translateX(-100%) rotateY(-75deg) scale(0.8);
            opacity: 0;
            z-index: 1;
        }

        .content-slide.next {
            transform: translateX(100%) rotateY(75deg) scale(0.8);
            opacity: 0;
            z-index: 1;
        }

        .text-content {
            flex: 1;
            max-width: 500px;
            text-align: left;
            transform: translateZ(50px);
        }

        .text-content h2 {
            font-size: 3rem;
            margin-bottom: 1.5rem;
            color: #333;
            opacity: 0;
            transform: translateX(-20px);
            transition: all 0.6s ease 0.3s;
        }

        .text-content p {
            font-size: 1.2rem;
            line-height: 1.8;
            color: #666;
            opacity: 0;
            transform: translateX(-20px);
            transition: all 0.6s ease 0.5s;
        }

        .content-slide.active .text-content h2,
        .content-slide.active .text-content p {
            opacity: 1;
            transform: translateX(0);
        }

        .image-content {
            flex: 1;
            max-width: 500px;
            transform: translateZ(100px);
        }

        .image-content img {
            width: 100%;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
            transition: transform 0.6s ease;
        }

        .nav-controls {
            position: fixed;
            bottom: 2rem;
            width: 100%;
            display: flex;
            justify-content: space-between;
            padding: 0 4rem;
            z-index: 10;
        }

        .nav-arrow {
            background: #005367;
            color: white;
            border: none;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 2rem;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(0, 83, 103, 0.3);
        }

        .nav-arrow:hover {
            background: #003b4a;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(0, 83, 103, 0.4);
        }

        .slide-indicator {
            position: fixed;
            bottom: 6rem;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 0.5rem;
            z-index: 10;
        }

        .indicator-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: rgba(0, 83, 103, 0.3);
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .indicator-dot.active {
            background: #005367;
            transform: scale(1.2);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .content-slide {
                flex-direction: column;
                gap: 2rem;
                padding: 1rem;
            }

            .text-content,
            .image-content {
                max-width: 100%;
                text-align: center;
            }

            .text-content h2 {
                font-size: 2rem;
            }

            .text-content p {
                font-size: 1rem;
            }

            .nav-controls {
                padding: 0 2rem;
            }

            .nav-arrow {
                width: 50px;
                height: 50px;
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content-wrapper">
            ${sliders.map((slider, index) => `
            <div class="content-slide ${index === 0 ? 'active' : index === 1 ? 'next' : ''}">
                <div class="text-content">
                    <h2>Slide ${index + 1}</h2>
                    <p>${slider.text}</p>
                </div>
                <div class="image-content">
                    <img src="${slider.isLocalFile ? `slider-images/${slider.imageFileName}` : slider.image}" alt="Slide ${index + 1}">
                </div>
            </div>
            `).join('')}
        </div>

        <div class="nav-controls">
            <button class="nav-arrow prev">←</button>
            <button class="nav-arrow next">→</button>
        </div>

        <div class="slide-indicator">
            ${sliders.map((_, index) => `
            <div class="indicator-dot ${index === 0 ? 'active' : ''}" data-slide="${index}"></div>
            `).join('')}
        </div>
    </div>

    <script>
        const slides = document.querySelectorAll('.content-slide');
        const prevBtn = document.querySelector('.nav-arrow.prev');
        const nextBtn = document.querySelector('.nav-arrow.next');
        const indicators = document.querySelectorAll('.indicator-dot');
        let currentIndex = 0;

        function updateSlides() {
            slides.forEach((slide, index) => {
                slide.classList.remove('active', 'prev', 'next');
                if (index === currentIndex) {
                    slide.classList.add('active');
                } else if (index === (currentIndex - 1 + slides.length) % slides.length) {
                    slide.classList.add('prev');
                } else {
                    slide.classList.add('next');
                }
            });

            // Update indicators
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentIndex);
            });
        }

        function goToSlide(index) {
            currentIndex = index;
            updateSlides();
        }

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateSlides();
        });

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateSlides();
        });

        // Indicator click events
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                goToSlide(index);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                updateSlides();
            } else if (e.key === 'ArrowRight') {
                currentIndex = (currentIndex + 1) % slides.length;
                updateSlides();
            }
        });

        // Auto-play (optional - uncomment to enable)
        /*
        setInterval(() => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateSlides();
        }, 5000);
        */

        // Initialize
        updateSlides();
    </script>
</body>
</html>`;
  };

  const downloadAsZip = async () => {
    try {
      const zip = new JSZip();
      const htmlContent = generateCurvedSliderHTML(sliders);
      const { images } = await FileManager.exportWithImages(sliders);
      
      // Add HTML file
      zip.file('index.html', htmlContent);
      
      // Create images folder
      const imgFolder = zip.folder('slider-images');
      
      // Add each image to the zip
      for (const { fileName, data } of images) {
        // Convert base64 to blob
        const base64Data = data.split(',')[1];
        imgFolder?.file(fileName, base64Data, { base64: true });
      }
      
      // Generate and download zip
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `curved-slider-export-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  };

  const downloadHTMLOnly = async () => {
    const htmlContent = generateCurvedSliderHTML(sliders);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curved-slider-export-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportHTML = async () => {
    if (sliders.length === 0) {
      alert('Export edilecek slider bulunamadı.');
      return;
    }

    setIsExporting(true);

    try {
      const hasLocalImages = sliders.some(slider => slider.isLocalFile);
      
      if (hasLocalImages) {
        // Export as ZIP with images folder
        await downloadAsZip();
        
        // Show instructions
        setTimeout(() => {
          alert(
            '📁 ZIP dosyası indirildi!\n\n' +
            '📋 Nasıl kullanılır:\n' +
            '1. ZIP dosyasını açın\n' +
            '2. index.html ve slider-images klasörü aynı konumda olmalı\n' +
            '3. index.html dosyasını çift tıklayarak açın\n\n' +
            '✅ Artık 3D curved slider\'ınız her yerde çalışacak!\n\n' +
            '🎮 Kontroller:\n' +
            '• Ok tuşları ile navigasyon\n' +
            '• Alt indikator noktalarına tıklayabilirsiniz\n' +
            '• Mobil uyumlu tasarım'
          );
        }, 1000);
      } else {
        // Only URL images, download HTML only
        await downloadHTMLOnly();
        
        setTimeout(() => {
          alert(
            '📄 HTML dosyası indirildi!\n\n' +
            '✅ Curved slider\'ınız hazır!\n\n' +
            '🎮 Kontroller:\n' +
            '• Ok tuşları ile navigasyon\n' +
            '• Alt indikator noktalarına tıklayabilirsiniz\n' +
            '• Mobil uyumlu tasarım'
          );
        }, 500);
      }
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Export sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsExporting(false);
    }
  };

  const previewSliders = () => {
    if (sliders.length === 0) {
      alert('Önizleme için en az bir slider eklemeniz gerekiyor.');
      return;
    }

    const htmlContent = generateCurvedSliderHTML(sliders);

    try {
      const newWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=no,resizable=yes');
      if (newWindow) {
        newWindow.document.open();
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        newWindow.focus();
      } else {
        // Fallback if popup is blocked
        alert('⚠️ Popup engellendi!\n\nTarayıcınızın popup engellemesini devre dışı bırakın veya bu siteye izin verin.');
      }
    } catch (error) {
      console.error('Preview error:', error);
      alert('Önizleme açılırken bir hata oluştu. Tarayıcınızın popup ayarlarını kontrol edin.');
    }
  };

  const localImageCount = sliders.filter(s => s.isLocalFile).length;
  const urlImageCount = sliders.length - localImageCount;

  return (
    <div className="space-y-4">
      {sliders.length > 0 && (
        <div className="text-sm text-gray-600 text-center">
          📊 Toplam: {sliders.length} slider | 📁 Yerel: {localImageCount} | 🌐 URL: {urlImageCount}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          onClick={previewSliders}
          disabled={sliders.length === 0}
        >
          👁️ 3D Önizleme
        </button>
        
        <button
          className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-2 rounded hover:from-teal-700 hover:to-teal-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          onClick={exportHTML}
          disabled={isExporting || sliders.length === 0}
        >
          {isExporting ? '⚙️ Export Ediliyor...' : `🎬 Curved Slider Export ${localImageCount > 0 ? '(ZIP)' : '(HTML)'}`}
        </button>
      </div>
      
      {localImageCount > 0 && (
        <div className="text-xs text-gray-500 text-center max-w-md mx-auto">
          ℹ️ Yerel resimler olduğu için ZIP dosyası olarak indirilecek. 
          ZIP'i açtığınızda index.html ve slider-images klasörü aynı yerde olmalı.
        </div>
      )}

      <div className="text-xs text-blue-600 text-center max-w-lg mx-auto mt-2 p-2 bg-blue-50 rounded">
        🎮 <strong>Curved Slider Özellikleri:</strong> 3D dönüşüm efektleri, keyboard navigasyonu (←→), 
        indikator noktalar, smooth geçişler ve mobil uyumlu tasarım
      </div>
    </div>
  );
}

// Additional package.json dependency needed:
// "jszip": "^3.10.1"