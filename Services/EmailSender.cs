using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;

namespace Delizioso.Services;

public class EmailOptions
{
    public string From { get; set; } = "delizioso@gmail.com";
    public string FromName { get; set; } = "Delizioso";
    public SmtpOptions Smtp { get; set; } = new();

    public class SmtpOptions
    {
        public string Host { get; set; } = "";
        public int Port { get; set; } = 587;
        public string User { get; set; } = "";
        public string Password { get; set; } = "";
        public bool EnableSsl { get; set; } = true;
    }

    public bool IsConfigured => !string.IsNullOrWhiteSpace(Smtp.Host);
}

public interface IEmailSender
{
    /// <summary>True when real SMTP is set up; otherwise emails are saved to App_Data/mail.</summary>
    bool IsConfigured { get; }

    /// <summary>Returns false when the mail server refused or could not be reached (the error is logged).</summary>
    Task<bool> SendAsync(string to, string subject, string html);
}

/// <summary>
/// Sends mail through SMTP (Email:Smtp settings). Without SMTP settings every message is written
/// as an .eml file to App_Data/mail so registration and password reset can still be tested locally.
/// </summary>
public class SmtpEmailSender(IOptions<EmailOptions> options, IWebHostEnvironment env, ILogger<SmtpEmailSender> log) : IEmailSender
{
    private readonly EmailOptions _o = options.Value;

    public bool IsConfigured => _o.IsConfigured;

    public static string PickupFolder(IWebHostEnvironment env) => Path.Combine(env.ContentRootPath, "App_Data", "mail");

    public async Task<bool> SendAsync(string to, string subject, string html)
    {
        using var message = new MailMessage
        {
            From = new MailAddress(_o.From, _o.FromName),
            Subject = subject,
            Body = html,
            IsBodyHtml = true,
        };
        message.To.Add(to);

        using var client = new SmtpClient();
        if (_o.IsConfigured)
        {
            client.Host = _o.Smtp.Host;
            client.Port = _o.Smtp.Port;
            client.EnableSsl = _o.Smtp.EnableSsl;
            if (_o.Smtp.User != "") client.Credentials = new NetworkCredential(_o.Smtp.User, _o.Smtp.Password);
        }
        else
        {
            var folder = PickupFolder(env);
            Directory.CreateDirectory(folder);
            client.DeliveryMethod = SmtpDeliveryMethod.SpecifiedPickupDirectory;
            client.PickupDirectoryLocation = folder;
        }

        try
        {
            await client.SendMailAsync(message);
            log.LogInformation(_o.IsConfigured ? "Email '{Subject}' sent to {To}" : "Email '{Subject}' for {To} saved to App_Data/mail (SMTP not configured)", subject, to);
            return true;
        }
        catch (Exception ex) when (ex is SmtpException or InvalidOperationException)
        {
            // A mail problem must not break booking or ordering: log it and carry on.
            log.LogError(ex, "Could not send email '{Subject}' to {To}", subject, to);
            return false;
        }
    }
}
