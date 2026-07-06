<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Travel Order</title>
    <style>
        @font-face {
            font-family: OldEnglish;
            src: url("{{ public_path('fonts/oldenglishtextmt.ttf') }}") format("truetype");
        }

        @page {
            margin: 20px 24px;
        }

        body {
            margin: 0;
            background: #fff;
            color: #000;
            font-family: "Times New Roman", serif;
            font-size: 12px;
        }

        .page {
            min-height: 1083px;
            position: relative;
        }

        .header {
            text-align: center;
            line-height: 1.2;
            margin-bottom: 8px;
        }

        .logo {
            width: 65px;
            display: block;
            margin: 0 auto 4px;
        }

        .old-english-small {
            font-family: OldEnglish, "Times New Roman", serif;
            font-size: 16px;
        }

        .old-english-large {
            font-family: OldEnglish, "Times New Roman", serif;
            font-size: 24px;
            font-weight: bold;
        }

        .header-line {
            border-top: 1px solid #000;
            margin: 8px 0;
        }

        .title {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 10px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .main-table {
            border: 1px solid #000;
        }

        .main-table td {
            border: 1px solid #000;
            padding: 6px 8px;
            vertical-align: top;
        }

        .label {
            width: 180px;
            font-weight: bold;
        }

        .value {
            text-transform: uppercase;
        }

        .attestation {
            margin-top: 10px;
            font-size: 11px;
        }

        .signature-table {
            margin-top: 15px;
        }

        .signature-table td {
            border: 0;
            padding: 0;
            vertical-align: top;
        }

        .signature-date {
            text-align: center;
            width: 220px;
        }

        .footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            border-top: 1px solid #000;
            padding-top: 8px;
            font-size: 11px;
            font-weight: bold;
        }

        .footer td {
            border: 0;
            padding: 0;
            vertical-align: middle;
        }

        .footer-logos {
            height: 46px;
        }

        .footer-address {
            text-align: right;
            line-height: 1.2;
        }

        .contacts {
            margin-top: 2px;
            text-align: right;
            font-size: 10px;
            white-space: nowrap;
        }

        .contact-item {
            display: inline-block;
            margin-left: 16px;
        }

        .contact-icon {
            width: 12px;
            height: 12px;
            vertical-align: middle;
            margin-right: 4px;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="header">
            <img class="logo" src="{{ public_path('img/logo.png') }}" alt="Logo">
            <div class="old-english-small">Republic of the Philippines</div>
            <div class="old-english-large">Department of Education</div>
            <div style="font-size: 13px; font-weight: bold;">REGION II - CAGAYAN VALLEY</div>
            <div style="font-size: 13px; font-weight: bold;">SCHOOLS DIVISION OF THE CITY OF ILAGAN</div>
        </div>

        <div class="header-line"></div>

        <div class="title">TRAVEL AUTHORITY FOR OFFICIAL LOCAL TRAVEL</div>

        <table class="main-table">
            <tr>
                <td class="label">NAME</td>
                <td class="value">{{ $request->employee_name }}</td>
            </tr>
            <tr>
                <td class="label">Position/Designation</td>
                <td class="value">{{ $request->position }}</td>
            </tr>
            <tr>
                <td class="label">Permanent Station</td>
                <td class="value">{{ $request->permanent_station }}</td>
            </tr>
            <tr>
                <td class="label">TO SHUTTLE SDS</td>
                <td class="value">{{ $request->purpose_of_travel }}</td>
            </tr>
            <tr>
                <td class="label">Host of Activity</td>
                <td class="value">{{ $request->host_of_activity }}</td>
            </tr>
            <tr>
                <td class="label">Inclusive Dates</td>
                <td class="value">{{ $request->inclusive_dates?->format('F j, Y') }}</td>
            </tr>
            <tr>
                <td class="label">Destination</td>
                <td class="value">{{ $request->destination }}</td>
            </tr>
            <tr>
                <td class="label">Fund Source</td>
                <td class="value">{{ $request->fund_source }}</td>
            </tr>
        </table>

        <div class="attestation">
            <i>
                I hereby attest that the information in this form and in the supporting documents
                attached hereto are true and correct.
            </i>
        </div>

        <table class="signature-table">
            <tr>
                <td>
                    <b class="value">{{ $request->employee_name }}</b><br>
                    Name and Signature of Requesting Employee
                </td>
                <td class="signature-date">
                    ___________________<br>
                    Date
                </td>
            </tr>
            <tr>
                <td style="padding-top: 20px;">
                    <b>CHERRY R. RAMIRO, PhD, CESO VI</b><br>
                    Assistant Schools Division Superintendent
                </td>
                <td class="signature-date" style="padding-top: 20px;">
                    ___________________<br>
                    Date
                </td>
            </tr>
        </table>

        <div style="margin-top: 15px; font-weight: bold;">APPROVED:</div>

        <table class="signature-table" style="margin-top: 8px;">
            <tr>
                <td>
                    <b>EDUARDO C. ESCORPISO JR., EdD, CESO V</b><br>
                    Schools Division Superintendent
                </td>
                <td class="signature-date">
                    ___________________<br>
                    Date
                </td>
            </tr>
        </table>

        <div class="footer">
            <table>
                <tr>
                    <td style="width: 200px;">
                        <img class="footer-logos" src="{{ public_path('img/footer_logos.png') }}" alt="Footer Logos">
                    </td>
                    <td>
                        <div class="footer-address">
                            Civic Center, Alibagu, City of Ilagan, Isabela<br>
                            Telephone Nos. (078) 624-0077
                        </div>
                        <div class="contacts">
                            <span class="contact-item">
                                <img class="contact-icon" src="{{ public_path('img/fb_logo.png') }}" alt="Facebook">www.facebook.com/sdoilagan
                            </span>
                            <span class="contact-item">
                                <img class="contact-icon" src="{{ public_path('img/gmail.png') }}" alt="Email">ilagan@deped.gov.ph
                            </span>
                            <span class="contact-item">
                                <img class="contact-icon" src="{{ public_path('img/internet.png') }}" alt="Website">www.sdocityofilagan.gov.ph
                            </span>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>
