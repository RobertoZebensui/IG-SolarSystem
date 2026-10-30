import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";

let scene, renderer;
let camera;
let camera2;
let flyControls;
let flyArea;
let info;
let info_teclas;
let grid;
let estrella,
  Planetas = [],
  Lunas = [];
let t0 = 0;
let accglobal = 0.0005;
let timestamp;
let vistaActiva = 1;
let clock = new THREE.Clock();

init();
animationLoop();

function init() {
  info = document.createElement("div");
  info.style.position = "relative";
  info.style.top = "30px";
  info.style.width = "95%";
  info.style.textAlign = "center";
  info.style.color = "#fff";
  info.style.fontWeight = "bold";
  info.style.backgroundColor = "transparent";
  info.style.zIndex = "1";
  info.style.fontFamily = "Monospace";
  info.innerHTML = "Sistema Planetario";
  document.body.appendChild(info);


  info_teclas = document.createElement("div");
  info_teclas.style.position = "relative";
  info_teclas.style.top = "60px";
  info_teclas.style.left = "60px";
  info_teclas.style.width = "95%";
  info_teclas.style.textAlign = "left";
  info_teclas.style.color = "#fff";
  info_teclas.style.fontWeight = "bold";
  info_teclas.style.backgroundColor = "transparent";
  info_teclas.style.zIndex = "1";
  info_teclas.style.fontSize = "20px"
  info_teclas.style.fontFamily = "Monospace";
  info_teclas.innerHTML = "Pulsar \"2\" para cambiar la vista";
  document.body.appendChild(info_teclas);
  flyArea = document.createElement("div");

  flyArea.style.position = "absolute";
  flyArea.style.right = "0";
  flyArea.style.bottom = "0";
  flyArea.style.width = "25vw";
  flyArea.style.height = "25vh";
  flyArea.style.zIndex = "10";
  flyArea.style.backgroundColor = "transparent";
  flyArea.style.pointerEvents = "auto";

  document.body.appendChild(flyArea);

  
  //Defino cámara
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 3, 17);

  camera2 = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera2.position.set(0, 3, 17);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.position = "fixed";
  renderer.domElement.style.top = "0";
  renderer.domElement.style.left = "0";
  renderer.domElement.style.display = "block";
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; 

  document.body.appendChild(renderer.domElement);

  const camcontrols = new OrbitControls(camera, renderer.domElement);
  flyControls = new FlyControls(camera2, flyArea);
  flyControls.dragToLook = true;
  flyControls.movementSpeed = 1.5;
  flyControls.rollSpeed = 0.2;
  //Rejilla de referencia indicando tamaño y divisiones
  grid = new THREE.GridHelper(20, 40);
  //Mostrarla en vertical
  grid.geometry.rotateX(Math.PI / 2);
  grid.position.set(0, 0, 0.05);
 // scene.add(grid);

  const Lamb = new THREE.AmbientLight(0xffffff, 0.01);
  scene.add(Lamb);

  const Ldir = new THREE.DirectionalLight(0xcccccc, 0.);
  Ldir.position.set(5, 5, 5);
  scene.add(Ldir);

  const Lpunt = new THREE.PointLight(0xffffff, 1.5, 0, 2);
  Lpunt.position.set(0, 0, 0);
  Lpunt.castShadow = true;
  scene.add(Lpunt)

  const tx_sol = new THREE.TextureLoader().load("src/Solarsystemscope_texture_8k_sun.jpg");
  
  const tx_mercury = new THREE.TextureLoader().load("src/2k_mercury.jpg");

  const tx_earth = new THREE.TextureLoader().load("src/2k_earth_daymap.jpg");
  const txb1 = new THREE.TextureLoader().load("src/earthbump1k.jpg");
  const tx2 = new THREE.TextureLoader().load("src/earthcloudmap.jpg");
  const txalpha2 = new THREE.TextureLoader().load(    "src/earthcloudmaptrans_invert.jpg");
  const tx_mars = new THREE.TextureLoader().load("src/2k_mars.jpg");
  
  const tx_jupiter = new THREE.TextureLoader().load("src/2k_jupiter.jpg");

  const tx_uranus = new THREE.TextureLoader().load("src/2k_uranus.jpg");

  const tx_moon = new THREE.TextureLoader().load("src/2k_moon.jpg");

  const tx_moon2 = new THREE.TextureLoader().load("src/2k_makemake_fictional.jpg");
  
  const tx_moon3 = new THREE.TextureLoader().load("src/2k_eris_fictional.jpg");

  //Objetos
  Estrella(1.8, 0xffffff, tx_sol);
  
  Planeta(0.1, 3.8, 0.8, 0xffffff, 1.1, 1.2, tx_mercury);
  const earth = Planeta(0.5, 6.0, 1.0, 0xffffff, 1.4, 1.5, tx_earth, txb1);
  Planeta(0.3, 10.8, 1.2, 0xffffff, 1.1, 1.2, tx_mars);
  Esfera(earth,0.0,0.0,0,0.55,40,40,0xffffff,tx2,undefined,undefined,txalpha2);


  const jupiter = Planeta(0.9, 16.8, 0.4, 0xffffff, 1.15, 1.3, tx_jupiter);
  Planeta(0.9, 19.4, 0.2, 0xffffff, 1.8, 1.5, tx_uranus);


  Luna(earth, 0.1, 0.9, -3.5, 0xffffff, Math.PI / 3, tx_moon);
  Luna(jupiter, 0.1, 1.7, 2.5, 0xffffff, Math.PI / 4, tx_moon2);
  Luna(jupiter, 0.2, 2.1, -1.5, 0xffffff, Math.PI / 2, tx_moon3);
  //Inicio tiempo
  t0 = Date.now();
  //EsferaChild(objetos[0],3.0,0,0,0.8,10,10, 0x00ff00);


  window.addEventListener("keydown", (event) => {
    if (event.key === "1") {
      vistaActiva = 1;
      info_teclas.innerHTML = "Pulsar \"2\" para cambiar la vista";
    }
  
    if (event.key === "2") {
      vistaActiva = 2;
      info_teclas.innerHTML = "Pulsar \"1\" para cambiar la vista";
    }
  });

}
function Esfera(
  padre,
  px,
  py,
  pz,
  radio,
  nx,
  ny,
  col,
  texture = undefined,
  texbump = undefined,
  texspec = undefined,
  texalpha = undefined,
  sombra = false
) {
  let geometry = new THREE.SphereBufferGeometry(radio, nx, ny);
  //Material Phong definiendo color
  let material = new THREE.MeshPhongMaterial({
    color: col,
  });

  //Textura
  if (texture != undefined) {
    material.map = texture;
  }
  //Rugosidad
  if (texbump != undefined) {
    material.bumpMap = texbump;
    material.bumpScale = 1;
  }

  //Especular
  if (texspec != undefined) {
    material.specularMap = texspec;
    material.specular = new THREE.Color("white");
  }

  //Transparencia
  if (texalpha != undefined) {
    //Con mapa de transparencia
    material.alphaMap = texalpha;
    material.transparent = true;
    material.side = THREE.DoubleSide;
    material.opacity = 1.0;
  }

  let mesh = new THREE.Mesh(geometry, material);
  if (sombra) mesh.castShadow = true;
  mesh.position.set(px, py, pz);
  padre.add(mesh);
}

function Estrella(rad, col,   texture = undefined,
  texbump = undefined,
  texspec = undefined,
  texalpha = undefined,
  sombra = false) {
  let geometry = new THREE.SphereGeometry(rad, 40, 40);
  let material = new THREE.MeshBasicMaterial({ color: col });
  if (texture != undefined) {
    material.map = texture;
  }
  estrella = new THREE.Mesh(geometry, material);
  scene.add(estrella);
}

function Planeta(radio, dist, vel, col, f1, f2, 
  texture = undefined,
  texbump = undefined,
  texspec = undefined,
  texalpha = undefined,
  sombra = true) {
  let geom = new THREE.SphereGeometry(radio, 40, 40);
  let material = new THREE.MeshPhongMaterial({ color: col });
  //Textura
  if (texture != undefined) {
    material.map = texture;
  }
  //Rugosidad
  if (texbump != undefined) {
    material.bumpMap = texbump;
    material.bumpScale = 0.1;
  }

  //Especular
  if (texspec != undefined) {
    material.specularMap = texspec;
    material.specular = new THREE.Color("white");
  }

  //Transparencia
  if (texalpha != undefined) {
    //Con mapa de transparencia
    material.alphaMap = texalpha;
    material.transparent = true;
    material.side = THREE.DoubleSide;
    material.opacity = 1.0;

    //Sin mapa de transparencia
    /*material.transparent = true;
    material.side = THREE.DoubleSide;
    material.opacity = 0.8;
    material.transparent = true;
    material.depthWrite = false;*/
  }

  let planeta = new THREE.Mesh(geom, material);
  planeta.userData.dist = dist;
  planeta.userData.speed = vel;
  planeta.userData.f1 = f1;
  planeta.userData.f2 = f2;

  if (sombra) {
    planeta.castShadow = true;
    planeta.receiveShadow = true;
  }
    Planetas.push(planeta);
  scene.add(planeta);

  //Dibuja trayectoria, con
  let curve = new THREE.EllipseCurve(
    0,
    0, // centro
    dist * f1,
    dist * f2,// radios elipse
  )
  //Crea geometría
  let points = curve.getPoints(100);
  let geome = new THREE.BufferGeometry().setFromPoints(points);
  geome.rotateX(Math.PI / 2);
  let mate = new THREE.LineBasicMaterial({ color: 0xffffff });
  // Objeto
  let orbita = new THREE.Line(geome, mate);
  scene.add(orbita);
  return planeta;
}

function Luna(planeta, radio, dist, vel, col, angle, 
  texture = undefined,
  texbump = undefined,
  texspec = undefined,
  texalpha = undefined,
  sombra = true) {
  var pivote = new THREE.Object3D();
  pivote.rotation.x = angle; //si no nulo, rotación suera de plano
  planeta.add(pivote);
  var geom = new THREE.SphereGeometry(radio, 40, 40);
  var material = new THREE.MeshPhongMaterial({ color: col });
  //Textura
  if (texture != undefined) {
    material.map = texture;
  }
  //Rugosidad
  if (texbump != undefined) {
    material.bumpMap = texbump;
    material.bumpScale = 0.1;
  }

  //Especular
  if (texspec != undefined) {
    material.specularMap = texspec;
    material.specular = new THREE.Color("white");
  }

  //Transparencia
  if (texalpha != undefined) {
    //Con mapa de transparencia
    material.alphaMap = texalpha;
    material.transparent = true;
    material.side = THREE.DoubleSide;
    material.opacity = 1.0;

    //Sin mapa de transparencia
    /*material.transparent = true;
    material.side = THREE.DoubleSide;
    material.opacity = 0.8;
    material.transparent = true;
    material.depthWrite = false;*/
  }
  var luna = new THREE.Mesh(geom, material);
  luna.userData.dist = dist;
  luna.userData.speed = vel;

  luna.castShadow = true;
  luna.receiveShadow = true;
  Lunas.push(luna);
  pivote.add(luna);
  return luna;
}

//Bucle de animación
function animationLoop() {
  timestamp = (Date.now() - t0) * accglobal;

  requestAnimationFrame(animationLoop);

  //Modifica rotación de todos los objetos
  for (let object of Planetas) {
    object.position.x =
      Math.cos(timestamp * object.userData.speed) *
      object.userData.f1 *
      object.userData.dist;
    object.position.z =
      Math.sin(timestamp * object.userData.speed) *
      object.userData.f2 *
      object.userData.dist;
  }

  for (let object of Lunas) {
    object.position.x =
      Math.cos(timestamp * object.userData.speed) * object.userData.dist;
    object.position.y =
      Math.sin(timestamp * object.userData.speed) * object.userData.dist;
  }

  for (let object of Planetas) {
    object.rotation.y += 0.005;
  }
  let delta = clock.getDelta();
  flyControls.update(delta);

  const camPrincipal = vistaActiva === 1 ? camera : camera2;
  const camSecundaria = vistaActiva === 1 ? camera2 : camera;
  
  let x, y, w, h;  
  //Efecto similar al puerto de vista de defecto, ocupa toda la ventana
  x = Math.floor(window.innerWidth * 0.0);
  y = Math.floor(window.innerHeight * 0.0);
  w = Math.floor(window.innerWidth * 1.0);
  h = Math.floor(window.innerHeight * 1.0);

  renderer.setViewport(x, y, w, h);
  renderer.setScissor(x, y, w, h);
  renderer.setScissorTest(true);
  renderer.render(scene, camPrincipal);
  
  x = Math.floor(window.innerWidth * 0.75);
  y = Math.floor(window.innerHeight * 0.0);
  w = Math.floor(window.innerWidth * 0.25);
  h = Math.floor(window.innerHeight * 0.25);

  camera2.aspect = w / h;
  camera2.updateProjectionMatrix();

  renderer.setViewport(x, y, w, h);
  renderer.setScissor(x, y, w, h);
  renderer.setScissorTest(true);

  renderer.render(scene, camSecundaria);


}
