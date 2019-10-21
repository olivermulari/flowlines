import * as PIXI from 'pixi.js';

import { makeColorGradient } from './color';
import { noise } from "./perlin";
import { Particle } from "./particle";
import { Vec2 } from "./Vector";

export class Field {
  constructor(app, options, settings) {
    this.app = app;
    this.options = options || {};
    this.settings = settings || {};

    // mobile test
    this.isMobile = PIXI.utils.isMobile.any;

    // options
    this.particleAmount = this.options.particleAmount || (this.isMobile ? 1000 : 4000);
    this.vectorUpdateFreq = this.options.vectorUpdateFreq || 10;
    this.perlinDiff = this.options.perlinDiff || 0.006;
    this.flowSpeed = this.options.flowSpeed || 0.0003;
    this.flowStrength = this.options.flowStrength || Math.min(0.0012 * window.innerWidth, 2.5); // 1.8
    this.particleMaxSpeed = this.options.particleMaxSpeed || Math.min(0.0037 * window.innerWidth, 4); // 4 in tabletop max 4
    this.colorChangeSpeed = this.options.colorChangeSpeed || 0.03;
    this.particleOpacity = this.options.particleOpacity || 0.015;
    this.color = this.options.color || 0xFFFFF;
    this.debug = this.options.debug || false;
    this.tileSize = 15; // good as a constant :)

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

    // graphic element
    this.vectorGraphics;
    this.particleGraphics;

    // init
    this.createVectors();
    this.createParticles();
  }

  createVectors() {
    const graphics = new PIXI.Graphics();
    this.app.stage.addChild(graphics);

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const obj = {
          color: 0xFFFFF,
          pos: new Vec2((x * this.tileSize) + this.halfTileSize, (y * this.tileSize) + this.halfTileSize),
          vec: new Vec2(0, 0)
        };

        // according to perlin noise
        const rotation = this.randomDir(obj.pos.x, obj.pos.y, this.zOff) + this.floatDir;
        obj.vec = new Vec2(this.lineLength * Math.cos(rotation), this.lineLength * Math.sin(rotation));

        this.vectors.push(obj);
      }
    }

    this.vectorGraphics = graphics;
  }

  createParticles() {
    const graphics = new PIXI.Graphics();
    this.app.stage.addChild(graphics);
    
    for (let i = 0; i < this.particleAmount; i++) {
      const part = new Particle(this, new Vec2(this.app.screen.width, this.app.screen.height), this.tileSize);
      this.particles.push(part);
    }

    this.particleGraphics = graphics;
  }

  showVectors() {
    this.vectorGraphics.clear();

    this.vectors.forEach(obj => {
      const endX = obj.pos.x + obj.vec.x;
      const endY = obj.pos.y + obj.vec.y;

      this.vectorGraphics.beginFill(obj.color, 0.5);
      this.vectorGraphics.lineStyle(1)
        .moveTo(obj.pos.x, obj.pos.y)
        .lineTo(endX, endY);
    });
    this.vectorGraphics.endFill();
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
    this.particleGraphics.clear();

    this.particles.forEach(part => {
      part.checkEdges();
      part.follow(this.vectors);
      part.update(delta);

      // draw
      if (!this.debug) {

        this.particleGraphics.beginFill(this.color, this.particleOpacity);
        this.particleGraphics.lineStyle(2)
          .moveTo(part.prevPos.x, part.prevPos.y)
          .lineTo(part.pos.x, part.pos.y);

      } else {

        this.particleGraphics.lineStyle(0);
        this.particleGraphics.beginFill(0xFFFFFF);
        this.particleGraphics.drawCircle(part.pos.x, part.pos.y, part.radius);

      }
    });

    this.particleGraphics.endFill();

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
