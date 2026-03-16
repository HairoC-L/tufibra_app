import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import { getStoragePath } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // 'logo' or 'favicon'

    if (!file || !type) {
      return NextResponse.json(
        { error: "Faltan datos requeridos (archivo o tipo)." },
        { status: 400 }
      );
    }

    const storagePath = await getStoragePath();
    const empresaPath = path.join(storagePath, "empresa");
    
    // Asegurar que el directorio de empresa existe
    try {
      await fs.mkdir(empresaPath, { recursive: true });
    } catch (err) {
      console.error("Error al crear el directorio de empresa:", err);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExtension = path.extname(file.name);
    const fileName = `${type}${fileExtension}`;
    const filePath = path.join(empresaPath, fileName);
    const relativePath = `empresa/${fileName}`;

    await fs.writeFile(filePath, buffer);

    const empresa = await prisma.empresa.findFirst();
    if (empresa) {
      const updateData = type === "logo" ? { logo_url: relativePath } : { favicon_url: relativePath };
      await prisma.empresa.update({
        where: { id: empresa.id },
        data: updateData,
      });
    }

    return NextResponse.json({ success: true, fileName: relativePath });
  } catch (error) {
    console.error("Error en /api/uploadEmpresa:", error);
    return NextResponse.json(
      { error: "Error al subir el archivo de empresa." },
      { status: 500 }
    );
  }
}
