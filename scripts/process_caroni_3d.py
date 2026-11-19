import bpy
import mathutils
import math
import os

print("=== STARTING RESIDENCIAS CARONI BLENDER PIPELINE ===")

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

# 5. Create High-End Architectural PBR Materials
tex_base = os.path.abspath(r"public\models\skp_extracted\materials")

def make_pbr_material(name, color_rgba, metallic=0.0, roughness=0.5, ior=1.5, transmission=0.0, alpha=1.0, texture_rel_path=None):
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
            except Exception as e:
                print(f"Could not load texture {full_tex_path}: {e}")
                
    links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])
    return mat

print("Creating PBR materials...")
mat_concrete = make_pbr_material(
    "Caroni_Concreto_Visto",
    (0.92, 0.90, 0.86, 1.0), # #EBE6DD warm limestone / off-white concrete
    metallic=0.02,
    roughness=0.48,
    texture_rel_path=r"[Polished Concrete New]\Polished Concrete New.jpg"
)

mat_wood = make_pbr_material(
    "Caroni_Madera_Teca",
    (0.55, 0.39, 0.22, 1.0), # #8C6338 cured rich teak/walnut
    metallic=0.04,
    roughness=0.35,
    texture_rel_path=r"[Wood Veneer 01]\Wood 01.jpg"
)

mat_glass = make_pbr_material(
    "Caroni_Vidrio_Arquitectonico",
    (0.93, 0.97, 0.98, 0.30), # crystal clear double glazing with subtle sky tint
    metallic=0.1,
    roughness=0.03,
    ior=1.52,
    transmission=0.92,
    alpha=0.30
)

mat_bronze = make_pbr_material(
    "Caroni_Bronce_Anodizado",
    (0.55, 0.45, 0.32, 1.0), # #8C7452 institutional luxury bronze accent
    metallic=0.85,
    roughness=0.28
)

mat_graphite = make_pbr_material(
    "Caroni_Carbon_Perfiles",
    (0.11, 0.09, 0.07, 1.0), # #1B1813 institutional obsidian
    metallic=0.75,
    roughness=0.35
)

mat_stone = make_pbr_material(
    "Caroni_Granito_Pisos",
    (0.85, 0.82, 0.77, 1.0), # travertine greige floor paving
    metallic=0.05,
    roughness=0.55,
    texture_rel_path=r"Granite Light Gray\Granite 02.jpg"
)

mat_plants = make_pbr_material(
    "Caroni_Vegetacion_Jardineras",
    (0.18, 0.26, 0.16, 1.0),
    metallic=0.0,
    roughness=0.70,
    texture_rel_path=r"[Vegetation Blur 02]\Vegetation_Blur5.jpg"
)

# 6. Reassign Materials on Building Meshes
print("Assigning refined PBR materials to meshes based on architectural type...")
for o in bpy.data.objects:
    if o.type != 'MESH':
        continue
    name_l = o.name.lower()
    
    # Analyze existing materials on object
    has_glass_mat = False
    has_wood_mat = False
    has_dark_mat = False
    has_plant_mat = False
    
    for slot in o.material_slots:
        if slot.material:
            m_name = slot.material.name
            # Check slot by index numbers identified earlier:
            # Mat 11, 18, 31, 34 are glass
            # Mat 3, 4, 10, 15 are wood
            # Mat 6, 16, 30, 51 are dark metal
            # Mat 13, 32 are plants
            if any(k in m_name for k in ['11', '18', '31', '34']) or 'vidrio' in m_name or 'glass' in m_name:
                has_glass_mat = True
            elif any(k in m_name for k in ['_3', '_4', '10', '15']) or 'wood' in m_name or 'madera' in m_name:
                has_wood_mat = True
            elif any(k in m_name for k in ['_6', '16', '30', '51']) or 'metal' in m_name or 'frame' in m_name:
                has_dark_mat = True
            elif any(k in m_name for k in ['13', '32']) or 'veg' in m_name or 'planta' in m_name:
                has_plant_mat = True
                
    # Reassign based on geometry name and detected material
    target_mat = mat_concrete
    if 'vidrio' in name_l or 'glass' in name_l or has_glass_mat:
        target_mat = mat_glass
    elif 'celosia' in name_l or 'louver' in name_l or 'madera' in name_l or 'wood' in name_l or has_wood_mat:
        target_mat = mat_wood
    elif 'perfil' in name_l or 'marco' in name_l or 'baranda' in name_l or 'columna' in name_l or has_dark_mat:
        target_mat = mat_bronze
    elif 'piso' in name_l or 'losa' in name_l or 'terreno' in name_l:
        target_mat = mat_stone
    elif 'jardin' in name_l or 'planta' in name_l or has_plant_mat:
        target_mat = mat_plants
    else:
        target_mat = mat_concrete
        
    # Apply target material to all slots
    if len(o.material_slots) == 0:
        o.data.materials.append(target_mat)
    else:
        for i in range(len(o.material_slots)):
            o.material_slots[i].material = target_mat

# 7. Organize Scene into Named Residential Units & Structural Core
print("Organizing hierarchy into 8 exclusive units and core...")
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
    
    # Classify by floor Z elevation and East/West (X) orientation
    is_core = False
    name_l = o.name.lower()
    if 'columna' in name_l or 'muro' in name_l and abs(x) < 2.0:
        is_core = True
        
    if is_core:
        o.parent = unit_groups['Estructura_Core']
    elif z < 6.8:
        o.parent = unit_groups['PB_Norte'] if x < 0 else unit_groups['PB_Sur']
    elif z < 14.0:
        o.parent = unit_groups['Nivel1_Norte'] if x < 0 else unit_groups['Nivel1_Sur']
    elif z < 21.2:
        o.parent = unit_groups['Nivel2_Norte'] if x < 0 else unit_groups['Nivel2_Sur']
    else:
        o.parent = unit_groups['PH_Norte'] if x < 0 else unit_groups['PH_Sur']

# 8. Save Blender .blend master file
blend_out = os.path.abspath(r"public\models\residencias_caroni_master.blend")
print(f"Saving Blender master file: {blend_out}")
bpy.ops.wm.save_as_mainfile(filepath=blend_out)

# 9. Export WebGL Draco-compressed GLB
glb_out = os.path.abspath(r"public\models\residencias_caroni_model.glb")
print(f"Exporting optimized WebGL GLB: {glb_out}")
bpy.ops.export_scene.gltf(
    filepath=glb_out,
    export_format='GLB',
    use_selection=False,
    export_apply=True,
    export_yup=True,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=7,
    export_materials='EXPORT',
    export_attributes=True,
    export_extras=True
)

print(f"GLB export finished! Size: {os.path.getsize(glb_out)} bytes")

# 10. Render high-res architectural showcase images
cam_data = bpy.data.cameras.new('Showcase_Cam')
cam_data.lens = 45
cam_obj = bpy.data.objects.new('Showcase_Cam', cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
bpy.context.scene.camera = cam_obj

# Camera 1: Front perspective (Terraces & Louvers)
cam_obj.location = (25, -35, 18)
direction = mathutils.Vector((0, 0, 10)) - cam_obj.location
cam_obj.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()

light_data = bpy.data.lights.new('Sun', type='SUN')
light_data.energy = 4.5
light_obj = bpy.data.objects.new('Sun', light_data)
bpy.context.scene.collection.objects.link(light_obj)
light_obj.rotation_euler = (math.radians(45), math.radians(25), math.radians(60))

scene = bpy.context.scene
scene.render.resolution_x = 1200
scene.render.resolution_y = 900
render_out = os.path.abspath(r"C:\Users\Sistemas\.gemini\antigravity\brain\f0708d1f-e346-4591-87ee-da77bfae1525\caroni_showcase_pbr.png")
scene.render.filepath = render_out

print("Rendering showcase image...")
bpy.ops.render.render(write_still=True)
print(f"Render saved to: {render_out}")
print("=== PIPELINE EXECUTION FINISHED SUCCESSFULLY ===")
