export interface SliderItem {
  id: string;
  title: string; // ⬅️ bunu ekle
  text: string;
  image: string;
  imageFileName?: string; // For local file tracking
  isLocalFile: boolean;   // Track if image is local or URL
}
