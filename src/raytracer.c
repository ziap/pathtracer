#include "raytracer.h"

#include "imports.h"
#include "resources.h"
#include "shader.h"

#define PI 3.1415926535897

void RayTracerInit(RayTracer *rb) {
  rb->program = create_program(shaders_raytracer_vert, shaders_raytracer_frag);

  rb->vao = glCreateVertexArray();

  rb->u_resolution = glGetUniformLocation(rb->program, "u_resolution");
  rb->u_angle = glGetUniformLocation(rb->program, "u_angle");
  rb->u_time = glGetUniformLocation(rb->program, "u_time");
}

void RayTracerUse(RayTracer *rb) {
  glUseProgram(rb->program);
  glBindVertexArray(rb->vao);
}

void RayTracerUpdate(
  RayTracer *rb, int width, int height, float mouse_x, float mouse_y, float time
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

  glUniform2f(rb->u_resolution, width, height);
  glUniform2f(rb->u_angle, rb->angle_x, rb->angle_y);
  glUniform1f(rb->u_time, time);
}

void RayTracerRender(RayTracer *rb) {
  (void)rb;
  glDrawArrays(GL_TRIANGLES, 0, 6);
}
