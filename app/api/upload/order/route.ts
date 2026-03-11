import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import { getStoragePath } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const ord_id = formData.get("ord_id") as string;
    const photo_type = formData.get("photo_type") as string; // 'nap', 'ont', 'dni'

    if (!file || !ord_id || !photo_type) {
      return NextResponse.json(
        { error: "Faltan datos requeridos (archivo, ID de orden o tipo de foto)." },
        { status: 400 }
      );
    }

    // 1. Obtener el cli_id a través de la orden -> contrato -> cliente
    const order = await prisma.orden_trabajo.findUnique({
      where: { ord_id: BigInt(ord_id) },
      include: {
        contrato: {
          select: { id_cli: true }
        }
      }
    });

    const cli_id = order?.contrato?.id_cli;
    if (!cli_id) {
      return NextResponse.json({ error: "No se encontró el cliente asociado a esta orden." }, { status: 404 });
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
    // Nombre de archivo descriptivo incluyendo la orden
    const fileName = `${photo_type}_ord_${ord_id}${fileExtension}`;
    const filePath = path.join(clientPath, fileName);
    const relativePath = `${cli_id}/${fileName}`;

    await fs.writeFile(filePath, buffer);

    // 2. Actualizar el modelo cliente con las nuevas columnas
    const clienteUpdateData: any = {};
    if (photo_type === "nap") clienteUpdateData.cli_foto_nap = relativePath;
    else if (photo_type === "ont") clienteUpdateData.cli_foto_ont = relativePath;
    else if (photo_type === "dni") clienteUpdateData.cli_foto_dni = relativePath;
    else if (photo_type === "fachada") clienteUpdateData.cli_foto_fachada = relativePath;

    await prisma.cliente.update({
      where: { cli_id: cli_id },
      data: clienteUpdateData,
    });


    return NextResponse.json({ success: true, fileName, relativePath });
  } catch (error) {
    console.error("Error en /api/upload/order:", error);
    return NextResponse.json(
      { error: "Error al subir el archivo." },
      { status: 500 }
    );
  }
}
