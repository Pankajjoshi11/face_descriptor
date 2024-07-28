const faceapi = require('face-api.js');
const canvas = require('canvas');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const loadModels = async () => {
  await faceapi.nets.tinyFaceDetector.loadFromDisk(path.join(__dirname, 'models'));
  await faceapi.nets.faceLandmark68Net.loadFromDisk(path.join(__dirname, 'models'));
  await faceapi.nets.faceRecognitionNet.loadFromDisk(path.join(__dirname, 'models'));
};

const imageToFaceDescriptor = async (imagePath) => {
  await loadModels();

  let img;
  if (imagePath.startsWith('http')) {
    const response = await axios({
      url: imagePath,
      responseType: 'arraybuffer',
    });
    img = await canvas.loadImage(Buffer.from(response.data, 'binary'));
  } else {
    img = await canvas.loadImage(imagePath);
  }

  const detections = await faceapi
    .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detections) {
    throw new Error('No face detected in the image.');
  }

  return detections.descriptor;
};

const saveDescriptorToFile = async (imagePath, outputPath) => {
  try {
    const descriptor = await imageToFaceDescriptor(imagePath);
    const descriptorArray = Array.from(descriptor);
    fs.writeFileSync(outputPath, JSON.stringify(descriptorArray, null, 2));
    console.log('Face descriptor saved to:', outputPath);
  } catch (err) {
    console.error(err);
  }
};

// Usage example
const imagePath = './images/pankaj.jpg'; // Replace with the actual path or URL of your image
const outputPath = path.join(__dirname, 'face_descriptor.txt');
saveDescriptorToFile(imagePath, outputPath);
//https://loq-user-manual.vercel.app/    user manual