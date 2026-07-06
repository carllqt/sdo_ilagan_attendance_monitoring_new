<?php

namespace App\Mail;

use App\Models\LocatorSlipRequest;
use App\Models\TravelOrderRequest;
use App\Services\DocumentRequestPdfService;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DocumentRequestSubmitted extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public LocatorSlipRequest|TravelOrderRequest $documentRequest,
        public string $requestType,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->pdf()->title($this->requestType).' PDF Copy',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.document-request-submitted',
            with: [
                'documentTitle' => $this->pdf()->title($this->requestType),
                'documentRequest' => $this->documentRequest,
            ],
        );
    }

    public function attachments(): array
    {
        return [
            Attachment::fromData(
                fn () => $this->pdf()->output($this->documentRequest, $this->requestType),
                $this->pdf()->filename($this->documentRequest, $this->requestType),
            )->withMime('application/pdf'),
        ];
    }

    private function pdf(): DocumentRequestPdfService
    {
        return app(DocumentRequestPdfService::class);
    }
}
