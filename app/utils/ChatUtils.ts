// utils/ChatUtils.ts

// ================= PARSE DATE =================
export const parseAppointmentDate = (appointment: any) => {
  try {
    const [day, month, year] = appointment.date.split("/");

    let [time, modifier] = appointment.time.trim().toUpperCase().split(" ");
    let [hours, minutes] = time.split(":");

    let h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);

    if (modifier === "PM" && h !== 12) h += 12;
    if (modifier === "AM" && h === 12) h = 0;

    return new Date(Number(year), Number(month) - 1, Number(day), h, m);
  } catch {
    return new Date();
  }
};

// ================= STATUS =================
export const getAppointmentStatus = (appointment: any) => {
  const start = parseAppointmentDate(appointment);
  const now = new Date();

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 15);

  if (now < start) return "confirmed";
  if (now >= start && now <= end) return "ongoing";
  return "completed";
};

// ================= CHAT =================
export const getChatState = (appointment: any) => {
  const start = parseAppointmentDate(appointment);
  const now = new Date();

  const chatEnd = new Date(start);
  chatEnd.setHours(chatEnd.getHours() + 48);

  if (now < start) return "disabled";
  if (now <= chatEnd) return "active";
  return "readonly";
};

// ================= JOIN =================
export const isJoinAvailable = (appointment: any) => {
  const start = parseAppointmentDate(appointment);
  const now = new Date();

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 15);

  return now >= start && now <= end;
};