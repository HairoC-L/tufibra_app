import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { getStoragePath } from "@/lib/config";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const storagePath = await getStoragePath();
    const filePath = path.join(storagePath, "empresa", ...pathSegments);

    // Verificar si el archivo existe
    try {
      await fs.access(filePath);
    } catch {
      return new NextResponse("Archivo no encontrado", { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);
    
    // Determinar el Content-Type básico
    const filename = pathSegments[pathSegments.length - 1];
    const ext = path.extname(filename).toLowerCase();
    let contentType = "image/jpeg";
    if (ext === ".png") contentType = "image/png";
    if (ext === ".gif") contentType = "image/gif";
    if (ext === ".webp") contentType = "image/webp";
    if (ext === ".svg") contentType = "image/svg+xml";
    if (ext === ".ico") contentType = "image/x-icon";

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error en /api/media/empresa:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}
