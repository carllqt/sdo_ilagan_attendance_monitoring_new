const documentTemplatePageStyle = `
    @page {
        size: A4 portrait;
        margin: 0;
    }

    .document-template-page {
        box-sizing: border-box;
        position: relative;
        width: 8.27in;
        min-height: 11.69in;
        overflow: hidden;
        padding: 2.25in 0.65in 1.2in;
        background: #ffffff;
    }

    .document-template-header,
    .document-template-footer {
        display: block;
        position: absolute;
        left: 0;
        width: 8.27in;
        max-width: none;
        object-fit: fill;
    }

    .document-template-header {
        top: 0;
        height: 2.22in;
    }

    .document-template-footer {
        bottom: 0.12in;
        height: 0.98in;
    }

    @media print {
        html,
        body {
            margin: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .document-template-page {
            position: static;
            overflow: visible;
            -webkit-box-decoration-break: clone;
            box-decoration-break: clone;
        }

        .document-template-header,
        .document-template-footer {
            position: fixed;
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
