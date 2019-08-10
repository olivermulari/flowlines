import * as PIXI from 'pixi.js';

import { makeColorGradient } from './color';
import { noise } from "./perlin";
import { Particle } from "./particle";
import { Vec2 } from "./Vector";

export class Field {
  constructor(app, options, settings) {
    this.app = app;

    this.options = options || {};
    // options
    this.particleAmount = this.options.particleAmount || PIXI.utils.isMobile.any ? 300 : 2000;
    this.vectorUpdateFreq = this.options.vectorUpdateFreq || 13;
    this.perlinDiff = this.options.perlinDiff || 0.006;
    this.flowSpeed = this.options.flowSpeed || 0.0006;
    this.flowStrength = this.options.flowStrength || 1.8;
    this.particleMaxSpeed = this.options.particleMaxSpeed || 4;
    this.colorChangeSpeed = this.options.colorChangeSpeed || 0.1;
    this.particleOpacity = this.options.particleOpacity || 0.02;
    this.color = this.options.color || 0xFFFFF;
    this.debug = this.options.debug || false;
    this.tileSize = 15; // good as a constant :)
    
    this.settings = settings || {};
    // advanced settings
    this.dynamicParticleAmount = this.settings.dynamicParticleAmount || false;
    this.targetFps = this.settings.targetFps || 55;

    // main direction of vectors
    this.floatDir = Math.PI / 2;
    // if > 0, main direction of vectors will vary
    this.floatDirChangeSpeed = 0;

    // helpers to reduce calculations
    this.lineLength = this.tileSize / 2;
    this.halfTileSize = this.tileSize / 2;
    this.cols = Math.ceil(this.app.screen.width / this.tileSize);
    this.rows = Math.ceil(this.app.screen.height / this.tileSize);

    this.frameCount = 0;
    this.zOff = Math.floor(Math.random() * 100);

    // arrays of elements
    this.vectors = [];
    this.particles = [];

    // init
    this.createVectors();
    this.createParticles();
  }

  createVectors() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const graphics = new PIXI.Graphics();

        const obj = {
          element: graphics,
          color: 0xFFFFF,
          pos: new Vec2((x * this.tileSize) + this.halfTileSize, (y * this.tileSize) + this.halfTileSize),
          vec: new Vec2(0, 0)
        };

        // according to perlin noise
        const rotation = this.randomDir(obj.pos.x, obj.pos.y, this.zOff) + this.floatDir;
        obj.vec = new Vec2(this.lineLength * Math.cos(rotation), this.lineLength * Math.sin(rotation));

        this.vectors.push(obj);
        this.app.stage.addChild(graphics);
      }
    }
  }

  createParticles() {
    for (let i = 0; i < this.particleAmount; i++) {
      const graphics = new PIXI.Graphics();
      const part = new Particle(this, graphics, new Vec2(this.app.screen.width, this.app.screen.height), this.tileSize);
      this.particles.push(part);
      this.app.stage.addChild(graphics);
    }
  }

  showVectors() {
    this.vectors.forEach(obj => {
      const endX = obj.pos.x + obj.vec.x;
      const endY = obj.pos.y + obj.vec.y;

      obj.element.clear();
      obj.element.beginFill(obj.color, 0.5);
      obj.element.lineStyle(1)
        .moveTo(obj.pos.x, obj.pos.y)
        .lineTo(endX, endY);
      // vec.element.endFill();
    });
  }

  updateVectors(delta) {
    this.vectors.forEach(obj => {
      const rotation = this.randomDir(obj.pos.x, obj.pos.y, this.zOff) + this.floatDir;
      obj.vec = new Vec2(this.lineLength * Math.cos(rotation), this.lineLength * Math.sin(rotation));
    });

    if (this.debug) {
      this.showVectors();
    }
  }

  updateParticles(delta) {
    this.particles.forEach(part => {
      part.checkEdges();
      part.follow(this.vectors);
      part.update(delta);
      if (!this.debug) {
        part.showLine();
      } else {
        part.showBall();
      }
    });

    if (this.frameCount % 5) {
      const c = makeColorGradient(this.frameCount * /* delta */ this.colorChangeSpeed);
      this.color = this.rgb(c[0], c[1], c[2]);
      // this.color = this.rgb(this.frameCount % 265, 255 - this.frameCount % 265, 150);
    }
  }

  update(delta) {
    if (this.frameCount % this.vectorUpdateFreq === 0) {
      this.updateVectors(delta);
    }
    this.updateParticles(delta);

    this.zOff += this.flowSpeed * delta;
    // if you want to vary yout main flow direction
    // this.floatDir += (this.flowSpeed * this.floatDirChangeSpeed * delta) % (Math.PI / 2);
    this.frameCount++;
  }
  
  randomDir(x, y, z) {
    const value = Math.abs(noise.perlin3(x * this.perlinDiff, y * this.perlinDiff, z)) * Math.PI * 4;
    return value;
  }

  rgb(r, g, b) {
    return ((r << 16) + (g << 8) + b);
  }

  // UI METHODS

  toggleDebug() {
    this.debug = !this.debug;
  }
}
