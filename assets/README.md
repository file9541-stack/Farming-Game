# Assets

วาง PNG จริงในโฟลเดอร์เหล่านี้โดยใช้ "ชื่อไฟล์ตามที่กำหนดใน manifest"
(`src/engine/assets.manifest.js`) แล้วเกมจะใช้ภาพจริงแทน placeholder ทันที
โดยไม่ต้องแก้โค้ด engine

```
tiles/        ground tiles ขนาด 128x64 (รูปทรงข้าวหลามตัด)
buildings/    อาคาร เช่น house.png, barn.png, silo.png
crops/        พืชแต่ละสเตจ seed.png, grow.png, ready.png
animals/      สัตว์ chicken.png, cow.png
decorations/  ของตกแต่ง tree.png, rock.png
ui/           ไอคอน/ปุ่ม UI (อนาคต)
```

## กติกาขนาดภาพ
- Tile: กว้าง 128, สูง 64 (diamond เต็มกรอบ)
- Object (อาคาร/ต้นไม้): กว้าง 128, สูงได้ตามต้องการ — ฐานภาพจะถูกจัดให้
  วางบนกึ่งกลางไทล์ด้านหน้าโดยอัตโนมัติ
- รองรับ Sprite Sheet ในอนาคต: เพิ่ม metadata ใน manifest แล้วต่อยอด
  AssetManager ได้โดยไม่กระทบส่วนอื่น

## หากไฟล์ยังไม่มี
AssetManager จะวาด placeholder ให้อัตโนมัติตามขนาด/ชนิดที่ระบุใน manifest
จึงพัฒนาเกมต่อได้ทันทีโดยไม่ต้องรอ asset จริง
