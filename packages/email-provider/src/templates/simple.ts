import { Company, Populated } from '@internalpackage/types';

export const generateSimpleEmail = (
    title: string,
    paragraph: string,
    {
        company,
        mailSettings,
    }: {
        company: Partial<Populated<Company>>; // populate slot only
        mailSettings: Partial<{
            primaryColor: string;
        }>;
    }
): string => {
    const style = {
        primaryColor: mailSettings.primaryColor || '#0f172A',
    };

    const content = {
        title: title,
        firstParagraph: paragraph,
        company: {
            name: company.name,
            website: company.website,
            logo: (company.logo as { url?: string })?.url,
        },
    };

    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
<title></title>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<!--[if !mso]>-->
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<!--<![endif]-->
<meta name="x-apple-disable-message-reformatting" content="" />
<meta content="target-densitydpi=device-dpi" name="viewport" />
<meta content="true" name="HandheldFriendly" />
<meta content="width=device-width" name="viewport" />
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
<style type="text/css">
.pl-title {margin:0;Margin:0;font-family:Outfit,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:bold;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;direction:ltr;color:#0E1E3B;text-align:left;mso-line-height-rule:exactly;mso-text-raise:-1px;}
.pl-table-title {margin:0;Margin:0;font-family:Outfit,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:600;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;letter-spacing:-0.64px;direction:ltr;color:#0E1E3B;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;}
.pl-table-value {margin:0;Margin:0;font-family:Outfit,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;direction:ltr;color:#0E1E3B;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;}
.pl-link {margin:0;Margin:0;font-family:Outfit,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:${
        style.primaryColor
    };mso-line-height-rule:exactly;}
table {
border-collapse: separate;
table-layout: fixed;
mso-table-lspace: 0pt;
mso-table-rspace: 0pt
}
table td {
border-collapse: collapse
}
.ExternalClass {
width: 100%
}
.ExternalClass,
.ExternalClass p,
.ExternalClass span,
.ExternalClass font,
.ExternalClass td,
.ExternalClass div {
line-height: 100%
}
body, a, li, p, h1, h2, h3 {
-ms-text-size-adjust: 100%;
-webkit-text-size-adjust: 100%;
}
html {
-webkit-text-size-adjust: none !important
}
body, #innerTable {
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale
}
#innerTable img+div {
display: none;
display: none !important
}
img {
Margin: 0;
padding: 0;
-ms-interpolation-mode: bicubic
}
h1, h2, h3, p, a {
line-height: inherit;
overflow-wrap: normal;
white-space: normal;
word-break: break-word
}
a {
text-decoration: none
}
h1, h2, h3, p {
min-width: 100%!important;
width: 100%!important;
max-width: 100%!important;
display: inline-block!important;
border: 0;
padding: 0;
margin: 0
}
a[x-apple-data-detectors] {
color: inherit !important;
text-decoration: none !important;
font-size: inherit !important;
font-family: inherit !important;
font-weight: inherit !important;
line-height: inherit !important
}
u + #body a {
color: inherit;
text-decoration: none;
font-size: inherit;
font-family: inherit;
font-weight: inherit;
line-height: inherit;
}
a[href^="mailto"],
a[href^="tel"],
a[href^="sms"] {
color: inherit;
text-decoration: none
}
img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#0e1e3b;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Roboto,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:34px;font-weight:400;font-style:normal;font-size:28px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}
</style>
<style type="text/css">
@media (min-width: 481px) {
.hd { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.hm { display: none!important }
}
</style>
<style type="text/css">
@media (min-width: 481px) {
h1,img,p{margin:0;Margin:0}img,p{font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#0e1e3b;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h1{font-family:Roboto,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:34px;font-weight:400;font-style:normal;font-size:28px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h2,h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;font-weight:400;font-style:normal;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h2{line-height:30px;font-size:24px}h3{line-height:26px;font-size:20px}.t13,.t131,.t176,.t179,.t183,.t206,.t218,.t220,.t5,.t58,.t9{width:570px!important}.t4{line-height:39px!important;font-size:34px!important}.t126,.t171,.t53{width:498px!important}.t46{width:57.14286%!important}.t166,.t44,.t89{padding-bottom:0!important;padding-right:5px!important}.t16,.t20,.t22,.t25,.t29,.t32,.t35,.t39,.t42{width:279.57px!important}.t134,.t138,.t142,.t144,.t147,.t151,.t154,.t157,.t161,.t164{width:493px!important}.t123,.t91{width:50%!important}.t102,.t106,.t109,.t112,.t116,.t119,.t61,.t65,.t67,.t70,.t74,.t77,.t80,.t84,.t87,.t93,.t97,.t99{width:244px!important}.t121{padding-left:5px!important}.t50{width:42.85714%!important}.t188{width:5.96491%!important}.t192,.t196,.t200,.t204{width:7.7193%!important}
}
</style>
<style type="text/css" media="screen and (min-width:481px)">.moz-text-html img,.moz-text-html p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#0e1e3b;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h1{margin:0;Margin:0;font-family:Roboto,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:34px;font-weight:400;font-style:normal;font-size:28px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html .t183,.moz-text-html .t220,.moz-text-html .t5{width:570px!important}.moz-text-html .t4{line-height:39px!important;font-size:34px!important}.moz-text-html .t179{width:570px!important}.moz-text-html .t53{width:498px!important}.moz-text-html .t46{width:57.14286%!important}.moz-text-html .t44{padding-bottom:0!important;padding-right:5px!important}.moz-text-html .t35,.moz-text-html .t39,.moz-text-html .t42{width:279.57px!important}.moz-text-html .t176{width:570px!important}.moz-text-html .t171{width:498px!important}.moz-text-html .t166{padding-bottom:0!important;padding-right:5px!important}.moz-text-html .t134,.moz-text-html .t142,.moz-text-html .t144,.moz-text-html .t147,.moz-text-html .t151,.moz-text-html .t154,.moz-text-html .t157,.moz-text-html .t161,.moz-text-html .t164{width:493px!important}.moz-text-html .t131{width:570px!important}.moz-text-html .t138{width:493px!important}.moz-text-html .t13,.moz-text-html .t58{width:570px!important}.moz-text-html .t126{width:498px!important}.moz-text-html .t91{width:50%!important}.moz-text-html .t89{padding-bottom:0!important;padding-right:5px!important}.moz-text-html .t61,.moz-text-html .t65,.moz-text-html .t67,.moz-text-html .t70,.moz-text-html .t74,.moz-text-html .t77,.moz-text-html .t80,.moz-text-html .t84,.moz-text-html .t87{width:244px!important}.moz-text-html .t123{width:50%!important}.moz-text-html .t121{padding-left:5px!important}.moz-text-html .t102,.moz-text-html .t106,.moz-text-html .t109,.moz-text-html .t112,.moz-text-html .t116,.moz-text-html .t119,.moz-text-html .t93,.moz-text-html .t97,.moz-text-html .t99{width:244px!important}.moz-text-html .t16,.moz-text-html .t20,.moz-text-html .t22,.moz-text-html .t25,.moz-text-html .t29,.moz-text-html .t32{width:279.57px!important}.moz-text-html .t50{width:42.85714%!important}.moz-text-html .t206,.moz-text-html .t218{width:570px!important}.moz-text-html .t188{width:5.96491%!important}.moz-text-html .t192,.moz-text-html .t196,.moz-text-html .t200,.moz-text-html .t204{width:7.7193%!important}.moz-text-html .t9{width:570px!important}</style>
<!--[if !mso]>-->
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&amp;display=swap" rel="stylesheet" type="text/css" />
<!--<![endif]-->
<!--[if mso]>
<style type="text/css">
img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#0e1e3b;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Roboto,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:34px;font-weight:400;font-style:normal;font-size:28px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h1.t4{line-height:39px !important;font-size:34px !important}div.t46{width:57.14286% !important}td.t166,td.t44{padding-bottom:0 !important;padding-right:5px !important}div.t91{width:50% !important}td.t89{padding-bottom:0 !important;padding-right:5px !important}div.t123{width:50% !important}td.t121{padding-left:5px !important}div.t50{width:42.85714% !important}div.t188{width:5.96491% !important}div.t192,div.t196,div.t200,div.t204{width:7.7193% !important}
</style>
<![endif]-->
<!--[if mso]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
</head>
<body id="body" class="t224" style="min-width:100%;Margin:0px;padding:0px;background-color:#FAF8F5;"><div class="t223" style="background-color:#FAF8F5;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t222" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#FAF8F5;" valign="top" align="center">
<!--[if mso]>
<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
<v:fill color="#FAF8F5"/>
</v:background>
<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td>
<!--[if mso]>
<table class="t221" role="presentation" cellpadding="0" cellspacing="0" align="center">
<![endif]-->
<!--[if !mso]>-->
<table class="t221" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t220" style="width:600px;padding:40px 15px 40px 15px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t220" style="width:450px;padding:40px 15px 40px 15px;">
<!--<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">

${
    content.company?.logo
        ? `<tr><td>
<!--[if mso]>
<table class="t2" role="presentation" cellpadding="0" cellspacing="0" align="left">
<![endif]-->
<!--[if !mso]>-->
<table class="t2" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t1" style="width:40px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t1" style="width:40px;">
<!--<![endif]-->
<div style="font-size:0px;">
<img class="t0" style="display:block;border:0;Margin:0;width:auto;" width="40" height="40" alt="" src="${
              content.company.logo || 'https://via.placeholder.com/40x40'
          }"/>
</div></td>
</tr></table>
</td></tr>
<tr><td><div class="t3" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr>`
        : ''
}
<tr><td>
<!--[if mso]>
<table class="t6" role="presentation" cellpadding="0" cellspacing="0" align="center">
<![endif]-->
<!--[if !mso]>-->
<table class="t6" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t5" style="width:570px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t5" style="width:450px;">
<!--<![endif]-->
<h1 class="t4" style="margin:0;Margin:0;font-family:Outfit,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:34px;font-weight:600;font-style:normal;font-size:28px;text-decoration:none;text-transform:none;letter-spacing:-1.36px;direction:ltr;color:${
        style.primaryColor
    };text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">${
        content.title || 'Booking confirmation'
    }</h1></td>
</tr></table>
</td></tr><tr><td><div class="t7" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td>
<!--[if mso]>
<table class="t10" role="presentation" cellpadding="0" cellspacing="0" align="left">
<![endif]-->
<!--[if !mso]>-->
<table class="t10" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t9" style="width:570px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t9" style="width:450px;">
<!--<![endif]-->
<p class="t8" style="margin:0;Margin:0;font-family:Outfit,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;direction:ltr;color:#0E1E3B;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">${
        content.firstParagraph || 'Thanks for your reservation'
    }</p></td>
</tr></table>
</td></tr>

<tr><td><div class="t217" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td>
<!--[if mso]>
<table class="t219" role="presentation" cellpadding="0" cellspacing="0" align="center">
<![endif]-->
<!--[if !mso]>-->
<table class="t219" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t218" style="border-top:1px solid #CFCFCF;width:570px;padding:30px 0 40px 0;">
<![endif]-->
<!--[if !mso]>-->
<td class="t218" style="border-top:1px solid #CFCFCF;width:450px;padding:30px 0 40px 0;">
<!--<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">

${
    // hide reseau
    false
        ? `
<tr><td>
<!--[if mso]>
<table class="t207" role="presentation" cellpadding="0" cellspacing="0" align="left">
<![endif]-->
<!--[if !mso]>-->
<table class="t207" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t206" style="width:570px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t206" style="width:450px;">
<!--<![endif]-->
<div class="t205" style="display:inline-table;width:100%;text-align:left;vertical-align:middle;">
<!--[if mso]>
<table role="presentation" cellpadding="0" cellspacing="0" align="left" valign="middle" width="210"><tr><td width="34" valign="middle"><![endif]-->
<div class="t188" style="display:inline-table;text-align:initial;vertical-align:inherit;width:7.55556%;max-width:34px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t187"><tr>
<td class="t186" style="padding:0 10px 0 0;"><div style="font-size:0px;"><img class="t185" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="23.984375" alt="" src="https://f4f08f44-00a8-413f-8808-25bfdf1258c5.b-cdn.net/e/db29e36f-a1c0-460b-bd9f-3608ecb119ee/29d8f748-8e14-4eaf-b461-da412b47835f.png"/></div></td>
</tr></table>
</div>
<!--[if mso]>
</td><td width="44" valign="middle"><![endif]-->
<div class="t192" style="display:inline-table;text-align:initial;vertical-align:inherit;width:9.77778%;max-width:44px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t191"><tr>
<td class="t190" style="padding:0 10px 0 10px;"><div style="font-size:0px;"><img class="t189" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="23.453125" alt="" src="https://f4f08f44-00a8-413f-8808-25bfdf1258c5.b-cdn.net/e/db29e36f-a1c0-460b-bd9f-3608ecb119ee/d0ec711b-6de5-407f-8b75-89aab2384082.png"/></div></td>
</tr></table>
</div>
<!--[if mso]>
</td><td width="44" valign="middle"><![endif]-->
<div class="t196" style="display:inline-table;text-align:initial;vertical-align:inherit;width:9.77778%;max-width:44px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t195"><tr>
<td class="t194" style="padding:0 10px 0 10px;"><div style="font-size:0px;"><img class="t193" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="28.359375" alt="" src="https://f4f08f44-00a8-413f-8808-25bfdf1258c5.b-cdn.net/e/db29e36f-a1c0-460b-bd9f-3608ecb119ee/b201cc1d-4caf-4bf5-bd92-d4923c388fab.png"/></div></td>
</tr></table>
</div>
<!--[if mso]>
</td><td width="44" valign="middle"><![endif]-->
<div class="t200" style="display:inline-table;text-align:initial;vertical-align:inherit;width:9.77778%;max-width:44px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t199"><tr>
<td class="t198" style="padding:0 10px 0 10px;"><div style="font-size:0px;"><img class="t197" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="16.75" alt="" src="https://f4f08f44-00a8-413f-8808-25bfdf1258c5.b-cdn.net/e/db29e36f-a1c0-460b-bd9f-3608ecb119ee/71e129be-7a44-43ed-b169-9064334cba34.png"/></div></td>
</tr></table>
</div>
<!--[if mso]>
</td><td width="44" valign="middle"><![endif]-->
<div class="t204" style="display:inline-table;text-align:initial;vertical-align:inherit;width:9.77778%;max-width:44px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t203"><tr>
<td class="t202" style="padding:0 10px 0 10px;"><div style="font-size:0px;"><img class="t201" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="19.1875" alt="" src="https://f4f08f44-00a8-413f-8808-25bfdf1258c5.b-cdn.net/e/db29e36f-a1c0-460b-bd9f-3608ecb119ee/a137250a-4aa6-459d-b22d-62a17cda483c.png"/></div></td>
</tr></table>
</div>
<!--[if mso]>
</td>
</tr></table>
<![endif]-->
</div></td>
</tr></table>
</td></tr>
<tr><td><div class="t208" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr>
`
        : ''
}

<tr><td>
<!--[if mso]>
<table class="t211" role="presentation" cellpadding="0" cellspacing="0" align="left">
<![endif]-->
<!--[if !mso]>-->
<table class="t211" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t210" style="width:332px;padding:0 0 12px 0;">
<![endif]-->
<!--[if !mso]>-->
<td class="t210" style="width:332px;padding:0 0 12px 0;">
<!--<![endif]-->
<p class="t209" style="margin:0;Margin:0;font-family:Outfit,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:18px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#0E1E3B;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">${
        content.company?.name || 'Company Name'
    }. © ${new Date().getFullYear()}</p></td>
</tr></table>
</td></tr>

${
    content.company?.website
        ? `
<tr><td>
<!--[if mso]>
<table class="t216" role="presentation" cellpadding="0" cellspacing="0" align="left">
<![endif]-->
<!--[if !mso]>-->
<table class="t216" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;">
<!--<![endif]-->
<tr>
<!--[if mso]>
<td class="t215" style="width:280px;">
<![endif]-->
<!--[if !mso]>-->
<td class="t215" style="width:280px;">
<!--<![endif]-->
<p class="t214" style="margin:0;Margin:0;font-family:Outfit,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:18px;font-weight:400;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:${
              style.primaryColor
          };text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">
<a class="t212 pl-link" href="${content.company.website}" target="_blank">Website</a>
${
    // initial links
    false
        ? `<a class="t212 pl-link" href="https://tabular.email" target="_blank">Website</a>&nbsp; •&nbsp; <a class="t213 pl-link" href="https://tabular.email" target="_blank">Help</a>`
        : ''
}
</p></td>
</tr></table>
</td></tr>
`
        : ''
}
</table></td>
</tr></table>
</td></tr></table></td>
</tr></table>
</td></tr></table></td></tr></table></div></body>
</html>`;
};
