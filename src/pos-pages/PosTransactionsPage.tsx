import { useTranslation } from "react-i18next";

export default function PosTransactionsPage() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("transactions") || "Sales & Transactions"}
          </h1>
          <p className="text-gray-600">
            {t("transactionsDesc") || "Manage your sales and transaction history"}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("transactionsComingSoon") || "Transaction Management Coming Soon"}
            </h3>
            <p className="text-gray-600">
              {t("transactionsFeatureDesc") || "Advanced transaction management features will be available here."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
