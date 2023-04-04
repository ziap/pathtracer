#include "raytracer.h"

#include "imports.h"
#include "resources.h"
#include "shader.h"

#define PI 3.1415926535897

void RayTracerInit(RayTracer *rb) {
  // TODO:
  // - Temporarily disable WebGL support (for easier string concatenation)
  // - Split shader into multiple files
  // - Generate `cast_ray` function from the CPU
  rb->program = create_program(shaders_raytracer_vert, shaders_raytracer_frag);

  rb->vao = glCreateVertexArray();

  rb->u_resolution = glGetUniformLocation(rb->program, "u_resolution");
  rb->u_angle = glGetUniformLocation(rb->program, "u_angle");
  rb->u_origin = glGetUniformLocation(rb->program, "u_origin");
  rb->u_time = glGetUniformLocation(rb->program, "u_time");

  rb->last_mouse_x = 0;
  rb->last_mouse_y = 0;

  rb->angle_x = 0;
  rb->angle_y = 0;

  rb->pos_x = 0;
  rb->pos_y = 1;
  rb->pos_z = 0;

  rb->time = 0;
}

void RayTracerUse(RayTracer *rb) {
  glUseProgram(rb->program);
  glBindVertexArray(rb->vao);
}

void RayTracerUpdate(
  RayTracer *rb, int width, int height, float mouse_x, float mouse_y,
  int input_x, int input_y, float dt
) {
  float dx = mouse_x - rb->last_mouse_x;
  float dy = mouse_y - rb->last_mouse_y;

  float dax = dx / (float)height;
  float day = dy / (float)height;

  rb->angle_x += dax;
  rb->angle_y += day;

  if (rb->angle_y * 2 > PI) rb->angle_y = PI / 2;
  if (rb->angle_y * 2 < -PI) rb->angle_y = -PI / 2;

  rb->last_mouse_x = mouse_x;
  rb->last_mouse_y = mouse_y;

  float vxz = fcos(rb->angle_y);

  float vy = fsin(rb->angle_y) * input_y;
  float vxf = vxz * fsin(rb->angle_x) * input_y;
  float vzf = vxz * fcos(rb->angle_x) * input_y;

  float vxr = fcos(rb->angle_x) * input_x;
  float vzr = -fsin(rb->angle_x) * input_x;

  float speed = 5 / (input_x != 0 && input_y != 0 ? sqrtf(2) : 1);

  rb->pos_x += (vxf + vxr) * speed * dt;
  rb->pos_z += (vzf + vzr) * speed * dt;
  rb->pos_y += vy * speed * dt;

  rb->time += dt;

  glUniform2f(rb->u_resolution, width, height);
  glUniform2f(rb->u_angle, rb->angle_x, rb->angle_y);
  glUniform3f(rb->u_origin, rb->pos_x, rb->pos_y, rb->pos_z);
  glUniform1f(rb->u_time, rb->time);
}

void RayTracerRender(RayTracer *rb) {
  (void)rb;
  glDrawArrays(GL_TRIANGLES, 0, 6);
}
