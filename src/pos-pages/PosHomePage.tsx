import { useTranslation } from "react-i18next";

export default function PosHomePage() {
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const stats = [
    {
      title: t("todaySales") || "Today's Sales",
      value: "₹12,450",
      change: "+12%",
      positive: true
    },
    {
      title: t("transactions") || "Transactions",
      value: "24",
      change: "+8%",
      positive: true
    },
    {
      title: t("productsSold") || "Products Sold",
      value: "156",
      change: "+15%",
      positive: true
    },
    {
      title: t("customers") || "Customers",
      value: "18",
      change: "+5%",
      positive: true
    }
  ];

  const quickActions = [
    {
      title: t("newSale") || "New Sale",
      icon: "🛒",
      color: "bg-green-50 text-green-600"
    },
    {
      title: t("viewReports") || "View Reports",
      icon: "📊",
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: t("manageStock") || "Manage Stock",
      icon: "📦",
      color: "bg-purple-50 text-purple-600"
    },
    {
      title: t("transactionHistory") || "Transaction History",
      icon: "💳",
      color: "bg-orange-50 text-orange-600"
    }
  ];

  const recentTransactions = [
    {
      id: "T001",
      time: "10:30 AM",
      items: "Rice (5kg), Oil (1L)",
      amount: 450,
      payment: "Cash"
    },
    {
      id: "T002",
      time: "09:15 AM",
      items: "Wheat (10kg)",
      amount: 320,
      payment: "UPI"
    },
    {
      id: "T003",
      time: "08:45 AM",
      items: "Sugar (2kg), Salt (1kg)",
      amount: 180,
      payment: "Card"
    }
  ];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("welcomeBack") || "Welcome back"}, {user.name || "POS User"}!
          </h1>
          <p className="text-gray-600">
            {t("todayOverview") || "Here's what's happening in your store today"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                {stat.title}
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <span className={`text-sm font-medium ${
                  stat.positive ? "text-green-600" : "text-red-600"
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {t("quickActions") || "Quick Actions"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className={`p-4 text-center rounded-lg transition-colors hover:opacity-80 ${action.color}`}
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <span className="text-sm font-medium">{action.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            {t("recentTransactions") || "Recent Transactions"}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">
                    {t("transactionId") || "ID"}
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">
                    {t("time") || "Time"}
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">
                    {t("items") || "Items"}
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">
                    {t("amount") || "Amount"}
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">
                    {t("payment") || "Payment"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100">
                    <td className="py-3 px-2 font-mono text-gray-900">
                      {transaction.id}
                    </td>
                    <td className="py-3 px-2 text-gray-600">
                      {transaction.time}
                    </td>
                    <td className="py-3 px-2 text-gray-900">
                      {transaction.items}
                    </td>
                    <td className="py-3 px-2 font-semibold text-gray-900">
                      ₹{transaction.amount}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.payment === 'Cash' 
                          ? 'bg-green-100 text-green-800'
                          : transaction.payment === 'UPI'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {transaction.payment}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
