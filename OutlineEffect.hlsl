#ifndef OUTLINE_EFFECT_INCLUDED
#define OUTLINE_EFFECT_INCLUDED

// Vertex expansion for outline effect
void OutlineVertexExpansion_float(
    float3 Position,
    float3 Normal,
    float OutlineWidth,
    out float3 OutPosition)
{
    // Expand vertex along normal direction
    OutPosition = Position + Normal * OutlineWidth;
}

// Improved outline with smooth normals for better quality
void OutlineVertexExpansionSmooth_float(
    float3 Position,
    float3 Normal,
    float3 Tangent,
    float OutlineWidth,
    float SmoothFactor,
    out float3 OutPosition)
{
    // Calculate bitangent
    float3 bitangent = cross(Normal, Tangent);
    
    // Create smooth normal by averaging
    float3 smoothNormal = normalize(Normal + Tangent * SmoothFactor + bitangent * SmoothFactor);
    
    // Expand vertex along smooth normal
    OutPosition = Position + smoothNormal * OutlineWidth;
}

// Screen-space outline width (maintains consistent thickness regardless of distance)
void OutlineVertexScreenSpace_float(
    float3 Position,
    float3 Normal,
    float OutlineWidth,
    float4x4 ViewMatrix,
    float4x4 ProjectionMatrix,
    out float3 OutPosition)
{
    #if SHADERGRAPH_PREVIEW
        OutPosition = Position + Normal * OutlineWidth;
    #else
        // Transform to view space
        float4 viewPos = mul(ViewMatrix, float4(Position, 1.0));
        float4 viewNormal = mul(ViewMatrix, float4(Normal, 0.0));
        
        // Calculate screen-space offset
        float distance = length(viewPos.xyz);
        float screenSpaceWidth = OutlineWidth * distance * 0.01;
        
        // Expand in view space
        viewPos.xyz += normalize(viewNormal.xyz) * screenSpaceWidth;
        
        // Transform back to world space
        OutPosition = mul(inverse(ViewMatrix), viewPos).xyz;
    #endif
}

#endif // OUTLINE_EFFECT_INCLUDED
