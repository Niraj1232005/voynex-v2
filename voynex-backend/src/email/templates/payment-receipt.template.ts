export function paymentReceiptTemplate(data: {
  userName: string;
  tripTitle: string;
  amount: number;
  paymentId: string;
}) {
  return `
    <h2>Payment Received</h2>
    <p>Hello ${data.userName},</p>
    <p>We have received your payment successfully.</p>
    <p><strong>Trip:</strong> ${data.tripTitle}</p>
    <p><strong>Amount:</strong> INR ${data.amount}</p>
    <p><strong>Payment ID:</strong> ${data.paymentId}</p>
    <p>Thank you for booking with Voynex.</p>
  `;
}