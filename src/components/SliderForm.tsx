import React, { useState } from 'react';
import { SliderItem } from '../App';

export function SliderForm({ onAddSlider }: { onAddSlider: (slider: SliderItem) => void }) {
  const [text, setText] = useState('');
  const [image, setImage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (text && image) {
      onAddSlider({ text, image });
      setText('');
      setImage('');
    }
  };

  return (
    <div className="w-1/2 bg-white p-4 rounded shadow">
      <label className="block mb-2 font-semibold">Slider Metni</label>
      <textarea
        className="w-full p-2 border rounded mb-4"
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <label className="block mb-2 font-semibold">Görsel URL’si veya Dosya</label>
      <input
        type="text"
        placeholder="https://..."
        className="w-full p-2 border rounded mb-2"
        value={image}
        onChange={(e) => setImage(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        className="mb-4"
        onChange={handleFileChange}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={handleSubmit}
      >
        [+] Yeni Slider Ekle
      </button>
    </div>
  );
}
