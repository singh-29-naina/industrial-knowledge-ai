

export const approvalHtml = (name, role) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #0A2540; color: #ffffff; padding: 24px; text-align: center;">
      <h2 style="margin: 0; font-size: 22px; letter-spacing: 0.5px;">ACCESS APPROVED</h2>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #00D4B2; font-weight: bold; text-transform: uppercase;">Reliance K-Portal AI Services</p>
    </div>
    <div style="padding: 32px; background-color: #ffffff; color: #333333; line-height: 1.6;">
      <p style="margin-top: 0; font-size: 16px;">Hello <strong>${name}</strong>,</p>
      <p>We are pleased to inform you that your registration request for the Reliance Industrial Knowledge Platform has been reviewed and approved by the system administrator.</p>
      
      <div style="background-color: #f8f9fa; border-left: 4px solid #00D4B2; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px;"><strong>Assigned Authorization Role:</strong> <code>${role}</code></p>
        <p style="margin: 5px 0 0 0; font-size: 14px;"><strong>Status:</strong> Active</p>
      </div>

      <p>You can now securely log in to the portal and begin executing engineering workflows on the LangGraph orchestration nodes.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:5173/login" style="background-color: #0A2540; color: #ffffff; font-weight: bold; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 15px;">
          Log In to Portal
        </a>
      </div>
    </div>
    <div style="background-color: #f1f3f5; padding: 16px; text-align: center; font-size: 11px; color: #888888; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0;">&copy; 2026 Reliance Industries Ltd. | Plant Digital Services Division</p>
    </div>
  </div>
`;

export const rejectionHtml = (name) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #721C24; color: #ffffff; padding: 24px; text-align: center;">
      <h2 style="margin: 0; font-size: 22px; letter-spacing: 0.5px;">REGISTRATION DECLINED</h2>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #f8d7da; font-weight: bold; text-transform: uppercase;">Reliance K-Portal AI Services</p>
    </div>
    <div style="padding: 32px; background-color: #ffffff; color: #333333; line-height: 1.6;">
      <p style="margin-top: 0; font-size: 16px;">Hello <strong>${name}</strong>,</p>
      <p>Thank you for your interest in the Reliance Industrial Knowledge Platform.</p>
      <p>After careful review of your application, we regret to inform you that your registration request has been declined at this time.</p>
      
      <p style="font-size: 13px; color: #721c24; background-color: #f8d7da; padding: 12px; border-left: 4px solid #f5c6cb; margin: 20px 0;">
        If you believe this decision was made in error, please contact your local IT Service Desk or your direct Plant Operations Supervisor.
      </p>
    </div>
    <div style="background-color: #f1f3f5; padding: 16px; text-align: center; font-size: 11px; color: #888888; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0;">&copy; 2026 Reliance Industries Ltd. | Plant Digital Services Division</p>
    </div>
  </div>
`;