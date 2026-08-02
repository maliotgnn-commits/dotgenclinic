# Vendored three.js (r160)

Source: https://github.com/mrdoob/three.js (MIT License)

Only the modules required by the home DNA intro animation are included:

- `three.module.js`
- postprocessing: EffectComposer, RenderPass, UnrealBloomPass (+ Pass/MaskPass/ShaderPass)
- shaders: CopyShader, LuminosityHighPassShader

Kept local (not npm) so production CSP `script-src 'self'` remains intact and `package.json` stays unchanged.
