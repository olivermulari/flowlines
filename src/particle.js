export class Particle {
  constructor(graphicsObj, options, containerVec, tileSize) {
    this.container = containerVec;
    this.tileSize = tileSize;
    this.el = graphicsObj;
    this.options = options;
    this.radius = 3;
    this.pos = new Vec2(Math.floor(Math.random() * this.container.x), Math.floor(Math.random() * this.container.y));
    this.prevPos = null;
    this.vel = new Vec2(0, 0);
    this.acc = new Vec2(0, 0);
    this.lifetime = 0;
  }

  update(delta) {
    this.vel.add(this.acc.multiply(delta * 0.2));
    this.vel.limit(this.options.particleMaxSpeed * delta);
    this.prevPos = this.pos.clone();
    this.pos.add(this.vel);
    this.acc.multiply(0);
    this.lifetime++;
  }

  follow(flowField) {
    const x = Math.floor(this.pos.x / this.tileSize);
    const y = Math.floor(this.pos.y / this.tileSize);
    const index = x + y * Math.ceil(this.container.x / this.tileSize);
    if (flowField[index]) {
      const vec = flowField[index].vec;
      this.applyForce(vec);
    }
  }

  applyForce(vec) {
    this.acc.add(vec.setMag(this.options.flowStrength));
  }

  showLine() {
    if (this.prevPos) {
      this.el.clear();
      this.el.beginFill(this.options.color, this.options.particleOpacity);
      // this.el.beginFill(0xFFFFF, this.options.particleOpacity);
      this.el.lineStyle(2)
        .moveTo(this.prevPos.x, this.prevPos.y)
        .lineTo(this.pos.x, this.pos.y);
      this.el.endFill();
    }
  }

  showBall() {
    this.el.clear();
    this.el.lineStyle(0);
    this.el.beginFill(0xFFFFFF);
    this.el.drawCircle(this.pos.x, this.pos.y, this.radius);
    this.el.endFill();
  }

  checkEdges() {
    if (this.pos.x > this.container.x) this.pos.x = 0, this.prevPos = null;
    if (this.pos.x < 0) this.pos.x = this.container.x, this.prevPos = null;
    if (this.pos.y > this.container.y) this.pos.y = 0, this.prevPos = null;
    if (this.pos.y < 0) this.pos.y = this.container.y, this.prevPos = null;
  }
}

export class Vec2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  add(vec) {
    this.x += vec.x;
    this.y += vec.y;
    return this;
  }
  multiply(num) {
    this.x *= num;
    this.y *= num;
    return this;
  }
  div(n) {
    this.x /= n;
    this.y /= n;
    return this;
  }
  mag() {
    return Math.sqrt(this.magSq());
  }
  magSq() {
    let x = this.x, y = this.y;
    return x * x + y * y;
  } 
  limit(l) {
    var mSq = this.magSq();
    if(mSq > l*l) {
      this.div(Math.sqrt(mSq));
      this.multiply(l);
    }
    return this;
  }
  normalize() {
    return this.div(this.mag());
  }
  setMag(n) {
    return this.normalize().multiply(n);
  }
  clone() {
    return new Vec2(this.x, this.y);
  }
}
