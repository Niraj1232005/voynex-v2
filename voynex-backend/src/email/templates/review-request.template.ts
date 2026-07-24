export function reviewRequestTemplate(data: {
  userName: string;
  tripTitle: string;
  tripId: string;
}) {
  return `
    <h2>How was your trip?</h2>
    <p>Hello ${data.userName},</p>
    <p>We hope you enjoyed your trip: <strong>${data.tripTitle}</strong>.</p>
    <p>Please take a moment to leave a review.</p>
    <p>Trip ID: ${data.tripId}</p>
    <p>Thank you for helping other travelers.</p>
  `;
}