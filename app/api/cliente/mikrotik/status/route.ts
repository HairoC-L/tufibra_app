import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { getMikrotikStatus, getMikrotikTraffic } from "@/lib/mikrotik";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pppUser = searchParams.get("pppUser");
    const trafficOnly = searchParams.get("trafficOnly") === "true";

    if (!pppUser) {
      return NextResponse.json({ error: "PPP User is required" }, { status: 400 });
    }

    // Fetch Mikrotik config
    const config = await prisma.mikrotik_config.findFirst({
      where: { estado: 1 }
    });

    if (!config) {
      return NextResponse.json({ error: "Mikrotik not configured" }, { status: 404 });
    }

    const auth = {
      host: config.ip,
      user: config.usuario,
      password: decrypt(config.password),
      port: config.port
    };

    if (trafficOnly) {
      const traffic = await getMikrotikTraffic(auth, pppUser);
      return NextResponse.json(traffic);
    }

    const status = await getMikrotikStatus(auth, pppUser);
    
    if (status.error === 'not_found') {
      return NextResponse.json({ error: "Usuario no registrado en Mikrotik" }, { status: 404 });
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error("Error in Mikrotik status API:", error);
    return NextResponse.json({ error: "Error de conexión con Mikrotik" }, { status: 500 });
  }
}
