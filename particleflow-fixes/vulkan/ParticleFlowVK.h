#pragma once
// ParticleFlow — Vulkan NDK Renderer (v3)
// NEXUS Engineering — Canyon (Kaneon)

#include <vulkan/vulkan.h>
#include <android/native_window.h>
#include <vector>
#include <cstdint>

class ParticleFlowVK {
public:
    ParticleFlowVK()  = default;
    ~ParticleFlowVK() = default;

    // ── Lifecycle ────────────────────────────────────────────────────────────
    bool init(ANativeWindow* window, int width, int height);
    void resize(int width, int height);
    void drawFrame();
    void destroy();

    // ── Particle control ─────────────────────────────────────────────────────
    /** Re-place particles on disk and set default attraction-point circle. */
    void resetParticles();

    // ── Touch input ──────────────────────────────────────────────────────────
    /** x,y in pixel space with Y already flipped: y = height - screenY */
    void setTouch(int idx, float x, float y);
    /** Deactivate touch point (writes -1 sentinel). */
    void clearTouch(int idx);

    // ── Settings ─────────────────────────────────────────────────────────────
    void setParams(int  numParticles, int   numTouch,
                   float attract,    float drag,
                   float bgR,        float bgG,   float bgB,
                   float slowH,      float slowS,  float slowV,
                   float fastH,      float fastS,  float fastV,
                   int   hueDir,     float pointSize);

private:
    // ── Push-constant structs (must match shader layouts exactly) ────────────
    struct ComputePC {
        int   numParticles;
        int   numTouch;
        float attract;
        float drag;
        float width;
        float height;
        float slowH, slowS, slowV;
        float fastH, fastS, fastV;
        int   hueDir;
        uint32_t frameSeed;
    };  // 56 bytes

    struct GraphicsPC {
        float width;
        float height;
        float pointSize;
    };  // 12 bytes

    // ── Core Vulkan objects ──────────────────────────────────────────────────
    VkInstance       instance_       = VK_NULL_HANDLE;
    VkPhysicalDevice physDev_        = VK_NULL_HANDLE;
    VkDevice         device_         = VK_NULL_HANDLE;
    uint32_t         queueFamily_    = 0;
    VkQueue          queue_          = VK_NULL_HANDLE;

    // ── Surface + Swapchain ──────────────────────────────────────────────────
    VkSurfaceKHR               surface_    = VK_NULL_HANDLE;
    VkSwapchainKHR             swapchain_  = VK_NULL_HANDLE;
    std::vector<VkImage>       swapImages_;
    std::vector<VkImageView>   swapViews_;
    std::vector<VkFramebuffer> framebuffers_;
    VkFormat                   swapFormat_ = VK_FORMAT_UNDEFINED;
    VkExtent2D                 swapExtent_ = {0, 0};

    // ── Render pass ──────────────────────────────────────────────────────────
    VkRenderPass renderPass_ = VK_NULL_HANDLE;

    // ── Pipelines ────────────────────────────────────────────────────────────
    VkPipelineLayout computeLayout_  = VK_NULL_HANDLE;
    VkPipeline       initPipeline_   = VK_NULL_HANDLE;
    VkPipeline       updatePipeline_ = VK_NULL_HANDLE;
    VkPipelineLayout graphicsLayout_ = VK_NULL_HANDLE;
    VkPipeline       graphicsPipeline_ = VK_NULL_HANDLE;

    // ── Descriptors ──────────────────────────────────────────────────────────
    VkDescriptorSetLayout descSetLayout_ = VK_NULL_HANDLE;
    VkDescriptorPool      descPool_      = VK_NULL_HANDLE;
    VkDescriptorSet       descSet_       = VK_NULL_HANDLE;

    // ── Buffers ──────────────────────────────────────────────────────────────
    VkBuffer     posBuf_   = VK_NULL_HANDLE;
    VkDeviceMemory posMem_ = VK_NULL_HANDLE;
    VkBuffer     velBuf_   = VK_NULL_HANDLE;
    VkDeviceMemory velMem_ = VK_NULL_HANDLE;
    VkBuffer     colBuf_   = VK_NULL_HANDLE;
    VkDeviceMemory colMem_ = VK_NULL_HANDLE;
    VkBuffer     touchBuf_ = VK_NULL_HANDLE;
    VkDeviceMemory touchMem_ = VK_NULL_HANDLE;
    void*        touchMapped_ = nullptr;  // persistent map

    // ── Commands + sync ──────────────────────────────────────────────────────
    VkCommandPool   cmdPool_         = VK_NULL_HANDLE;
    VkCommandBuffer cmdBuf_          = VK_NULL_HANDLE;
    VkSemaphore     imgAvailSem_     = VK_NULL_HANDLE;
    VkSemaphore     renderDoneSem_   = VK_NULL_HANDLE;
    VkFence         frameFence_      = VK_NULL_HANDLE;

    // ── Cached state ─────────────────────────────────────────────────────────
    static constexpr int MAX_TOUCHES    = 16;
    static constexpr int MAX_PARTICLES  = 1000000;

    ComputePC  cpc_  = {};
    GraphicsPC gpc_  = {};
    float bgR_ = 0, bgG_ = 0, bgB_ = 0;
    bool  initialized_ = false;

    // ── Private helpers ──────────────────────────────────────────────────────
    bool createInstance();
    bool selectPhysicalDevice();
    bool createDevice();
    bool createSurface(ANativeWindow* window);
    bool createSwapchain(int width, int height);
    bool createRenderPass();
    bool createFramebuffers();
    bool createBuffers();
    bool createDescriptors();
    bool createComputePipelines();
    bool createGraphicsPipeline();
    bool createCommandResources();
    bool createSyncObjects();

    void destroySwapchain();
    void recreateSwapchain(int width, int height);

    /** Submit init compute dispatch synchronously. */
    void dispatchInit();

    VkShaderModule createShaderModule(const uint32_t* code, size_t sizeBytes);
    uint32_t findMemoryType(uint32_t filter, VkMemoryPropertyFlags props);
    void createBuffer(VkDeviceSize size, VkBufferUsageFlags usage,
                      VkMemoryPropertyFlags props,
                      VkBuffer& buf, VkDeviceMemory& mem);
};
