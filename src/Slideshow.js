import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './css/Slideshow.css';

import demo1 from './images/slide-1.jpg';
import demo2 from './images/slide-2.jpg';
import demo3 from './images/slide-3.jpg';

const Slideshow = () => {
  const slides = [
    {
      image: demo1,
      caption: 'Two North Atlantic right whales. Photo: NOAA',
      text: [
        'There are only around 356 North Atlantic Right Whales alive today.',
        'Collisions with boats is a leading cause of injury and death.'
      ],
      animation: {
        initial: { opacity: 0, x: 0 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 0 },
        transition: { duration: 1, ease: 'easeInOut' }
      },
      delays: { text: [3, 13] }
    },
    {
      image: demo2,
      caption: 'North American right whale mother and calf. Photo: NOAA, Northeast Fisheries Science Center',
      text: [
        'Go Slow - Whales Below!',
        'November through April, the speed limit in the Mid-Atlantic Migratory Route and Calving Grounds for vessels greater than 65 ft is 10 knots, which can reduce the risk of death in a collision by up to 90%.'
      ],
      animation: {
        initial: { opacity: 0, y: 0 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 0 },
        transition: { duration: 1.2, ease: 'easeInOut' }
      },
      delays: { text: [3,3] }
    },
    {
      image: demo3,
      caption: 'A North Atlantic right whale with propeller wounds. Photo: NOAA',
      text: [
        'Go Slow - Whales Below!',
        'Over 80% of boats sped through mandatory slow zones in 2020-22',
        '- Oceana Report October 2023'
      ],
      animation: {
        initial: { opacity: 0},
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 1.5, ease: 'easeInOut' }
      },
      delays: { text: [3,3,3] }
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSlideshow, setShowSlideshow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSlideshow(true);
    }, 120000); // Delay the slideshow by 10 seconds after page load

    return () => clearTimeout(timer);
  }, []);

    useEffect(() => {
     let timeout;
     if (showSlideshow) {
       const displayTimes = [28000, 33000, 0]; // Display times for each slide in milliseconds

       timeout = setTimeout(() => {
         setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
       }, displayTimes[currentSlide]);

       if (currentSlide === slides.length - 1) {
         clearTimeout(timeout);
         timeout = setTimeout(() => {
           setShowSlideshow(false);
           setCurrentSlide(0);
         }, displayTimes.reduce((acc, val) => acc + val, 0)); // Hide slideshow after displaying all slides
       }
     }
     return () => clearTimeout(timeout);
   }, [currentSlide, showSlideshow, slides.length]);


  useEffect(() => {
    if (!showSlideshow && currentSlide === 0) {
      const timer = setTimeout(() => {
        setShowSlideshow(true);
      }, 120000); // Delay the slideshow by 2 minutes after completing all slides

      return () => clearTimeout(timer);
    }
  }, [currentSlide, showSlideshow]);

  return (
    <>
      {showSlideshow && (
        <div className="slideshow-container">
          <AnimatePresence>
            <motion.div
              key={currentSlide}
              initial={slides[currentSlide].animation.initial}
              animate={slides[currentSlide].animation.animate}
              exit={slides[currentSlide].animation.exit}
              transition={slides[currentSlide].animation.transition}
              className={`slide slide${currentSlide + 1} slidecommonclass`}
              style={{
                backgroundImage: `url(${slides[currentSlide].image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0, duration: 1 }}
                className="caption"
              >
                {slides[currentSlide].caption}
              </motion.div>

              {slides[currentSlide].text.map((sentence, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, textAlign: index === 0 ? 'left' : 'right' }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: slides[currentSlide].delays.text[index], duration: 1 }}
                  className="text"
                >
                  {sentence}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </>
  );
};

export default Slideshow;