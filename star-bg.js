/* star-bg.js — ambient particle field for inner pages */
(function(){
  var container = document.getElementById('cv');
  if(!container || typeof THREE === 'undefined') return;

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x07070f, 0.018);

  var camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.z = 8;

  var renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x07070f, 1);
  container.appendChild(renderer.domElement);

  // Star field
  var count = 2400;
  var geo = new THREE.BufferGeometry();
  var pos = new Float32Array(count * 3);
  var sizes = new Float32Array(count);
  for(var i = 0; i < count; i++){
    pos[i*3]   = (Math.random() - 0.5) * 60;
    pos[i*3+1] = (Math.random() - 0.5) * 60;
    pos[i*3+2] = (Math.random() - 0.5) * 60;
    sizes[i] = Math.random();
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var mat = new THREE.PointsMaterial({
    size: 0.06,
    color: 0xb026ff,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });
  var stars = new THREE.Points(geo, mat);
  scene.add(stars);

  // Faint white stars layer
  var geo2 = new THREE.BufferGeometry();
  var pos2 = new Float32Array(1200 * 3);
  for(var j = 0; j < 1200; j++){
    pos2[j*3]   = (Math.random() - 0.5) * 80;
    pos2[j*3+1] = (Math.random() - 0.5) * 80;
    pos2[j*3+2] = (Math.random() - 0.5) * 80;
  }
  geo2.setAttribute('position', new THREE.BufferAttribute(pos2, 3));
  var mat2 = new THREE.PointsMaterial({
    size: 0.04,
    color: 0xeeeeff,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });
  scene.add(new THREE.Points(geo2, mat2));

  // Subtle purple glow light
  var light = new THREE.PointLight(0xb026ff, 1.2, 40);
  light.position.set(-6, 4, 6);
  scene.add(light);

  // Slow drift animation
  var clock = new THREE.Clock();
  (function animate(){
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();
    stars.rotation.y += 0.0002;
    stars.rotation.x = Math.sin(t * 0.05) * 0.04;
    renderer.render(scene, camera);
  })();

  window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
