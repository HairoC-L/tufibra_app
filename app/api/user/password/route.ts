import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// PUT: Cambiar propia contraseña
export async function PUT(req: NextRequest) {
  try {
    const { userId, currentPassword, newPassword } = await req.json();

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const user = await prisma.usuario.findUnique({
      where: { usu_id: parseInt(userId) },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.usu_contrasena || "");
    if (!isPasswordValid) {
      return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 401 });
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.usuario.update({
      where: { usu_id: parseInt(userId) },
      data: { usu_contrasena: hashedPassword },
    });

    return NextResponse.json({ success: true, message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}

// PATCH: Restablecer contraseña ajena (Solo Administrador)
export async function PATCH(req: NextRequest) {
  try {
    const { adminId, targetUserId, newPassword } = await req.json();

    if (!adminId || !targetUserId || !newPassword) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // Verificar que el solicitante sea Administrador
    const admin = await prisma.usuario.findUnique({
      where: { usu_id: parseInt(adminId) },
    });

    if (!admin || admin.usu_rol !== "ADMINISTRADOR") {
      return NextResponse.json({ error: "No autorizado. Se requieren permisos de Administrador." }, { status: 403 });
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.usuario.update({
      where: { usu_id: parseInt(targetUserId) },
      data: { usu_contrasena: hashedPassword },
    });

    return NextResponse.json({ success: true, message: "Contraseña restablecida correctamente" });
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
