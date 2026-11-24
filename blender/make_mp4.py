# รวมภาพเป็น MP4: blender -b -P blender/make_mp4.py -- FRAMES_DIR OUT.mp4
import bpy, sys, os
d, out = sys.argv[sys.argv.index('--') + 1:]
L = sorted(f for f in os.listdir(d) if f.endswith('.png'))
s = bpy.context.scene; s.sequence_editor_create()
st = s.sequence_editor.sequences.new_image('f', os.path.join(d, L[0]), 1, 1)
for f in L[1:]: st.elements.append(f)
st.frame_final_duration = len(L)
s.frame_start, s.frame_end = 1, len(L)
im = bpy.data.images.load(os.path.join(d, L[0]))
r = s.render; r.resolution_x, r.resolution_y, r.resolution_percentage = im.size[0], im.size[1], 100
r.fps = 24; r.image_settings.file_format = 'FFMPEG'
r.ffmpeg.format = 'MPEG4'; r.ffmpeg.codec = 'H264'; r.ffmpeg.constant_rate_factor = 'HIGH'
s.view_settings.view_transform = 'Standard'
r.filepath = os.path.abspath(out)
bpy.ops.render.render(animation=True)
