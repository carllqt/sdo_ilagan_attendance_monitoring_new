const documentTemplatePageStyle = `
    @page {
        size: 8.5in 13in;
        margin: 0;
    }

    .document-template-page {
        box-sizing: border-box;
        position: relative;
        width: 8.5in;
        height: 13in;
        overflow: hidden;
        margin: 0;
        padding: 2.75in 0.75in 1.5in;
        background: #ffffff;
    }

    .document-template-header,
    .document-template-footer {
        display: block;
        position: absolute;
        left: 0;
        width: 8.5in;
        max-width: none;
        object-fit: fill;
    }

    .document-template-header {
        top: 0.5in;
        height: 2.22in;
    }

    .document-template-footer {
        bottom: 0.5in;
        height: 0.98in;
    }

    @media print {
        html,
        body {
            width: 8.5in;
            height: auto;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .document-template-page {
            box-sizing: border-box;
            position: relative;
            width: 8.5in;
            min-height: 13in;
            height: auto;
            margin: 0;
            overflow: visible;
            padding: 2.75in 0.75in 1.5in;
            -webkit-box-decoration-break: clone;
            box-decoration-break: clone;
        }

        .document-template-header,
        .document-template-footer {
            position: fixed;
            left: 0;
            z-index: 10;
        }

        .document-template-header {
            top: 0.25in;
        }

        .document-template-footer {
            bottom: 0.5in;
        }

        .tardiness-summary-table thead {
            display: table-header-group;
        }

        .tardiness-summary-table tr {
            break-inside: avoid;
            page-break-inside: avoid;
        }
    }
`;

export default documentTemplatePageStyle;