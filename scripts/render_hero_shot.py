import bpy
import math

print("=== RENDERING 1080p ARCHITECTURAL HERO SHOT ===")

# Load master blend
bpy.ops.wm.open_mainfile(filepath=r"public\models\residencias_caroni_master.blend")

# 1. Setup Camera for eye-level / slightly elevated 3/4 architectural perspective
cam_data = bpy.data.cameras.new("HeroCamera")
cam_data.lens = 32 # 32mm architectural wide lens
cam_data.clip_end = 500.0
cam_obj = bpy.data.objects.new("HeroCamera", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
bpy.context.scene.camera = cam_obj

# Camera looking at the front-left facade (Balconies + Louvers)
# Building center is roughly at X=1.0, Y=31.0, Z=12.0
cam_obj.location = (-35.0, -22.0, 16.0)
cam_obj.rotation_euler = (math.radians(76), 0, math.radians(-54))

# 2. Lighting - Natural Caracas Daylight
sun_data = bpy.data.lights.new(name="Sun_Caracas_Day", type='SUN')
sun_data.energy = 5.0
sun_data.color = (1.0, 0.97, 0.92) # Warm 5500K tropical sun
sun_obj = bpy.data.objects.new(name="Sun_Caracas_Day", object_data=sun_data)
bpy.context.scene.collection.objects.link(sun_obj)
sun_obj.rotation_euler = (math.radians(48), math.radians(18), math.radians(-38))

# Fill skylight
sky_light_data = bpy.data.lights.new(name="Sky_Fill", type='SUN')
sky_light_data.energy = 1.5
sky_light_data.color = (0.75, 0.88, 1.0)
sky_light_obj = bpy.data.objects.new(name="Sky_Fill", object_data=sky_light_data)
bpy.context.scene.collection.objects.link(sky_light_obj)
sky_light_obj.rotation_euler = (math.radians(65), math.radians(-30), math.radians(140))

# 3. Sky World Environment
if bpy.context.scene.world is None:
    bpy.context.scene.world = bpy.data.worlds.new("World")
bpy.context.scene.world.use_nodes = True
nodes = bpy.context.scene.world.node_tree.nodes
links = bpy.context.scene.world.node_tree.links
nodes.clear()

bg_node = nodes.new(type='ShaderNodeBackground')
bg_node.inputs['Color'].default_value = (0.42, 0.68, 0.95, 1.0)
bg_node.inputs['Strength'].default_value = 1.0
out_node = nodes.new(type='ShaderNodeOutputWorld')
links.new(bg_node.outputs['Background'], out_node.inputs['Surface'])

# 4. Render Engine Configuration
bpy.context.scene.render.engine = 'BLENDER_EEVEE'
bpy.context.scene.render.resolution_x = 1920
bpy.context.scene.render.resolution_y = 1080
bpy.context.scene.render.image_settings.file_format = 'PNG'

# Enable EEVEE raytracing / soft shadows
if hasattr(bpy.context.scene.eevee, 'use_shadows'):
    bpy.context.scene.eevee.use_shadows = True

out_png = r"C:\Users\Sistemas\.gemini\antigravity\brain\f0708d1f-e346-4591-87ee-da77bfae1525\caroni_hero_render_1080p.png"
bpy.context.scene.render.filepath = out_png
print(f"Rendering to {out_png}...")
bpy.ops.render.render(write_still=True)
print("Hero render complete!")
