

// ---- Base Template ----
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>ECMS</title>
</head>

<body style="margin:0; padding:0; background:#f5f7fb; font-family:Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fb; padding:20px;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" 
          style="max-width:600px; background:#ffffff; border-radius:8px; padding:30px;">

          <!-- Header -->
          <tr>
            <td style="text-align:center; padding-bottom:20px;">
              <h2 style="margin:0; color:#2c3e50;">ECMS</h2>
              <p style="margin:5px 0 0; font-size:12px; color:#888;">
                Election Control & Management System
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="font-size:14px; color:#333; line-height:1.6;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:30px; font-size:12px; color:#999; text-align:center;">
              <p style="margin:0;">© ${new Date().getFullYear()} ECMS</p>
              <p style="margin:5px 0;">Secure Election Management Platform</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;

// ---- Reusable Components ----
const button = (url, text) => `
  <div style="text-align:center; margin:25px 0;">
    <a href="${url}" 
       style="background:#2563eb; color:#fff; padding:12px 20px;
              text-decoration:none; border-radius:6px;
              display:inline-block; font-weight:bold;">
      ${text}
    </a>
  </div>
`;

const otpBox = (otp) => `
  <div style="
    font-size:28px;
    letter-spacing:4px;
    background:#f1f5f9;
    padding:15px;
    text-align:center;
    font-weight:bold;
    border-radius:6px;
    margin:20px 0;">
    ${otp}
  </div>
`;

// ---- Templates ----
const emailTemplates = {

  verificationOTP: ({ otp }) => ({
    subject: "Verify Your Email - ECMS",
    html: baseTemplate(`
      <h3>Welcome to ECMS 👋</h3>
      <p>Please verify your email using this OTP:</p>
      ${otpBox(otp)}
      <p>This OTP expires in <strong>10 minutes</strong>.</p>
    `)
  }),

  resendOTP: ({ otp }) => ({
    subject: "New OTP - ECMS",
    html: baseTemplate(`
      <h3>Email Verification</h3>
      <p>Your new OTP:</p>
      ${otpBox(otp)}
      <p>Expires in <strong>10 minutes</strong>.</p>
    `)
  }),

  passwordReset: ({ resetURL }) => ({
    subject: "Reset Your Password - ECMS",
    html: baseTemplate(`
      <h3>Password Reset</h3>
      <p>Click below to reset your password:</p>
      ${button(resetURL, "Reset Password")}
      <p style="font-size:12px;">Or copy this link:<br>${resetURL}</p>
      <p>This link expires in <strong>10 minutes</strong>.</p>
    `)
  }),

  institutionVerification: ({
    institutionName,
    requesterName,
    requesterEmail,
    verificationLink,
    expiresIn
  }) => ({
    subject: `Verify ${institutionName} Request - ECMS`,
    html: baseTemplate(`
      <h3>Institution Verification</h3>
      <p>
        <strong>${requesterName}</strong> (${requesterEmail}) 
        requested access for <strong>${institutionName}</strong>.
      </p>
      <p>Please confirm if this request is legitimate:</p>
      ${button(verificationLink, "Review Request")}
      <p>This link expires in <strong>${expiresIn}</strong>.</p>
    `)
  }),

  institutionConfirmed: ({ institutionName, adminUrl }) => ({
    subject: `${institutionName} Ready for Review`,
    html: baseTemplate(`
      <h3>Institution Confirmed</h3>
      <p>${institutionName} has confirmed their request.</p>
      ${button(adminUrl, "Review in Admin Panel")}
    `)
  }),

  institutionApproved: ({ institutionName, loginUrl, role }) => ({
    subject: `${institutionName} Approved`,
    html: baseTemplate(`
      <h3>🎉 Approved!</h3>
      <p>Your institution <strong>${institutionName}</strong> is approved.</p>
      <p>Your role: <strong>${role}</strong></p>
      ${button(loginUrl, "Go to Dashboard")}
    `)
  }),

  institutionRejected: ({
    institutionName,
    rejectionReason,
    supportEmail
  }) => ({
    subject: `${institutionName} Request Update`,
    html: baseTemplate(`
      <h3>Request Update</h3>
      <p>Your request for <strong>${institutionName}</strong> was rejected.</p>
      <p><strong>Reason:</strong> ${rejectionReason}</p>
      <p>Contact support: ${supportEmail}</p>
    `)
  }),
  welcomeAdmin: ({ firstName, lastName, institutionName, loginUrl, email, password }) => ({
    subject: `Welcome to ECMS - ${institutionName} Admin Access`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563EB;">Welcome to ECMS!</h2>
        <p>Dear <strong>${firstName} ${lastName}</strong>,</p>
        <p>You have been assigned as <strong>Election Admin</strong> for <strong>${institutionName}</strong>.</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Your Login Credentials:</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p><em>Please change your password after first login.</em></p>
        </div>
        <a href="${loginUrl}" style="display: inline-block; padding: 12px 24px; background: #2563EB; color: white; text-decoration: none; border-radius: 8px;">Login to Dashboard</a>
        <p style="margin-top: 20px; font-size: 12px; color: #64748b;">Election Control & Management System (ECMS)</p>
      </div>
    `
  }),// services/emailTemplateService.js - Add this new template

  voterCredentials: ({ firstName, lastName, electionTitle, electionId, voterId }) => ({
    subject: `Your Voting Credentials for ${electionTitle}`,
    html: baseTemplate(`
      <div style="text-align: center;">
        <h2 style="color: #10b981;">✓ Registration Successful!</h2>
        <p>Dear <strong>${firstName} ${lastName}</strong>,</p>
        <p>You have successfully registered for the election:</p>
        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">📋 ${electionTitle}</h3>
        </div>
      </div>
  
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #2563eb;">Your Voting Credentials</h3>
        <p style="margin: 10px 0;"><strong>🏷️ Election ID:</strong> <code style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px;">${electionId}</code></p>
        <p style="margin: 10px 0;"><strong>🆔 Voter ID:</strong> <code style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px;">${voterId}</code></p>
      </div>
  
      <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">⚠️ Important Instructions</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Keep these credentials safe and secure</li>
          <li>You will need these to vote when voting period opens</li>
          <li>Do not share your Voter ID with anyone</li>
          <li>These credentials are for one-time verification</li>
        </ul>
      </div>
  
      <div style="text-align: center; margin: 20px 0;">
        <p>When voting begins, you will need to verify using:</p>
        <p><strong>Election ID + Voter ID</strong></p>
      </div>
  
      <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 20px;">
        This is an automated message from ECMS. Please do not reply.
      </p>
    `)
  }),
  // services/emailTemplateService.js - Add this template

  nominationApproved: ({ firstName, lastName, electionTitle, positionName, ballotPosition, loginUrl, adminComments }) => ({
    subject: `🎉 Congratulations! Your Nomination for ${positionName} has been Approved!`,
    html: baseTemplate(`
      <div style="text-align: center;">
        <div style="background: #dcfce7; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
          <h2 style="color: #166534; margin: 0;">🎉 Congratulations, ${firstName} ${lastName}! 🎉</h2>
        </div>
        
        <p>We are pleased to inform you that your nomination for <strong>${positionName}</strong> has been <strong style="color: #10b981;">APPROVED</strong>!</p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #166534;">Nomination Details</h3>
          <p style="margin: 8px 0;"><strong>📋 Election:</strong> ${electionTitle}</p>
          <p style="margin: 8px 0;"><strong>🎯 Position:</strong> ${positionName}</p>
          ${ballotPosition ? `<p style="margin: 8px 0;"><strong>🔢 Ballot Position:</strong> #${ballotPosition}</p>` : ''}
          <p style="margin: 8px 0;"><strong>✅ Status:</strong> <span style="color: #10b981; font-weight: bold;">Approved</span></p>
        </div>
  
        ${adminComments ? `
          <div style="background: #eff6ff; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <h4 style="margin: 0 0 8px 0; color: #1e40af;">📝 Admin Comments</h4>
            <p style="margin: 0; color: #1e3a8a;">${adminComments}</p>
          </div>
        ` : ''}
  
        <div style="background: #fef3c7; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #92400e;">What's Next?</h3>
          <p style="margin: 10px 0;">✅ You can now access your candidate dashboard</p>
          <p style="margin: 10px 0;">✅ Start preparing your campaign materials</p>
          <p style="margin: 10px 0;">✅ Promote your candidacy to voters</p>
          <p style="margin: 10px 0;">✅ Stay updated on election timelines</p>
        </div>
  
        <div style="text-align: center; margin: 25px 0;">
          <a href="${loginUrl}" style="background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            🚀 Go to Candidate Dashboard
          </a>
        </div>
  
        <p style="margin-top: 20px; font-size: 13px; color: #64748b;">
          You can now log in to your candidate dashboard to track your campaign progress and view election updates.
        </p>
  
        <hr style="margin: 20px 0; border-color: #e2e8f0;" />
  
        <p style="font-size: 12px; color: #64748b;">
          This is an automated message from ECMS. Please do not reply to this email.<br/>
          If you have any questions, please contact your election administrator.
        </p>
    `)
  }),
};

// ---- Send Function ----
const sendEmailWithTemplate = async (email, templateName, data) => {
  const template = emailTemplates[templateName];

  if (!template) {
    throw new Error(`Template "${templateName}" not found`);
  }

  const { subject, html } = template(data);

  return sendEmail({ email, subject, html });
};

module.exports = { sendEmailWithTemplate };