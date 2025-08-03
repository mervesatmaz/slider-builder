export class FileManager {
  private static imageFolder = 'slider-images';
  
  static async saveImageToFolder(file: File, fileName: string): Promise<string> {
    try {
      // Create folder if it doesn't exist (browser limitation - we'll handle this in export)
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            // Store the base64 data URL for now
            resolve(e.target.result as string);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    } catch (error) {
      throw new Error('Failed to save image');
    }
  }

  static generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `slider-${timestamp}-${random}.${extension}`;
  }

  static async exportWithImages(sliders: SliderItem[]): Promise<{ html: string; images: { fileName: string; data: string }[] }> {
    const images: { fileName: string; data: string }[] = [];
    let htmlContent = '';

    // Process each slider and collect local images
    const processedSliders = sliders.map(slider => {
      if (slider.isLocalFile && slider.image.startsWith('data:')) {
        const fileName = slider.imageFileName || this.generateFileName('image.jpg');
        images.push({
          fileName,
          data: slider.image
        });
        return {
          ...slider,
          image: `./slider-images/${fileName}` // Relative path for HTML
        };
      }
      return slider;
    });

    htmlContent = this.generateHTML(processedSliders);

    return { html: htmlContent, images };
  }

  private static generateHTML(sliders: SliderItem[]): string {
    return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Slider Export - ${new Date().toLocaleDateString('tr-TR')}</title>
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f5f5f5;
    padding: 20px;
  }
  
  .container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    overflow: hidden;
  }
  
  .header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    text-align: center;
  }
  
  .slider-item { 
    margin-bottom: 24px; 
    padding: 20px;
    border-bottom: 1px solid #eee;
  }
  
  .slider-item:last-child {
    border-bottom: none;
  }
  
  .slider-item img { 
    max-width: 100%; 
    height: auto; 
    border-radius: 8px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .slider-text {
    font-size: 16px;
    line-height: 1.6;
  }
  
  .footer {
    text-align: center;
    padding: 20px;
    color: #666;
    font-size: 14px;
    border-top: 1px solid #eee;
  }
  
  .error-image {
    background: #f0f0f0;
    border: 2px dashed #ccc;
    border-radius: 8px;
    padding: 40px;
    text-align: center;
    color: #666;
    margin-bottom: 12px;
  }
  
  @media (max-width: 768px) {
    body { padding: 10px; }
    .slider-item { padding: 15px; }
    .header { padding: 15px; }
  }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Slider Koleksiyonu</h1>
      <p>Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</p>
    </div>
    
    <div class="content">
      ${sliders
        .map(
          (item) => `
      <div class="slider-item">
        <img src="${item.image}" alt="Slider görseli" loading="lazy" 
             onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
        <div class="error-image" style="display:none;">
          <p>📷 Resim yüklenemedi</p>
          <p style="font-size: 12px; margin-top: 8px;">Dosya: ${item.image}</p>
        </div>
        <div class="slider-text">${item.text}</div>
      </div>`
        )
        .join('')}
    </div>
    
    <div class="footer">
      <p>Toplam ${sliders.length} slider • Slider Oluşturucu ile yapıldı</p>
      <p style="font-size: 12px; margin-top: 8px; color: #999;">
        Yerel resimler için slider-images klasörünün aynı konumda olması gerekir.
      </p>
    </div>
  </div>
</body>
</html>`;
  }
}