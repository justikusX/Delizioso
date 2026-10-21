using System.Globalization;
using System.Net;
using Delizioso.Models;

namespace Delizioso.Services;

/// <summary>HTML bodies for the emails the site sends (inline styles, since mail clients ignore stylesheets).</summary>
public static class EmailTemplates
{
    private static readonly CultureInfo En = CultureInfo.InvariantCulture;
    private static string E(string? s) => WebUtility.HtmlEncode(s ?? "");
    private static string Money(decimal d) => "$" + d.ToString("0.00", En);

    private static string Layout(string title, string body, string? buttonText = null, string? buttonUrl = null) => $"""
        <div style="background:#f6f3ef;padding:32px 12px;font-family:Arial,Helvetica,sans-serif;color:#311f09">
          <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden">
            <div style="background:#ff8a00;padding:24px 32px;color:#fff;font-size:22px;font-weight:bold">Delizi<span style="color:#311f09">oso</span></div>
            <div style="padding:32px">
              <h1 style="font-size:22px;margin:0 0 16px">{E(title)}</h1>
              <div style="font-size:15px;line-height:1.6;color:#5c4529">{body}</div>
              {(buttonUrl == null ? "" : $"""<p style="margin:28px 0"><a href="{E(buttonUrl)}" style="background:#ff8a00;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:bold;display:inline-block">{E(buttonText)}</a></p><p style="font-size:12px;color:#a08d76">If the button doesn't work, open this link: <br><a href="{E(buttonUrl)}" style="color:#a08d76">{E(buttonUrl)}</a></p>""")}
            </div>
            <div style="padding:16px 32px;background:#311f09;color:#e3e2e0;font-size:12px">3247 Johnson Ave, Bronx, NY 10463 · +123 4567 8901</div>
          </div>
        </div>
        """;

    public static (string Subject, string Html) ConfirmEmail(string name, string url) => ("Confirm your Delizioso account", Layout(
        $"Welcome, {name}!",
        "Please confirm your email address to finish creating your account. The link is valid for 3 days.",
        "Confirm email", url));

    public static (string Subject, string Html) ResetPassword(string name, string url) => ("Reset your Delizioso password", Layout(
        $"Hi {name},",
        "We received a request to reset your password. The link is valid for 2 hours. If it wasn't you, just ignore this email.",
        "Choose a new password", url));

    public static (string Subject, string Html) ReservationConfirmed(Reservation r, string url, bool changed) => (
        changed ? $"Your reservation #{r.Code} was changed" : $"Reservation confirmed #{r.Code}",
        Layout(changed ? "Your reservation was changed" : "Reservation has been confirmed", $"""
            <p>Thank you, {E(r.CustomerName)}! Here are your booking details:</p>
            <p><b>{r.ReservedFor.ToString("dddd, d MMMM yyyy", En)}</b> at <b>{r.ReservedFor.ToString("h:mm tt", En)}</b><br>
            {r.Guests} {(r.Guests == 1 ? "person" : "people")} · Booking ID <b>#{r.Code}</b>
            {(r.Occasion != "" ? $"<br>Occasion: {E(r.Occasion)}" : "")}</p>
            """, "View or change reservation", url));

    public static (string Subject, string Html) ReservationCancelled(Reservation r, string url) => ($"Reservation #{r.Code} cancelled", Layout(
        "Your reservation has been cancelled",
        $"<p>The table for {r.ReservedFor.ToString("dddd, d MMMM 'at' h:mm tt", En)} has been released. We hope to see you another time.</p>",
        "Book another table", url));

    public static (string Subject, string Html) OrderPlaced(Order o, string url)
    {
        var rows = string.Concat(o.Items.Select(i =>
            $"""<tr><td style="padding:6px 0">{E(i.Dish?.Name)} × {i.Quantity}</td><td style="text-align:right">{Money(i.UnitPrice * i.Quantity)}</td></tr>"""));
        var where = o.Method == "Delivery" ? $"Delivery to: {E(o.Address)}" : "Take away from the restaurant";
        var when = o.ScheduledFor is { } at ? $"Scheduled for {at.ToString("dddd h:mm tt", En)}" : "We're preparing it now";
        return ($"Order #{o.Code} received", Layout($"Thank you for your order, {o.CustomerName}!", $"""
            <p>{where}<br>{when}</p>
            <table style="width:100%;border-collapse:collapse;font-size:15px">{rows}
              <tr><td style="padding-top:12px;border-top:1px dashed #ddd">Subtotal</td><td style="text-align:right;padding-top:12px;border-top:1px dashed #ddd">{Money(o.Subtotal)}</td></tr>
              <tr><td>Tax fee</td><td style="text-align:right">{Money(o.Tax)}</td></tr>
              {(o.Discount > 0 ? $"<tr><td>Voucher {E(o.VoucherCode)}</td><td style=\"text-align:right\">−{Money(o.Discount)}</td></tr>" : "")}
              <tr><td style="font-weight:bold;font-size:17px;padding-top:8px">Total</td><td style="text-align:right;font-weight:bold;font-size:17px;color:#ff8a00;padding-top:8px">{Money(o.Total)}</td></tr>
            </table>
            """, "View order", url));
    }
}
