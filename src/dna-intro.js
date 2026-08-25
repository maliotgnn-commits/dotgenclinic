import * as THREE from './vendor/three/three.module.js';

/* Demo panel: Bloom 0.0 (no post FX), Parlaklık 0.3× */
const BRIGHTNESS_MULTIPLIER = 0.3;

const DESKTOP_CONFIG = {
  strandCount: 1400,
  turns: 6,
  radius: 3.0,
  height: 26,
  rungs: 80,
  rungParticles: 9,
  baseSize: 16.0,
  openTwist: 0.06,
  openRadius: 2.1,
  dustCount: 180,
  helixBrightness: 0.7,
};

const MOBILE_CONFIG = {
  strandCount: 700,
  turns: 6,
  radius: 3.0,
  height: 26,
  rungs: 48,
  rungParticles: 6,
  baseSize: 13.0,
  openTwist: 0.06,
  openRadius: 2.1,
  dustCount: 80,
  helixBrightness: 0.7,
};

let runtime = null;

function isMobileViewport() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function introSectionHidden(overlay) {
  const section = overlay.parentElement;
  return Boolean(section && section.style.display === 'none');
}

function buildDNA(config) {
  const posD = [];
  const aF = [];
  const aPhase = [];
  const aType = [];
  const aRungT = [];
  const rnd = [];

  for (let s = 0; s < 2; s += 1) {
    const phase = s * Math.PI;
    for (let i = 0; i < config.strandCount; i += 1) {
      const f = i / (config.strandCount - 1);
      posD.push(0, 0, 0);
      aF.push(f);
      aPhase.push(phase);
      aType.push(0);
      aRungT.push(0);
      rnd.push(Math.random());
    }
  }

  for (let r = 0; r < config.rungs; r += 1) {
    const f = r / (config.rungs - 1);
    for (let k = 0; k < config.rungParticles; k += 1) {
      const t = k / (config.rungParticles - 1);
      posD.push(0, 0, 0);
      aF.push(f);
      aPhase.push(0);
      aType.push(1);
      aRungT.push(t);
      rnd.push(Math.random());
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(posD, 3));
  geometry.setAttribute('aF', new THREE.Float32BufferAttribute(aF, 1));
  geometry.setAttribute('aPhase', new THREE.Float32BufferAttribute(aPhase, 1));
  geometry.setAttribute('aType', new THREE.Float32BufferAttribute(aType, 1));
  geometry.setAttribute('aRungT', new THREE.Float32BufferAttribute(aRungT, 1));
  geometry.setAttribute('aRandom', new THREE.Float32BufferAttribute(rnd, 1));
  return geometry;
}

function buildDust(config) {
  const pos = [];
  const rnd = [];
  const warm = [];

  for (let i = 0; i < config.dustCount; i += 1) {
    pos.push((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20);
    rnd.push(Math.random());
    warm.push(Math.random());
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geometry.setAttribute('aRandom', new THREE.Float32BufferAttribute(rnd, 1));
  geometry.setAttribute('aWarm', new THREE.Float32BufferAttribute(warm, 1));
  return geometry;
}

function createRing(radius, opacity) {
  const segments = 128;
  const points = [];
  for (let i = 0; i <= segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0xc9a24a,
    transparent: true,
    opacity,
  });
  return new THREE.LineLoop(geometry, material);
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      canvas.getContext('webgl2')
      || canvas.getContext('webgl')
      || canvas.getContext('experimental-webgl'),
    );
  } catch {
    return false;
  }
}

/**
 * Mount DNA helix intro into a container element.
 * @param {HTMLElement} container
 * @returns {boolean}
 */
export function initDnaIntro(container) {
  if (!container || runtime || !supportsWebGL()) return false;

  const config = isMobileViewport() ? MOBILE_CONFIG : DESKTOP_CONFIG;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 200);
  /* Farther camera so the helix reads as a background atmosphere behind the logo */
  camera.position.set(0, 0, 30);

  const renderer = new THREE.WebGLRenderer({ antialias: !isMobileViewport(), alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.className = 'intro-dna-canvas';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.appendChild(renderer.domElement);

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: config.baseSize },
      uPixelRatio: { value: pixelRatio },
      uProgress: { value: 0 },
      uTurns: { value: config.turns },
      uRadius: { value: config.radius },
      uHeight: { value: config.height },
      uOpenTwist: { value: config.openTwist },
      uOpenRadius: { value: config.openRadius },
      uBright: { value: config.helixBrightness * BRIGHTNESS_MULTIPLIER },
    },
    vertexShader: /* glsl */ `
      uniform float uTime,uSize,uPixelRatio,uProgress,uTurns,uRadius,uHeight,uOpenTwist,uOpenRadius;
      attribute float aF,aPhase,aType,aRungT,aRandom;
      varying float vProgress,vTwinkle;
      const float TWO_PI=6.28318530718;
      vec3 helixPoint(float f,float phase){
        float twist=mix(1.0,uOpenTwist,uProgress);
        float radius=mix(uRadius,uRadius*uOpenRadius,uProgress);
        float ang=f*uTurns*TWO_PI*twist+phase;
        return vec3(radius*cos(ang),(f-0.5)*uHeight,radius*sin(ang));
      }
      void main(){
        vProgress=aF; vec3 p;
        if(aType<0.5){ p=helixPoint(aF,aPhase); }
        else { p=mix(helixPoint(aF,0.0),helixPoint(aF,3.14159265),aRungT); }
        vec4 mv=modelViewMatrix*vec4(p,1.0);
        gl_Position=projectionMatrix*mv;
        float tw=0.55+0.45*sin(uTime*2.0+aRandom*6.2831);
        vTwinkle=tw;
        gl_PointSize=uSize*uPixelRatio*tw*(30.0/-mv.z);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uBright;
      varying float vProgress,vTwinkle;
      void main(){
        float d=length(gl_PointCoord-vec2(0.5));
        float alpha=smoothstep(0.5,0.0,d);
        vec3 bronze=vec3(0.35,0.22,0.06);
        vec3 gold  =vec3(0.83,0.62,0.26);
        vec3 champ =vec3(1.0,0.90,0.68);
        vec3 col=mix(bronze,gold,smoothstep(0.0,0.5,vProgress));
        col=mix(col,champ,smoothstep(0.5,1.0,vProgress));
        col*=(0.8+vTwinkle*0.5)*uBright;
        gl_FragColor=vec4(col,alpha*0.9);
      }`,
  });

  const dna = new THREE.Points(buildDNA(config), material);
  dna.frustumCulled = false;
  const group = new THREE.Group();
  group.add(dna);
  /* Push helix deeper in Z so logo/tagline stay in the foreground */
  group.position.z = -14;
  group.scale.setScalar(0.7);
  scene.add(group);

  const dustMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
    },
    vertexShader: /* glsl */ `
      uniform float uTime,uPixelRatio; attribute float aRandom,aWarm;
      varying float vTw,vWarm;
      void main(){
        vec3 p=position; p.y+=sin(uTime*0.2+aRandom*6.28)*0.6;
        vec4 mv=modelViewMatrix*vec4(p,1.0);
        gl_Position=projectionMatrix*mv;
        float tw=0.4+0.6*pow(abs(sin(uTime*0.8+aRandom*6.28)),3.0);
        vTw=tw; vWarm=aWarm;
        gl_PointSize=(1.5+aRandom*2.5)*uPixelRatio*tw*(30.0/-mv.z);
      }`,
    fragmentShader: /* glsl */ `
      varying float vTw,vWarm;
      void main(){
        float d=length(gl_PointCoord-vec2(0.5));
        float a=smoothstep(0.5,0.0,d);
        vec3 gold=vec3(0.9,0.72,0.35); vec3 white=vec3(1.0,0.97,0.9);
        vec3 col=mix(white,gold,vWarm);
        gl_FragColor=vec4(col*vTw,a*vTw*0.8);
      }`,
  });

  const dust = new THREE.Points(buildDust(config), dustMat);
  dust.frustumCulled = false;
  scene.add(dust);

  const rings = new THREE.Group();
  rings.add(createRing(7.5, 0.08));
  rings.add(createRing(9.2, 0.05));
  rings.add(createRing(11, 0.03));
  rings.position.z = -12;
  scene.add(rings);

  const clock = new THREE.Clock();
  const mouse = { x: 0, y: 0 };
  let openP = 0;
  let targetOpen = 0;
  let rafId = 0;
  let disposed = false;

  const onPointerMove = (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (event.clientY / window.innerHeight) * 2 - 1;
  };

  const onResize = () => {
    if (disposed) return;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    const nextPixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    material.uniforms.uPixelRatio.value = nextPixelRatio;
    dustMat.uniforms.uPixelRatio.value = nextPixelRatio;
  };

  const overlay = container.closest('#intro-overlay');

  const shouldStop = () => {
    if (disposed) return true;
    if (!container.isConnected) return true;
    if (!overlay) return true;
    if (overlay.classList.contains('completed')) return true;
    if (overlay.style.display === 'none') return true;
    if (introSectionHidden(overlay)) return true;
    return false;
  };

  const tick = () => {
    if (shouldStop()) {
      runtime?.dispose();
      return;
    }

    const t = clock.getElapsedTime();
    material.uniforms.uTime.value = t;
    dustMat.uniforms.uTime.value = t;

    group.rotation.y = t * 0.12;
    rings.rotation.z = t * 0.03;

    openP += (targetOpen - openP) * 0.05;
    material.uniforms.uProgress.value = openP;

    const camZ = THREE.MathUtils.lerp(30, 38, openP);
    camera.position.x += (mouse.x * 1.0 - camera.position.x) * 0.05;
    camera.position.y += (-mouse.y * 0.8 - camera.position.y) * 0.06;
    camera.position.z += (camZ - camera.position.z) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(tick);
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('resize', onResize);

  runtime = {
    disposed: false,
    setProgress(progress) {
      targetOpen = THREE.MathUtils.clamp(progress, 0, 1);
    },
    getSmoothedProgress() {
      return openP;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);

      renderer.dispose();
      material.dispose();
      dustMat.dispose();
      dna.geometry.dispose();
      dust.geometry.dispose();
      rings.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      runtime = null;
    },
  };

  rafId = requestAnimationFrame(tick);
  (overlay || container).classList.add('has-dna-intro');
  return true;
}

export function setDnaIntroProgress(progress) {
  runtime?.setProgress(progress);
}

export function disposeDnaIntro() {
  const overlay = document.getElementById('intro-overlay');
  overlay?.classList.remove('has-dna-intro');
  runtime?.dispose();
}

export function isDnaIntroActive() {
  return Boolean(runtime && !runtime.disposed);
}
