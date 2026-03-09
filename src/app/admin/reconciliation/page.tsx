import { BankStatementParser } from '@/components/admin/reconciliation/BankStatementParser'

export default function ReconciliationPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Bank Transfer Reconciliation</h1>
                <p className="text-slate-500 mt-1">Paste rows from your bank statement to quickly identify and confirm member payments.</p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 flex flex-col gap-2">
                <p className="font-semibold flex items-center gap-2">
                    How it works
                </p>
                <ul className="list-disc list-inside space-y-1 ml-1 text-blue-700">
                    <li>Copy a block of text directly from your online banking statement.</li>
                    <li>Paste it into the text area below.</li>
                    <li>The system will extract £ amounts and try to match names against members whose status is <strong>Awaiting Payment</strong>.</li>
                    <li>Review the suggestions and click <strong>Confirm & Link</strong> to log the successful payment.</li>
                </ul>
            </div>

            <BankStatementParser />
        </div>
    )
}
