import { BankStatementParser } from '@/components/admin/reconciliation/BankStatementParser'
import { SumUpTransactionReconciler } from '@/components/admin/reconciliation/SumUpTransactionReconciler'

export default function ReconciliationPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Payment Reconciliation</h1>
                <p className="text-slate-500 mt-2">Match bank transfers and SumUp transactions with pending memberships.</p>
            </div>

            <div className="space-y-12">
                <section>
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-slate-800">Bank Transfer Reconciliation</h2>
                        <p className="text-sm text-slate-500">Paste bank statement lines to match manually.</p>
                    </div>
                    <BankStatementParser />
                </section>

                <hr className="border-slate-200" />

                <section>
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-slate-800">SumUp Terminal Reconciliation</h2>
                        <p className="text-sm text-slate-500">Reconcile transactions from handheld devices.</p>
                    </div>
                    <SumUpTransactionReconciler />
                </section>
            </div>
        </div>
    )
}
