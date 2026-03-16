import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const empresa = await prisma.empresa.findFirst();
    return NextResponse.json(empresa || {});
  } catch (error) {
    console.error("Error fetching empresa:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, nombre, ruc, direccion, celular, frase, logo_url, favicon_url } = body;

    let empresa;

    if (id) {
      empresa = await prisma.empresa.update({
        where: { id },
        data: {
          nombre,
          ruc,
          direccion,
          celular,
          frase,
          ...(logo_url !== undefined && { logo_url }),
          ...(favicon_url !== undefined && { favicon_url }),
        },
      });
    } else {
      // Create if it doesn't exist
      const existing = await prisma.empresa.findFirst();
      if (existing) {
        empresa = await prisma.empresa.update({
          where: { id: existing.id },
          data: {
            nombre,
            ruc,
            direccion,
            celular,
            frase,
            ...(logo_url !== undefined && { logo_url }),
            ...(favicon_url !== undefined && { favicon_url }),
          },
        });
      } else {
        empresa = await prisma.empresa.create({
          data: {
            nombre,
            ruc,
            direccion,
            celular,
            frase,
            logo_url,
            favicon_url,
          },
        });
      }
    }

    return NextResponse.json(empresa);
  } catch (error) {
    console.error("Error updating empresa:", error);
    return NextResponse.json(
      { error: "Error al actualizar la configuración de la empresa" },
      { status: 500 }
    );
  }
}
