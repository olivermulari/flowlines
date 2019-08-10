# Flowlines

[![Build Status](https://travis-ci.org/olivermulari/flowlines.png?branch=master)](https://travis-ci.org/olivermulari/flowlines) . [![npm](https://img.shields.io/npm/v/flowlines.svg?style=flat-square)](https://www.npmjs.com/package/flowlines)

..work in progress

A Pixi.js background scene that generates randomly.

## Features:
- Vectorfield generated with perlin noise
- Vectorfield that updates constantly
- Particles that follow vectorfield and draw lines
- RAINBOW COLORS

## Installation

First install Flowlines as a depency:

```
npm install flowlines --save
```

Then you can import and use flowlines in your project:

```javascript
import FlowLines from 'flowlines';

const flowlines = new FlowLines();
flowlines.create();
```

Coming soon: options-parameter