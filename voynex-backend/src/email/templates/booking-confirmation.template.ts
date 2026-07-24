export function bookingConfirmationTemplate(data: {
  userName: string;
  tripTitle: string;
  bookingId: string;
  travelDate?: string;
}) {
  return `
    <h1>Niraj Testing, reply kar email aala tar</h1>
    <h2>Booking Confirmed</h2>
    <p>Hello ${data.userName},</p>
    <p>Your booking has been confirmed successfully.</p>
    <p><strong>Trip:</strong> ${data.tripTitle}</p>
    <p><strong>Booking ID:</strong> ${data.bookingId}</p>
    <p><strong>Travel Date:</strong> ${data.travelDate || 'Not provided'}</p>
    <p>Thank you for choosing Voynex.</p>
  `;
}