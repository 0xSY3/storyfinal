"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Color, Triangle } from "ogl";

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ), 
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \
  int index = 0;                                            \
  for (int i = 0; i < 2; i++) {                               \
     ColorStop currentColor = colors[i];                    \
     bool isInBetween = currentColor.position <= factor;    \
     index = int(mix(float(index), float(i), float(isInBetween))); \
  }                                                         \
  ColorStop currentColor = colors[index];                   \
  ColorStop nextColor = colors[index + 1];                  \
  float range = nextColor.position - currentColor.position; \
  float lerpFactor = (factor - currentColor.position) / range; \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  
  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);
  
  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);
  
  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;
  
  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
  
  vec3 auroraColor = intensity * rampColor;
  
  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}
`;

interface AuroraProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  time?: number;
  speed?: number;
  className?: string;
}

export default function Aurora({
  colorStops = ["#10b981", "#3b82f6", "#8b5cf6"],
  amplitude = 1.2,
  blend = 0.6,
  speed = 0.3,
  className = "",
}: AuroraProps) {
  const ctnDom = useRef<HTMLDivElement>(null);
  const propsRef = useRef<AuroraProps>({ colorStops, amplitude, blend, speed });
  propsRef.current = { colorStops, amplitude, blend, speed };

  useEffect(() => {
    const ctn = ctnDom.current;
    if (!ctn) return;

    let renderer: Renderer;
    let gl: WebGL2RenderingContext;
    let program: Program | undefined;
    let animateId: number;
    let resizeHandler: () => void;

    try {
      renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: true,
        antialias: true,
      });
      gl = renderer.gl as WebGL2RenderingContext;
      
      gl.clearColor(0, 0, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.canvas.style.backgroundColor = "transparent";
      gl.canvas.style.width = "100%";
      gl.canvas.style.height = "100%";
      gl.canvas.style.position = "absolute";
      gl.canvas.style.top = "0";
      gl.canvas.style.left = "0";

      resizeHandler = () => {
        if (!ctn) return;
        const width = ctn.offsetWidth;
        const height = ctn.offsetHeight;
        renderer.setSize(width, height);
        if (program) {
          program.uniforms.uResolution.value = [width, height];
        }
      };

      window.addEventListener("resize", resizeHandler);

      const geometry = new Triangle(gl);
      if (geometry.attributes.uv) {
        delete (geometry.attributes as any).uv;
      }

      const colorStopsArray = colorStops.map((hex) => {
        const c = new Color(hex);
        return [c.r, c.g, c.b];
      });

      program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uAmplitude: { value: amplitude },
          uColorStops: { value: colorStopsArray },
          uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
          uBlend: { value: blend },
        },
      });

      const mesh = new Mesh(gl, { geometry, program });
      ctn.appendChild(gl.canvas);

      const update = (t: number) => {
        animateId = requestAnimationFrame(update);
        const currentProps = propsRef.current;
        const currentSpeed = currentProps.speed ?? 0.3;
        
        if (program) {
          program.uniforms.uTime.value = t * 0.001 * currentSpeed;
          program.uniforms.uAmplitude.value = currentProps.amplitude ?? 1.2;
          program.uniforms.uBlend.value = currentProps.blend ?? 0.6;
          
          const stops = currentProps.colorStops ?? colorStops;
          program.uniforms.uColorStops.value = stops.map((hex: string) => {
            const c = new Color(hex);
            return [c.r, c.g, c.b];
          });
          
          renderer.render({ scene: mesh });
        }
      };

      resizeHandler();
      animateId = requestAnimationFrame(update);

    } catch (error) {
      console.warn("WebGL Aurora effect failed to initialize:", error);
      return;
    }

    return () => {
      if (animateId) {
        cancelAnimationFrame(animateId);
      }
      window.removeEventListener("resize", resize);
      if (ctn && gl && gl.canvas && gl.canvas.parentNode === ctn) {
        try {
          ctn.removeChild(gl.canvas);
        } catch (e) {
          // Canvas might already be removed
        }
      }
      if (gl) {
        const ext = gl.getExtension("WEBGL_lose_context");
        ext?.loseContext();
      }
    };
  }, []);

  return (
    <div 
      ref={ctnDom} 
      className={`w-full h-full relative ${className}`}
      style={{ minHeight: '100vh' }}
    />
  );
}