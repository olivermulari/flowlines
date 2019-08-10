import { Field } from './Field';
import * as PIXI from 'pixi.js';

export default class FlowLines {
  constructor(options) {
    this.sceneid = "pixi-scene";
    this.options = options || {
      debug: false,
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
    this.field = new Field(this.app, this.options);
  }

  create() {
    this.createScene(this.sceneid);
  };

  createScene(sceneid) {
    const div = document.createElement("div");
    div.setAttribute("id", sceneid);
    document.body.appendChild(div);
    div.appendChild(this.app.view);

    this.addStyleTags();
    this.addResizes();
  
    this.app.ticker.add(delta => {
      this.field.update(delta);
    });
  }

  addFpsCounter() {
    const style = document.createElement('style');
    style.innerHTML = `
      #fps {
        position: absolute;
        margin: 10px;
        bottom: 0;
        right: 0;
      }
      `;
    document.head.appendChild(style);
    // FPS COUNTER
    const element = document.createElement("p");
    element.setAttribute("id", "fps");
    document.getElementById(this.sceneid).appendChild(element);
    setInterval(() => {
      if (this.app) {
        element.innerHTML = "FPS: " + String(Math.floor(this.app.ticker.FPS));
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
        z-index: -10;
      }
      `;
    document.head.appendChild(style);
  }
}
