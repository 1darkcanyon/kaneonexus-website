cmake_minimum_required(VERSION 3.22.1)
project(particleflow)

set(SRC ${CMAKE_CURRENT_SOURCE_DIR})
set(BIN ${CMAKE_CURRENT_BINARY_DIR})

# ── SPIR-V compilation ──────────────────────────────────────────────────────
# Compile each GLSL shader to .spv, then embed as a C uint32_t[] array via
# xxd -i so no runtime asset loading is needed.
find_program(GLSLC glslc
    HINTS
        $ENV{ANDROID_HOME}/ndk-bundle/shader-tools/linux-x86_64
        $ENV{VULKAN_SDK}/bin
)
if(NOT GLSLC)
    message(FATAL_ERROR "glslc not found — install the Android NDK shader-tools or Vulkan SDK")
endif()

function(compile_shader name stage)
    set(SRC_FILE ${SRC}/shaders/${name})
    set(SPV_FILE ${BIN}/${name}.spv)
    set(HDR_FILE ${BIN}/${name}.spv.h)
    add_custom_command(
        OUTPUT  ${HDR_FILE}
        COMMAND ${GLSLC} -fshader-stage=${stage} ${SRC_FILE} -o ${SPV_FILE}
        # Run xxd from BIN so the variable name is derived from just the filename,
        # e.g. "init.comp.spv" → "init_comp_spv" (dots become underscores).
        # Full-path argument would produce a mangled absolute-path variable name.
        COMMAND xxd -i ${name}.spv > ${HDR_FILE}
        WORKING_DIRECTORY ${BIN}
        DEPENDS ${SRC_FILE}
        COMMENT "Compiling shader ${name}"
    )
    target_sources(particleflow PRIVATE ${HDR_FILE})
endfunction()

# ── Shared library ───────────────────────────────────────────────────────────
add_library(particleflow SHARED
    vulkan/ParticleFlowVK.cpp
    vulkan/jni_bridge.cpp
)

compile_shader(init.comp    compute)
compile_shader(update.comp  compute)
compile_shader(particles.vert vertex)
compile_shader(particles.frag fragment)

target_include_directories(particleflow PRIVATE ${BIN})

target_link_libraries(particleflow
    android
    vulkan
    log
)
