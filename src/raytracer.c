#include "raytracer.h"

#include "resources.h"
#include "shader.h"

#define PI 3.1415926535897

void RayTracerInit(RayTracer *rb, const char *shader) {
  // TODO: Generate `cast_ray` function from the CPU
  rb->tracer_program = create_program(shaders_quad_vert, shader);
  rb->render_program = create_program(shaders_quad_vert, shaders_render_frag);

  rb->vao = glCreateVertexArray();

  rb->u_resolution = glGetUniformLocation(rb->tracer_program, "u_resolution");
  rb->u_angle = glGetUniformLocation(rb->tracer_program, "u_angle");
  rb->u_origin = glGetUniformLocation(rb->tracer_program, "u_origin");
  rb->u_samples = glGetUniformLocation(rb->tracer_program, "u_samples");

  rb->last_mouse_x = 0;
  rb->last_mouse_y = 0;

  rb->angle_x = 0;
  rb->angle_y = 0;

  rb->pos_x = 0;
  rb->pos_y = 1;
  rb->pos_z = 0;

  rb->moved = false;
  rb->samples = 0;

  rb->texture1 = glCreateTexture();
  rb->texture2 = glCreateTexture();
  rb->framebuffer = glCreateFramebuffer();

  glBindTexture(GL_TEXTURE_2D, rb->texture1);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);

  glBindTexture(GL_TEXTURE_2D, rb->texture2);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
}

static void Render(RayTracer *rb, int width, int height) {
  glUseProgram(rb->tracer_program);

  glUniform2f(rb->u_resolution, width, height);
  glUniform2f(rb->u_angle, rb->angle_x, rb->angle_y);
  glUniform3f(rb->u_origin, rb->pos_x, rb->pos_y, rb->pos_z);
  glUniform1ui(rb->u_samples, rb->samples);

  // Setup textures
  glBindTexture(GL_TEXTURE_2D, rb->texture1);
  glTexImage2D(
    GL_TEXTURE_2D, 0, GL_RGB32F, width, height, 0, GL_RGB, GL_FLOAT, 0
  );

  glBindTexture(GL_TEXTURE_2D, rb->texture2);
  glTexImage2D(
    GL_TEXTURE_2D, 0, GL_RGB32F, width, height, 0, GL_RGB, GL_FLOAT, 0
  );

  // Trace image into a texture
  glBindFramebuffer(GL_FRAMEBUFFER, rb->framebuffer);
  glFramebufferTexture(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, rb->texture2, 0);

  glActiveTexture(GL_TEXTURE0);
  glBindTexture(GL_TEXTURE_2D, rb->texture1);
  glBindVertexArray(rb->vao);
  glDrawArrays(GL_TRIANGLES, 0, 6);
  glBindFramebuffer(GL_FRAMEBUFFER, 0);

  // Render texture to the screen
  glUseProgram(rb->render_program);
  glActiveTexture(GL_TEXTURE0);
  glBindTexture(GL_TEXTURE_2D, rb->texture2);
  glDrawArrays(GL_TRIANGLES, 0, 6);

  // Swap textures
  int tmp = rb->texture1;
  rb->texture1 = rb->texture2;
  rb->texture2 = tmp;

  rb->samples++;
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

  float speed = 5 / ((input_x && input_y) ? sqrtf(2) : 1);

  rb->pos_x += (vxf + vxr) * speed * dt;
  rb->pos_z += (vzf + vzr) * speed * dt;
  rb->pos_y += vy * speed * dt;

  if (input_x || input_y) rb->moved = true;

  if (rb->moved) rb->samples = 0;
  rb->moved = false;

  Render(rb, width, height);
}
