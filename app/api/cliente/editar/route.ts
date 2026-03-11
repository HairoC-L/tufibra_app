import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { cliente, contrato, userRole } = await req.json();

    // Validar si se está intentando cambiar el PPP user sin ser administrador
    if (cliente.cli_ppp_user) {
      const currentClient = await prisma.cliente.findUnique({
        where: { cli_id: cliente.cli_id },
        select: { cli_ppp_user: true }
      });

      if (currentClient && currentClient.cli_ppp_user !== cliente.cli_ppp_user) {
        if (userRole !== 'ADMINISTRADOR') {
          return NextResponse.json(
            { error: "No tiene permisos para modificar el usuario Mikrotik (PPP). Solo un Administrador puede hacerlo." },
            { status: 403 }
          );
        }
      }
    }

    // Actualizar cliente
    await prisma.cliente.update({
      where: {
        cli_id: cliente.cli_id,
      },
      data: {
        cli_tipo: cliente.cli_tipo,
        cli_nombre: cliente.cli_nombre,
        cli_apellido: cliente.cli_apellido,
        cli_razonsoci: cliente.cli_razonsoci,
        cli_dni: cliente.cli_dni,
        cli_ruc: cliente.cli_ruc,
        cli_direccion: cliente.cli_direccion,
        cli_coordenada: cliente.cli_coordenada,
        cli_cel: cliente.cli_cel,
        cli_ppp_user: cliente.cli_ppp_user,
      },
    });

    // Actualizar contrato
    await prisma.contrato.update({
      where: {
        num_con: contrato.num_con,
      },
      data: {
        id_serv: contrato.id_serv ? parseInt(contrato.id_serv) : undefined,
        id_caja: contrato.id_caja ? parseInt(contrato.id_caja) : undefined,
        estado: contrato.estado ? parseInt(contrato.estado) : undefined,
      },
    });

    return NextResponse.json({ message: "Cliente actualizado correctamente" });
  } catch (error) {
    console.error("Error al editar cliente:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
