
import Cuota from "../models/Cuota.js";
import CuentaCorriente from "../models/CuentaCorriente.js";

// Calcular recargo diario desde el vencimiento
const calcularRecargo = (capital, fechaVencimiento, porcentajeDiario) => {
  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);

  hoy.setHours(0, 0, 0, 0);
  vencimiento.setHours(0, 0, 0, 0);

  const diasAtraso = Math.max(
    0,
    Math.floor((hoy - vencimiento) / (1000 * 60 * 60 * 24))
  );

  const recargo = Number(
    (capital * (porcentajeDiario / 100) * diasAtraso).toFixed(2)
  );

  return { diasAtraso, recargo };
};

// Actualizar los saldos y estados de las cuentas
const sincronizarCuenta = async (cuentaId) => {
  const cuenta = await CuentaCorriente.findById(cuentaId);

  if (!cuenta) {
    throw new Error(`No se encontró la cuenta ${cuentaId}`);
  }

  const cuotas = await Cuota.find({
    cuentaCorriente: cuentaId
  });

  const cuotasPendientes = cuotas.filter(
    (cuota) => cuota.estado !== "pagada"
  );

  const saldoTotal = cuotas.reduce(
    (total, cuota) => total + cuota.saldoPendiente,
    0
  );

  cuenta.saldoPendiente = Number(saldoTotal.toFixed(2));

  if (cuotasPendientes.length === 0) {
    cuenta.saldoPendiente = 0;
    cuenta.estado = "pagado";
  } else {
    const hayVencidas = cuotasPendientes.some(
      (cuota) => cuota.estado === "vencida"
    );

    cuenta.estado = hayVencidas ? "vencido" : "pendiente";

    const proximaCuota = [...cuotasPendientes].sort(
      (a, b) =>
        new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento)
    )[0];

    cuenta.proximoVencimiento = proximaCuota.fechaVencimiento;
  }

  await cuenta.save();
};

// Actualizar recargos de todas las cuotas pendientes
const actualizarRecargos = async () => {
  const cuotas = await Cuota.find({
    estado: { $ne: "pagada" }
  });

  const cuentasAActualizar = new Set();

  for (const cuota of cuotas) {
    const { diasAtraso, recargo } = calcularRecargo(
      cuota.capital,
      cuota.fechaVencimiento,
      cuota.porcentajeDiario
    );

    const pagosRealizados = cuota.pagos.reduce(
      (total, pago) => total + pago.monto,
      0
    );

    const nuevoTotal = Number(
      (cuota.capital + recargo).toFixed(2)
    );

    cuota.diasAtraso = diasAtraso;
    cuota.recargo = recargo;
    cuota.total = nuevoTotal;

    cuota.saldoPendiente = Math.max(
      0,
      Number((nuevoTotal - pagosRealizados).toFixed(2))
    );

    cuota.estado =
      cuota.saldoPendiente === 0
        ? "pagada"
        : diasAtraso > 0
          ? "vencida"
          : "pendiente";

    await cuota.save();

    cuentasAActualizar.add(cuota.cuentaCorriente.toString());
  }

  for (const cuentaId of cuentasAActualizar) {
    await sincronizarCuenta(cuentaId);
  }

  console.log(
    `Recargos automáticos actualizados. Cuotas revisadas: ${cuotas.length}`
  );

  return cuotas.length;
};

export default actualizarRecargos;
