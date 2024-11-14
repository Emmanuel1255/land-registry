// src/components/common/SignaturePad.jsx
import { useRef, useEffect, useState } from 'react';
import SignaturePadLib from 'signature_pad';
import { Button } from './Button';

export const SignaturePad = ({ 
  onSave, 
  width = 500, 
  height = 200,
  signatureLabel = "Digital Signature",
  className = "" 
}) => {
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;

    signaturePadRef.current = new SignaturePadLib(canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(0, 0, 0)',
    });

    const resizeCanvas = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d").scale(ratio, ratio);
      signaturePadRef.current.clear();
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [width, height]);

  const handleClear = () => {
    signaturePadRef.current.clear();
    setIsEmpty(true);
  };

  const handleSave = () => {
    if (signaturePadRef.current.isEmpty()) {
      alert("Please provide a signature first.");
      return;
    }

    const dataUrl = signaturePadRef.current.toDataURL();
    onSave(dataUrl);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {signatureLabel}
      </label>
      <div className="border rounded-lg p-4 bg-white">
        <canvas
          ref={canvasRef}
          className="border rounded touch-none w-full"
          style={{ 
            maxWidth: '100%',
            height: `${height}px`
          }}
          onMouseDown={() => setIsEmpty(false)}
          onTouchStart={() => setIsEmpty(false)}
        />
        <div className="mt-4 flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
          >
            Clear
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            // disabled={isEmpty}
          >
            Save Signature
          </Button>
        </div>
      </div>
    </div>
  );
};