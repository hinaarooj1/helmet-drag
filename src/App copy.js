import logo_text_black from './assets/logo-text-black.png';
import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image, Transformer } from 'react-konva';
import useImage from 'use-image';
import { useDropzone } from 'react-dropzone';
import html2canvas from 'html2canvas';
import helmet from './helmet.png'
import './App.css'
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
    html2canvas(stageRef.current.content).then((canvas) => {
      const link = document.createElement('a');
      link.download = 'image_with_helmet.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  const handleFlipHelmet = () => {
    const helmet = helmetRef.current;

    // Toggle flip state by inverting scaleX
    const newFlipState = !flipHelmet;

    // Calculate the new X position to keep it in the same place when flipped
    const currentX = helmet.x();
    const helmetWidth = helmet.width();
    const newX = newFlipState ? currentX + helmetWidth : currentX - helmetWidth;

    // Set the new position and flip the helmet horizontally
    helmet.x(newX);  // Update x position to maintain the same visual position
    helmet.scaleX(newFlipState ? -1 : 1);  // Flip scaleX
    helmet.scaleY(1);  // Ensure scaleY remains unchanged

    // Redraw the layer to apply changes
    helmet.getLayer().batchDraw();

    // Update the flip state
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
      const height = 200 / aspectRatio; // Calculate height based on aspect ratio
      setHelmetSize({ width: 200, height });
    }
  }, [image]);

  return (
    <div className="w-full h-hf flex flex-col items-center md:justify-center h-full md:mt-0 mt-10">
      <div className="flex md:gap-4 gap-2 md:text-5xl text-3xl items-end font-pretty" bis_skin_checked={1}><div className="z-[300]" style={{ opacity: 1, transform: 'none' }} bis_skin_checked={1}>Put</div><div className="z-[300]" style={{ opacity: 1, transform: 'none' }} bis_skin_checked={1}>on</div><div className="z-[300]" style={{ opacity: 1, transform: 'none' }} bis_skin_checked={1}>A</div><div className="z-[300]" style={{ opacity: 1, transform: 'none' }} bis_skin_checked={1}>Helmet</div></div>

      <div className="z-[300]" style={{ opacity: 1, transform: 'none' }} bis_skin_checked={1}>
        <div className="relative md:w-[300px] md:h-[80px] w-[200px] h-[70px] z-20 mb-10 md:mt-2 mt-1"
          bis_skin_checked={1}><img alt="head" fetchpriority="high" decoding="async" data-nimg="fill"
            className="object-contain" style={{
              position: 'absolute', height: '100%', width: '100%', left: 0,
              top: 0, right: 0, bottom: 0, color: 'transparent'
            }}
            sizes="100vw"
            src={logo_text_black} /></div></div>

      <div>
        {/* Upload Background Image */}



        {/* Button to Flip Helmet */}

        {/* Canvas */}
        <div style={{ border: '1px solid black', width: '450px', height: '450px', position: 'relative', backgroundColor: "#f3c684" }}>
          <Stage
            ref={stageRef}
            width={450}
            height={450}
            onMouseDown={handleDeselect}
          >
            <Layer>
              {/* Display uploaded background image (non-draggable) */}
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
              <Image
                image={image}
                ref={helmetRef}
                x={helmetPos.x}
                y={helmetPos.y}
                draggable
                width={helmetSize.width} // Set initial width
                height={helmetSize.height} // Maintain aspect ratio
                scaleX={flipHelmet ? -1 : 1} // Flip the helmet horizontally
                scaleY={1} // Ensure scaleY remains unchanged
                onClick={() => handleSelect(helmetRef.current)}
                onDragEnd={(e) => setHelmetPos({ x: e.target.x(), y: e.target.y() })} // Update helmet position on drag
              />

              {/* Transformer to resize/rotate selected element */}
              {selectedElement && (
                <Transformer
                  ref={transformerRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    // Restrict resizing to maintain aspect ratio for helmet
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
        </div>
        <div className="flex flex-col items-center md:pt-5 pt-3" bis_skin_checked={1}><div className="md:pt-3 pt-2 w-full px-8" bis_skin_checked={1}>
          <input type="file" style={{ display: 'none' }}{...getImageInputProps()} />
          <div className="z-[300]" style={{ opacity: 1, transform: 'none', paddingInline: "2rem" }} bis_skin_checked={1}>
            <button {...getImageRootProps({ className: 'dropzone' })} className="font-pretty text-white md:text-3xl text-2xl bg-red border-4 rounded-0 border-black shadow md:px-8 px-6 md:py-2 md:pt-4 py-1 pt-3 tracking-wide transition-all rotate-0 mx-auto w-full opacity-100 md:hover:scale-105">Add Image</button>
          </div></div></div>

        <button onClick={handleFlipHelmet} style={{ marginBottom: '10px' }}>Flip Helmet</button>
        {/* <button onClick={handleSave} style={{ marginTop: '10px' }}>Save Image</button> */}
      </div>
    </div>
  );
};

export default HelmetEditor;
