'use client';

import { useEffect, useRef, useState } from 'react';
import ThreeGlobe from 'three-globe';
import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';

interface LocationData {
  lat: number;
  lng: number;
  city: string;
  state: string;
  country: string;
  timezone: string;
}

const locationData: LocationData = {
  lat: 35.1495,
  lng: -90.0490,
  city: "Memphis",
  state: "TN",
  country: "USA",
  timezone: "CST",
};

export default function GlobeWidget() {
  const mountRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<ThreeGlobe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const mountElement = mountRef.current;
    if (!mountElement) return;

    const globe = new ThreeGlobe()
      .globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg')
      .showGlobe(true)
      .showGraticules(true)
      .showAtmosphere(false);

    // set up camera
    const camera = new THREE.PerspectiveCamera(
      60,
      mountElement.clientWidth / mountElement.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 290;
    camera.lookAt(0, 0, 0);

    // set up scene
    const scene = new THREE.Scene();
    
    // create a wrapper for easier globe rotation
    const globeGroup = new THREE.Group();
    globeGroup.add(globe);
    scene.add(globeGroup);
    
    // globe tilt
    globeGroup.rotation.y = THREE.MathUtils.degToRad(-50);
    globeGroup.rotation.z = THREE.MathUtils.degToRad(-23);

    
    // set up renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(mountElement.clientWidth, mountElement.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountElement.appendChild(renderer.domElement);

    // camera controls
    const tbControls = new TrackballControls(camera, renderer.domElement);
    tbControls.minDistance = 101;
    tbControls.rotateSpeed = 2;
    tbControls.zoomSpeed = 0.8;
    tbControls.noPan = true;
    tbControls.noZoom = true;
    
    let isUserInteracting = false;
    
    mountElement.addEventListener('mousedown', () => {
      isUserInteracting = true;
    });
    
    mountElement.addEventListener('mouseup', () => {
      isUserInteracting = false;
    });
    
    mountElement.addEventListener('mouseleave', () => {
      isUserInteracting = false;
    });

    globeRef.current = globe;
    
    // set initial time
    const now = new Date();
    const cstTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Chicago"}));
    const timeString = cstTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    setCurrentTime(timeString);
    
    // animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      tbControls.update();
      
      if (globeRef.current && !isUserInteracting) {
        globeRef.current.rotation.y += 0.0015;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = mountElement.clientWidth / mountElement.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountElement.clientWidth, mountElement.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // load countries and configure rings
    fetch('/countries.geojson')
      .then(res => res.json())
      .then(countries => {
        globe
          .polygonsData(countries.features.filter((d: { properties: { ISO_A2: string } }) => d.properties.ISO_A2 !== 'AQ'))
          .polygonSideColor(() => getComputedStyle(document.documentElement).getPropertyValue('--color-globe-polygon-side').trim())
          .polygonCapColor(() => getComputedStyle(document.documentElement).getPropertyValue('--color-globe-polygon-cap').trim())
          .polygonStrokeColor(() => getComputedStyle(document.documentElement).getPropertyValue('--color-globe-polygon-stroke').trim());
        
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });

    // update time every minute
    const timeInterval = setInterval(() => {
      const now = new Date();
      const cstTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Chicago"}));
      const timeString = cstTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      setCurrentTime(timeString);
    }, 60000);

    // cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountElement.removeChild(renderer.domElement);
      renderer.dispose();
      tbControls.dispose();
      globeRef.current = null;
      clearInterval(timeInterval);
    };
  }, []);

  // update ring data for location
  useEffect(() => {
    if (globeRef.current && !isLoading) {
      const ringData = [{
        lat: locationData.lat,
        lng: locationData.lng,
        maxR: 15,
        propagationSpeed: 3,
        repeatPeriod: 2000,
        altitude: 0.03
      }];
      
      globeRef.current
        .ringsData(ringData)
        .ringColor(() => getComputedStyle(document.documentElement).getPropertyValue('--color-globe-ring').trim())
        .ringMaxRadius('maxR')
        .ringPropagationSpeed('propagationSpeed')
        .ringRepeatPeriod('repeatPeriod')
        .ringAltitude('altitude');
    }
  }, [isLoading]);

  // listen for theme changes & update globe colors
  useEffect(() => {
    const updateGlobeColors = () => {
      if (globeRef.current) {
        globeRef.current
          .polygonSideColor(() => getComputedStyle(document.documentElement).getPropertyValue('--color-globe-polygon-side').trim())
          .polygonCapColor(() => getComputedStyle(document.documentElement).getPropertyValue('--color-globe-polygon-cap').trim())
          .polygonStrokeColor(() => getComputedStyle(document.documentElement).getPropertyValue('--color-globe-polygon-stroke').trim());
        
        globeRef.current
          .ringColor(() => getComputedStyle(document.documentElement).getPropertyValue('--color-globe-ring').trim());
      }
    };

    // custom event listener for theme changes
    const handleThemeChange = () => {
      setTimeout(updateGlobeColors, 10);
    };

    // listen for CSS variable changes
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      <div ref={mountRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-primary-400">
          <div className="text-glow text-base">MONITOR :: INITIALIZING...</div>
        </div>
      )}
      <div className="absolute top-3 left-3 text-primary-500 text-glow text-2xl">LOCATION</div>
      <div className="absolute bottom-3 left-3 max-w-full">
        <div className="text-glow text-lg text-primary-400 break-words">[TTY-2] {locationData.city.toUpperCase()} {locationData.state}, {currentTime} {locationData.timezone}</div>
      </div>
    </div>
  );
} 