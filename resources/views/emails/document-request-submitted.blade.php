<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $documentTitle }} Request</title>
</head>
<body style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
    <h2 style="margin: 0 0 12px;">{{ $documentTitle }} Request Submitted</h2>
    <p>Hello {{ $documentRequest->employee_name }},</p>
    <p>Your {{ strtolower($documentTitle) }} request has been submitted successfully.</p>
    <p>A PDF copy of your request is attached to this email.</p>
    <p style="margin-top: 24px;">Thank you.</p>
</body>
</html>
