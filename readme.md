# Path tracer

A real-time, GPU accelerated, interactive path tracing engine written in C and OpenGL.

![](render.png)

## Features

- Geometry:
  + [x] Floor and sky
  + [x] Sphere
  + [ ] Triangle
  + [ ] AABB
  + [ ] SDF (Ray marching)
- Material:
  + [x] Diffuse
  + [x] Emissive
  + [x] Glossy/Metallic
  + [ ] Specular
  + [ ] Glass
- Features:
  + [x] Interactive camera
  + [x] Continuous rendering
  + [ ] Scene loading
  + [ ] VBH generation
  + [ ] Adaptive sampling
  + [ ] Depth of field
  + [ ] Motion blur

## How to use

### Requirements

**Linux build**

- A C99 compiler
- GNU make
- GLFW
- GLEW

**WebAssembly build**

- Clang
- A web server (ex: `python -m http.server`)

**Windows build**

- `¯\_(ツ)_/¯`

### Building

Running this will compile both the Linux version and the web version

```
make
```

### Debugging

Compile with debug symbols then use gdb to debug

```
make debug

gdb ./debug/app
```

### Running

For the Linux version, the executable is located at `./build/app`

For the web version use a web server (See [above](#requirements)) to host the
website.

## License

This project is licensed under the [MIT License](LICENSE).
