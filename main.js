import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js';

import {player} from './player.js';
import {world} from './world.js';
import {background} from './background.js';


class BasicWorldDemo {
  constructor() {
    this._Initialize();

    this._gameStarted = true;
  }

  _Initialize() {
   
    this.threejs_ = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.threejs_.outputEncoding = THREE.sRGBEncoding;
    this.threejs_.gammaFactor = 2.2;
    this.threejs_.shadowMap.enabled = true;
    this.threejs_.setPixelRatio(window.devicePixelRatio);
    this.threejs_.setSize(window.innerWidth, window.innerHeight);

    document.getElementById('container').appendChild(this.threejs_.domElement);

    window.addEventListener('resize', () => {
      this.OnWindowResize_();
    }, false);

    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 20000.0;
    this.camera_ = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera_.position.set(8, 3, 10);
    // this.camera_.lookAt(8, 3, 0);

    this.scene_ = new THREE.Scene();

    let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light.position.set(60, 100, 10);
    light.target.position.set(40, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    light.shadow.camera.far = 200.0;
    light.shadow.camera.near = 1.0;
    light.shadow.camera.left = 50;
    light.shadow.camera.right = -50;
    light.shadow.camera.top = 50;
    light.shadow.camera.bottom = -50;
    this.scene_.add(light);

    light = new THREE.HemisphereLight(0x202020, 0x004080, 0.6);
    this.scene_.add(light);

    this.scene_.background = new THREE.Color(0x808080);
    this.scene_.fog = new THREE.FogExp2(0x89b2eb, 0.00125);

    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(20000, 20000, 10, 10),
        new THREE.MeshStandardMaterial({
            color: 0xf6f47f,
          }));
    ground.castShadow = false;
    ground.receiveShadow = true;
    ground.rotation.x = -Math.PI / 2;
    this.scene_.add(ground);
    this.scene_.background = new THREE.Color(0x87ceeb)

    const uniforms = {
      topColor: { value: new THREE.Color(0x0077FF) },
      bottomColor: { value: new THREE.Color(0x89b2eb) },
      offset: { value: 33 },
      exponent: { value: 0.6 }
    };

    this.world_ = new world.WorldManager({scene: this.scene_});
    this.player_ = new player.Player({scene: this.scene_, world: this.world_});
    this.background_ = new background.Background({scene: this.scene_});

    this.gameOver_ = false;
    this.previousRAF_ = null;
    this.RAF_();
    this.OnWindowResize_();
  }

  OnWindowResize_() {
    this.camera_.aspect = window.innerWidth / window.innerHeight;
    this.camera_.updateProjectionMatrix();
    this.threejs_.setSize(window.innerWidth, window.innerHeight);
  }

  RAF_() {
    requestAnimationFrame((t) => {
      if (this.previousRAF_ === null) {
        this.previousRAF_ = t;
      }

      this.RAF_();

      this.Step_((t - this.previousRAF_) / 1000.0);
      this.threejs_.render(this.scene_, this.camera_);
      this.previousRAF_ = t;
    });
  }

  Step_(timeElapsed) {
    if (this.gameOver_ || !this._gameStarted) {
      return
    }

    this.player_.Update(timeElapsed);
    this.world_.Update(timeElapsed);
    this.background_.Update(timeElapsed);

    if (this.player_.gameOver && !this.gameOver_) {
      this.gameOver_ = true;
      document.getElementById('game-over').classList.toggle('active');

    }
  }
}

function init(){
  let _APP = null;

  window.addEventListener('DOMContentLoaded', () => {
    _APP = new BasicWorldDemo();
  });
}

init();

