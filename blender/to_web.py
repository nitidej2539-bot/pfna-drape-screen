# แปลงภาพเรนเดอร์เป็นเฟรมเว็บ: python blender/to_web.py FINAL_DIR public/pole3  (เฟรมที่ยังไม่มีใช้เฟรมก่อนหน้า)
import sys, os
from PIL import Image
fin, out = sys.argv[1:3]
os.makedirs(out, exist_ok=True); n = 0; last = None
for i in range(192):
    a = os.path.join(fin, f'{i+1:04d}.png')
    if os.path.exists(a) and os.path.getsize(a) > 50000: last = a; n += 1
    Image.open(last).convert('RGB').save(os.path.join(out, f'f{i:04d}.webp'), quality=76, method=5)
print('full', n, 'of 192')
