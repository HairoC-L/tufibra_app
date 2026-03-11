import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { decrypt } from "@/lib/encryption";
import { testMikrotikConnection } from "@/lib/mikrotik";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { ip, port, usuario, password } = await req.json();

    let finalPassword = password;
    
    // If no password provided in request, try fetching from DB
    if (!password) {
      const config = await prisma.mikrotik_config.findFirst();
      if (config && config.password) {
        finalPassword = decrypt(config.password);
      }
    }

    if (!ip || !usuario || !finalPassword) {
      return NextResponse.json({ error: "Datos incompletos para la prueba" }, { status: 400 });
    }

    const isConnected = await testMikrotikConnection({
      host: ip,
      user: usuario,
      password: finalPassword,
      port: Number(port) || 8728,
    });

    if (isConnected) {
      return NextResponse.json({ success: true, message: "Conexión exitosa" });
    } else {
      return NextResponse.json({ success: false, error: "No se pudo establecer la conexión" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error testing Mikrotik connection:", error);
    return NextResponse.json({ error: "Error al probar la conexión" }, { status: 500 });
  }
}
