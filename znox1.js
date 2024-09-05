import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './App.css';

function App() {
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [order, setOrder] = useState({
    length: 10,
    width: 5,
    height: 2,
    quantity: 1,
    material: 'cast5000',
    roughCutting: false,
    eyeBoltHoles: false,
    mountingHoles: false,
    additionalComments: ''
  });

  const mountRef = useRef(null);
  const blockRef = useRef(null);

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prevInfo => ({
      ...prevInfo,
      [name]: value
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOrder(prevOrder => ({
      ...prevOrder,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  useEffect(() => {
    // Background scene setup
    const bgScene = new THREE.Scene();
    bgScene.background = new THREE.Color(0x0A0A0A); // Off-black background
    const bgCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const bgRenderer = new THREE.WebGLRenderer();
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(bgRenderer.domElement);

    // Create hyperspace effect with lines
    const linesGeometry = new THREE.BufferGeometry();
    const linesMaterial = new THREE.LineBasicMaterial({ 
      color: 0xFFFFFF, 
      transparent: true, 
      opacity: 0.55, // 55% transparency
      linewidth: 1
    });

    const linesVertices = [];
    const linesCount = 150; // Reduced for more spread out effect
    for (let i = 0; i < linesCount; i++) {
      const x = THREE.MathUtils.randFloatSpread(2500); // Increased spread
      const y = THREE.MathUtils.randFloatSpread(2500); // Increased spread
      const z = THREE.MathUtils.randFloatSpread(2500); // Increased spread
      linesVertices.push(x, y, z);
      linesVertices.push(x, y, z + 150); // End point of the line, 25% shorter
    }

    linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linesVertices, 3));
    const lineField = new THREE.LineSegments(linesGeometry, linesMaterial);
    bgScene.add(lineField);

    bgCamera.position.z = 1;

    // Render scene setup
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe0dede); // Changed to a more noticeable off-white

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(300, 300);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);
    const blockGeometry = new THREE.BoxGeometry(order.length, order.height, order.width);
    const material = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      metalness: 0
      ,
      roughness: 0.25,
    });
    const blockMesh = new THREE.Mesh(blockGeometry, material);
    scene.add(blockMesh);

    const maxDimension = Math.max(order.length, order.width, order.height);
    camera.position.set(maxDimension * 1.5, maxDimension * 1.5, maxDimension * 1.5);
    camera.lookAt(0, 0, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;

    const animate = () => {
      requestAnimationFrame(animate);
      
      // Animate background for hyperspace effect
      const positions = linesGeometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 6) { // Increment by 6 to move both start and end points
        positions[i + 2] += 10; // Move start point of line, 25% faster
        positions[i + 5] += 10; // Move end point of line, 25% faster
        if (positions[i + 2] > 1000) {
          positions[i + 2] -= 2500; // Reset line start position
          positions[i + 5] -= 2500; // Reset line end position
        }
      }
      linesGeometry.attributes.position.needsUpdate = true;

      bgRenderer.render(bgScene, bgCamera);

      // Animate render scene
      controls.update();
      blockMesh.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      bgCamera.aspect = window.innerWidth / window.innerHeight;
      bgCamera.updateProjectionMatrix();
      bgRenderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      document.body.removeChild(bgRenderer.domElement);
      renderer.dispose();
      bgRenderer.dispose();
      controls.dispose();
    };
  }, [order.length, order.width, order.height]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Contact Info:', contactInfo);
    console.log('Order submitted:', order);
    
    // Simulate sending order to backend DB
    try {
      const response = await fetch('https://api.example.com/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contactInfo, order }),
      });
      
      if (response.ok) {
        alert('Order submitted successfully!');
        // Reset form here if needed
      } else {
        alert('Failed to submit order. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>NOX METALS</h1>
        <h2>Custom Aluminum Block Order for CNC Quick Setup</h2>
      </header>
      <main className="main-content">
        <div className="order-container">
          <form onSubmit={handleSubmit} className="order-form">
            <div className="form-content">
              <div className="form-left">
                <div className="contact-info">
                  <h3>Contact Information</h3>
                  <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input type="text" id="name" name="name" value={contactInfo.name} onChange={handleContactChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" value={contactInfo.email} onChange={handleContactChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone:</label>
                    <input type="tel" id="phone" name="phone" value={contactInfo.phone} onChange={handleContactChange} required />
                  </div>
                </div>
                <div className="order-details">
                  <h3>Order Details</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="length">Length (inches):</label>
                      <input type="number" id="length" name="length" value={order.length} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="width">Width (inches):</label>
                      <input type="number" id="width" name="width" value={order.width} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="height">Height (inches):</label>
                      <input type="number" id="height" name="height" value={order.height} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="quantity">Quantity:</label>
                      <input type="number" id="quantity" name="quantity" value={order.quantity} onChange={handleInputChange} min="1" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="material">Material:</label>
                    <select id="material" name="material" value={order.material} onChange={handleInputChange}>
                      <option value="cast5000">Cast 5000</option>
                    </select>
                  </div>
                  <div className="checkbox-group">
                    <label>
                      <input type="checkbox" name="roughCutting" checked={order.roughCutting} onChange={handleInputChange} />
                      Rough Cutting
                    </label>
                    <label>
                      <input type="checkbox" name="eyeBoltHoles" checked={order.eyeBoltHoles} onChange={handleInputChange} />
                      Eye Bolt Holes
                    </label>
                    <label>
                      <input type="checkbox" name="mountingHoles" checked={order.mountingHoles} onChange={handleInputChange} />
                      Mounting Holes
                    </label>
                  </div>
                  <div className="form-group">
                    <label htmlFor="additionalComments">Additional Comments:</label>
                    <textarea id="additionalComments" name="additionalComments" value={order.additionalComments} onChange={handleInputChange} rows="3" />
                  </div>
                </div>
              </div>
              <div className="form-right">
                <div className="render-section">
                  <div className="render-container" ref={mountRef}></div>
                  <p>Interact with the 3D model: Rotate, Zoom, Pan</p>
                </div>
                <button type="submit" className="submit-btn">Submit Order</button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;
