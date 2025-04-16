import prisma from '../utils/database.utils';

export class AppointmentService {
  async getUserAppointments(userId: string) {
    return prisma.appointment.findMany({
      where: { userId },
      include: {
        service: true,
        staff: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async createAppointment(data: {
    userId: string;
    serviceId: string;
    staffId: string;
    date: Date;
    timeRange: string;
    note: string;
  }): Promise<string> {
    try {
      if (!data.userId || !data.serviceId || !data.staffId || !data.date || !data.timeRange) {
        throw new Error('Missing required fields');
      }

      const newAppointment = await prisma.appointment.create({
        data,
        include: {
          service: true,
          staff: true,
          user: true,
        },
      });

      return newAppointment.id;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw new Error(`Could not create appointment: ${error.message}`);
    }
  }

  async cancelAppointment(id: string) {
    return prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });
  }

  async getAppointmentById(id: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        service: true,
        staff: true,
        user: true,
      },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    return appointment;
  }

  async updateAppointment(id: string, data: {
    userId?: string;
    serviceId?: string;
    staffId?: string;
    date?: Date;
    timeRange?: string;
  }) {
    return prisma.appointment.update({ where: { id }, data });
  }
}
