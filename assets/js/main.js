<!-- ✅ 자유시점 OrbitControls 기반 3D Viewer -->
<script type="module">
  // === Three.js 모듈 불러오기 ===
  import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
  import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
  import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

  // === 컨테이너 설정 ===
  const container = document.getElementById("hero3d");
  if (!container) throw new Error("hero3d container not found");

  // === 기본 장면, 카메라, 렌더러 ===
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 2000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // === 조명 ===
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(6, 10, 8);
  scene.add(dirLight);

  // === OrbitControls ===
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // 부드러운 감속 효과
  controls.enablePan = true;     // 패닝(이동) 가능
  controls.minDistance = 0.5;    // 최소 줌 거리
  controls.maxDistance = 200;    // 최대 줌 거리
  controls.target.set(0, 0, 0);  // 기본 초점

  // === GLB 모델 로드 ===
  const loader = new GLTFLoader();
  let object = null;

  loader.load(
    "assets/models/eye/scene.glb", // ✅ 파일 경로 수정 가능
    gltf => {
      object = gltf.scene;
      scene.add(object);
      fitCameraToObject(camera, object, 1.25, controls);
      const ph = container.querySelector(".placeholder");
      if (ph) ph.remove();
    },
    xhr => {
      if (xhr.total) console.log(((xhr.loaded / xhr.total) * 100).toFixed(0) + "% loaded");
      else console.log(xhr.loaded + " bytes loaded");
    },
    err => {
      console.error("❌ GLB 로딩 오류:", err);
      // fallback — 박스 표시
      const geo = new THREE.BoxGeometry(1, 1, 1);
      const mat = new THREE.MeshNormalMaterial();
      object = new THREE.Mesh(geo, mat);
      scene.add(object);
      fitCameraToObject(camera, object, 1.25, controls);
    }
  );

  // === 모델 크기에 맞게 카메라 자동 배치 ===
  function fitCameraToObject(cam, obj, offset = 1.2, ctrl) {
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const fov = cam.fov * Math.PI / 180;
    let dist = (maxDim / 2) / Math.tan(fov / 2) * offset;

    cam.position.copy(center);
    cam.position.x += dist * 0.6;
    cam.position.y += dist * 0.35;
    cam.position.z += dist;
    cam.near = Math.max(0.1, maxDim / 1000);
    cam.far = Math.max(2000, maxDim * 10);
    cam.updateProjectionMatrix();

    if (ctrl) {
      ctrl.target.copy(center);
      ctrl.update();
    }
  }

  // === 리사이즈 대응 ===
  function sizeToContainer() {
    const { width, height } = container.getBoundingClientRect();
    camera.aspect = Math.max(1e-6, width / height);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  sizeToContainer();
  window.addEventListener("resize", sizeToContainer);
  new ResizeObserver(sizeToContainer).observe(container);

  // === 애니메이션 루프 ===
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
</script>

