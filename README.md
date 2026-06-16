# 🌻 Isometric Farm

เกมฟาร์มมุมมอง Isometric สร้างด้วย **HTML5 Canvas + Vanilla JavaScript**
(ไม่ใช้ framework, ไม่ใช้ Three.js / 3D engine) เน้น **Mobile First** และออกแบบ
โครงสร้างให้ขยายต่อได้ระยะยาว

## วิธีรัน
ต้องเสิร์ฟผ่าน HTTP (เพราะใช้ ES Modules):

```bash
python3 -m http.server 8000
# เปิด http://localhost:8000/index.html
```

## การควบคุม
- **ลากนิ้ว/เมาส์** — เลื่อนกล้อง (Drag Camera)
- **ล้อเมาส์ / Pinch สองนิ้ว** — ซูม (50%–200%)
- **แตะ** — เก็บเกี่ยวพืชที่โตเต็มที่ / เก็บผลผลิตจากสัตว์
- **เลือกไอเทมที่แถบล่าง** — เข้าสู่โหมดวางวัตถุ แล้วแตะไทล์ที่ต้องการ
- **💾 / 🗑️** — บันทึก / รีเซ็ตฟาร์ม (มี Autosave ทุก 30 วินาที)

## โครงสร้างโปรเจกต์
```
assets/            PNG ทั้งหมด (มี placeholder อัตโนมัติเมื่อยังไม่มีไฟล์จริง)
├─ tiles/ buildings/ crops/ animals/ decorations/ ui/
src/
├─ engine/         Config, Game (orchestrator), World, Input, AssetManager, manifest
├─ camera/         Camera (pan/zoom/boundary, world↔screen)
├─ map/            IsoMap (tile data + occupancy), TileMath (iso math)
├─ renderer/       Renderer (depth sorting + viewport culling)
├─ entities/       Entity ฐาน + Building/Crop/Animal/Decoration + Factory
├─ ui/             UI overlay (toolbar/inventory/toast)
└─ save/           SaveManager (LocalStorage, พร้อมต่อ Cloud Save)
```

## หลักการออกแบบ
- **Tile Data ไม่ใช่ภาพแผนที่ใหญ่** — แผนที่เก็บเป็น array ของชนิดไทล์ ขยายเป็น
  200×200 ได้ราคาถูก
- **Layer แยกชัดเจน** — Ground / Decoration / Building / Animal / Effect
  (กำหนดใน `Config.js`)
- **Depth Sorting อัตโนมัติ** — วัตถุด้านหน้าบังด้านหลังถูกต้อง โดยเรนเดอร์
  เฉพาะส่วนที่อยู่ในจอ (culling) จึงรองรับวัตถุจำนวนมาก
- **Asset แบบ manifest** — เพิ่ม/เปลี่ยนภาพได้โดยแก้แค่ `assets.manifest.js`
  ไม่ต้องแตะ engine; ไฟล์ที่ยังไม่มีจะใช้ placeholder ให้เอง
- **Entity + Factory** — เพิ่มชนิดวัตถุใหม่โดยลงทะเบียนใน `EntityFactory.js`
- **Save แยก backend** — JSON contract เดียวกัน เปลี่ยนเป็น Cloud Save ได้ภายหลัง

## สถานะตามเฟส
- **Phase 1 — Isometric Engine / Camera / Zoom / Map** ✅
- **Phase 2 — ระบบวางวัตถุ / Building / Tile Occupancy** ✅
- **Phase 3 — ปลูกพืช / เติบโต / เก็บเกี่ยว** ✅ (Crop หลายสเตจ)
- **Phase 4 — สัตว์ / บ้าน / คลังสินค้า** ✅ (Animal ผลิตผล + inventory)
- **Phase 5 — UI จริง / Asset จริง / ปรับกราฟิก** 🚧 (วาง PNG จริงใน `assets/`)

> ไฟล์ `Game REV.1.html` เป็นเวอร์ชันเดิมแบบไฟล์เดียว เก็บไว้อ้างอิง
