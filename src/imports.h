#ifndef IMPORTS_H
#define IMPORTS_H

#define NULL (const void*)0
#define offsetof(t, d) __builtin_offsetof(t, d)
#define sqrtf(x) __builtin_sqrtf(x)
#define max(a, b) (a > b ? a : b)
#define min(a, b) (a < b ? a : b)

#define GL_UNSIGNED_BYTE 0x1401
#define GL_FLOAT 0x1406
#define GL_TRIANGLES 0x0004
#define GL_FRAGMENT_SHADER 0x8B30
#define GL_VERTEX_SHADER 0x8B31
#define GL_COMPILE_STATUS 0x8B81
#define GL_ARRAY_BUFFER 0x8892
#define GL_FRAMEBUFFER 0x8D40
#define GL_TEXTURE_2D 0x0DE1
#define GL_TEXTURE_MAG_FILTER 0x2800
#define GL_TEXTURE_MIN_FILTER 0x2801
#define GL_RGB 0x1907
#define GL_RGB32F 0x8815
#define GL_NEAREST 0x2600
#define GL_COLOR_ATTACHMENT0 0x8CE0

#ifndef __cplusplus
typedef enum { false, true } bool;
#endif

extern int puts(const char*);
extern int putf(double);

extern int glCreateBuffer(void);
extern int glCreateFramebuffer(void);
extern int glCreateTexture(void);
extern int glCreateVertexArray(void);
extern int glCreateShader(int);
extern int glCreateProgram(void);
extern int glGetUniformLocation(int, const char*);
extern int glGetShaderParameter(int, int);
extern void glViewport(int, int, int, int);
extern void glSetShaderSource(int, const char*);
extern void glCompileShader(int);
extern void glDeleteShader(int);
extern void glAttachShader(int, int);
extern void glLinkProgram(int);
extern void glValidateProgram(int);
extern void glUseProgram(int);
extern void glBindBuffer(int, int);
extern void glBindFramebuffer(int, int);
extern void glBindVertexArray(int);
extern void glBindTexture(int, int);
extern void glTexImage2D(int, int, int, int, int, int, int, int, int);
extern void glTexParameteri(int, int, int);
extern void glFramebufferTexture2D(int, int, int, int, int);
extern void glUniform3f(int, float, float, float);
extern void glUniform2f(int, float, float);
extern void glUniform1ui(int, unsigned int);
extern void glUniform1i(int, int);
extern void glDrawArrays(int, int, int);

extern float fsin(float);
extern float fcos(float);

#endif
