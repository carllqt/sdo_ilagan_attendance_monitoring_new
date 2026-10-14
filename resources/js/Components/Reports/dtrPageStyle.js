const dtrPageStyle = `
    @page {
        size: 8.5in 13in;
        margin: 0;
    }

    .dtr-print-page {
        box-sizing: border-box;
        position: relative;
        width: 8.5in;
        height: 13in;
        overflow: hidden;
        margin: 0;
        padding: 0.5in;
        background: #ffffff;
    }

    @media print {
        html, body {
            width: 8.5in;
            height: 13in;
            margin: 0 !important;
            padding: 0 !important;
        }
        body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        #dtr-print-content {
            position: static !important;
            top: auto !important;
            left: auto !important;
            width: 8.5in !important;
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: 100% !important;
            text-size-adjust: 100% !important;
        }
        .dtr-print-page {
            -webkit-box-decoration-break: clone;
            box-decoration-break: clone;
        }
        .dtr-print-page + .dtr-print-page {
            break-before: page;
        }
        #dtr-print-content * {
            -webkit-text-size-adjust: 100% !important;
            text-size-adjust: 100% !important;
        }
    }
`;

export default dtrPageStyle;

