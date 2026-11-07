import CuentaCorriente from "../models/CuentaCorriente.js";
import Notificacion from "../models/Notificacion.js";

// Generar recordatorios de vencimientos y cuentas vencidas
const generarRecordatorios = async () => {
  try {
    const ahora = new Date();

    // Fecha límite: dentro de 3 días
    const fechaLimite = new Date(ahora);
    fechaLimite.setDate(fechaLimite.getDate() + 3);

    // Buscar cuentas que vencen dentro de 3 días
    const cuentasPorVencer = await CuentaCorriente.find({
      estado: { $ne: "pagado" },
      saldoPendiente: { $gt: 0 },
      proximoVencimiento: {
        $gte: ahora,
        $lte: fechaLimite,
      },
    });

    for (const cuenta of cuentasPorVencer) {
      await Notificacion.updateOne(
        {
          cuentaCorriente: cuenta._id,
          tipo: "proximo_vencimiento",
          fechaEnvioProgramada: cuenta.proximoVencimiento,
        },
        {
          $setOnInsert: {
            cliente: cuenta.cliente,
            mensaje: "Recordatorio: tu cuenta corriente vence dentro de 3 días.",
            estado: "pendiente",
            canal: "sistema",
          },
        },
        { upsert: true }
      );
    }

    // Buscar cuentas vencidas
    const cuentasVencidas = await CuentaCorriente.find({
      estado: { $ne: "pagado" },
      saldoPendiente: { $gt: 0 },
      proximoVencimiento: { $lt: ahora },
    });

    for (const cuenta of cuentasVencidas) {
      await Notificacion.updateOne(
        {
          cuentaCorriente: cuenta._id,
          tipo: "vencido",
          fechaEnvioProgramada: cuenta.proximoVencimiento,
        },
        {
          $setOnInsert: {
            cliente: cuenta.cliente,
            mensaje: "Aviso: tu cuenta corriente tiene un pago vencido.",
            estado: "pendiente",
            canal: "sistema",
          },
        },
        { upsert: true }
      );

      // Actualizar estado de la cuenta
      if (cuenta.estado !== "vencido") {
        cuenta.estado = "vencido";
        await cuenta.save();
      }
    }

    console.log("Recordatorios revisados correctamente.");
  } catch (error) {
    console.error("Error al generar recordatorios:", error.message);
  }
};

export default generarRecordatorios;