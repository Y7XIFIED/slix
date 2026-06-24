import * as THREE from 'https://unpkg.com/three@0.128.0/build/three.module.js';
        
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        camera.position.z = 1;
        
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance', precision: 'highp' });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(renderer.domElement);
        console.log("&Toc on codepen - https://codepen.io/ol-ivier");
        
        const PALETTES = {
            aurora: { name: "Aurora", c1: [0.2, 0.8, 0.6], c2: [0.4, 0.2, 0.7], c3: [0.1, 0.5, 0.9] },
            sunset: { name: "Sunset", c1: [0.9, 0.3, 0.4], c2: [0.8, 0.5, 0.2], c3: [0.6, 0.2, 0.5] },
            ocean: { name: "Ocean", c1: [0.1, 0.4, 0.7], c2: [0.2, 0.6, 0.8], c3: [0.0, 0.3, 0.6] },
            forest: { name: "Forest", c1: [0.2, 0.5, 0.3], c2: [0.5, 0.7, 0.3], c3: [0.1, 0.4, 0.2] },
            rose: { name: "Rose", c1: [0.9, 0.5, 0.6], c2: [0.8, 0.4, 0.7], c3: [0.7, 0.3, 0.5] },
            mint: { name: "Mint", c1: [0.4, 0.8, 0.7], c2: [0.3, 0.7, 0.8], c3: [0.5, 0.9, 0.6] },
            lavender: { name: "Lavender", c1: [0.6, 0.4, 0.9], c2: [0.5, 0.3, 0.8], c3: [0.7, 0.5, 0.9] },
            ember: { name: "Ember", c1: [0.9, 0.4, 0.2], c2: [0.8, 0.3, 0.1], c3: [0.7, 0.2, 0.3] },
            nordic: { name: "Nordic", c1: [0.3, 0.7, 0.8], c2: [0.5, 0.4, 0.7], c3: [0.2, 0.5, 0.9] },
            champagne: { name: "Champagne", c1: [0.95, 0.85, 0.7], c2: [0.9, 0.7, 0.5], c3: [0.85, 0.6, 0.4] },
            midnight: { name: "Midnight", c1: [0.2, 0.2, 0.4], c2: [0.3, 0.1, 0.5], c3: [0.4, 0.2, 0.6] },
            candy: { name: "Candy", c1: [1.0, 0.4, 0.6], c2: [0.9, 0.5, 0.8], c3: [0.8, 0.6, 1.0] },
            tropical: { name: "Tropical", c1: [0.2, 0.9, 0.6], c2: [0.9, 0.7, 0.2], c3: [0.1, 0.8, 0.9] },
            royal: { name: "Royal", c1: [0.5, 0.2, 0.7], c2: [0.7, 0.3, 0.8], c3: [0.4, 0.1, 0.6] },
            earth: { name: "Earth", c1: [0.6, 0.4, 0.2], c2: [0.5, 0.5, 0.3], c3: [0.4, 0.3, 0.2] }
        };
        
        const uniforms = {
            u_time: { value: 0 },
            u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
            u_color1: { value: new THREE.Vector3(0.2, 0.8, 0.6) },
            u_color2: { value: new THREE.Vector3(0.4, 0.2, 0.7) },
            u_color3: { value: new THREE.Vector3(0.1, 0.5, 0.9) },
            u_speed: { value: 0.5 },
            u_brightness: { value: 1.0 },
            u_contrast: { value: 1.0 },
            u_complexity: { value: 1.0 },
            u_direction: { value: 0.0 }
        };
        
        const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        
        const fragmentShader = `
            uniform float u_time;
            uniform vec2 u_resolution;
            uniform vec2 u_mouse;
            uniform vec3 u_color1;
            uniform vec3 u_color2;
            uniform vec3 u_color3;
            uniform float u_speed;
            uniform float u_brightness;
            uniform float u_contrast;
            uniform float u_complexity;
            uniform float u_direction;
            varying vec2 vUv;
            
            float smoothNoise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                vec2 u = f * f * (3.0 - 2.0 * f);
                float a = sin(i.x * 12.9898 + i.y * 78.233 + 43758.5453) * 43758.5453;
                float b = sin((i.x+1.0) * 12.9898 + i.y * 78.233 + 43758.5453) * 43758.5453;
                float c = sin(i.x * 12.9898 + (i.y+1.0) * 78.233 + 43758.5453) * 43758.5453;
                float d = sin((i.x+1.0) * 12.9898 + (i.y+1.0) * 78.233 + 43758.5453) * 43758.5453;
                return mix(mix(fract(a), fract(b), u.x), mix(fract(c), fract(d), u.x), u.y);
            }
            
            void main() {
                vec2 st = vUv;
                float aspect = u_resolution.x / u_resolution.y;
                st.x *= aspect;
                
                vec2 mouse = u_mouse;
                vec2 mouseSt = vec2(mouse.x * aspect, mouse.y);
                vec2 toMouse = st - mouseSt;
                float mouseDist = length(toMouse);
                float mouseInfluence = 1.0 - smoothstep(0.0, 0.75, mouseDist);
                
                // #1 Mouse Ripple: Distort UVs based on mouse proximity
                st -= toMouse * mouseInfluence * 0.15 * sin(u_time * 2.0);
                
                // #4 Flow Direction Control: Rotate the coordinate system
                float dir = u_direction;
                mat2 rot = mat2(cos(dir), -sin(dir), sin(dir), cos(dir));
                st = rot * st;
                
                float time = u_time * u_speed;
                
                float wave1 = sin(st.x * 3.2 + time) * cos(st.y * 2.8 - time * 0.65);
                float wave2 = sin(st.y * 4.5 + time * 0.85) * 0.65;
                float wave3 = sin((st.x * 2.2 - st.y * 1.7) * 1.9 + time * 0.55) * 0.55;
                float flow = wave1 + wave2 + wave3;
                
                vec2 noiseCoord = st * (3.8 * u_complexity) + u_time * 0.18 * u_speed;
                float detail = smoothNoise(noiseCoord);
                detail += smoothNoise(noiseCoord * 2.6) * 0.45;
                detail *= 0.55 * u_complexity;
                
                vec2 center = vec2(aspect * 0.5, 0.5);
                float radial = sin(length(st - center) * 7.2 - u_time * 0.9 * u_speed) * 0.28;
                
                float pattern = flow * 0.62 + detail * 0.28 + radial * 0.1;
                pattern += mouseInfluence * 0.45 * sin(u_time * 3.2 * u_speed - length(toMouse) * 14.0);
                pattern = pattern * 0.8 + 0.5;
                pattern = clamp(pattern, 0.0, 1.0);
                
                float r = sin(pattern * 3.14159 * 2.0 + 0.0) * 0.5 + 0.5;
                float g = sin(pattern * 3.14159 * 2.0 + 2.094) * 0.5 + 0.5;
                float b = sin(pattern * 3.14159 * 2.0 + 4.188) * 0.5 + 0.5;
                
                vec3 color = vec3(0.0);
                color += u_color1 * r;
                color += u_color2 * g;
                color += u_color3 * b;
                
                color = color / (r + g + b + 0.001);
                color += sin(u_time * 0.6 * u_speed) * 0.025;
                color += cos(u_time * 0.8 * u_speed) * 0.018;
                
                float vignette = 1.0 - length(st - center) * 0.38;
                color *= clamp(vignette, 0.68, 1.0);
                
                color = color * u_brightness;
                color = (color - 0.5) * u_contrast + 0.5;
                color = clamp(color, 0.0, 1.0);
                color = pow(color, vec3(1.0/1.08));
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;
        
        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });
        
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
        scene.add(mesh);
        
        window.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = 1.0 - (e.clientY / window.innerHeight);
            uniforms.u_mouse.value.set(mouseX, mouseY);
        });
        
        window.addEventListener('resize', () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
        });
        
        const guiContainer = document.getElementById('guiContainer');
        
        const settings = {
            currentPalette: 'Aurora',
            speed: 0.5,
            brightness: 1.0,
            contrast: 1.0,
            complexity: 1.0,
            direction: 0.0,
            color1: [uniforms.u_color1.value.x, uniforms.u_color1.value.y, uniforms.u_color1.value.z],
            color2: [uniforms.u_color2.value.x, uniforms.u_color2.value.y, uniforms.u_color2.value.z],
            color3: [uniforms.u_color3.value.x, uniforms.u_color3.value.y, uniforms.u_color3.value.z]
        };
        
        function rgbToHex(r, g, b) {
            return "#" + ((1 << 24) + (Math.round(r * 255) << 16) + (Math.round(g * 255) << 8) + Math.round(b * 255)).toString(16).slice(1);
        }
        
        function hsbToRgb(hsb) {
            let h = hsb.h / 360;
            let s = hsb.s / 100;
            let v = hsb.b / 100;
            const i = Math.floor(h * 6);
            const f = h * 6 - i;
            const p = v * (1 - s);
            const q = v * (1 - f * s);
            const t = v * (1 - (1 - f) * s);
            let r, g, bv;
            switch (i % 6) {
                case 0: r = v; g = t; bv = p; break;
                case 1: r = q; g = v; bv = p; break;
                case 2: r = p; g = v; bv = t; break;
                case 3: r = p; g = q; bv = v; break;
                case 4: r = t; g = p; bv = v; break;
                default: r = v; g = p; bv = q; break;
            }
            return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(bv * 255) };
        }
        
        function rgbToHsb(r, g, b) {
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const delta = max - min;
            let h = 0;
            if (delta !== 0) {
                if (max === r) h = 60 * (((g - b) / delta) % 6);
                else if (max === g) h = 60 * ((b - r) / delta + 2);
                else h = 60 * ((r - g) / delta + 4);
            }
            if (h < 0) h += 360;
            const s = max === 0 ? 0 : (delta / max) * 100;
            const br = max * 100;
            return { h: Math.round(h), s: Math.round(s), b: Math.round(br) };
        }
        
       class CustomColorPicker {
    constructor(colorValue, onChange) {
        this.colorValue = colorValue;
        this.onChange = onChange;
        this.picker = null;
        this.currentHsb = null;
        this.isOpen = false;
        this.createPicker();
    }
    
    createPicker() {
        const pickerHTML = `
            <div class="custom-color-picker" style="display: none;">
                <div class="color-square">
                    <div class="color-overlay1">
                        <div class="color-overlay2">
                            <div class="color-selector-outer">
                                <div class="color-selector-inner"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="hue-bar">
                    <div class="hue-selector">
                        <div class="hue-arrow-left"></div>
                        <div class="hue-arrow-right"></div>
                    </div>
                </div>
                <div class="clearfix"></div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', pickerHTML);
        this.picker = document.querySelector('.custom-color-picker:last-child');
        this.initPickerEvents();
    }
    
    initPickerEvents() {
        this.colorSquare = this.picker.querySelector('.color-square');
        this.hueBar = this.picker.querySelector('.hue-bar');
        this.colorSelector = this.picker.querySelector('.color-selector-outer');
        this.hueSelector = this.picker.querySelector('.hue-selector');
        
        const rgb = { r: this.colorValue[0] * 255, g: this.colorValue[1] * 255, b: this.colorValue[2] * 255 };
        this.currentHsb = rgbToHsb(rgb.r / 255, rgb.g / 255, rgb.b / 255);
        this.updatePickerUI();
        
        let isMouseDown = false;
        let activeElement = null;
        
        const updateColorFromSquare = (e) => {
            const rect = this.colorSquare.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            const x = Math.max(0, Math.min(e.clientX - rect.left, width));
            const y = Math.max(0, Math.min(e.clientY - rect.top, height));
            this.currentHsb.s = Math.round((x / width) * 100);
            this.currentHsb.b = 100 - Math.round((y / height) * 100);
            this.updatePickerUI();
            this.updateColorValue();
        };
        
        const updateHue = (e) => {
            const rect = this.hueBar.getBoundingClientRect();
            const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
            this.currentHsb.h = Math.round((1 - y / rect.height) * 360);
            this.updatePickerUI();
            this.updateColorValue();
        };
        
        this.colorSquare.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            activeElement = 'color';
            updateColorFromSquare(e);
            e.stopPropagation();
        });
        
        this.hueBar.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            activeElement = 'hue';
            updateHue(e);
            e.stopPropagation();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;
            if (activeElement === 'color') updateColorFromSquare(e);
            else if (activeElement === 'hue') updateHue(e);
        });
        
        document.addEventListener('mouseup', () => {
            isMouseDown = false;
            activeElement = null;
        });
        
        // Add click outside listener for this picker
        document.addEventListener('click', (e) => {
            if (this.isOpen && this.picker && !this.picker.contains(e.target) && 
                e.target !== this.buttonElement) {
                this.hide();
            }
        });
    }
    
    updatePickerUI() {
        const squareRect = this.colorSquare.getBoundingClientRect();
        const selectorX = (this.currentHsb.s / 100) * squareRect.width;
        const selectorY = ((100 - this.currentHsb.b) / 100) * squareRect.height;
        this.colorSelector.style.left = selectorX + 'px';
        this.colorSelector.style.top = selectorY + 'px';
        
        const hueRect = this.hueBar.getBoundingClientRect();
        const hueY = ((360 - this.currentHsb.h) / 360) * hueRect.height;
        this.hueSelector.style.top = hueY + 'px';
        
        const hueColor = `hsl(${this.currentHsb.h}, 100%, 50%)`;
        this.colorSquare.style.backgroundColor = hueColor;
    }
    
    updateColorValue() {
        const rgb = hsbToRgb(this.currentHsb);
        const color = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
        this.onChange(color);
    }
    
    hide() {
        if (this.picker) {
            this.picker.style.display = 'none';
            this.isOpen = false;
            this.buttonElement = null;
        }
    }
    
    show(buttonElement) {
        // Close all other pickers first
        if (window.activeColorPicker && window.activeColorPicker !== this) {
            window.activeColorPicker.hide();
        }
        
        if (!this.picker) return;
        
        // If this picker is already open, close it
        if (this.isOpen) {
            this.hide();
            return;
        }
        
        const rect = buttonElement.getBoundingClientRect();
        this.picker.style.left = (rect.left + window.scrollX) - 85 + 'px';
        this.picker.style.top = (rect.top + rect.height + 12 + window.scrollY) + 'px';
        this.picker.style.display = 'block';
        this.isOpen = true;
        this.buttonElement = buttonElement;
        
        const rgb = { r: this.colorValue[0] * 255, g: this.colorValue[1] * 255, b: this.colorValue[2] * 255 };
        this.currentHsb = rgbToHsb(rgb.r / 255, rgb.g / 255, rgb.b / 255);
        this.updatePickerUI();
        
        // Track active picker globally
        window.activeColorPicker = this;
    }
    
    updateColor(color) {
        this.colorValue = color;
        const rgb = { r: color[0] * 255, g: color[1] * 255, b: color[2] * 255 };
        this.currentHsb = rgbToHsb(rgb.r / 255, rgb.g / 255, rgb.b / 255);
        if (this.picker && this.picker.style.display === 'block') this.updatePickerUI();
    }
}
        
        const paletteSelect = document.getElementById('paletteSelect');
        const speedSlider = document.getElementById('speedSlider');
        const dirSlider = document.getElementById('dirSlider');
        const contrastSlider = document.getElementById('contrastSlider');
        const speedVal = document.getElementById('speedVal');
        const dirVal = document.getElementById('dirVal');
        const contrastVal = document.getElementById('contrastVal');
        const btnRandomize = document.getElementById('btnRandomize');

        // Populate Palette Select
        const paletteNames = Object.values(PALETTES).map(p => p.name);
        paletteNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            paletteSelect.appendChild(option);
        });

        paletteSelect.addEventListener('change', (e) => {
            const value = e.target.value;
            const paletteEntry = Object.entries(PALETTES).find(([_, p]) => p.name === value);
            if (paletteEntry && !isApplyingPalette) applyPalette(paletteEntry[0]);
        });
        
        let isApplyingPalette = false;
        function applyPalette(paletteKey) {
            if (isApplyingPalette) return;
            isApplyingPalette = true;
            const palette = PALETTES[paletteKey];
            if (palette) {
                settings.color1 = [...palette.c1];
                settings.color2 = [...palette.c2];
                settings.color3 = [...palette.c3];
                settings.currentPalette = palette.name;
                uniforms.u_color1.value.set(palette.c1[0], palette.c1[1], palette.c1[2]);
                uniforms.u_color2.value.set(palette.c2[0], palette.c2[1], palette.c2[2]);
                uniforms.u_color3.value.set(palette.c3[0], palette.c3[1], palette.c3[2]);
                paletteSelect.value = palette.name;
            }
            isApplyingPalette = false;
        }

        btnRandomize.addEventListener('click', () => {
            const randomColor = () => [Math.random(), Math.random(), Math.random()];
            settings.color1 = randomColor();
            settings.color2 = randomColor();
            settings.color3 = randomColor();
            uniforms.u_color1.value.set(settings.color1[0], settings.color1[1], settings.color1[2]);
            uniforms.u_color2.value.set(settings.color2[0], settings.color2[1], settings.color2[2]);
            uniforms.u_color3.value.set(settings.color3[0], settings.color3[1], settings.color3[2]);
            
            // Generate a random speed, direction
            const rSpeed = Math.random() * 1.5;
            const rDir = Math.random() * 6.28;
            
            settings.speed = rSpeed;
            uniforms.u_speed.value = rSpeed;
            speedSlider.value = rSpeed;
            speedVal.textContent = rSpeed.toFixed(2);
            
            settings.direction = rDir;
            uniforms.u_direction.value = rDir;
            dirSlider.value = rDir;
            dirVal.textContent = rDir.toFixed(2);
            
            // Ensure 'RANDOM' option exists
            let randomOption = Array.from(paletteSelect.options).find(opt => opt.value === 'RANDOM');
            if (!randomOption) {
                randomOption = document.createElement('option');
                randomOption.value = 'RANDOM';
                randomOption.textContent = 'RANDOM';
                paletteSelect.appendChild(randomOption);
            }
            paletteSelect.value = 'RANDOM';
        });

        speedSlider.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            settings.speed = v;
            uniforms.u_speed.value = v;
            speedVal.textContent = v.toFixed(2);
        });
        
        dirSlider.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            settings.direction = v;
            uniforms.u_direction.value = v;
            dirVal.textContent = v.toFixed(2);
        });
        
        contrastSlider.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            settings.contrast = v;
            uniforms.u_contrast.value = v;
            contrastVal.textContent = v.toFixed(2);
        });

        function resetEffects() {
            settings.speed = 0.5; settings.brightness = 1.0; settings.contrast = 1.0;
            uniforms.u_speed.value = 0.5; uniforms.u_brightness.value = 1.0; uniforms.u_contrast.value = 1.0;
            speedSlider.value = 0.5; speedVal.textContent = '0.50';
            brightSlider.value = 1.0; brightVal.textContent = '1.00';
            contrastSlider.value = 1.0; contrastVal.textContent = '1.00';
        }


        applyPalette('aurora');
        
        // Animation Loop
        let clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            uniforms.u_time.value += clock.getDelta();
            renderer.render(scene, camera);
        }
        animate();
        uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);