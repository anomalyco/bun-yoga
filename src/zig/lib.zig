const std = @import("std");

// Import C headers from webgpu.h
const c = @cImport({
    @cInclude("dawn/webgpu.h");
});

// --- Instance Functions ---

pub export fn zwgpuCreateInstance(descriptor: ?*const c.WGPUInstanceDescriptor) c.WGPUInstance {
    return c.wgpuCreateInstance(descriptor);
}

pub export fn zwgpuInstanceRelease(instance: c.WGPUInstance) void {
    c.wgpuInstanceRelease(instance);
}

pub export fn zwgpuInstanceRequestAdapter(
    instance: c.WGPUInstance,
    options: ?*const c.WGPURequestAdapterOptions,
    callback_info_ptr: *const c.WGPURequestAdapterCallbackInfo,
) u64 {
    const future = c.wgpuInstanceRequestAdapter(instance, options, callback_info_ptr.*);
    return future.id;
}
