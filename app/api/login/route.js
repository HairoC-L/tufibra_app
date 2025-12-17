import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request) {
  const body = await request.json()
  const { username, password, role } = body
  let id 

  try {
    const user = await prisma.usuario.findFirst({
      where: {
        usu_usuario: username,
        usu_rol: role,
        usu_estado: 1,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado" },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.usu_contrasena)

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Contraseña incorrecta" },
        { status: 401 }
      )
    }

    if (role === "ADMINISTRADOR") {
      id = user.usu_id;
    } else if (role === "OFICINA") {
      const personal = await prisma.personal_oficina.findFirst({
        where: { usuario_usu_id: user.usu_id },
      });

      if (!personal) {
        return NextResponse.json(
          { success: false, message: "No se encontró personal de oficina vinculado" },
          { status: 404 }
        );
      }

      id = personal.per_id;
    } else if (role === "TECNICO") {
      const tecnico = await prisma.tecnico.findFirst({
        where: { usuario_usu_id: user.usu_id },
      });

      if (!tecnico) {
        return NextResponse.json(
          { success: false, message: "No se encontró técnico vinculado" },
          { status: 404 }
        );
      }

      id = tecnico.tec_id;
    } else {
      return NextResponse.json(
        { success: false, message: "Rol no válido" },
        { status: 400 }
      );
    }


    return NextResponse.json({
      success: true,
      user: {
        id,
        name: user.usu_nombre,
        role: user.usu_rol,
      },
    })
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json(
      { success: false, message: "Error del servidor" },
      { status: 500 }
    )
  }
}
