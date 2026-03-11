import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import { getStoragePath } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const cli_id = formData.get("cli_id") as string;

    if (!file || !cli_id) {
      return NextResponse.json(
        { error: "Faltan datos requeridos (archivo o ID de cliente)." },
        { status: 400 }
      );
    }

    const storagePath = await getStoragePath();
    const clientPath = path.join(storagePath, cli_id);
    
    // Asegurar que el directorio del cliente existe
    try {
      await fs.mkdir(clientPath, { recursive: true });
    } catch (err) {
      console.error("Error al crear el directorio del cliente:", err);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExtension = path.extname(file.name);
    const fileName = `fachada${fileExtension}`;
    const filePath = path.join(clientPath, fileName);
    const relativePath = `${cli_id}/${fileName}`;

    await fs.writeFile(filePath, buffer);

    // Actualizar el cliente en la base de datos (mantenemos cli_foto por compatibilidad)
    await prisma.cliente.update({
      where: { cli_id },
      data: { 
        cli_foto_fachada: relativePath 
      },
    });

    return NextResponse.json({ success: true, fileName: relativePath });
  } catch (error) {
    console.error("Error en /api/upload:", error);
    return NextResponse.json(
      { error: "Error al subir el archivo." },
      { status: 500 }
    );
  }
}
