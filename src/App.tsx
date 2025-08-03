import React, { useState } from 'react';
import { SliderForm } from './components/SliderForm';
import { SliderPreview } from './components/SliderPreview';
import { ExportButton } from './components/ExportButton';
import { SliderItem } from './types';

function App() {
  const [sliders, setSliders] = useState<SliderItem[]>([]);

  const addSlider = (slider: Omit<SliderItem, 'id'>) => {
    const newSlider: SliderItem = {
      ...slider,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
    setSliders([...sliders, newSlider]);
  };


  const removeSlider = (id: string) => {
    setSliders(sliders.filter(slider => slider.id !== id));
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 bg-gray-100 flex flex-col">
      <h1 className="text-2xl font-bold mb-6 text-center">Slider Oluşturucu</h1>
      <div className="flex flex-1 flex-col lg:flex-row gap-6">
        <SliderForm onAddSlider={addSlider} />
        <SliderPreview sliders={sliders} onRemoveSlider={removeSlider} />
      </div>
      <div className="mt-6 text-center">
        <ExportButton sliders={sliders} />
      </div>
    </div>
  );
}

export default App;