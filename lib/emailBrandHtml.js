/**
 * Email-safe header block matching storefront branding (no external images).
 * Primary #02C3B6 matches Tailwind `primary` in ma-ap.
 */
const PRIMARY = "#019B91";
const STONE_900 = "#0c0a09";
const STONE_400 = "#a8a29e";

const emailBrandHtml = `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 28px auto;">
  <tr>
    <td align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
        <tr>
          <td style="background-color:${STONE_900};color:#ffffff;border-radius:16px;padding:16px 22px;font-weight:900;font-size:28px;line-height:1;font-family:Arial,Helvetica,sans-serif;text-align:center;">
            V
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top:14px;font-size:18px;font-weight:900;color:${STONE_900};letter-spacing:3px;font-family:Arial,Helvetica,sans-serif;">
            VARNOX
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top:14px;">
            <div style="height:4px;width:56px;background-color:${PRIMARY};border-radius:4px;margin:0 auto;opacity:0.95;"></div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;

module.exports = { emailBrandHtml, PRIMARY, STONE_900 };
