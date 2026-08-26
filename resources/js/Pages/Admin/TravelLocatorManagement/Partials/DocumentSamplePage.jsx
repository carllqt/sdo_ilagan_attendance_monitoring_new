import { PDFViewer, pdf } from "@react-pdf/renderer";
import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, Download, FileSearch, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button } from "@/Components/ui/button";

export const sampleFieldClassName =
    "mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const DocumentSamplePage = ({
    documentTitle,
    initialSample,
    pageTitle,
    renderFields,
    ReportComponent,
}) => {
    const [sample, setSample] = useState(() => ({ ...initialSample }));
    const [previewSample, setPreviewSample] = useState(() => ({
        ...initialSample,
    }));
    const [isGenerating, setIsGenerating] = useState(false);
    const pdfDocument = useMemo(
        () => <ReportComponent data={previewSample} />,
        [ReportComponent, previewSample],
    );

    const downloadSample = async () => {
        if (isGenerating) return;

        setIsGenerating(true);

        try {
            const blob = await pdf(pdfDocument).toBlob();
            const downloadUrl = URL.createObjectURL(blob);
            const downloadLink = document.createElement("a");

            downloadLink.href = downloadUrl;
            downloadLink.download = `${documentTitle}.pdf`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();
            window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
        } finally {
            setIsGenerating(false);
        }
    };

    const updateField = (field, value) => {
        setSample((current) => ({ ...current, [field]: value }));
    };

    const resetSample = () => {
        setSample({ ...initialSample });
        setPreviewSample({ ...initialSample });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <FileSearch className="h-5 w-5 text-blue-600" />
                    <span>{pageTitle} Document Test</span>
                </div>
            }
        >
            <Head title={`${pageTitle} Document Test`} />

            <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">
                            {pageTitle} Sample Testing
                        </h1>
                        <p className="text-sm text-slate-500">
                            React PDF preview only. This page does not save a
                            request.
                        </p>
                    </div>

                    <Link
                        href="/travel-locator-management"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Management
                    </Link>
                </div>

                <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            setPreviewSample({ ...sample });
                        }}
                        className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Sample Information
                            </h2>
                            <p className="text-sm text-slate-500">
                                Change any field, then update the preview.
                            </p>
                        </div>

                        {renderFields({
                            fieldClassName: sampleFieldClassName,
                            sample,
                            updateField,
                        })}

                        <div className="grid grid-cols-2 gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetSample}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                            <Button type="submit" variant="blue">
                                <FileSearch className="mr-2 h-4 w-4" />
                                Preview
                            </Button>
                        </div>
                    </form>

                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="font-semibold text-slate-900">
                                    Document Preview
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Uses the shared Summary header and footer
                                    template.
                                </p>
                            </div>

                            <Button
                                type="button"
                                variant="blue"
                                onClick={downloadSample}
                                disabled={isGenerating}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                {isGenerating
                                    ? "Generating..."
                                    : "Download Sample"}
                            </Button>
                        </div>

                        <div className="h-[75vh] min-h-[680px] overflow-hidden bg-slate-200">
                            <PDFViewer
                                className="h-full w-full border-0"
                                showToolbar
                            >
                                {pdfDocument}
                            </PDFViewer>
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default DocumentSamplePage;
