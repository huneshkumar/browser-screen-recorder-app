import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
  VStack,
  useBreakpointValue,
  Input,
  Icon,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUpload } from 'react-icons/fa';
import PptxGenJS from 'pptxgenjs';

function App() {
  const [recording, setRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [slides, setSlides] = useState([]);
  const [intervalSec, setIntervalSec] = useState(3);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const isMobile = useBreakpointValue({ base: true, md: false });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      mediaRecorderRef.current = new MediaRecorder(stream);
      recordedChunks.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      toast.error('Could not start screen recording.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const downloadRecording = () => {
    const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'screen-recording.webm';
    a.click();
    URL.revokeObjectURL(url);
  };

  const convertVideoToSlides = (videoSrc = videoUrl) => {
    if (!videoSrc) return;
    const video = document.createElement('video');
    video.src = videoSrc;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const slidesArray = [];
    const interval = parseFloat(intervalSec);

    video.onloadeddata = () => {
      video.play();
      video.currentTime = 0;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const captureFrame = () => {
        if (video.currentTime < video.duration) {
          setTimeout(() => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageUrl = canvas.toDataURL('image/png');
            slidesArray.push(imageUrl);
            video.currentTime += interval;
            captureFrame();
          }, 100);
        } else {
          setSlides(slidesArray);
          toast.success('Slides created from video!');
        }
      };

      captureFrame();
    };

    video.onerror = () => {
      toast.error('Error processing video');
    };
  };

  const downloadSlidesAsPPT = () => {
    if (!slides.length) return;
    const pptx = new PptxGenJS();
    slides.forEach((slideImg) => {
      const slide = pptx.addSlide();
      slide.background = { data: slideImg };
    });
    pptx.writeFile('ScreenRecordingSlides.pptx');
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      toast.success('Video uploaded successfully! Now convert to slides.');
    }
  };

  return (
    <Box bg="gray.900" minH="100vh" py={10} px={4} color="white">
      <Container maxW="container.xl">
        <VStack spacing={10}>
          <Box textAlign="center" py={20}>
            <Heading fontSize={['4xl', '5xl']} fontWeight="bold">
              Capture Your Screen, Effortlessly.
            </Heading>
            <Text fontSize={['md', 'xl']} color="gray.400" mt={4}>
              Record your screen or upload a video and convert to professional slides in one click.
            </Text>
            <Stack direction={['column', 'row']} spacing={6} justify="center" mt={6}>
              <Button colorScheme="teal" size="lg" onClick={startRecording}>
                Start Recording
              </Button>
              <Button colorScheme="blue" size="lg" variant="outline" onClick={() => toast.info('Live demo coming soon!')}>
                Watch Live Demo
              </Button>
            </Stack>
          </Box>

          <Box bg="gray.800" w="full" p={10} borderRadius="lg" boxShadow="2xl">
            <Heading as="h2" size="lg" textAlign="center" mb={6}>
              Upload or Record Your Screen
            </Heading>

            <Stack direction={['column', 'row']} spacing={6} align="center" justify="center" wrap="wrap">
              {!recording ? (
                <Button colorScheme="green" size="lg" onClick={startRecording}>
                  Start Recording
                </Button>
              ) : (
                <Button colorScheme="red" size="lg" onClick={stopRecording}>
                  Stop Recording
                </Button>
              )}
              <Flex
                align="center"
                justify="center"
                p={2}
                borderRadius="md"
                borderWidth={2}
                borderStyle="dashed"
                borderColor="gray.600"
                _hover={{ borderColor: 'gray.400' }}
                cursor="pointer"
                position="relative"
              >
                <Icon as={FaUpload} mr={2} />
                <Text>Upload Video</Text>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  position="absolute"
                  top={0}
                  left={0}
                  width="100%"
                  height="100%"
                  opacity={0}
                  cursor="pointer"
                />
              </Flex>
              {videoUrl && (
                <Button colorScheme="blue" size="lg" onClick={downloadRecording}>
                  Download Recording
                </Button>
              )}
            </Stack>

            {videoUrl && (
              <Box mt={6} textAlign="center">
                <video src={videoUrl} controls width="100%" style={{ borderRadius: '10px' }} />
              </Box>
            )}

            {videoUrl && (
              <Box mt={6} textAlign="center">
                <Text mb={2}>Capture Interval (sec):</Text>
                <Input
                  type="number"
                  min={1}
                  value={intervalSec}
                  onChange={(e) => setIntervalSec(e.target.value)}
                  maxW="100px"
                  mx="auto"
                  textAlign="center"
                />
                <Button mt={4} colorScheme="purple" onClick={() => convertVideoToSlides(videoUrl)}>
                  Convert Video to Slides
                </Button>
              </Box>
            )}

            {slides.length > 0 && (
              <Box mt={6}>
                <Heading as="h3" size="md" textAlign="center" mb={4}>
                  Slide Previews
                </Heading>
                <Stack direction="row" spacing={6} overflowX="auto" p={4} justify="center">
                  {slides.map((slide, index) => (
                    <Box key={index} width="300px" height="200px" flexShrink={0}>
                      <img
                        src={slide}
                        alt={`Slide ${index + 1}`}
                        width="100%"
                        height="100%"
                        style={{ borderRadius: '10px', objectFit: 'cover' }}
                      />
                    </Box>
                  ))}
                </Stack>
                <Box mt={4} textAlign="center">
                  <Button colorScheme="teal" onClick={downloadSlidesAsPPT}>
                    Download Slides as PPT
                  </Button>
                </Box>
              </Box>
            )}
          </Box>

          <Box py={10} textAlign="center" color="gray.400">
            <Text>&copy; 2025 ScreenRec. All Rights Reserved.</Text>
          </Box>
        </VStack>
      </Container>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar />
    </Box>
  );
}

export default App;
