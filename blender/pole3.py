# ฉากเรนเดอร์ "เสา 3 ประกอบตัวแล้วสอดห่วงหัวเสา 1 และ 2"
# ใช้: blender -b -P blender/pole3.py -- OUT_DIR frames=1,100,192 res=100 spp=64   (frames=all = ทั้งช็อต)
import bpy, sys, math, os, time
from mathutils import Vector

args = sys.argv[sys.argv.index('--') + 1:]
OUT = args[0]
opt = dict(a.split('=') for a in args[1:])
END = 192
BG = opt.get('bg', 'spot')  # spot = ห้องขาว ไฟห้องหรี่ลงแล้วสปอตไลต์ส่องอุปกรณ์, light = ห้องขาวเทาเรียบ, dark = เทาน้ำเงินเข้มแบบสตูดิโอ
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
PI = math.pi

# ---------- วัสดุ ----------
def mat(name, color, metal=0.0, rough=0.5, noise=0.0, bump=0.0, scale=30.0, stretch=None, emit=0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    n, l = m.node_tree.nodes, m.node_tree.links
    b = n['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Metallic'].default_value = metal
    b.inputs['Roughness'].default_value = rough
    if emit:
        b.inputs['Emission Color'].default_value = (*color, 1)
        b.inputs['Emission Strength'].default_value = emit
    if noise or bump:
        tc = n.new('ShaderNodeTexCoord'); mp = n.new('ShaderNodeMapping')
        mp.inputs['Scale'].default_value = stretch or (1, 1, 1)
        nz = n.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = scale; nz.inputs['Detail'].default_value = 6
        l.new(tc.outputs['Object'], mp.inputs[0]); l.new(mp.outputs[0], nz.inputs['Vector'])
        if noise:
            r = n.new('ShaderNodeMapRange')
            r.inputs['To Min'].default_value = max(0.02, rough - noise); r.inputs['To Max'].default_value = rough + noise
            l.new(nz.outputs['Fac'], r.inputs['Value']); l.new(r.outputs[0], b.inputs['Roughness'])
        if bump:
            bp = n.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump; bp.inputs['Distance'].default_value = 0.002
            l.new(nz.outputs['Fac'], bp.inputs['Height']); l.new(bp.outputs[0], b.inputs['Normal'])
    return m

STEEL = mat('steel', (.74, .735, .72), 1, .13, .07, 0.02, 9)
HANDLE = mat('handle', (.72, .715, .70), 1, .2, .08, .12, 60)
WELD = mat('weld', (.52, .5, .47), 1, .32, .12, .6, 260)
THREAD = mat('thread', (.42, .40, .38), 1, .3)
CART = mat('cart', (.6, .61, .61), 1, .34, .08, .05, 40, (1, 1, 22))
GEAR = mat('gear', (.5, .51, .52), 1, .24, .06, .05, 120)
CAP = mat('cap', (.70, .70, .68), 0, .42, 0, .02, 90)
BLUE = mat('blue', (.012, .035, .30), 0, .33)
RUBBER = mat('rubber', (.02, .02, .022), 0, .6)
LABEL = mat('label', (.9, .9, .87), 0, .6)
INK = mat('ink', (.012, .012, .015), 0, .5)
MARK = mat('mark', (.03, .42, .33), 0, .5)
WALL = mat('wall', (.50, .53, .545) if BG != 'dark' else (.045, .062, .075), 0, .55, .05, .015, 6)
SEAM = mat('seam', (.42, .445, .455) if BG != 'dark' else (.03, .043, .052), 0, .6)
MINT = mat('mint', (.36, .68, .54), 0, .4)
CEIL = mat('ceil', (.80, .82, .83) if BG != 'dark' else (.06, .075, .085), 0, .7)

# พื้นไวนิลลายจุด
FLOOR = mat('floor', (.62, .63, .62), 0, .22)
n, l = FLOOR.node_tree.nodes, FLOOR.node_tree.links
tc = n.new('ShaderNodeTexCoord'); vo = n.new('ShaderNodeTexVoronoi'); vo.inputs['Scale'].default_value = 130
wn = n.new('ShaderNodeSeparateColor'); rp = n.new('ShaderNodeValToRGB')
rp.color_ramp.elements[0].color = (.30, .315, .325, 1) if BG != 'dark' else (.03, .04, .048, 1); rp.color_ramp.elements[1].color = (.46, .475, .485, 1) if BG != 'dark' else (.06, .075, .085, 1)
rp.color_ramp.elements[0].position = .0; rp.color_ramp.elements[1].position = .55
l.new(tc.outputs['Object'], vo.inputs['Vector']); l.new(vo.outputs['Color'], wn.inputs[0]); l.new(wn.outputs[0], rp.inputs[0])
l.new(rp.outputs[0], n['Principled BSDF'].inputs['Base Color'])

# ---------- เครื่องมือปั้น ----------
def link(o, m=None, parent=None, smooth=True):
    sc.collection.objects.link(o)
    if m: o.data.materials.append(m)
    if smooth and o.type == 'MESH':
        for p in o.data.polygons: p.use_smooth = True
        md = o.modifiers.new('es', 'EDGE_SPLIT'); md.split_angle = math.radians(40)
    if parent: o.parent = parent
    return o

def empty(name, loc=(0, 0, 0), parent=None):
    o = bpy.data.objects.new(name, None); sc.collection.objects.link(o); o.location = loc
    if parent: o.parent = parent
    return o

def lathe(profile, m, axis='Z', loc=(0, 0, 0), parent=None, seg=72, closed=False):
    """profile = [(รัศมี, ตำแหน่งตามแกน)] หมุนรอบแกน"""
    vs, fs = [], []
    for r, h in profile:
        for i in range(seg):
            a = 2 * PI * i / seg
            c, s = r * math.cos(a), r * math.sin(a)
            vs.append((c, s, h) if axis == 'Z' else (h, c, s) if axis == 'X' else (s, h, c))
    k = len(profile)
    for j in range(k if closed else k - 1):
        for i in range(seg):
            a0, a1 = j * seg + i, j * seg + (i + 1) % seg
            b0, b1 = ((j + 1) % k) * seg + i, ((j + 1) % k) * seg + (i + 1) % seg
            fs.append((a0, a1, b1, b0))
    me = bpy.data.meshes.new('lathe'); me.from_pydata(vs, [], fs); me.update()
    o = link(bpy.data.objects.new('lathe', me), m, parent); o.location = loc
    return o

def rod(r, a, b, m, axis='Z', loc=(0, 0, 0), parent=None, bev=.0006):
    return lathe([(0, a), (r - bev, a), (r, a + bev), (r, b - bev), (r - bev, b), (0, b)], m, axis, loc, parent)

def tube(ro, ri, a, b, m, axis='Z', loc=(0, 0, 0), parent=None, bev=.0004):
    return lathe([(ri, a + bev), (ri + bev, a), (ro - bev, a), (ro, a + bev), (ro, b - bev), (ro - bev, b), (ri + bev, b), (ri, b - bev)],
                 m, axis, loc, parent, closed=True)

def box(size, loc, m, parent=None, bev=.004, rot=(0, 0, 0)):
    x, y, z = (s / 2 for s in size)
    vs = [(i * x, j * y, k * z) for i in (-1, 1) for j in (-1, 1) for k in (-1, 1)]
    fs = [(0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)]
    me = bpy.data.meshes.new('box'); me.from_pydata(vs, [], fs); me.update()
    o = link(bpy.data.objects.new('box', me), m, parent, smooth=False); o.location = loc; o.rotation_euler = rot
    if bev:
        md = o.modifiers.new('b', 'BEVEL'); md.width = bev; md.segments = 3
    return o

def ball(r, loc, m, parent=None, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=40, ring_count=24)
    o = bpy.context.object; o.data.materials.append(m); o.location = loc; o.scale = scale
    for p in o.data.polygons: p.use_smooth = True
    if parent: o.parent = parent
    return o

def torus(R, r, loc, m, axis='Z', parent=None):
    pr = [(R + r * math.cos(2 * PI * i / 12), r * math.sin(2 * PI * i / 12)) for i in range(12)]
    return lathe(pr, m, axis, loc, parent, closed=True)

FONT = None
for f in ('C:/Windows/Fonts/segoeprb.ttf', 'C:/Windows/Fonts/segoepr.ttf', 'C:/Windows/Fonts/comicbd.ttf'):
    if os.path.exists(f): FONT = bpy.data.fonts.load(f); break

def label(num, r, loc, parent, vertical=True, face=-PI / 2):
    """ป้ายกระดาษขาวพันท่อ + ตัวเลขลายมือโค้งตามผิวท่อ"""
    h = .026
    e = empty('lab', loc, parent)
    ax = 'Z' if vertical else 'X'
    tube(r + .00025, r, -h / 2, h / 2, LABEL, ax, parent=e, bev=.0001)
    cu = bpy.data.curves.new('t', 'FONT'); cu.body = num; cu.size = .024; cu.align_x = 'CENTER'; cu.align_y = 'CENTER'
    if FONT: cu.font = FONT
    cu.resolution_u = 8; cu.fill_mode = 'FRONT'
    t = bpy.data.objects.new('t', cu); sc.collection.objects.link(t)
    me = bpy.data.meshes.new_from_object(t); bpy.data.objects.remove(t)
    import bmesh
    bm = bmesh.new(); bm.from_mesh(me)
    for _ in range(2):
        bmesh.ops.subdivide_edges(bm, edges=[g for g in bm.edges if g.calc_length() > .002], cuts=1)
    cx = (min(v.co.x for v in bm.verts) + max(v.co.x for v in bm.verts)) / 2
    cy = (min(v.co.y for v in bm.verts) + max(v.co.y for v in bm.verts)) / 2
    R = r + .0004
    for v in bm.verts:
        u, w = v.co.x - cx, v.co.y - cy
        if vertical:
            a = face + u / R
            v.co = (R * math.cos(a), R * math.sin(a), w)
        else:
            a = face - w / R  # แกน X: เลขอ่านจากด้านหน้า
            v.co = (u, R * math.cos(a), R * math.sin(a))
    bm.to_mesh(me); bm.free()
    link(bpy.data.objects.new('num', me), INK, e, smooth=False)

# ---------- หัวเสา ----------
def head(parent, z, ri, seed, hand_rot):
    """ห่วงเชื่อมตัว T: แกนห่วงตามแกน X, คอดกลาง, ผนังบาง"""
    e = empty('head', (0, 0, z), parent)
    L = .041
    prof = [(ri * (1 + .10 * (i / 8) ** 2 if False else 1) + .0026 * (i / 8) ** 2, L * i / 8) for i in range(-8, 9)]
    th = .0018
    ring = [(r + th, h) for r, h in prof] + [(r, h) for r, h in reversed(prof)]
    o = lathe(ring, STEEL, 'X', parent=e, closed=True, seg=96)
    ro = ri + th
    # รอยเชื่อมโคนห่วง
    w = torus(.0098, .0034, (0, 0, -ro - .0005), WELD, 'Z', e); w.scale = (1.15, 1, 1)
    tx = bpy.data.textures.new('w%d' % seed, 'CLOUDS'); tx.noise_scale = .006
    md = w.modifiers.new('d', 'DISPLACE'); md.texture = tx; md.strength = .0026; md.texture_coords = 'OBJECT'
    for i in range(9):
        a = i * 2 * PI / 9 + seed
        ball(.0028, (.0112 * math.cos(a), .0098 * math.sin(a), -ro + .0012 * math.sin(a * 3)), WELD, e, (1.2, 1, .8))
    # น็อตหกเหลี่ยม + สกรูเกลียว + มือหมุน
    lathe([(0, ro - .002), (.0088, ro - .002), (.0098, ro + .001), (.0098, ro + .008), (.0086, ro + .010), (0, ro + .010)], WELD, 'Z', parent=e, seg=6)
    s = empty('screw', (0, 0, ro + .010), e); s.rotation_euler[2] = hand_rot
    top = .034
    pr = []
    k = 0
    z0 = -.012
    while z0 < top:
        pr.append((.0034 if k % 2 else .0042, z0)); z0 += .0009; k += 1
    lathe([(0, -.012)] + pr + [(0, top)], THREAD, 'Z', parent=s, seg=40)
    ball(.0088, (0, 0, top + .003), WELD, s, (1, 1, .9))
    # มือหมุนแบน ปลายมน เอียงเล็กน้อยแบบงานทำมือ
    hb = empty('hb', (0, 0, top + .009), s); hb.rotation_euler = (0, .035, 0)
    Lh = .068; r = .0098
    pf = [(0, -Lh)] + [(r * math.sin(i / 6 * PI / 2), -Lh + r * (1 - math.cos(i / 6 * PI / 2))) for i in range(1, 7)]
    pf += [(r * .97, -Lh * .4), (r * 1.02, 0), (r * .97, Lh * .4)]
    pf += [(a, -b) for a, b in reversed(pf[:7])]
    hd = lathe(pf, HANDLE, 'X', parent=hb, seg=48); hd.scale = (1, .62, 1)
    return e, ro

# ---------- รถเข็น ----------
W, D, TZ = .86, .52, .22
cart = empty('cart')
box((W, D, .012), (0, 0, TZ), CART, cart, .002)
for y in (-1, 1): box((W, .008, .085), (0, y * D / 2, TZ + .037), CART, cart, .002)
for x in (-1, 1): box((.008, D, .085), (x * W / 2, 0, TZ + .037), CART, cart, .002)
box((W - .04, D - .04, .03), (0, 0, TZ - .02), CART, cart, .003)
for x in (-1, 1):
    for y in (-1, 1):
        px, py = x * (W / 2 - .07), y * (D / 2 - .07)
        rod(.009, .12, TZ - .03, CART, loc=(px, py, 0), parent=cart)
        box((.045, .06, .045), (px, py + .012, .115), RUBBER, cart, .012)
        for dx in (-.017, .017):
            rod(.055, -.011, .011, RUBBER, 'X', (px + dx, py + .03, .055), cart, .006)
            rod(.026, -.0125, .0125, mat('hub', (.3, .3, .3), .3, .4), 'X', (px + dx, py + .03, .055), cart, .002)
# โครงตั้ง + คานคู่
RZ = .80
for x in (-1, 1):
    box((.0384, .0384, RZ - TZ + .022), (x * (W / 2 - .05), .02, (RZ + TZ + .022) / 2), CART, cart, .003)
box((W - .136, .038, .038), (0, .02, RZ), CART, cart, .004)
box((W - .10, .022, .022), (0, -.01, RZ - .10), CART, cart, .003)
# มือจับขวา
hx = W / 2 - .05
rod(.0125, RZ, RZ + .30, CART, loc=(hx, .02, 0), parent=cart)
rod(.0135, -.19, .15, CART, 'Y', (hx, .02, RZ + .30), cart, .004)
# แขนเสริมซ้าย (มือหมุน)
box((.5, .016, .024), (-.12, .055, RZ + .13), CART, cart, .003)
rod(.013, RZ, RZ + .17, CART, loc=(-hx, .02, 0), parent=cart)
box((.15, .02, .012), (-hx - .05, .02, RZ + .18), CART, cart, .005)

def clamp(x, y, z, parent, knob_x=-.0):
    e = empty('clamp', (x, y, z), parent)
    tube(.017, .0098, -.024, .024, CART, parent=e, bev=.001)
    box((.034, .05, .04), (0, .036, 0), CART, e, .004)
    rod(.006, -.045, -.015, THREAD, 'Y', parent=e)
    k = empty('k', (0, -.056, 0), e)
    rod(.017, -.013, .012, BLUE, 'Y', parent=k, bev=.004)
    for i in range(5):
        a = i * 2 * PI / 5 + .3
        rod(.0085, -.012, .010, BLUE, 'Y', (.0165 * math.cos(a), 0, .0165 * math.sin(a)), k, .004)
PY = -.035
PX = .20
for x in (-PX, 0, PX): clamp(x, PY, RZ - .005, cart)

# ---------- เสา 1, 2 ----------
HZ = 2.08
FACE = math.radians(-58)
RI = {1: .0165, 2: .0150}
for k, x in ((1, -PX), (2, PX)):
    p = empty('pole%d' % k, (x, PY, 0), cart)
    e, ro = head(p, HZ, RI[k], k, .35 if k == 1 else 1.25)
    rod(.0095, TZ + .008, HZ - ro + .001, STEEL, parent=p)
    label(str(k), .0095, (0, 0, HZ - .105), p, True, FACE)
    tube(.0098, .0095, RZ + .07, RZ + .083, MARK, parent=p, bev=.0001)

# ---------- เสา 3 แยกชิ้น (แกน X) ----------
P3 = empty('pole3', (0, PY, HZ))
outer, gear, inner, cap = (empty(nm, (0, 0, 0), P3) for nm in ('outer', 'gear', 'inner', 'cap'))
OR, OI, IR = .0133, .0122, .0095   # ท่อนอก 1 นิ้ว, ท่อเลื่อน 6 หุน
XO = -PX + .075                    # ปลายขวาของท่อนอกเมื่อเสร็จ (พ้นห่วง 1)
XI = PX + .085                     # ปลายขวาของท่อเลื่อน
tube(OR, OI, XO - .80, XO, STEEL, 'X', parent=outer)
tube(OR + .0012, OI, XO - .80 - .03, XO - .80 + .03, CAP, 'X', parent=outer, bev=.002)
tube(IR, IR - .0012, XI - .55, XI, STEEL, 'X', parent=inner)
label('3', IR, (XI - .055, 0, 0), inner, False, PI - .18)
# ปลอกขาวสองชั้น ตามภาพจริง
lathe([(0, .045), (.0108, .045), (.0118, .043), (.0120, .012), (.0120, .008), (.0132, .007), (.0134, .005), (.0134, -.021), (.0130, -.022), (IR + .0001, -.022), (IR + .0001, .0)],
      CAP, 'X', (XI, 0, 0), cap)
# เฟืองล็อกกันหมุน: ฟันรอบวง + รูกลาง
def gearmesh():
    T, seg = 24, 8
    ring = []
    for i in range(T):
        for q, rr in ((0, .0106), (.2, .0121), (.5, .0121), (.7, .0106)):
            a = 2 * PI * (i + q) / T; ring.append((rr * math.cos(a), rr * math.sin(a)))
    N = len(ring); ri = IR + .0002
    vs, fs = [], []
    X0, X1 = -.013, .013
    for X, sh in ((X0, .95), (X0 + .0012, 1), (X1 - .0012, 1), (X1, .95)):
        vs += [(X, c * sh, s * sh) for c, s in ring]
    for X in (X1, X0):
        vs += [(X, ri * math.cos(2 * PI * i / N), ri * math.sin(2 * PI * i / N)) for i in range(N)]
    for j in range(6):
        for i in range(N):
            a, b = j * N, ((j + 1) % 6) * N; i2 = (i + 1) % N
            fs.append((a + i, b + i, b + i2, a + i2))
    me = bpy.data.meshes.new('gear'); me.from_pydata(vs, [], fs); me.update()
    o = link(bpy.data.objects.new('gear', me), GEAR, gear)
    o.location = (XO - .0125, 0, 0)
gearmesh()
# ปลอกบ่าหลังเฟือง (ส่วนสวมในท่อนอก)
tube(OI - .0004, IR + .0002, XO - .052, XO - .026, GEAR, 'X', parent=gear, bev=.0006)

# ---------- ห้อง ----------
RX, RY0, RY1, H = 6.0, 2.6, -8.0, 2.95
box((2 * RX, .05, H), (0, RY0, H / 2), WALL, bev=0)
box((2 * RX, .05, H), (0, RY1, H / 2), WALL, bev=0)
for x in (-1, 1): box((.05, RY0 - RY1, H), (x * RX, (RY0 + RY1) / 2, H / 2), WALL, bev=0)
box((2 * RX, RY0 - RY1, .05), (0, (RY0 + RY1) / 2, -.025), FLOOR, bev=0)
box((2 * RX, RY0 - RY1, .05), (0, (RY0 + RY1) / 2, H + .025), CEIL, bev=0)
for i in range(-5, 6):
    box((.006, .004, H), (i * 1.15 + .4, RY0 - .027, H / 2), SEAM, bev=0)
box((2 * RX, .012, .11), (0, RY0 - .03, .055), mat('skirt', (.38, .40, .41) if BG != 'dark' else (.03, .042, .05), 0, .5), bev=.004)
for x in (-1, 1):
    box((.012, RY0 - RY1, .11), (x * (RX - .03), (RY0 + RY1) / 2, .055), mat('skirt2', (.38, .40, .41) if BG != 'dark' else (.03, .042, .05), 0, .5), bev=.004)
# แผง LED ฝ้า
LEDS, GLOWS = [], []
for ix in (-3.4, -1.1, 1.2, 3.5):
    for iy in (1.2, -1.2, -3.6, -6.0):
        box((1.24, .64, .012), (ix, iy, H - .004), mat('frame', (.75, .76, .76), .2, .4), bev=.002)
        ld = bpy.data.lights.new('led', 'AREA'); ld.shape = 'RECTANGLE'; ld.size = 1.14; ld.size_y = .54; ld.energy = 13; ld.color = (.96, .985, 1)
        lo = bpy.data.objects.new('led', ld); sc.collection.objects.link(lo); lo.location = (ix, iy, H - .014); LEDS.append(ld)
        box((1.16, .56, .003), (ix, iy, H - .0115), GLOWS.append(mat('ledglow', (.95, .98, 1), 0, .5, emit=2.4)) or GLOWS[-1], bev=0)
wd = bpy.data.worlds.new('w'); sc.world = wd; wd.use_nodes = True
wd.node_tree.nodes['Background'].inputs[0].default_value = (.6, .68, .70, 1); wd.node_tree.nodes['Background'].inputs[1].default_value = .12 if BG != 'dark' else .06
# ไฟขอบช่วยเน้นผิวท่อ
def softbox(loc, target, sx, sy, e):
    ld = bpy.data.lights.new('sb', 'AREA'); ld.shape = 'RECTANGLE'; ld.size = sx; ld.size_y = sy; ld.energy = e
    o = bpy.data.objects.new('sb', ld); sc.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    o.visible_camera = False
# แผ่นดำนอกภาพ: ให้ผิวสแตนเลสมีเงาสะท้อนเข้ม เห็นรูปทรงชัด (ไม่บังแสงและกล้องมองไม่เห็น)
DARK = mat('flag', (.02, .026, .028), 0, .9)
def flag(size, loc):
    o = box(size, loc, DARK, bev=0)
    o.visible_camera = False; o.visible_shadow = False; o.visible_diffuse = False
flag((.03, 2.2, 2.6), (-3.0, -1.4, 1.5))
flag((.03, 1.8, 2.6), (2.5, -.2, 1.5))
flag((1.0, .03, 2.8), (1.5, -3.2, 1.7))
flag((7.0, .03, .22), (-.5, -2.9, 2.24))
flag((6, .8, .02), (-.6, .65, 1.15))
softbox((2.6, -2.4, 2.5), (0, 0, 1.6), .35, 1.8, 45)
softbox((-2.8, 1.4, 2.4), (0, 0, 1.8), .3, 1.6, 30)
softbox((-.6, -2.2, 2.85), (-.4, 0, 1.6), 2.4, .35, 50 if BG != 'dark' else 90)
if BG != 'light':  # ไฟขอบจากด้านหลัง
    softbox((1.6, 1.9, 2.6), (0, 0, 2.0), .25, 1.6, 60)
    softbox((-1.8, 1.9, 2.6), (-.6, 0, 2.0), .25, 1.6, 60)

# ---------- แอนิเมชัน ----------
K = [  # เฟรม, ตำแหน่งกล้อง, จุดมอง, เลนส์, fstop
    (1, (-.75, -4.3, 1.45), (-.75, 0, 1.22), 33, 5.6),
    (52, (-.25, -1.75, 1.0), (.0, 0, .86), 35, 2.8),
    (88, (-.95, -1.15, 1.95), (-.55, 0, 1.9), 35, 2.8),
    (110, (-1.40, -.36, 2.165), (-1.135, 0, 2.078), 42, 4),
    (122, (-1.38, -.40, 2.17), (-1.16, 0, 2.076), 42, 4),
    (135, (-1.20, -.60, 2.185), (-1.02, 0, 2.074), 36, 4),
    (148, (-.60, -.78, 2.21), (-.42, 0, 2.07), 40, 2.8),
    (168, (.10, -.80, 2.21), (-.05, 0, 2.07), 40, 2.8),
    (187, (.45, -.60, 2.19), (.07, 0, 2.07), 40, 4),
    (END, (.455, -.595, 2.19), (.07, 0, 2.07), 40, 4),
]
def interp(f, get):
    # Catmull-Rom ตามเวลา (ลื่น ไม่สะดุดที่คีย์)
    i = max(0, min(len(K) - 2, next((k for k in range(len(K) - 1) if f <= K[k + 1][0]), len(K) - 2)))
    p = [K[max(0, i - 1)], K[i], K[i + 1], K[min(len(K) - 1, i + 2)]]
    t = (f - p[1][0]) / (p[2][0] - p[1][0]); h = p[2][0] - p[1][0]
    v = [get(q) for q in p]
    def slope(a, b, c, va, vb, vc):
        if c[0] == a[0]: return 0
        d1 = (vb - va) / max(1, b[0] - a[0]); d2 = (vc - vb) / max(1, c[0] - b[0])
        return 0 if d1 * d2 <= 0 else 2 * d1 * d2 / (d1 + d2)
    m1 = 0 if i == 0 else slope(p[0], p[1], p[2], v[0], v[1], v[2])
    m2 = 0 if i == len(K) - 2 else slope(p[1], p[2], p[3], v[1], v[2], v[3])
    t2, t3 = t * t, t * t * t
    return (2 * t3 - 3 * t2 + 1) * v[1] + (t3 - 2 * t2 + t) * h * m1 + (-2 * t3 + 3 * t2) * v[2] + (t3 - t2) * h * m2

# ความเร็วคงที่: END = เวลาอ้างอิงเดิม, N = จำนวนเฟรมจริง — แบ่งให้ทุกเฟรมกล้องเคลื่อน "ระยะที่ตาเห็น" เท่ากัน
N = int(opt.get('n', 240))
def _state(f):
    return (Vector([interp(f, lambda k, q=q: k[1][q]) for q in range(3)]), Vector([interp(f, lambda k, q=q: k[2][q]) for q in range(3)]))
def _step(a, b):
    va, vb = a[1] - a[0], b[1] - b[0]
    return (b[0] - a[0]).length / ((va.length + vb.length) / 2) + va.angle(vb)
_M = 4000
_F = [1 + (END - 1) * k / _M for k in range(_M + 1)]
_S = [_state(f) for f in _F]
_C = [0.0]
for a_, b_ in zip(_S, _S[1:]): _C.append(_C[-1] + _step(a_, b_))
def wf(F):
    import bisect
    g = (F - 1) / (N - 1) * _C[-1]
    k = min(max(bisect.bisect_left(_C, g), 1), _M)
    d = _C[k] - _C[k - 1]
    return _F[k - 1] + (_F[k] - _F[k - 1]) * ((g - _C[k - 1]) / d if d > 1e-12 else 0)

def sm(f, a, b):
    t = min(1, max(0, (f - a) / (b - a))); return t * t * t * (t * (6 * t - 15) + 10)
if BG == 'spot':
    # สปอตไลต์: ลำแสงกรวยนุ่มจากเพดาน ส่องรถเข็น เสา และแนวราว
    SPOTS = []
    def spot(loc, tgt, e, size, blend=.55, rad=.10):
        ld = bpy.data.lights.new('spot', 'SPOT'); ld.spot_size = math.radians(size); ld.spot_blend = blend
        ld.shadow_soft_size = rad; ld.color = (1, .985, .96)
        o = bpy.data.objects.new('spot', ld); sc.collection.objects.link(o); o.location = loc
        o.rotation_euler = (Vector(tgt) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
        SPOTS.append((ld, e)); return o
    spot((.5, -2.1, 2.9), (0, 0, .9), 260, 34)
    spot((-1.0, -2.0, 2.9), (-.75, 0, 2.05), 120, 34)
    spot((.35, -1.5, 2.92), (0, 0, 2.05), 70, 36)
    spot((-.35, 1.5, 2.92), (0, 0, 1.6), 150, 46)
    # แผงไฟยาวให้สแตนเลสมีแถบสะท้อนสว่าง
    softbox((-1.9, -2.3, 1.5), (0, 0, 1.3), .8, 2.4, 70)
    softbox((2.3, -1.6, 1.5), (0, 0, 1.4), .7, 2.4, 70)
    softbox((-.4, -1.6, 2.9), (-.4, 0, 2.05), 3.4, .9, 60)
    # ไฟส่องสินค้าอย่างเดียว ไม่เลอะผนัง (light linking)
    prod = bpy.data.collections.new('prod')
    def under(o):
        while o.parent: o = o.parent
        return o in (cart, P3)
    for o in list(sc.objects):
        if o.type == 'MESH' and under(o): prod.objects.link(o)
    for o in list(sc.objects):
        if o.type == 'LIGHT' and o.name.split('.')[0] in ('sb', 'spot'): o.light_linking.receiver_collection = prod
    # วงแสงบนพื้นและแสงจาง ๆ ที่ผนังหลังอุปกรณ์
    spot((.1, -.2, 2.93), (0, 0, 0), 190, 56, .95, .08)
    spot((-.3, .9, 2.93), (-.3, RY0, 1.7), 75, 80, 1, .25)
    for F in range(1, N + 1):
        f = wf(F)
        dim = 1 - .94 * sm(f, 6, 52)       # ไฟห้องหรี่ลง
        on = sm(f, 24, 58)                  # สปอตไลต์ค่อย ๆ สว่าง
        for ld in LEDS:
            ld.energy = 36 * dim; ld.keyframe_insert('energy', frame=F)
        for m in GLOWS:
            s = m.node_tree.nodes['Principled BSDF'].inputs['Emission Strength']
            s.default_value = 2.4 * (1 - .87 * sm(f, 6, 52)); s.keyframe_insert('default_value', frame=F)
        for ld, e in SPOTS:
            ld.energy = e * on; ld.keyframe_insert('energy', frame=F)
        b = wd.node_tree.nodes['Background'].inputs[1]
        b.default_value = .12 * (1 - .6 * sm(f, 6, 52)); b.keyframe_insert('default_value', frame=F)
SLIDE = XI + .045 - (-PX - .13)          # ระยะถอยให้ปลายปลอกพ้นห่วง 1 ออกมาทางซ้าย
EX = {'cap': .0, 'inner': -.11, 'gear': -.3575, 'outer': -.50}
for F in range(1, N + 1):
    f = wf(F)
    P3.location = (-SLIDE * (1 - sm(f, 148, 187)), PY, HZ)
    cap.location.x = 0
    inner.location.x = EX['inner'] * (1 - sm(f, 124, 148))
    gear.location.x = EX['gear'] + (EX['outer'] - EX['gear']) * 0 if False else 0
    # เฟืองเข้าท่อนอกก่อน แล้วท่อนอก+เฟืองเลื่อนมาสวมท่อเลื่อน
    a, b = sm(f, 108, 130), sm(f, 122, 148)
    outer.location.x = EX['outer'] * (1 - b)
    gear.location.x = (EX['gear'] * (1 - a) + EX['outer'] * a) * (1 - b)
    for o in (P3, cap, inner, gear, outer): o.keyframe_insert('location', frame=F)

cam = bpy.data.cameras.new('cam'); co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
cam.sensor_width = 36
cam.dof.use_dof = True
for F in range(1, N + 1):
    f = wf(F)
    co.location = [interp(f, lambda k, q=q: k[1][q]) for q in range(3)]
    tgt = Vector([interp(f, lambda k, q=q: k[2][q]) for q in range(3)]); tgt.y = PY
    co.rotation_euler = (tgt - co.location).to_track_quat('-Z', 'Y').to_euler()
    cam.lens = interp(f, lambda k: k[3]); cam.dof.aperture_fstop = interp(f, lambda k: k[4])
    cam.dof.focus_distance = (tgt - co.location).length
    co.keyframe_insert('location', frame=F); co.keyframe_insert('rotation_euler', frame=F)
    cam.keyframe_insert('lens', frame=F); cam.dof.keyframe_insert('aperture_fstop', frame=F); cam.dof.keyframe_insert('focus_distance', frame=F)

for act in bpy.data.actions:
    for fc in act.fcurves:
        for kp in fc.keyframe_points: kp.interpolation = 'LINEAR'

# ---------- เรนเดอร์ ----------
sc.frame_start, sc.frame_end = 1, N
r = sc.render
r.engine = 'CYCLES'
r.resolution_x, r.resolution_y, r.resolution_percentage = 1280, 720, int(opt.get('res', 100))
pr = bpy.context.preferences.addons['cycles'].preferences
gpu = False
for t in ('CUDA',):
    try:
        pr.compute_device_type = t; pr.get_devices()
        for d in pr.devices:
            d.use = d.type == t; gpu = gpu or d.use
    except Exception as ex: print('gpu', ex)
c = sc.cycles
c.device = 'GPU' if gpu else 'CPU'
c.samples = int(opt.get('spp', 64)); c.use_adaptive_sampling = True; c.adaptive_threshold = .02
c.use_denoising = True; c.denoiser = 'OPENIMAGEDENOISE'; c.denoising_prefilter = 'ACCURATE'
c.max_bounces = 8; c.diffuse_bounces = 3; c.glossy_bounces = 6; c.sample_clamp_indirect = 4; c.blur_glossy = .5
c.seed = 7; c.use_animated_seed = False
r.use_persistent_data = True
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - High Contrast'
sc.view_settings.exposure = float(opt.get('ev', 0))
r.image_settings.file_format = 'PNG'
os.makedirs(OUT, exist_ok=True)
fr = opt.get('frames', '1')
# เรนเดอร์สลับเฟรมก่อน (ใช้บนเว็บได้เร็ว) แล้วค่อยเติมเฟรมที่เหลือ
L = list(range(1, N + 1, 2)) + [N] + list(range(2, N, 2)) if fr == 'all' else list(range(1, N + 1, 2)) + [N] if fr == 'half' else [int(x) for x in fr.split(',')]
print('DEVICE', c.device)
for f in L:
    p = os.path.join(OUT, f'{f:04d}.png')
    if fr in ('all', 'half') and os.path.exists(p): continue   # ทำต่อจากที่ค้างได้
    sc.frame_set(f); r.filepath = p; t0 = time.time()
    bpy.ops.render.render(write_still=True)
    print('FRAME', f, round(time.time() - t0, 1), flush=True)
