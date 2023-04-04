#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "src/exports.h"
#include "src/resources.h"

#define WIDTH 800
#define HEIGHT 600

#define TITLE "Example"

float fsin(float x) { return sin(x); }
float fcos(float x) { return cos(x); }

void resize_callback(GLFWwindow *window, int new_w, int new_h) {
  (void)window;
  resize(new_w, new_h);
}

void cursor_callback(GLFWwindow *window, double xpos, double ypos) {
  (void)window;
  update_mouse(xpos, ypos);
}

void key_callback(
  GLFWwindow *window, int key, int scancode, int action, int mods
) {
  (void)window;
  (void)scancode;
  (void)mods;
  if (key > 256) return;
  if (action == GLFW_PRESS) {
    key_pressed(key);
    return;
  }
  if (action == GLFW_RELEASE) {
    key_released(key);
    return;
  }
}

int glCreateBuffer(void) {
  GLuint buf;
  glCreateBuffers(1, &buf);
  return buf;
}

int glCreateFramebuffer(void) {
  GLuint buf;
  glCreateFramebuffers(1, &buf);
  return buf;
}

int glCreateVertexArray(void) {
  GLuint vao;
  glCreateVertexArrays(1, &vao);
  return vao;
}

void glSetShaderSource(int shader, const char *src) {
  glShaderSource(shader, 1, &src, NULL);
}

int glGetShaderParameter(int shader, int pname) {
  GLint param;
  glGetShaderiv(shader, pname, &param);
  return param;
}

void message_callback(
  GLenum source, GLenum type, GLuint id, GLenum severity, GLsizei length,
  const GLchar *message, const void *userParam
) {
  (void)source;
  (void)id;
  (void)length;
  (void)userParam;
  fprintf(
    stderr, "GL CALLBACK: %s type = 0x%x, severity = 0x%x\n%s\n",
    (type == GL_DEBUG_TYPE_ERROR ? "** GL ERROR **" : ""), type, severity,
    message
  );
}

char *generate_shader(void) {
  const char *shaders[] = {
    shaders_header_frag,   shaders_random_frag,    shaders_ray_frag,
    shaders_hittable_frag, shaders_raytracer_frag,
  };

  size_t shader_count = sizeof(shaders) / sizeof(shaders[0]);

  size_t *sizes = malloc(sizeof(size_t) * shader_count);
  size_t total_size = 0;

  for (size_t i = 0; i < shader_count; ++i) {
    sizes[i] = strlen(shaders[i]);
    total_size += sizes[i];
  }

  char *shader = malloc(total_size + 1);

  char *ptr = shader;
  for (size_t i = 0; i < shader_count; ++i) {
    memcpy(ptr, shaders[i], sizes[i]);
    ptr += sizes[i];
  }

  shader[total_size] = 0;
  free(sizes);

  return shader;
}

int main(void) {
  if (!glfwInit()) return -1;

  glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
  glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
  glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

  GLFWwindow *window = glfwCreateWindow(WIDTH, HEIGHT, TITLE, NULL, NULL);
  if (!window) {
    glfwTerminate();
    return -1;
  }

  glfwMakeContextCurrent(window);
  if (glewInit() != GLEW_OK) {
    glfwTerminate();
    return -1;
  }

  glfwSwapInterval(0);

  printf("Created window with OpenGL version: %s\n", glGetString(GL_VERSION));

  glfwSetFramebufferSizeCallback(window, resize_callback);
  glfwSetCursorPosCallback(window, cursor_callback);
  glfwSetKeyCallback(window, key_callback);

  glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_DISABLED);

  glEnable(GL_DEBUG_OUTPUT);
  glDebugMessageCallback(message_callback, 0);

  double last = glfwGetTime();
  double last_display = last;
  double dt = 0;

  unsigned frames = 0;

  resize(WIDTH, HEIGHT);

  char *shader = generate_shader();
  game_init(shader);
  free(shader);

  while (!glfwWindowShouldClose(window)) {
    game_update(dt);
    glfwSwapBuffers(window);
    glfwPollEvents();
    frames += 1;
    double now = glfwGetTime();
    if (now - last_display >= 1) {
      char title[64];
      sprintf(title, "%s - FPS: %d", TITLE, frames);
      glfwSetWindowTitle(window, title);
      frames = 0;
      last_display = now;
    }
    dt = now - last;
    last = now;
  }

  glfwTerminate();
  return 0;
}
