import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {

    const body = await req.json();
    //console.log("BODY RECIBIDO:", body); // 

    const {
      id_tipo_compro,
      serie,
      correlativo,
      monto_total,
      medio_pago,
      num_con,
      id_user,
      detallePago,
    } = body;

    if (
      !id_tipo_compro ||
      !serie ||
      !correlativo ||
      !monto_total ||
      !medio_pago ||
      !num_con ||
      !id_user ||
      !detallePago ||
      detallePago.length === 0
    ) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios o detalle vacío" },
        { status: 400 }
      );
    }

    const cod_comprobante = `${serie}-${correlativo}`;

    // 1. Crear comprobante
    const nuevoComprobante = await prisma.comprobante_pago.create({
      data: {
        cod_comprobante,
        id_tipo_compro: parseInt(id_tipo_compro),
        serie,
        correlativo: parseInt(correlativo),
        monto_total: parseFloat(monto_total),
        medio_pago,
        estado: "NORMAL",
        num_con,
        id_per_oficina: parseInt(id_user),
      },
    });

    // 2. Crear detalle_pago y actualizar deudas
    for (const item of detallePago) {
      await prisma.detalle_pago.create({
        data: {
          cod_comprobante,
          descripcion: item.descripcion,
          ano_mes: item.ano_mes,
          monto: parseFloat(item.monto),
        },
      });
    }
    for (const item of detallePago) {
      // Obtener la deuda actual
      const deuda = await prisma.deuda.findUnique({
        where: { id_deuda: item.id_deuda },
      });

      if (!deuda) continue;

      // Convertir a number por seguridad (por si vienen como string)
      const montoPagado = Number(item.monto);
      const saldoPendiente = Number(deuda.saldo_pendiente);

      // Comparar
      if (montoPagado == saldoPendiente) {
        // Pago total → salda la deuda
        await prisma.deuda.update({
          where: { id_deuda: item.id_deuda },
          data: {
            saldo_pendiente: 0,
            estado: "PAGADO",
          },
        });
      } else if (montoPagado < saldoPendiente) {

        const nuevoSaldo = Number(saldoPendiente - montoPagado);
        await prisma.deuda.update({
          where: { id_deuda: item.id_deuda },
          data: {
            saldo_pendiente: nuevoSaldo,
            estado: "RESTANTE",
          },
        });
      }
    }

    return NextResponse.json({ comprobante: nuevoComprobante });
  } catch (error) {
    console.error("Error al registrar comprobante de pago:", error);
    return NextResponse.json(
      { error: "Error interno al registrar el comprobante" },
      { status: 500 }
    );
  }
}
