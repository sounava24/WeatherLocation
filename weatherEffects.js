// Enhanced Weather Effects with Three.js - Realistic Weather Simulation
class WeatherEffects {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        this.particleSystem = null;
        this.currentWeather = 'clear';
        this.mouseX = 0;
        this.mouseY = 0;
        this.clock = new THREE.Clock();
        this.windStrength = 0;
        this.lightningSystem = null;
        this.soundEnabled = true;
        
        this.init();
        this.animate();
        this.setupEventListeners();
        this.createUI();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 100;
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('weather-canvas'),
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        
        // Create dynamic lighting
        this.setupLighting();
        
        // Create initial particle system
        this.createParticleSystem();
    }

    setupLighting() {
        // Ambient lighting that changes with weather
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(this.ambientLight);
        
        // Directional light (sun/moon)
        this.sunLight = new THREE.DirectionalLight(0xffffff, 0.6);
        this.sunLight.position.set(50, 50, 50);
        this.scene.add(this.sunLight);
        
        // Point lights for special effects
        this.effectLights = [];
    }

    createParticleSystem() {
        // Remove existing particle system
        if (this.particleSystem) {
            this.scene.remove(this.particleSystem);
        }

        const particleCount = 2000;
        this.particles = [];
        
        // Create particle group
        this.particleGroup = new THREE.Group();
        this.scene.add(this.particleGroup);
        
        // Initialize with default clear weather
        this.updateWeatherEffect('clear', 20);
    }

    createRainParticles() {
        const particleCount = 1500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 400;
            positions[i3 + 1] = Math.random() * 300 + 100;
            positions[i3 + 2] = (Math.random() - 0.5) * 400;
            
            velocities[i3] = Math.random() * 0.5 - 0.25;
            velocities[i3 + 1] = -Math.random() * 8 - 5; // Fast falling
            velocities[i3 + 2] = Math.random() * 0.5 - 0.25;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        
        // Rain shader material
        const material = new THREE.ShaderMaterial({
            transparent: true,
            vertexShader: `
                attribute vec3 velocity;
                varying float vSpeed;
                
                void main() {
                    vSpeed = length(velocity);
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = 2.0 + vSpeed * 0.5;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying float vSpeed;
                
                void main() {
                    vec2 center = gl_PointCoord - 0.5;
                    float dist = length(center);
                    
                    // Create raindrop shape
                    float alpha = 1.0 - smoothstep(0.0, 0.3, dist);
                    alpha *= (0.7 + 0.3 * vSpeed / 10.0);
                    
                    gl_FragColor = vec4(0.6, 0.8, 1.0, alpha);
                }
            `
        });
        
        this.particleSystem = new THREE.Points(geometry, material);
        this.particleGroup.add(this.particleSystem);
    }

    createSnowParticles() {
        const particleCount = 800;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 400;
            positions[i3 + 1] = Math.random() * 300 + 100;
            positions[i3 + 2] = (Math.random() - 0.5) * 400;
            
            velocities[i3] = (Math.random() - 0.5) * 0.5;
            velocities[i3 + 1] = -Math.random() * 1 - 0.5; // Slow falling
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.5;
            
            sizes[i] = Math.random() * 3 + 2;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.ShaderMaterial({
            transparent: true,
            vertexShader: `
                attribute float size;
                attribute vec3 velocity;
                varying float vSize;
                
                void main() {
                    vSize = size;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (200.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying float vSize;
                
                void main() {
                    vec2 center = gl_PointCoord - 0.5;
                    float dist = length(center);
                    
                    // Create snowflake effect
                    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                    
                    // Add sparkle effect
                    float sparkle = sin(dist * 20.0) * 0.3 + 0.7;
                    alpha *= sparkle;
                    
                    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
                }
            `
        });
        
        this.particleSystem = new THREE.Points(geometry, material);
        this.particleGroup.add(this.particleSystem);
    }

    createCloudParticles() {
        const particleCount = 300;
        const cloudGeometry = new THREE.SphereGeometry(1, 8, 6);
        
        for (let i = 0; i < particleCount; i++) {
            const material = new THREE.MeshLambertMaterial({
                color: new THREE.Color().setHSL(0, 0, 0.7 + Math.random() * 0.2),
                transparent: true,
                opacity: 0.3 + Math.random() * 0.3
            });
            
            const cloud = new THREE.Mesh(cloudGeometry, material);
            cloud.position.set(
                (Math.random() - 0.5) * 400,
                Math.random() * 100 + 50,
                (Math.random() - 0.5) * 400
            );
            
            cloud.scale.setScalar(5 + Math.random() * 10);
            cloud.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.2,
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.2
                )
            };
            
            this.particleGroup.add(cloud);
        }
    }

    createThunderstormParticles() {
        // Combine rain with lightning effects
        this.createRainParticles();
        
        // Add lightning system
        this.createLightningSystem();
        
        // Darken ambient lighting
        this.ambientLight.intensity = 0.2;
        this.sunLight.intensity = 0.3;
    }

    createLightningSystem() {
        this.lightningGeometry = new THREE.BufferGeometry();
        const points = [];
        
        // Create zigzag lightning path
        for (let i = 0; i < 20; i++) {
            points.push(new THREE.Vector3(
                (Math.random() - 0.5) * 100,
                100 - (i * 10) + Math.random() * 5,
                (Math.random() - 0.5) * 100
            ));
        }
        
        this.lightningGeometry.setFromPoints(points);
        
        const lightningMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0
        });
        
        this.lightning = new THREE.Line(this.lightningGeometry, lightningMaterial);
        this.scene.add(this.lightning);
    }

    createSunnyParticles() {
        const particleCount = 500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 300;
            positions[i3 + 1] = (Math.random() - 0.5) * 200;
            positions[i3 + 2] = (Math.random() - 0.5) * 300;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.ShaderMaterial({
            transparent: true,
            vertexShader: `
                void main() {
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = 3.0;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                void main() {
                    vec2 center = gl_PointCoord - 0.5;
                    float dist = length(center);
                    
                    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                    alpha *= 0.6;
                    
                    gl_FragColor = vec4(1.0, 0.9, 0.6, alpha);
                }
            `
        });
        
        this.particleSystem = new THREE.Points(geometry, material);
        this.particleGroup.add(this.particleSystem);
        
        // Brighten lighting for sunny weather
        this.ambientLight.intensity = 0.6;
        this.sunLight.intensity = 0.8;
        this.sunLight.color.setHex(0xffffcc);
    }

    updateWeatherEffect(weatherType, temperature) {
        // Clear existing particles
        while (this.particleGroup.children.length > 0) {
            this.particleGroup.remove(this.particleGroup.children[0]);
        }
        
        // Remove lightning if exists
        if (this.lightning) {
            this.scene.remove(this.lightning);
            this.lightning = null;
        }
        
        this.currentWeather = weatherType.toLowerCase();
        this.currentTemperature = temperature;
        
        // Reset lighting
        this.ambientLight.intensity = 0.4;
        this.sunLight.intensity = 0.6;
        this.sunLight.color.setHex(0xffffff);
        
        switch (this.currentWeather) {
            case 'rain':
            case 'drizzle':
                this.createRainParticles();
                this.ambientLight.intensity = 0.3 * this.intensity;
                this.sunLight.color.setHex(0xaaccff);
                break;
                
            case 'snow':
                this.createSnowParticles();
                this.ambientLight.intensity = 0.8 * this.intensity;
                this.sunLight.color.setHex(0xccddff);
                break;
                
            case 'clouds':
            case 'mist':
            case 'fog':
                this.createCloudParticles();
                this.ambientLight.intensity = 0.5 * this.intensity;
                this.sunLight.intensity = 0.4 * this.intensity;
                break;
                
            case 'thunderstorm':
                this.createThunderstormParticles();
                break;
                
            case 'clear':
            default:
                this.createSunnyParticles();
                break;
        }
        
        this.updateTemperatureEffect(temperature);
        this.createWeatherTransition();
    }

    createWeatherTransition() {
        // Add smooth transition effect
        const transitionOverlay = document.createElement('div');
        transitionOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.1);
            z-index: 999;
            pointer-events: none;
            opacity: 1;
            transition: opacity 0.5s ease;
        `;
        
        document.body.appendChild(transitionOverlay);
        
        setTimeout(() => {
            transitionOverlay.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(transitionOverlay);
            }, 500);
        }, 100);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Skip animation if paused
        if (this.isPaused) {
            this.renderer.render(this.scene, this.camera);
            return;
        }
        
        const delta = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();
        
        // Update particles based on weather type
        if (this.particleSystem && this.particleSystem.geometry.attributes.position) {
            const positions = this.particleSystem.geometry.attributes.position.array;
            const velocities = this.particleSystem.geometry.attributes.velocity?.array;
            
            if (velocities) {
                for (let i = 0; i < positions.length; i += 3) {
                    // Apply velocity with intensity modifier
                    positions[i] += (velocities[i] + this.mouseX * 0.0001) * this.intensity;
                    positions[i + 1] += velocities[i + 1] * this.intensity;
                    positions[i + 2] += (velocities[i + 2] + this.mouseY * 0.0001) * this.intensity;
                    
                    // Reset particles that go out of bounds
                    if (positions[i + 1] < -150) {
                        positions[i + 1] = 200;
                        positions[i] = (Math.random() - 0.5) * 400;
                        positions[i + 2] = (Math.random() - 0.5) * 400;
                    }
                }
                
                this.particleSystem.geometry.attributes.position.needsUpdate = true;
            }
        }
        
        // Update cloud particles
        this.particleGroup.children.forEach(child => {
            if (child.userData && child.userData.velocity) {
                const vel = child.userData.velocity.clone().multiplyScalar(this.intensity);
                child.position.add(vel);
                child.rotation.y += 0.01 * this.intensity;
                
                // Reset clouds that drift too far
                if (Math.abs(child.position.x) > 200) {
                    child.position.x = (Math.random() - 0.5) * 400;
                }
            }
        });
        
        // Lightning effects for thunderstorms
        if (this.currentWeather === 'thunderstorm' && this.lightning) {
            if (Math.random() < 0.005 * this.intensity) {
                this.triggerLightning();
            }
        }
        
        // Gentle rotation for ambiance
        this.particleGroup.rotation.y += 0.0005 * this.intensity;
        
        // Add breathing effect
        const breathe = Math.sin(elapsedTime * 0.5) * 0.02 + 1;
        this.particleGroup.scale.setScalar(breathe);
        
        this.renderer.render(this.scene, this.camera);
    }

    triggerLightning() {
        if (!this.lightning) return;
        
        // Flash effect
        this.lightning.material.opacity = 1;
        this.ambientLight.intensity = 2;
        
        // Create thunder sound effect (visual feedback)
        document.body.style.filter = 'brightness(1.5)';
        
        setTimeout(() => {
            this.lightning.material.opacity = 0;
            this.ambientLight.intensity = 0.2;
            document.body.style.filter = 'brightness(1)';
        }, 100);
    }

    createUI() {
        // Create floating UI panel
        const uiPanel = document.createElement('div');
        uiPanel.id = 'weather-controls';
        uiPanel.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: rgba(255,255,255,0.1); 
                        backdrop-filter: blur(10px); padding: 15px; border-radius: 15px; 
                        border: 1px solid rgba(255,255,255,0.2); z-index: 1000; color: white;
                        font-family: inherit; box-shadow: 0 8px 25px rgba(0,0,0,0.2); min-width: 200px;">
                <h4 style="margin: 0 0 10px 0; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">⚡ Weather Controls</h4>
                
                <div style="margin-bottom: 15px;">
                    <label style="font-size: 12px; opacity: 0.8;">Intensity:</label>
                    <input type="range" id="intensity-slider" min="0.2" max="2" step="0.1" value="1" 
                           style="width: 100%; margin: 5px 0;">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 15px;">
                    <button id="rain-btn" style="padding: 8px; background: rgba(70,130,180,0.8); 
                                                  border: none; border-radius: 8px; color: white; cursor: pointer;
                                                  transition: all 0.2s; font-size: 12px;">🌧️ Rain</button>
                    <button id="snow-btn" style="padding: 8px; background: rgba(200,200,255,0.8); 
                                                  border: none; border-radius: 8px; color: white; cursor: pointer;
                                                  transition: all 0.2s; font-size: 12px;">❄️ Snow</button>
                    <button id="thunder-btn" style="padding: 8px; background: rgba(50,50,100,0.8); 
                                                     border: none; border-radius: 8px; color: white; cursor: pointer;
                                                     transition: all 0.2s; font-size: 12px;">⛈️ Storm</button>
                    <button id="clear-btn" style="padding: 8px; background: rgba(255,200,100,0.8); 
                                                   border: none; border-radius: 8px; color: white; cursor: pointer;
                                                   transition: all 0.2s; font-size: 12px;">☀️ Clear</button>
                </div>
                
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <button id="auto-weather" style="flex: 1; padding: 8px; background: rgba(100,100,100,0.8); 
                                                     border: none; border-radius: 8px; color: white; cursor: pointer;
                                                     transition: all 0.2s; font-size: 11px;">🔄 Auto Mode</button>
                    <button id="pause-btn" style="flex: 1; padding: 8px; background: rgba(150,50,50,0.8); 
                                                   border: none; border-radius: 8px; color: white; cursor: pointer;
                                                   transition: all 0.2s; font-size: 11px;">⏸️ Pause</button>
                </div>
                
                <div style="font-size: 10px; opacity: 0.7; text-align: center;">
                    Keys: 1-4 for weather, Space to pause
                </div>
            </div>
        `;
        document.body.appendChild(uiPanel);
        
        // Initialize properties
        this.intensity = 1;
        this.isPaused = false;
        this.autoMode = false;
        this.autoModeInterval = null;
        
        // Add event listeners
        document.getElementById('intensity-slider').oninput = (e) => {
            this.intensity = parseFloat(e.target.value);
            this.updateWeatherEffect(this.currentWeather, this.currentTemperature || 20);
        };
        
        document.getElementById('rain-btn').onclick = () => {
            this.stopAutoMode();
            this.updateWeatherEffect('rain', 15);
        };
        document.getElementById('snow-btn').onclick = () => {
            this.stopAutoMode();
            this.updateWeatherEffect('snow', -5);
        };
        document.getElementById('thunder-btn').onclick = () => {
            this.stopAutoMode();
            this.updateWeatherEffect('thunderstorm', 10);
        };
        document.getElementById('clear-btn').onclick = () => {
            this.stopAutoMode();
            this.updateWeatherEffect('clear', 25);
        };
        
        document.getElementById('auto-weather').onclick = () => this.toggleAutoMode();
        document.getElementById('pause-btn').onclick = () => this.togglePause();
        
        // Add hover effects
        const buttons = uiPanel.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.onmouseenter = () => btn.style.transform = 'translateY(-2px)';
            btn.onmouseleave = () => btn.style.transform = 'translateY(0)';
        });
    }

    toggleAutoMode() {
        this.autoMode = !this.autoMode;
        const btn = document.getElementById('auto-weather');
        
        if (this.autoMode) {
            btn.innerHTML = '🔄 Auto ON';
            btn.style.background = 'rgba(50,150,50,0.8)';
            this.startAutoMode();
        } else {
            btn.innerHTML = '🔄 Auto Mode';
            btn.style.background = 'rgba(100,100,100,0.8)';
            this.stopAutoMode();
        }
    }

    startAutoMode() {
        const weathers = ['clear', 'rain', 'snow', 'thunderstorm'];
        let index = 0;
        
        this.autoModeInterval = setInterval(() => {
            if (!this.isPaused) {
                this.updateWeatherEffect(weathers[index], Math.random() * 30 - 10);
                index = (index + 1) % weathers.length;
            }
        }, 5000);
    }

    stopAutoMode() {
        if (this.autoModeInterval) {
            clearInterval(this.autoModeInterval);
            this.autoModeInterval = null;
        }
        this.autoMode = false;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const btn = document.getElementById('pause-btn');
        
        if (this.isPaused) {
            btn.innerHTML = '▶️ Resume';
            btn.style.background = 'rgba(50,150,50,0.8)';
        } else {
            btn.innerHTML = '⏸️ Pause';
            btn.style.background = 'rgba(150,50,50,0.8)';
        }
    }

    setupEventListeners() {
        // Mouse movement
        document.addEventListener('mousemove', (event) => {
            this.mouseX = (event.clientX - window.innerWidth / 2) * 0.1;
            this.mouseY = (event.clientY - window.innerHeight / 2) * 0.1;
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Device orientation for mobile
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (event) => {
                this.mouseX = event.gamma * 2;
                this.mouseY = event.beta * 2;
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            switch(event.key) {
                case '1': 
                    this.stopAutoMode();
                    this.updateWeatherEffect('clear', 25); 
                    break;
                case '2': 
                    this.stopAutoMode();
                    this.updateWeatherEffect('rain', 15); 
                    break;
                case '3': 
                    this.stopAutoMode();
                    this.updateWeatherEffect('snow', -5); 
                    break;
                case '4': 
                    this.stopAutoMode();
                    this.updateWeatherEffect('thunderstorm', 10); 
                    break;
                case ' ': 
                    event.preventDefault();
                    this.togglePause(); 
                    break;
                case 'a':
                case 'A':
                    this.toggleAutoMode();
                    break;
            }
        });
    }

    updateTemperatureEffect(temperature) {
        // Adjust particle colors based on temperature
        const tempFactor = Math.max(-20, Math.min(40, temperature)) / 60 + 0.5;
        
        if (this.currentWeather === 'clear') {
            // Warmer = more orange/red, cooler = more blue
            const hue = tempFactor * 0.1; // 0 to 0.1 (red to yellow)
            this.sunLight.color.setHSL(hue, 0.3, 0.8);
        }
    }
}

// Initialize effects when DOM is loaded
let weatherEffects;

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        weatherEffects = new WeatherEffects();
    }, 100);
});

// Global function to update effects from weather data
window.updateWeatherEffects = (weatherMain, temperature) => {
    if (weatherEffects) {
        weatherEffects.updateFromWeatherData(weatherMain, temperature);
    }
};

// Add method to weather effects class
WeatherEffects.prototype.updateFromWeatherData = function(weatherMain, temperature) {
    this.updateWeatherEffect(weatherMain, temperature);
};