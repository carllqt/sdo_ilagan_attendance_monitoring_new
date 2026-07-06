<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Locator Slip</title>
    <style>
        @font-face {
            font-family: OldEnglish;
            src: url("{{ public_path('fonts/oldenglishtextmt.ttf') }}") format("truetype");
        }

        @page {
            margin: 20px 50px;
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
            font-size: 18px;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 8px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .main-table {
            border: 1px solid #000;
            font-size: 14px;
        }

        .main-table td,
        .certification td {
            border: 1px solid #000;
            padding: 6px 8px;
            vertical-align: top;
        }

        .label {
            width: 160px;
            font-weight: bold;
        }

        .value {
            text-transform: uppercase;
        }

        .signature-cell {
            width: 50%;
            height: 80px;
            text-align: center;
            vertical-align: bottom !important;
            padding-bottom: 6px !important;
        }

        .certification {
            border: 1px solid #000;
            margin-top: 14px;
        }

        .certification-title {
            text-align: center;
            font-weight: bold;
        }

        .certification-body {
            height: 130px;
            padding: 18px 12px !important;
        }

        .certification-signature {
            width: 350px;
            margin-left: auto;
            line-height: 1.5;
        }

        .footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            border-top: 1px solid #000;
            font-size: 11px;
            padding-top: 6px;
        }

        .footer td {
            border: 0;
            padding: 0;
            vertical-align: middle;
        }

        .footer-logos {
            height: 54px;
        }

        .footer-address {
            text-align: right;
            font-weight: bold;
            font-size: 12px;
            line-height: 1.2;
            margin-bottom: 6px;
        }

        .contacts {
            width: 100%;
            text-align: right;
            font-size: 9px;
            font-weight: bold;
            white-space: nowrap;
        }

        .contact-item {
            display: inline-block;
            margin-left: 12px;
        }

        .contact-icon {
            width: 12px;
            height: 12px;
            vertical-align: middle;
            margin-right: 3px;
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

        <div class="title">LOCATOR SLIP</div>

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
                <td class="label" style="height: 44px;">
                    Purpose of Travel<br>
                    <span style="font-size: 10px;">(must be supported by attachments)</span>
                </td>
                <td class="value">{{ $request->purpose_of_travel }}</td>
            </tr>
            <tr>
                <td class="label">Please Check</td>
                <td>
                    <span style="font-family: DejaVu Sans, sans-serif;">
                        {{ $request->travel_type === 'official_business' ? '☑' : '☐' }}
                    </span>
                    Official Business
                    <span style="display: inline-block; width: 30px;"></span>
                    <span style="font-family: DejaVu Sans, sans-serif;">
                        {{ $request->travel_type === 'official_time' ? '☑' : '☐' }}
                    </span>
                    Official Time
                </td>
            </tr>
            <tr>
                <td class="label">Date and Time</td>
                <td class="value">{{ $request->travel_datetime?->format('F j, Y h:i A') }}</td>
            </tr>
            <tr>
                <td class="label">Destination</td>
                <td class="value">{{ $request->destination }}</td>
            </tr>
            <tr>
                <td colspan="2" style="padding: 0;">
                    <table>
                        <tr>
                            <td class="signature-cell">
                                _____________________________<br>
                                Signature of Requesting Employee
                            </td>
                            <td class="signature-cell">
                                _____________________________<br>
                                Signature of Head of Office
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <table class="certification">
            <tr>
                <td class="certification-title">CERTIFICATION</td>
            </tr>
            <tr>
                <td class="certification-body">
                    To the concerned:<br><br>
                    This is to certify that the above-named DepEd official/personnel has visited or
                    appeared in this Office/place for the purpose and during the date and time stated
                    above.
                    <br><br><br>
                    <div class="certification-signature">
                        Name and Signature:<br>
                        Position/Designation:<br>
                        Office:
                    </div>
                </td>
            </tr>
        </table>

        <div class="footer">
            <table>
                <tr>
                    <td style="width: 360px;">
                        <img class="footer-logos" src="{{ public_path('img/footer_logos.png') }}" alt="Footer Logos">
                    </td>
                    <td>
                        <div class="footer-address">
                            City Civic Center, Alibagu, City of Ilagan, Isabela
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
