import bpy
import mathutils
import math
import os

print("=== INITIATING PHOTOREALISTIC ARCHITECTURAL PIPELINE (BLENDER 5.2 LTS) ===")

# 1. Reset factory settings
bpy.ops.wm.read_factory_settings(use_empty=True)

# 2. Import instanced GLB
glb_input = r"public\models\caroni_instanced.glb"
print(f"Importing {glb_input}...")
bpy.ops.import_scene.gltf(filepath=glb_input)

# 3. Filter only building meshes (discard 2D CAD linework and far-away elements)
keep_objs = []
remove_objs = []

for o in list(bpy.data.objects):
    if o.type == 'MESH':
        mw = o.matrix_world
        c = mw @ (0.125 * sum((mathutils.Vector(b) for b in o.bound_box), mathutils.Vector()))
        name_l = o.name.lower()
        if 'archtick' in name_l or 'dwg' in name_l or 'planta' in name_l:
            remove_objs.append(o)
        elif 10 <= c.x <= 65 and 15 <= c.y <= 65 and c.z >= -1:
            keep_objs.append(o)
        else:
            remove_objs.append(o)

for o in remove_objs:
    bpy.data.objects.remove(o, do_unlink=True)

# Clean orphaned empties
for o in list(bpy.data.objects):
    if o.type == 'EMPTY' and len(o.children) == 0:
        bpy.data.objects.remove(o, do_unlink=True)

print(f"Retained building meshes: {len(keep_objs)}")

# 4. Center building at (0, 0, 0)
min_b = [float('inf')]*3
max_b = [float('-inf')]*3
for o in bpy.data.objects:
    if o.type == 'MESH':
        for v in o.bound_box:
            wv = o.matrix_world @ mathutils.Vector(v)
            for i in range(3):
                min_b[i] = min(min_b[i], wv[i])
                max_b[i] = max(max_b[i], wv[i])

center_x = (min_b[0] + max_b[0]) / 2.0
center_y = (min_b[1] + max_b[1]) / 2.0
base_z = min_b[2]

print(f"Centering offset: X={-center_x:.2f}, Y={-center_y:.2f}, Z={-base_z:.2f}")
shift = mathutils.Vector((-center_x, -center_y, -base_z))
for o in bpy.data.objects:
    if o.parent is None:
        o.location += shift

# Make objects single-user so transform_apply succeeds cleanly
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.make_single_user(type='SELECTED_OBJECTS', object=True, obdata=True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# Apply smooth normals for architectural curves (columns, moldings)
for o in bpy.data.objects:
    if o.type == 'MESH':
        name_l = o.name.lower()
        if any(k in name_l for k in ['circular', 'columna', 'cilindro', 'curva', 'vidrio']):
            for poly in o.data.polygons:
                poly.use_smooth = True

# 5. Create High-End Architectural PBR Materials with Authentically Extracted Textures
tex_base = os.path.abspath(r"public\models\skp_extracted\materials")

def make_pbr_material(name, color_rgba, metallic=0.0, roughness=0.5, ior=1.5, transmission=0.0, alpha=1.0, texture_rel_path=None, bump_scale=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    node_out = nodes.new(type='ShaderNodeOutputMaterial')
    node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    node_bsdf.inputs['Base Color'].default_value = color_rgba
    node_bsdf.inputs['Metallic'].default_value = metallic
    node_bsdf.inputs['Roughness'].default_value = roughness
    node_bsdf.inputs['IOR'].default_value = ior
    if 'Transmission Weight' in node_bsdf.inputs:
        node_bsdf.inputs['Transmission Weight'].default_value = transmission
    elif 'Transmission' in node_bsdf.inputs:
        node_bsdf.inputs['Transmission'].default_value = transmission
    node_bsdf.inputs['Alpha'].default_value = alpha
    
    if alpha < 1.0 or transmission > 0:
        if hasattr(mat, 'blend_method'):
            mat.blend_method = 'BLEND'
            
    if texture_rel_path:
        full_tex_path = os.path.join(tex_base, texture_rel_path)
        if os.path.exists(full_tex_path):
            try:
                img = bpy.data.images.load(full_tex_path)
                node_tex = nodes.new(type='ShaderNodeTexImage')
                node_tex.image = img
                links.new(node_tex.outputs['Color'], node_bsdf.inputs['Base Color'])
                
                if bump_scale > 0:
                    node_bump = nodes.new(type='ShaderNodeBump')
                    node_bump.inputs['Distance'].default_value = bump_scale
                    links.new(node_tex.outputs['Color'], node_bump.inputs['Height'])
                    links.new(node_bump.outputs['Normal'], node_bsdf.inputs['Normal'])
            except Exception as e:
                print(f"Could not load texture {full_tex_path}: {e}")
                
    links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])
    return mat

print("Creating Authentic Architectural PBR Material Palette...")

# A. Concreto visto arquitectónico noble (tono gris cálido natural, no blanco puro)
mat_concrete = make_pbr_material(
    "Caroni_Concreto_Visto",
    (0.62, 0.60, 0.57, 1.0),
    metallic=0.02,
    roughness=0.55,
    texture_rel_path=r"[Polished Concrete Old]\Polished Concrete Old.jpg",
    bump_scale=0.025
)

# B. Piedra laja negra / Basamento volcánico de Caracas (muros perimetrales, zócalo, rampas)
mat_slate = make_pbr_material(
    "Caroni_Piedra_Laja_Negra",
    (0.18, 0.17, 0.16, 1.0),
    metallic=0.06,
    roughness=0.72,
    texture_rel_path=r"Revestimiento_oscuro\thumbnail.jpg",
    bump_scale=0.045
)

# C. Madera noble de teca (celosías, louvers, plafones y techos)
mat_wood = make_pbr_material(
    "Caroni_Madera_Teca",
    (0.48, 0.28, 0.14, 1.0),
    metallic=0.04,
    roughness=0.35,
    texture_rel_path=r"[Wood Veneer 01]\Wood 01.jpg",
    bump_scale=0.020
)

# D. Terracota / Acero Corten arquitectónico (paneles de fachada y celosías contrastantes)
mat_terracotta = make_pbr_material(
    "Caroni_Terracota_Corten",
    (0.64, 0.33, 0.20, 1.0),
    metallic=0.12,
    roughness=0.50,
    texture_rel_path=r"Revestimiento_fibrocemento\thumbnail.jpg",
    bump_scale=0.022
)

# E. Vidrio arquitectónico doble cristal piso a techo (alta transparencia y refracción)
mat_glass = make_pbr_material(
    "Caroni_Vidrio_Arquitectonico",
    (0.90, 0.95, 0.98, 0.15),
    metallic=0.08,
    roughness=0.02,
    ior=1.52,
    transmission=0.95,
    alpha=0.15
)

# F. Vidrio templado de barandas de terrazas
mat_glass_balcony = make_pbr_material(
    "Caroni_Vidrio_Barandas",
    (0.82, 0.92, 0.96, 0.28),
    metallic=0.12,
    roughness=0.04,
    ior=1.52,
    transmission=0.90,
    alpha=0.28
)

# G. Perfilería de aluminio negro antracita / obsidiana (marcos, barandas, parteluces)
mat_graphite = make_pbr_material(
    "Caroni_Carbon_Perfiles",
    (0.08, 0.08, 0.08, 1.0),
    metallic=0.88,
    roughness=0.22,
    texture_rel_path=r"Marco_aluminio_antracita\thumbnail.jpg",
    bump_scale=0.010
)

# H. Pisos de terrazas en granito / travertino greige
mat_stone = make_pbr_material(
    "Caroni_Granito_Pisos",
    (0.72, 0.68, 0.62, 1.0),
    metallic=0.04,
    roughness=0.45,
    texture_rel_path=r"Granite Light Gray\Granite 02.jpg",
    bump_scale=0.015
)

# I. Espejo de agua de piscinas privadas (azul turquesa profundo)
mat_water = make_pbr_material(
    "Caroni_Piscina_Agua",
    (0.12, 0.55, 0.72, 0.75),
    metallic=0.10,
    roughness=0.02,
    ior=1.333,
    transmission=0.88,
    alpha=0.75,
    texture_rel_path=r"[Water Light Blue]\Water Light Blue.jpg",
    bump_scale=0.030
)

# J. Vegetación de jardineras y terrazas
mat_plants = make_pbr_material(
    "Caroni_Vegetacion_Jardineras",
    (0.18, 0.32, 0.14, 1.0),
    metallic=0.0,
    roughness=0.65,
    texture_rel_path=r"[Vegetation Blur 02]\Vegetation_Blur5.jpg"
)

# 6. Intelligent Semantic Material Assignment Based on Original Slots & Geometry
print("Applying semantic PBR materials...")
for o in bpy.data.objects:
    if o.type != 'MESH':
        continue
    name_l = o.name.lower()
    
    # Calculate geometric center and bounds
    mw = o.matrix_world
    c = mw @ (0.125 * sum((mathutils.Vector(b) for b in o.bound_box), mathutils.Vector()))
    z = c.z
    
    # Check original material names
    orig_mats = [s.material.name for s in o.material_slots if s.material]
    
    # Check if object is basement / perimeter wall / lower planter (Z < 1.2 or basement names)
    is_basement_slate = (
        any(m in ['Material_0', 'Material_42', 'Material_51'] for m in orig_mats) or
        any(k in name_l for k in ['laja', 'basamento', 'sotano', 'rampa', 'componente#35', 'grupo#35']) or
        (z < 1.2 and any(k in name_l for k in ['muro', 'losa externa', 'diferencia', 'pared']))
    )
    
    is_glass = any(m in ['Material_11', 'Material_18'] for m in orig_mats) or 'vidrio' in name_l or 'glass' in name_l
    is_balcony_glass = ('Material_31' in orig_mats) or ('baranda' in name_l and is_glass)
    is_wood = any(m in ['Material_4', 'Material_3', 'Material_14'] for m in orig_mats) or any(k in name_l for k in ['madera', 'wood', 'celosia', 'louver', 'teca', 'componente#54', 'componente#57'])
    is_dark_frame = any(m in ['Material_30', 'Material_6', 'Material_16', 'Material_38'] for m in orig_mats) or any(k in name_l for k in ['marco', 'perfil', 'mullion', 'reja', 'antracita', 'baranda', 'aluminio'])
    is_terracotta = any(m in ['Material_1', 'Material_2', 'Material_19', 'Material_20'] for m in orig_mats) or any(k in name_l for k in ['terracota', 'corten', 'revestimiento'])
    is_column = any(m in ['Material_5', 'Material_12'] for m in orig_mats) or any(k in name_l for k in ['columna', 'pilar', 'viga', 'machon'])
    is_stone_floor = any(m in ['Material_10', 'Material_15'] for m in orig_mats) or any(k in name_l for k in ['piso', 'terraza', 'huella', 'escalera', 'granito'])
    is_water = any(m in ['Material_17', 'Material_36'] for m in orig_mats) or any(k in name_l for k in ['agua', 'piscina', 'pool'])
    is_plant = any(m in ['Material_32', 'Material_13'] for m in orig_mats) or any(k in name_l for k in ['vegetacion', 'planta', 'jardin', 'grama', 'arbol'])

    if is_water:
        target_mat = mat_water
    elif is_balcony_glass:
        target_mat = mat_glass_balcony
    elif is_glass:
        target_mat = mat_glass
    elif is_dark_frame:
        target_mat = mat_graphite
    elif is_wood:
        target_mat = mat_wood
    elif is_basement_slate:
        target_mat = mat_slate
    elif is_plant:
        target_mat = mat_plants
    elif is_stone_floor:
        target_mat = mat_stone
    elif is_terracotta:
        target_mat = mat_terracotta
    elif is_column:
        target_mat = mat_concrete
    else:
        target_mat = mat_concrete

    if len(o.material_slots) == 0:
        o.data.materials.append(target_mat)
    else:
        for i in range(len(o.material_slots)):
            o.material_slots[i].material = target_mat

# 7. Organize Hierarchy into 8 Units and Structural Core
print("Structuring 8 Units and Core hierarchy...")
unit_groups = {
    'PB_Norte': bpy.data.objects.new('PB_Norte', None),
    'PB_Sur': bpy.data.objects.new('PB_Sur', None),
    'Nivel1_Norte': bpy.data.objects.new('Nivel1_Norte', None),
    'Nivel1_Sur': bpy.data.objects.new('Nivel1_Sur', None),
    'Nivel2_Norte': bpy.data.objects.new('Nivel2_Norte', None),
    'Nivel2_Sur': bpy.data.objects.new('Nivel2_Sur', None),
    'PH_Norte': bpy.data.objects.new('PH_Norte', None),
    'PH_Sur': bpy.data.objects.new('PH_Sur', None),
    'Estructura_Core': bpy.data.objects.new('Estructura_Core', None),
}

for parent in unit_groups.values():
    bpy.context.scene.collection.objects.link(parent)

for o in bpy.data.objects:
    if o.type != 'MESH':
        continue
    c = 0.125 * sum((mathutils.Vector(b) for b in o.bound_box), mathutils.Vector())
    z = c.z
    x = c.x
    
    is_core = False
    name_l = o.name.lower()
    if 'columna' in name_l or ('muro' in name_l and abs(x) < 2.0) or 'nucleo' in name_l or 'sotano' in name_l or z < 1.2:
        is_core = True
        
    if is_core:
        o.parent = unit_groups['Estructura_Core']
    elif z < 6.8:
        o.parent = unit_groups['PB_Norte'] if x < 0 else unit_groups['PB_Sur']
    elif z < 11.2:
        o.parent = unit_groups['Nivel1_Norte'] if x < 0 else unit_groups['Nivel1_Sur']
    elif z < 15.6:
        o.parent = unit_groups['Nivel2_Norte'] if x < 0 else unit_groups['Nivel2_Sur']
    else:
        o.parent = unit_groups['PH_Norte'] if x < 0 else unit_groups['PH_Sur']

# 8. Save Native Master Blend
blend_out = r"public\models\residencias_caroni_master.blend"
print(f"Saving Blender master to {blend_out}...")
bpy.ops.wm.save_as_mainfile(filepath=blend_out)

# 9. Export WebGL Draco GLB with Embedded Textures
glb_out = r"public\models\residencias_caroni_model.glb"
print(f"Exporting optimized WebGL asset to {glb_out}...")
bpy.ops.export_scene.gltf(
    filepath=glb_out,
    export_format='GLB',
    use_selection=False,
    export_apply=True,
    export_yup=True,
    export_texcoords=True,
    export_normals=True,
    export_attributes=True,
    export_materials='EXPORT',
    export_image_format='AUTO',
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=7,
    export_draco_position_quantization=14,
    export_draco_normal_quantization=10,
    export_draco_texcoord_quantization=12
)

# 10. Render Photographic Validation Preview of the Refined Model
print("Rendering photographic validation preview with balanced architectural lighting...")
cam_data = bpy.data.cameras.new("RenderCam")
cam_obj = bpy.data.objects.new("RenderCam", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
bpy.context.scene.camera = cam_obj

cam_obj.location = (-28.0, -38.0, 18.0)
cam_obj.rotation_euler = (math.radians(72), 0, math.radians(-35))

# Caracas Sun - Balanced warm intensity (no blowout)
sun_data = bpy.data.lights.new(name="Sun_Caracas", type='SUN')
sun_data.energy = 2.6
sun_data.color = (1.0, 0.95, 0.88)
sun_obj = bpy.data.objects.new(name="Sun_Caracas", object_data=sun_data)
bpy.context.scene.collection.objects.link(sun_obj)
sun_obj.rotation_euler = (math.radians(45), math.radians(20), math.radians(-30))

# Ambient Fill Sky
if bpy.context.scene.world is None:
    bpy.context.scene.world = bpy.data.worlds.new("World")
bpy.context.scene.world.use_nodes = True
bg_node = bpy.context.scene.world.node_tree.nodes.get('Background')
if not bg_node:
    bg_node = bpy.context.scene.world.node_tree.nodes.new(type='ShaderNodeBackground')
    out_node = bpy.context.scene.world.node_tree.nodes.new(type='ShaderNodeOutputWorld')
    bpy.context.scene.world.node_tree.links.new(bg_node.outputs['Background'], out_node.inputs['Surface'])
bg_node.inputs['Color'].default_value = (0.28, 0.48, 0.75, 1.0)
bg_node.inputs['Strength'].default_value = 0.8

bpy.context.scene.render.engine = 'BLENDER_EEVEE'
bpy.context.scene.render.resolution_x = 1920
bpy.context.scene.render.resolution_y = 1080
bpy.context.scene.render.image_settings.file_format = 'PNG'

render_png = r"C:\Users\Sistemas\.gemini\antigravity\brain\f0708d1f-e346-4591-87ee-da77bfae1525\caroni_photoreal_render.png"
bpy.context.scene.render.filepath = render_png
bpy.ops.render.render(write_still=True)
print(f"Photoreal preview saved to {render_png}")
print("=== COMPLETED PHOTOREALISTIC PIPELINE SUCCESSFULLY ===")
