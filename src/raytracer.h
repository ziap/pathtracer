#ifndef RAYTRACER_H
#define RAYTRACER_H

typedef struct {
  int u_resolution;
  int u_angle;
  int u_time;

  int program;

  int vao;

  float angle_x;
  float angle_y;

  float last_mouse_x;
  float last_mouse_y;
} RayTracer;

extern void RayTracerInit(RayTracer*);
extern void RayTracerUpdate(RayTracer*, int, int, float, float, float);
extern void RayTracerUse(RayTracer*);
extern void RayTracerRender(RayTracer*);

#endif
