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
  const [isImageUploaded, setIsImageUploaded] = useState(false); // Track if an image is uploaded
  const [bgImageSize, setBgImageSize] = useState({ width: 450, height: 450 }); // Default size

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
        setIsImageUploaded(true); // Set image uploaded state
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
    if (selectedElement === null) {
      setSelectedElement(elementRef);

    } else {

      setSelectedElement(null);
    }
  };

  const handleDeselect = (e) => {
    if (e.target === stageRef.current) {
      setSelectedElement(null);
    }
  };

  const handleSave = () => {
    setSelectedElement(null);
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
  useEffect(() => {
    if (uploadedBackground) {
      const img = new window.Image();
      img.src = uploadedImage;
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        let newWidth = 450;
        let newHeight = newWidth / aspectRatio;

        // If image is taller than it is wide, adjust height instead
        if (newHeight > 450) {
          newHeight = 450;
          newWidth = newHeight * aspectRatio;
        }

        setBgImageSize({ width: newWidth, height: newHeight });
      };
    }
  }, [uploadedBackground, uploadedImage]);
  let toggleCancel = () => {
    setUploadedImage(null)
    setIsImageUploaded(false)
    setBgImageSize({ width: 450, height: 450 })

  }
  return (
    <div className="w-full h-hf flex flex-col items-center md:justify-center h-full md:mt-0 mt-10">
      <div className="flex md:gap-4 gap-2 md:text-5xl text-3xl items-end font-leper">
        Put on a hat & <br />
        Join the leper leper legion
      </div>


      <div style={{ position: 'relative', width: bgImageSize.width, height: bgImageSize.height, border: "4px solid black" }} onClick={handleDeselect}>
        {/* Canvas */}
        <Stage
          ref={stageRef}

          width={bgImageSize.width}
          height={bgImageSize.height}
          onMouseLeave={handleDeselect}
          style={{ backgroundColor: "#226d44", }}
        >
          <Layer onClick={handleDeselect} onTouchStart={handleDeselect}>
            {/* Display uploaded background image */}
            {uploadedBackground && (
              <Image
                image={uploadedBackground}
                ref={imageRef}
                x={0}
                y={0}

                width={bgImageSize.width}
                height={bgImageSize.height}
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

                onTouchStart={() => handleSelect(ponkeRef.current)}
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
                onTouchStart={() => handleSelect(helmetRef.current)}
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
              onClick={toggleCancel} // Clear uploaded image
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
          {isImageUploaded ? <button onClick={handleSave} className="font-pretty text-white md:text-3xl lp-btn text-2xl bg-red border-4 rounded-0 border-black shadow md:px-8 px-6 md:py-2 md:pt-4 py-1 pt-3 tracking-wide transition-all rotate-0 mx-auto w-full opacity-100 md:hover:scale-105"
          >
            Save Image
          </button> : <>
            <input type="file" style={{ display: 'none' }} {...getImageInputProps()} />
            <button
              {...getImageRootProps({ className: 'dropzone' })}
              className="font-pretty text-white md:text-3xl lp-btn text-2xl bg-red border-4 rounded-0 border-black shadow md:px-8 px-6 md:py-2 md:pt-4 py-1 pt-3 tracking-wide transition-all rotate-0 mx-auto w-full opacity-100 md:hover:scale-105"
            >
              Add Image
            </button></>
          }

        </div>
      </div>


    </div>
  );
};

export default HelmetEditor;
