import { Resend } from "resend";
import React from "react";
import { render } from "@react-email/render";

import { ProfilePublishedEmail } from "../emails/ProfilePublishedEmail";
import { ChangesRequestedEmail } from "../emails/ChangesRequestedEmail";
import { GenericActionEmail } from "../emails/GenericActionEmail";

export class EmailService {
  private static resend = process.env.RESEND_API_KEY 
    ? new Resend(process.env.RESEND_API_KEY) 
    : null;

  static async send(options: { to: string; subject: string; reactComponent: React.ReactElement }): Promise<boolean> {
    try {
      const html = await render(options.reactComponent);

      if (!this.resend) {
        console.warn(`
[EMAIL WARNING] RESEND_API_KEY is not set. 
Skipping actual email delivery to ${options.to}.
Subject: ${options.subject}
        `);
        return true;
      }

      const { data, error } = await this.resend.emails.send({
        from: 'Global Leader Sphere <noreply@globalleadersphere.com>', // Update this to verified domain when going to prod
        to: options.to,
        subject: options.subject,
        html: html
      });

      if (error) {
        console.error("[EMAIL ERROR]", error);
        return false;
      }

      console.log(`[EMAIL SUCCESS] Sent to ${options.to} - ID: ${data?.id}`);
      return true;

    } catch (err) {
      console.error("[EMAIL FATAL ERROR]", err);
      return false;
    }
  }

  // --- Implementations ---

  static async sendProfilePublished(to: string, leaderName: string, versionNumber: number) {
    return this.send({
      to,
      subject: `Your Profile (v${versionNumber}) is now LIVE!`,
      reactComponent: (
        <ProfilePublishedEmail 
          leaderName={leaderName} 
          versionNumber={versionNumber} 
          profileUrl="https://globalleadersphere.com/profile" // Update with dynamic url later
        />
      )
    });
  }

  static async sendChangesRequested(to: string, leaderName: string, notes: string) {
    return this.send({
      to,
      subject: `Action Required: Changes requested for your profile`,
      reactComponent: (
        <ChangesRequestedEmail 
          leaderName={leaderName} 
          notes={notes} 
          dashboardUrl="https://globalleadersphere.com/admin" // Update with dynamic url later
        />
      )
    });
  }

  static async sendApplicationSubmitted(to: string, applicantName: string) {
    return this.send({
      to,
      subject: `Application Received - Global Leader Sphere`,
      reactComponent: (
        <GenericActionEmail 
          title="Application Received"
          previewText="We have received your application."
          greeting={`Hello ${applicantName},`}
          body="Thank you for applying to the Global Leader Sphere. Our review committee has received your application and will evaluate it shortly. We will notify you of the outcome via email."
        />
      )
    });
  }

  static async sendApplicationApproved(to: string, applicantName: string) {
    return this.send({
      to,
      subject: `Application Approved - Welcome to Global Leader Sphere`,
      reactComponent: (
        <GenericActionEmail 
          title="Application Approved"
          previewText="Congratulations, your application is approved."
          greeting={`Congratulations ${applicantName},`}
          body="Your application to join the Global Leader Sphere has been approved! The next step is to accept your official invitation and set up your leader portfolio."
          ctaText="Login to Dashboard"
          ctaUrl="https://globalleadersphere.com/login"
          ctaColor="#10b981"
        />
      )
    });
  }

  static async sendApplicationRejected(to: string, applicantName: string) {
    return this.send({
      to,
      subject: `Update on your Application - Global Leader Sphere`,
      reactComponent: (
        <GenericActionEmail 
          title="Application Update"
          previewText="An update regarding your application."
          greeting={`Dear ${applicantName},`}
          body="Thank you for your interest in joining the Global Leader Sphere. After careful consideration, our committee has decided not to proceed with your application at this time. We encourage you to re-apply in the future as you continue to grow your leadership journey."
        />
      )
    });
  }

  static async sendInvitationSent(to: string, leaderName: string, inviteLink: string) {
    return this.send({
      to,
      subject: `You're Invited to Global Leader Sphere`,
      reactComponent: (
        <GenericActionEmail 
          title="Exclusive Invitation"
          previewText="You have been invited to join the Global Leader Sphere."
          greeting={`Hello ${leaderName},`}
          body="You have been officially invited to create your leadership portfolio on the Global Leader Sphere platform. Click the link below to accept your invitation and activate your account."
          ctaText="Accept Invitation"
          ctaUrl={inviteLink}
        />
      )
    });
  }

  static async sendPortfolioSubmitted(to: string, leaderName: string) {
    return this.send({
      to,
      subject: `Portfolio Submitted for Review`,
      reactComponent: (
        <GenericActionEmail 
          title="Portfolio Submitted"
          previewText="Your portfolio has been submitted for review."
          greeting={`Hi ${leaderName},`}
          body="Your portfolio draft has been successfully submitted for review. Our administrators will review the contents to ensure it meets our quality standards. You will be notified once it is approved or if any changes are required."
          ctaText="View Dashboard"
          ctaUrl="https://globalleadersphere.com/admin"
        />
      )
    });
  }
}
