import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { decrypt } from "@/lib/encryption";
import { activateMikrotikUser } from "@/lib/mikrotik";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { pppUser } = await req.json();

    if (!pppUser) {
      return NextResponse.json({ error: "pppUser is required" }, { status: 400 });
    }

    // Get Mikrotik configuration
    const config = await prisma.mikrotik_config.findFirst();
    if (!config) {
      return NextResponse.json({ error: "Mikrotik config not found" }, { status: 404 });
    }

    // Decrypt password
    const password = config.password ? decrypt(config.password) : "";
    const auth = {
      host: config.ip,
      user: config.usuario,
      password: password,
      port: config.port
    };

    // Activate user
    const result = await activateMikrotikUser(auth, pppUser);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error || "Activation failed" }, { status: 500 });
    }

  } catch (error) {
    console.error("Error in Mikrotik activation API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
