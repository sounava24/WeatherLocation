// Enhanced Weather Effects with Three.js - Realistic Weather Simulation
class WeatherEffects {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        this.particleSystem = null;
        this.particleGroup = null;
        this.currentWeather = 'clear';
        this.currentTemperature = 20;
        this.mouseX = 0;
        this.mouseY = 0;
        this.clock = new THREE.Clock();
        this.lightning = null;

        // Initialize core properties
        this.intensity = 1;
        this.isPaused = false;
        this.autoMode = false;
        this.autoModeInterval = null;
        
        this.init();
        this.animate();
        this.setupEventListeners();
        this.createUI();
    }

    init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 100;
        
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('weather-canvas'),
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        
        this.setupLighting();
        this.createParticleSystem();
    }

    setupLighting() {
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(this.ambientLight);
        
        this.sunLight = new THREE.DirectionalLight(0xffffff, 0.6);
        this.sunLight.position.set(50, 50, 50);
        this.scene.add(this.sunLight);
    }

    createParticleSystem() {
        if (this.particleGroup) {
            this.scene.remove(this.particleGroup);
        }
        this.particleGroup = new THREE.Group();
        this.scene.add(this.particleGroup);
        this.updateWeatherEffect('clear', 20); // Initial weather
    }

    createRainParticles() {
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 400;
            positions[i3 + 1] = Math.random() * 300 + 100;
            positions[i3 + 2] = (Math.random() - 0.5) * 400;
            
            velocities[i3] = Math.random() * 0.5 - 0.25;
            velocities[i3 + 1] = -Math.random() * 2 - 5; // Fast falling
            velocities[i3 + 2] = Math.random() * 0.5 - 0.25;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        
        const material = new THREE.ShaderMaterial({
            transparent: false,
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
                    float alpha = 1.0 - smoothstep(0.0, 0.3, dist);
                    alpha *= (0.7 + 0.3 * vSpeed / 10.0);
                    gl_FragColor = vec4(0.6, 0.8, 1.0, alpha);
                }
            `
        });
        
        this.particleSystem = new THREE.Points(geometry,material);
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
                    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
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
        const particleCount = 1000;
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
        this.createRainParticles();
        this.createLightningSystem();
        this.ambientLight.intensity = 0.2;
        this.sunLight.intensity = 0.3;
    }

    createLightningSystem() {
        const points = [];
        for (let i = 0; i < 20; i++) {
            points.push(new THREE.Vector3(
                (Math.random() - 0.5) * 100,
                100 - (i * 10) + Math.random() * 5,
                (Math.random() - 0.5) * 100
            ));
        }
        
        this.lightningGeometry = new THREE.BufferGeometry().setFromPoints(points);
        
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
            transparent: false,
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
    }

    updateWeatherEffect(weatherType, temperature) {
        // Clear existing particles
        while (this.particleGroup.children.length > 0) {
            const child = this.particleGroup.children[0];
            this.particleGroup.remove(child);
             if(child.geometry) child.geometry.dispose();
             if(child.material) child.material.dispose();
        }
        
        if (this.lightning) {
            this.scene.remove(this.lightning);
            if(this.lightning.geometry) this.lightning.geometry.dispose();
            if(this.lightning.material) this.lightning.material.dispose();
            this.lightning = null;
        }
        
        this.currentWeather = weatherType.toLowerCase();
        this.currentTemperature = temperature;
        
        switch (this.currentWeather) {
            case 'rain':
            case 'drizzle':
                this.createRainParticles();
                this.ambientLight.intensity = 0.3;
                this.sunLight.intensity = 0.4;
                this.sunLight.color.setHex(0xaaccff);
                break;
                
            case 'snow':
                this.createSnowParticles();
                this.ambientLight.intensity = 0.5;
                this.sunLight.intensity = 0.5;
                this.sunLight.color.setHex(0xccddff);
                break;
                
            case 'clouds':
            case 'mist':
            case 'fog':
                this.createCloudParticles();
                this.ambientLight.intensity = 0.5;
                this.sunLight.intensity = 0.4;
                this.sunLight.color.setHex(0xffffff);
                break;
                
            case 'thunderstorm':
                this.createThunderstormParticles();
                break;
                
            case 'clear':
            default:
                this.createSunnyParticles();
                this.ambientLight.intensity = 0.6;
                this.sunLight.intensity = 0.8;
                this.sunLight.color.setHex(0xffffcc);
                break;
        }
        
        this.updateTemperatureEffect(temperature);
        this.createWeatherTransition();
    }

    createWeatherTransition() {
        const transitionOverlay = document.createElement('div');
        transitionOverlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.1); z-index: 999;
            pointer-events: none; opacity: 1; transition: opacity 0.5s ease;
        `;
        document.body.appendChild(transitionOverlay);
        
        setTimeout(() => {
            transitionOverlay.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(transitionOverlay)) {
                    document.body.removeChild(transitionOverlay);
                }
            }, 500);
        }, 100);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.isPaused) return;
        
        const elapsedTime = this.clock.getElapsedTime();
        
        if (this.particleSystem && this.particleSystem.geometry.attributes.position) {
            const positions = this.particleSystem.geometry.attributes.position.array;
            const velocities = this.particleSystem.geometry.attributes.velocity?.array;
            
            if (velocities) {
                for (let i = 0; i < positions.length; i += 3) {
                    positions[i] += (velocities[i] + this.mouseX * 0.0001) * this.intensity;
                    positions[i + 1] += velocities[i + 1] * this.intensity;
                    positions[i + 2] += (velocities[i + 2] + this.mouseY * 0.0001) * this.intensity;
                    
                    if (positions[i + 1] < -150) {
                        positions[i + 1] = 200;
                        positions[i] = (Math.random() - 0.5) * 400;
                        positions[i + 2] = (Math.random() - 0.5) * 400;
                    }
                }
                this.particleSystem.geometry.attributes.position.needsUpdate = true;
            }
        }
        
        this.particleGroup.children.forEach(child => {
            if (child.userData && child.userData.velocity) {
                const vel = child.userData.velocity.clone().multiplyScalar(this.intensity);
                child.position.add(vel);
                child.rotation.y += 0.01 * this.intensity;
                
                if (Math.abs(child.position.x) > 250) child.position.x *= -1;
                if (Math.abs(child.position.z) > 250) child.position.z *= -1;
            }
        });
        
        if (this.currentWeather === 'thunderstorm' && this.lightning && Math.random() < 0.005 * this.intensity) {
            this.triggerLightning();
        }
        
        this.particleGroup.rotation.y += 0.0005 * this.intensity;
        const breathe = Math.sin(elapsedTime * 0.5) * 0.02 + 1;
        this.particleGroup.scale.setScalar(breathe);
        
        this.renderer.render(this.scene, this.camera);
    }

    triggerLightning() {
        if (!this.lightning) return;
        
        this.lightning.position.x = (Math.random() - 0.5) * 50;
        this.lightning.position.z = (Math.random() - 0.5) * 50;

        this.lightning.material.opacity = 1;
        this.ambientLight.intensity = 2;
        document.body.style.filter = 'brightness(1.5)';
        
        setTimeout(() => {
            this.lightning.material.opacity = 0;
            this.ambientLight.intensity = 0.2; // Back to thunderstorm ambient
            document.body.style.filter = 'brightness(1)';
        }, Math.random() * 100 + 50);
    }

    createUI() {
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
                    <button id="clear-btn" style="padding: 8px; background: rgba(255,200,100,0.8); border: none; border-radius: 8px; color: white; cursor: pointer; transition: all 0.2s; font-size: 12px;">☀️ Clear</button>
                    <button id="rain-btn" style="padding: 8px; background: rgba(70,130,180,0.8); border: none; border-radius: 8px; color: white; cursor: pointer; transition: all 0.2s; font-size: 12px;">🌧️ Rain</button>
                    <button id="snow-btn" style="padding: 8px; background: rgba(200,200,255,0.8); border: none; border-radius: 8px; color: white; cursor: pointer; transition: all 0.2s; font-size: 12px;">❄️ Snow</button>
                    <button id="thunder-btn" style="padding: 8px; background: rgba(50,50,100,0.8); border: none; border-radius: 8px; color: white; cursor: pointer; transition: all 0.2s; font-size: 12px;">⛈️ Storm</button>
                </div>
                
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <button id="auto-weather" style="flex: 1; padding: 8px; background: rgba(100,100,100,0.8); border: none; border-radius: 8px; color: white; cursor: pointer; transition: all 0.2s; font-size: 11px;">🔄 Auto Mode</button>
                    <button id="pause-btn" style="flex: 1; padding: 8px; background: rgba(150,50,50,0.8); border: none; border-radius: 8px; color: white; cursor: pointer; transition: all 0.2s; font-size: 11px;">⏸️ Pause</button>
                </div>
                
                <div style="font-size: 10px; opacity: 0.7; text-align: center;">
                    Keys: 1-4 for weather, [A]uto, [Space] to pause
                </div>
            </div>
        `;
        document.body.appendChild(uiPanel);
        
        // Add event listeners after a short delay to ensure DOM is ready
        setTimeout(() => {
            const intensitySlider = document.getElementById('intensity-slider');
            const rainBtn = document.getElementById('rain-btn');
            const snowBtn = document.getElementById('snow-btn');
            const thunderBtn = document.getElementById('thunder-btn');
            const clearBtn = document.getElementById('clear-btn');
            const autoBtn = document.getElementById('auto-weather');
            const pauseBtn = document.getElementById('pause-btn');
            
            if (intensitySlider) {
                intensitySlider.oninput = (e) => { this.intensity = parseFloat(e.target.value); };
            }
            if (clearBtn) {
                clearBtn.onclick = () => { this.stopAutoMode(); this.updateWeatherEffect('clear', 25); };
            }
            if (rainBtn) {
                rainBtn.onclick = () => { this.stopAutoMode(); this.updateWeatherEffect('rain', 15); };
            }
            if (snowBtn) {
                snowBtn.onclick = () => { this.stopAutoMode(); this.updateWeatherEffect('snow', -5); };
            }
            if (thunderBtn) {
                thunderBtn.onclick = () => { this.stopAutoMode(); this.updateWeatherEffect('thunderstorm', 10); };
            }
            if (autoBtn) {
                autoBtn.onclick = () => this.toggleAutoMode();
            }
            if (pauseBtn) {
                pauseBtn.onclick = () => this.togglePause();
            }
        }, 50);
        
        const buttons = uiPanel.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.onmouseenter = () => btn.style.transform = 'translateY(-2px) scale(1.02)';
            btn.onmouseleave = () => btn.style.transform = 'translateY(0) scale(1)';
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
        this.stopAutoMode(); // Ensure no multiple intervals are running
        const weathers = ['clear', 'rain', 'snow', 'thunderstorm', 'clouds'];
        this.autoModeInterval = setInterval(() => {
            if (!this.isPaused) {
                const nextWeather = weathers[Math.floor(Math.random() * weathers.length)];
                this.updateWeatherEffect(nextWeather, Math.random() * 30 - 10);
            }
        }, 8000); // Change weather every 8 seconds
    }

    stopAutoMode() {
        if (this.autoModeInterval) {
            clearInterval(this.autoModeInterval);
            this.autoModeInterval = null;
        }
        this.autoMode = false;
        const btn = document.getElementById('auto-weather');
        if (btn) {
            btn.innerHTML = '🔄 Auto Mode';
            btn.style.background = 'rgba(100,100,100,0.8)';
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const btn = document.getElementById('pause-btn');
        if (this.isPaused) {
            btn.innerHTML = '▶️ Resume';
            btn.style.background = 'rgba(50,150,50,0.8)';
            if(this.autoMode) clearInterval(this.autoModeInterval);
        } else {
            btn.innerHTML = '⏸️ Pause';
            btn.style.background = 'rgba(150,50,50,0.8)';
            if(this.autoMode) this.startAutoMode();
        }
    }

    setupEventListeners() {
        document.addEventListener('mousemove', (event) => {
            this.mouseX = (event.clientX - window.innerWidth / 2) * 0.1;
            this.mouseY = (event.clientY - window.innerHeight / 2) * 0.1;
        });
        
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (event) => {
                if(event.gamma !== null) this.mouseX = event.gamma * 2;
                if(event.beta !== null) this.mouseY = event.beta * 2;
            });
        }
        
        document.addEventListener('keydown', (event) => {
            switch(event.key.toLowerCase()) {
                case '1': this.stopAutoMode(); this.updateWeatherEffect('clear', 25); break;
                case '2': this.stopAutoMode(); this.updateWeatherEffect('rain', 15); break;
                case '3': this.stopAutoMode(); this.updateWeatherEffect('snow', -5); break;
                case '4': this.stopAutoMode(); this.updateWeatherEffect('thunderstorm', 10); break;
                case ' ': event.preventDefault(); this.togglePause(); break;
                case 'a': this.toggleAutoMode(); break;
            }
        });
    }

    updateTemperatureEffect(temperature) {
        const tempFactor = Math.max(-20, Math.min(40, temperature)) / 60 + 0.5;
        if (this.currentWeather === 'clear') {
            const hue = 0.1 * (1 - tempFactor); // 0.1 is yellow, 0 is red
            this.sunLight.color.setHSL(hue, 0.5, 0.8);
        }
    }

    updateFromWeatherData(weatherMain, temperature) {
        this.updateWeatherEffect(weatherMain, temperature);
    }
}

// Global scope initialization
let weatherEffects;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE === 'undefined') {
        console.error('Three.js failed to load.');
        addFallbackStyling();
    } else {
        initWeatherEffects();
    }
});

function initWeatherEffects() {
    try {
        weatherEffects = new WeatherEffects();
        console.log('Weather effects initialized successfully. ✨');
    } catch (error) {
        console.error('Error initializing weather effects:', error);
        addFallbackStyling();
    }
}

function addFallbackStyling() {
    const canvas = document.getElementById('weather-canvas');
    if (canvas) canvas.style.display = 'none';
    document.body.style.background = 'linear-gradient(135deg, #2c3e50, #3498db)';
    console.log('Fallback styling applied.');
}


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