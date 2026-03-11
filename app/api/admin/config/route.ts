import { NextRequest, NextResponse } from "next/server";
import { getConfig, saveConfig } from "@/lib/config";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const config = await getConfig();
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener la configuración" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { storagePath } = await req.json();
    
    if (!storagePath) {
      return NextResponse.json({ error: "La ruta de almacenamiento es requerida" }, { status: 400 });
    }

    // 1. Validar/Crear directorio
    try {
      await fs.mkdir(storagePath, { recursive: true });
    } catch (err: any) {
      return NextResponse.json({ 
        error: `No se pudo crear o acceder a la ruta: ${err.message}` 
      }, { status: 400 });
    }

    // 2. Validar permisos de escritura con un archivo temporal
    const testFile = path.join(storagePath, `.write_test_${Date.now()}`);
    try {
      await fs.writeFile(testFile, "test");
      await fs.unlink(testFile);
    } catch (err: any) {
      return NextResponse.json({ 
        error: "La ruta existe pero el servidor no tiene permisos de escritura." 
      }, { status: 400 });
    }

    await saveConfig({ storagePath });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en config API:", error);
    return NextResponse.json({ error: "Error interno al guardar la configuración" }, { status: 500 });
  }
}
