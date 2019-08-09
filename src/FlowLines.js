import { Flowfield } from './Flowfield';
import * as PIXI from 'pixi.js';

export default class FlowLines {
  constructor() {
    console.log("flowlines!");
    this.sceneid = "pixi-scene";
    this.options = {
      debug: false,
      floatSpeed: 0.0006,
      flowStrength: 1.8,
      perlinDiff: 0.006,
      vectorUpdateFreq: 13,
      particleAmount: 2000,
      particleMaxSpeed: 4,
      color: 0xFFFFF,
      colorChangeSpeed: 0.1,
      particleOpacity: 0.02
    };
    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000000,
      resolution: 1,
      clearBeforeRender: this.options.debug,
      preserveDrawingBuffer: !this.options.debug,
      transparent: !this.options.debug
    });
    this.flowField = new Flowfield(this.app, this.options);
    this.createScene(this.sceneid);
  }

  createScene(sceneid) {
    const div = document.createElement("div");
    div.setAttribute("id", sceneid);
    document.body.appendChild(div);
    div.appendChild(this.app.view);

    this.addStyleTags();
    this.addResizes();
  
    this.app.ticker.add(delta => {
      this.flowField.update(delta);
    });
  }

  addFpsCounter() {
    // FPS COUNTER
    const element = document.createElement("p");
    element.setAttribute("id", "fps");
    document.getElementById("root").appendChild(element);
    setInterval(() => {
      if (app) {
        element.innerHTML = "FPS: " + String(Math.floor(app.ticker.FPS));
      }
    }, 1000);
  }

  addResizes() {
    window.onresize = (event) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.app.renderer.view.style.width = w + "px";
      this.app.renderer.view.style.height = h + "px";
      this.app.renderer.resize(w, h);
    };

    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    window.addEventListener('resize', () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    });
  }

  addStyleTags() {
    // add style tags
    const style = document.createElement('style');
    style.innerHTML = `
      #${this.sceneid} {
        height: 100vh;
        height: calc(100 * var(--vh));
        width: 100vw;
        position: absolute;
        top: 0;
        left: 0;
        overflow: hidden;
      }
      `;
    document.head.appendChild(style);
  }
}
