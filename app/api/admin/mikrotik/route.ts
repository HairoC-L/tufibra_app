import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { encrypt, decrypt } from "@/lib/encryption";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const config = await prisma.mikrotik_config.findFirst();
    if (!config) return NextResponse.json({});
    
    // Mask password for security
    const { password, ...safeConfig } = config;
    return NextResponse.json({ ...safeConfig, hasPassword: !!password });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener la configuración de Mikrotik" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { ip, port, usuario, password } = await req.json();

    if (!ip || !usuario) {
      return NextResponse.json({ error: "IP y usuario son requeridos" }, { status: 400 });
    }

    const encryptedPassword = password ? encrypt(password) : undefined;

    const existingConfig = await prisma.mikrotik_config.findFirst();

    if (existingConfig) {
      await prisma.mikrotik_config.update({
        where: { id: existingConfig.id },
        data: {
          ip,
          port: Number(port) || 8728,
          usuario,
          ...(encryptedPassword && { password: encryptedPassword }),
        },
      });
    } else {
      await prisma.mikrotik_config.create({
        data: {
          ip,
          port: Number(port) || 8728,
          usuario,
          password: encryptedPassword || "",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving Mikrotik config:", error);
    return NextResponse.json({ error: "Error al guardar la configuración" }, { status: 500 });
  }
}
