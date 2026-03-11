import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Crear nuevo cliente
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log("Iniciando registro de cliente. Datos:", body);

        const {
            nombre,
            apellido,
            razon_social,
            dni,
            ruc,
            direccion,
            celular,
            num_contrato,
            tipoServicio,
            fechaInicio,
            id_user,
            tec_id,
            coordenada,
            id_caja,
            tipoComprobante,
            ppp_user
        } = body;

        // validaciones básicas
        if (!num_contrato) return NextResponse.json({ error: "Número de contrato es obligatorio" }, { status: 400 });
        if (!tipoServicio) return NextResponse.json({ error: "Seleccione un servicio válido" }, { status: 400 });
        if (!id_user) return NextResponse.json({ error: "ID de usuario no proporcionado" }, { status: 400 });
        if (!tec_id) return NextResponse.json({ error: "Seleccione el técnico responsable" }, { status: 400 });
        if (!fechaInicio) return NextResponse.json({ error: "Indique la fecha de inicio" }, { status: 400 });

        // 1. Resolver IDs vinculados (Usuario vs Personal de Oficina)
        // El id_user del frontend puede ser usu_id (Admin) o per_id (Oficina)
        let final_usu_id: number | null = null;
        let final_per_id: number | null = null;

        const parsedIdUser = parseInt(id_user);

        // Intentar encontrar como per_id
        const personalByPerId = await prisma.personal_oficina.findUnique({
            where: { per_id: parsedIdUser }
        });

        if (personalByPerId) {
            final_per_id = personalByPerId.per_id;
            final_usu_id = personalByPerId.usuario_usu_id;
        } else {
            // Intentar encontrar como usu_id
            const personalByUsuId = await prisma.personal_oficina.findFirst({
                where: { usuario_usu_id: parsedIdUser }
            });

            if (personalByUsuId) {
                final_per_id = personalByUsuId.per_id;
                final_usu_id = parsedIdUser;
            } else {
                // Si es un usuario admin sin record en personal_oficina, 
                // pero necesitamos un per_id para la orden de trabajo (que es obligatorio)
                const user = await prisma.usuario.findUnique({ where: { usu_id: parsedIdUser } });
                if (user) {
                    final_usu_id = user.usu_id;
                    // Si es admin, intentamos ver si hay ALGÚN personal de oficina o fallamos
                    // porque la FK en orden_trabajo es obligatoria
                    const anyPersonal = await prisma.personal_oficina.findFirst();
                    if (anyPersonal) {
                        final_per_id = anyPersonal.per_id;
                    } else {
                        return NextResponse.json({ error: "No hay personal de oficina registrado para asignar la orden." }, { status: 400 });
                    }
                } else {
                    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 400 });
                }
            }
        }

        // 2. Validar duplicado
        const existingContrato = await prisma.contrato.findUnique({
            where: { num_con: num_contrato },
        });

        if (existingContrato) {
            return NextResponse.json({ error: "El número de contrato ya existe." }, { status: 400 });
        }

        // 3. Generar ID de cliente
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, "0");
        const prefix = `${year}${month}`;

        const lastCliente = await prisma.cliente.findFirst({
            where: { cli_id: { startsWith: prefix } },
            orderBy: { cli_id: 'desc' },
            select: { cli_id: true },
        });

        let nextNumber = 1;
        if (lastCliente?.cli_id) {
            nextNumber = parseInt(lastCliente.cli_id.slice(4)) + 1;
        }
        const cli_id = `${prefix}${nextNumber.toString().padStart(4, '0')}`;

        // 4. Tipo de cliente
        const isEmpresa = razon_social && ruc;
        const cli_tipo = isEmpresa ? "JURIDICA" : "NATURAL";

        // 5. Crear registros en TRANSACCIÓN para evitar datos huérfanos
        const resultado = await prisma.$transaction(async (tx) => {
            const nuevoCliente = await tx.cliente.create({
                data: {
                    cli_id,
                    cli_nombre: !isEmpresa ? nombre : null,
                    cli_apellido: !isEmpresa ? apellido : null,
                    cli_dni: !isEmpresa ? dni : null,
                    cli_razonsoci: isEmpresa ? razon_social : null,
                    cli_ruc: isEmpresa ? ruc : null,
                    cli_direccion: direccion,
                    cli_coordenada: coordenada,
                    cli_cel: celular,
                    cli_estado: "ACTIVO",
                    cli_tipo: cli_tipo,
                    cli_ppp_user: ppp_user
                },
            });

            await tx.contrato.create({
                data: {
                    num_con: num_contrato,
                    id_cli: cli_id,
                    id_serv: parseInt(tipoServicio),
                    fecha_registro: new Date(),
                    fecha_inicio: new Date(fechaInicio),
                    estado: 2,
                    id_user: final_usu_id,
                    tec_id: parseInt(tec_id),
                    id_caja: id_caja ? parseInt(id_caja) : null,
                    id_tipo_comprobante: tipoComprobante ? parseInt(tipoComprobante) : null,
                },
            });

            const servicio = await tx.servicio.findUnique({
                where: { serv_id: parseInt(tipoServicio) },
            });

            if (!servicio) throw new Error("Servicio no encontrado");

            // Asegurar que existe tipo_trabajo con ID 1 o buscar el primero
            let tipId = 1;
            const tipoTrabajo = await tx.tipo_trabajo.findUnique({ where: { tip_id: 1 } });
            if (!tipoTrabajo) {
                const firstTipo = await tx.tipo_trabajo.findFirst();
                if (firstTipo) tipId = firstTipo.tip_id;
            }

            await tx.orden_trabajo.create({
                data: {
                    ord_descripcion: `INSTALACION DE ${servicio.serv_nombre?.toUpperCase()}`,
                    ord_fecha_asignacion: new Date(fechaInicio),
                    ord_estado: 1,
                    ord_prioridad: "Alta",
                    tec_id: parseInt(tec_id),
                    per_id: final_per_id!,
                    num_con: num_contrato,
                    tip_id: tipId,
                }
            });

            return nuevoCliente;
        });

        console.log("Registro exitoso para cliente:", cli_id);
        return NextResponse.json({ cliente: resultado });

    } catch (error: any) {
        console.error("Error crítico en registro:", error);
        return NextResponse.json({ 
            error: "Error interno del servidor", 
            message: error.message 
        }, { status: 500 });
    }
}
