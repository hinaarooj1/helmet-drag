import React, { useState, useRef, useEffect } from 'react';
import logo_text_black from './assets/logo-text-black.png';
import { Stage, Layer, Image, Transformer } from 'react-konva';
import useImage from 'use-image';
import { useDropzone } from 'react-dropzone';
import html2canvas from 'html2canvas';
import helmet from './helmet.png';
import './App.css';

const HelmetEditor = () => {
  const [uploadedImage, setUploadedImage] = useState(null); // Uploaded background image
  const [ponkeImage, setPonkeImage] = useState(null); // Ponke image
  const [selectedElement, setSelectedElement] = useState(null);
  const [image] = useImage(helmet); // Helmet image
  const [uploadedPonke] = useImage(ponkeImage); // Load Ponke character image
  const [uploadedBackground] = useImage(uploadedImage); // Load uploaded image
  const [helmetPos, setHelmetPos] = useState({ x: 150, y: 150 }); // Helmet default position
  const [flipHelmet, setFlipHelmet] = useState(false); // Helmet flipping state
  const [helmetSize, setHelmetSize] = useState({ width: 200, height: 0 }); // Initial helmet size

  const stageRef = useRef();
  const transformerRef = useRef();
  const helmetRef = useRef();
  const ponkeRef = useRef();
  const imageRef = useRef();

  // Dropzone for Ponke upload
  const { getRootProps: getPonkeRootProps, getInputProps: getPonkeInputProps } = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        setPonkeImage(reader.result);
        resetHelmetPosition(); // Reset helmet position when Ponke is uploaded
      };
      reader.readAsDataURL(file);
    },
  });

  // Dropzone for background image upload
  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps } = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result);
        resetHelmetPosition(); // Reset helmet position when background image is uploaded
      };
      reader.readAsDataURL(file);
    },
  });

  const resetHelmetPosition = () => {
    // Reset helmet to default position
    setHelmetPos({ x: 150, y: 150 });
  };

  const handleSelect = (elementRef) => {
    setSelectedElement(elementRef);
  };

  const handleDeselect = (e) => {
    if (e.target === stageRef.current) {
      setSelectedElement(null);
    }
  };

  const handleSave = () => {
    if (stageRef.current) {
      html2canvas(stageRef.current.content).then((canvas) => {
        const link = document.createElement('a');
        link.download = 'image_with_helmet.png';
        link.href = canvas.toDataURL();
        link.click();
      });
    }
  };

  const handleFlipHelmet = () => {
    const helmet = helmetRef.current;
    const newFlipState = !flipHelmet;
    const currentX = helmet.x();
    const helmetWidth = helmet.width();
    const newX = newFlipState ? currentX + helmetWidth : currentX - helmetWidth;
    helmet.x(newX);
    helmet.scaleX(newFlipState ? -1 : 1);
    helmet.scaleY(1);
    helmet.getLayer().batchDraw();
    setFlipHelmet(newFlipState);
  };

  // Update transformer when the selected element changes
  useEffect(() => {
    if (selectedElement && transformerRef.current) {
      transformerRef.current.nodes([selectedElement]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedElement]);

  // Adjust the helmet size when the image is loaded
  useEffect(() => {
    if (image) {
      const aspectRatio = image.width / image.height;
      const height = 200 / aspectRatio;
      setHelmetSize({ width: 200, height });
    }
  }, [image]);

  return (
    <div className="w-full h-hf flex flex-col items-center md:justify-center h-full md:mt-0 mt-10">
      <div className="flex md:gap-4 gap-2 md:text-5xl text-3xl items-end font-pretty">
        <div className="z-[300]" style={{ opacity: 1, transform: 'none' }}>Put</div>
        <div className="z-[300]" style={{ opacity: 1, transform: 'none' }}>on</div>
        <div className="z-[300]" style={{ opacity: 1, transform: 'none' }}>A</div>
        <div className="z-[300]" style={{ opacity: 1, transform: 'none' }}>Helmet</div>
      </div>

      <div className="z-[300]" style={{ opacity: 1, transform: 'none' }}>
        <div className="relative md:w-[300px] md:h-[80px] w-[200px] h-[70px] z-20 mb-10 md:mt-2 mt-1">
          <img alt="head" fetchpriority="high" decoding="async" className="object-contain"
            style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0, color: 'transparent' }}
            src={logo_text_black} />
        </div>
      </div>

      <div style={{ position: 'relative', width: '450px', height: '450px' }}>
        {/* Canvas */}
        <Stage
          ref={stageRef}
          width={442}
          height={450}
          onMouseDown={handleDeselect}
          style={{ backgroundColor: "#f3c684", border: "4px solid black" }}
        >
          <Layer>
            {/* Display uploaded background image */}
            {uploadedBackground && (
              <Image
                image={uploadedBackground}
                ref={imageRef}
                x={0}
                y={0}
                width={450}
                height={450}
              />
            )}

            {/* Display uploaded Ponke image */}
            {uploadedPonke && (
              <Image
                image={uploadedPonke}
                ref={ponkeRef}
                x={100}
                y={100}
                draggable
                onClick={() => handleSelect(ponkeRef.current)}
              />
            )}

            {/* Display helmet */}
            {image && (
              <Image
                image={image}
                ref={helmetRef}
                x={helmetPos.x}
                y={helmetPos.y}
                draggable
                width={helmetSize.width}
                height={helmetSize.height}
                scaleX={flipHelmet ? -1 : 1}
                scaleY={1}
                onClick={() => handleSelect(helmetRef.current)}
                onDragEnd={(e) => setHelmetPos({ x: e.target.x(), y: e.target.y() })}
              />
            )}

            {/* Transformer */}
            {selectedElement && (
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  if (selectedElement === helmetRef.current) {
                    newBox.width = Math.max(30, newBox.width);
                    newBox.height = (newBox.width / oldBox.width) * oldBox.height;
                  }
                  return newBox;
                }}
              />
            )}
          </Layer>
        </Stage>

        {/* Buttons outside the Stage */}
        {uploadedBackground && (
          <>

            <button
              onClick={handleFlipHelmet}
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 1000,
                background: 'white',
                border: '1px solid black',
                borderRadius: '5px',
                padding: '5px',
              }}
              className='flipbtn'
            >
              Flip
            </button>
            <button
              onClick={() => setUploadedImage(null)} // Clear uploaded image
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 1000,
                background: 'red',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                padding: '5px',
              }}
            >
              X
            </button>
          </>
        )}
      </div>

      <div className="flex flex-col items-center md:pt-5 pt-3">
        <div className="md:pt-3 pt-2 w-full px-8">
          <input type="file" style={{ display: 'none' }} {...getImageInputProps()} />
          <button {...getImageRootProps({ className: 'dropzone' })} className="font-pretty text-white md:text-3xl text-2xl bg-red border-4 rounded-0 border-black shadow md:px-8 px-6 md:py-2 md:pt-4 py-1 pt-3 tracking-wide transition-all rotate-0 mx-auto w-full opacity-100 md:hover:scale-105">
            Add Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelmetEditor;
