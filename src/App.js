import React, { Fragment, useRef, useEffect } from "react";
import {
  createMultilineText,
  getPowerOfTwo,
  measureText,
} from "./utils/utils";
import fragmentShader from "./shaders/fragmentShader";
import vertexShader from "./shaders/vertexShader";
import "./App.css";

const App = () => {
  const canvas2D = useRef(null);
  const canvasWebGL = useRef(null);

  useEffect(() => {
    initCanvas2D();
    initCanvasWebGL();
  }, []);

  const initProgram = (program, gl, canvas) => {
    canvas.width = 800;
    canvas.height = 800;

    gl.useProgram(program);
    const texCoordAttribute = gl.getAttribLocation(program, "a_texCoord");
    const texCoordBuffer = gl.createBuffer();
    const texCoords = new Float32Array([
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      1.0,
      0.0,
      1.0,
      1.0,
      1.0,
      1.0,
      0.0,
    ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      canvas2D.current
    );

    const positionAttribute = gl.getAttribLocation(program, `a_position`);
    const positionBuffer = gl.createBuffer();
    const positions = new Float32Array([
      0,
      0,
      canvas.width,
      0,
      0,
      canvas.height,
      0,
      canvas.height,
      canvas.width,
      canvas.height,
      canvas.width,
      0,
    ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const mouseLocation = gl.getUniformLocation(program, "mouse");

    // lookup uniforms
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeUniform = gl.getUniformLocation(program, `u_time`);
    const fps = 60,
      frameDuration = 1000 / fps;
    let time = 0,
      lastTime = 0;

    const draw = (elapsed) => {
      let delta = elapsed - lastTime;
      lastTime = elapsed;
      let step = delta / frameDuration;
      time += step;
      gl.useProgram(program);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
      gl.uniform1f(timeUniform, time * 0.001);
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.enableVertexAttribArray(texCoordAttribute);
      gl.vertexAttribPointer(texCoordAttribute, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionAttribute);
      gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      const laserColourUniform = gl.getUniformLocation(
        program,
        `u_laserColour`
      );
      gl.uniform3f(laserColourUniform, 5.0, 0.0, 0.0);

      canvas.addEventListener("mousemove", (e) => {
        const rect = gl.canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / canvas.width) * 2 - 1;
        const y = ((e.clientY - rect.top) / canvas.height) * -2 + 1;

        gl.uniform2f(mouseLocation, x, y);
      });
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  };

  const createShader = (gl, type, id) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, id === "vertex" ? vertexShader : fragmentShader);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return false;
  };

  const createProgram = (gl, vertexId, fragmentId) => {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexId);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentId);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return false;
  };

  const initCanvas2D = () => {
    let canvasX, canvasY;
    let textX, textY;
    let text = [];
    let textToWrite = "ROBOTS ROBOTS ROBOTS ROBOTS ROBOTS";
    let maxWidth = 30;
    let textHeight = 650;
    const $canvas2D = canvas2D.current;
    const ctx = $canvas2D.getContext(`2d`);
    ctx.font = textHeight + "italic bold 550pt Tahoma";
    if (maxWidth && measureText(ctx, textToWrite) > maxWidth) {
      maxWidth = createMultilineText(ctx, textToWrite, maxWidth, text);
      canvasX = getPowerOfTwo(maxWidth);
    } else {
      text.push(textToWrite);
      canvasX = getPowerOfTwo(ctx.measureText(textToWrite).width);
    }
    canvasY = getPowerOfTwo(textHeight * (text.length + 1));
    canvasX > canvasY ? (canvasY = canvasX) : (canvasX = canvasY);
    $canvas2D.width = canvasX;
    $canvas2D.height = canvasY;
    textX = 0;
    textY = 0;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 20;
    ctx.textAlign = "middle";
    ctx.textBaseline = "middle";
    ctx.font = "italic bold 550pt Tahoma";
    var offset = (canvasY - textHeight * (text.length + 1)) * 0.5;
    for (var i = 0; i < text.length; i++) {
      if (text.length > 1) {
        textY = (i + 1) * textHeight + offset;
      }
      ctx.strokeText(text[i], textX, textY);
    }
  };

  const initCanvasWebGL = () => {
    const $canvasWebGL = canvasWebGL.current;
    const gl = $canvasWebGL.getContext(`webgl`, {
      antialias: true,
    });
    const program = createProgram(gl, `vertex`, `fragment`);
    initProgram(program, gl, $canvasWebGL);
  };

  return (
    <Fragment>
      <canvas ref={canvas2D} className="canvas2d" />
      <canvas ref={canvasWebGL} />
    </Fragment>
  );
};

export default App;
