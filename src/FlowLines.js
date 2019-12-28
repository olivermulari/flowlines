import { Field } from './Field';
import GRAPHICS from "@olivermulari/graphics";

/**
 * Flowlines
 */
export default class FlowLines {
  constructor(divID, options) {
    this.divID = divID;
    this.options = options || {
      debug: false,
    };
    this.app;
    this.field;
  }

  create() {
    this.app = new GRAPHICS(this.divID, {
      width: window.innerWidth,
      height: window.innerHeight,
      clearBeforeRender: this.options.debug,
      preserveDrawingBuffer: !this.options.debug,
      transparent: !this.options.debug
    });
    this.field = new Field(this.app, this.options);
    this.createScene(this.sceneid);
  };

  destroy() {
    this.app.destroy();
    this.field.destroy();
    this.app = null;
    this.field = null;
  }

  createScene(sceneid) {
    this.app.renderer.runRenderLoop(delta => {
      this.app.scene.render();
      this.field.update(delta*1000);
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
    //this.addEngineResize();
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    window.addEventListener('resize', () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    });
  }

  addEngineResize() {
    window.onresize = (event) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.app.renderer.view.style.width = w + "px";
      this.app.renderer.view.style.height = h + "px";
      this.app.renderer.resize(w, h);
    };
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
