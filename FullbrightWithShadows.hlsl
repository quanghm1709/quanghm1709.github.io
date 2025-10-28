#ifndef FULLBRIGHT_WITH_SHADOWS_INCLUDED
#define FULLBRIGHT_WITH_SHADOWS_INCLUDED

// Function to get fullbright lighting with shadow receiving
void FullbrightWithShadows_float(
    float3 BaseColor,
    float ShadowStrength,
    float4 ShadowCoord,
    out float3 Out)
{
    #if SHADERGRAPH_PREVIEW
        Out = BaseColor;
    #else
        // Sample shadow map
        Light mainLight = GetMainLight(ShadowCoord);
        float shadow = mainLight.shadowAttenuation;
        
        // Apply shadow to base color
        // Lerp between full shadow (0) and no shadow (1)
        float3 shadowedColor = BaseColor * lerp(1.0 - ShadowStrength, 1.0, shadow);
        
        Out = shadowedColor;
    #endif
}

// Alternative version with main light color influence
void FullbrightWithShadowsAndLight_float(
    float3 BaseColor,
    float ShadowStrength,
    float LightInfluence,
    float4 ShadowCoord,
    out float3 Out)
{
    #if SHADERGRAPH_PREVIEW
        Out = BaseColor;
    #else
        Light mainLight = GetMainLight(ShadowCoord);
        float shadow = mainLight.shadowAttenuation;
        
        // Blend between pure color and light-influenced color
        float3 litColor = BaseColor * lerp(1.0, mainLight.color, LightInfluence);
        
        // Apply shadow
        float3 shadowedColor = litColor * lerp(1.0 - ShadowStrength, 1.0, shadow);
        
        Out = shadowedColor;
    #endif
}

#endif // FULLBRIGHT_WITH_SHADOWS_INCLUDED
