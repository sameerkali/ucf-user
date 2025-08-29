import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  ChevronDown, 
  ChevronRight,
  Book,
  Video,
  Download,
  ExternalLink
} from "lucide-react";

const PosHelpAndSupportPage = () => {
  const { t } = useTranslation();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      question: t("howToProcessSale") || "How do I process a sale?",
      answer: t("processSaleAnswer") || "To process a sale, click on 'New Sale' from the home dashboard, add items by scanning barcodes or searching, enter quantities, and complete the transaction by selecting a payment method."
    },
    {
      question: t("howToAddProducts") || "How do I add new products to inventory?",
      answer: t("addProductsAnswer") || "Go to Settings > Inventory Management > Add Product. Fill in product details including name, price, SKU, and stock quantity. You can also bulk import products using CSV files."
    },
    {
      question: t("howToViewReports") || "How can I view sales reports?",
      answer: t("viewReportsAnswer") || "Navigate to Reports section from the main menu. You can view daily, weekly, monthly reports including sales summary, top-selling products, and payment method breakdowns."
    },
    {
      question: t("howToHandleReturns") || "How do I handle returns and refunds?",
      answer: t("handleReturnsAnswer") || "In the Transactions section, find the original transaction, click on it, and select 'Process Return'. Choose items to return and select refund method."
    },
    {
      question: t("troubleshootPrinter") || "My receipt printer is not working. What should I do?",
      answer: t("troubleshootPrinterAnswer") || "Check printer connections, ensure it has paper and is powered on. Go to Settings > Printer Settings to reconfigure. If issues persist, contact technical support."
    },
    {
      question: t("howToBackupData") || "How do I backup my sales data?",
      answer: t("backupDataAnswer") || "Data is automatically backed up to the cloud daily. You can also manually export data from Settings > Data Management > Export Data."
    }
  ];

  const supportChannels = [
    {
      title: t("liveChat") || "Live Chat",
      description: t("liveChatDesc") || "Get instant help from our support team",
      icon: MessageCircle,
      color: "text-blue-600",
      bg: "bg-blue-50",
      action: t("startChat") || "Start Chat",
      available: "9 AM - 6 PM"
    },
    {
      title: t("phoneSupport") || "Phone Support",
      description: t("phoneSupportDesc") || "Call us for immediate assistance",
      icon: Phone,
      color: "text-green-600", 
      bg: "bg-green-50",
      action: "+91 1800-123-4567",
      available: "24/7 Available"
    },
    {
      title: t("emailSupport") || "Email Support",
      description: t("emailSupportDesc") || "Send us your questions via email",
      icon: Mail,
      color: "text-purple-600",
      bg: "bg-purple-50", 
      action: "pos-support@ucf.com",
      available: "Response in 2-4 hours"
    }
  ];

  const resources = [
    {
      title: t("userGuide") || "User Guide",
      description: t("userGuideDesc") || "Complete guide for using POS system",
      icon: Book,
      type: "PDF"
    },
    {
      title: t("videoTutorials") || "Video Tutorials",
      description: t("videoTutorialsDesc") || "Step-by-step video instructions",
      icon: Video,
      type: "Video"
    },
    {
      title: t("quickReference") || "Quick Reference Card",
      description: t("quickReferenceDesc") || "Printable reference for common tasks",
      icon: Download,
      type: "PDF"
    }
  ];

  const toggleFaq = (index: any) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("helpAndSupport") || "Help & Support"}
          </h1>
          <p className="text-gray-600">
            {t("helpDesc") || "Get help with your POS system and find answers to common questions"}
          </p>
        </div>

        {/* Quick Support Channels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {supportChannels.map((channel, index) => {
            const Icon = channel.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className={`${channel.bg} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${channel.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {channel.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {channel.description}
                </p>
                <div className="space-y-2">
                  <button className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${channel.color} ${channel.bg} hover:opacity-80`}>
                    {channel.action}
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    {channel.available}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {t("frequentlyAsked") || "Frequently Asked Questions"}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-4 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 text-gray-600 border-t border-gray-100">
                    <p className="mt-2">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resources Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {t("helpfulResources") || "Helpful Resources"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">{resource.title}</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {resource.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                      <div className="flex items-center text-blue-600 text-sm mt-2">
                        <span>{t("download") || "Download"}</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {t("contactUs") || "Contact Us"}
          </h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("name") || "Name"}
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("enterName") || "Enter your name"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("email") || "Email"}
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("enterEmail") || "Enter your email"}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("subject") || "Subject"}
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t("enterSubject") || "Brief description of your issue"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("message") || "Message"}
              </label>
              <textarea
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t("enterMessage") || "Describe your issue in detail..."}
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {t("sendMessage") || "Send Message"}
            </button>
          </form>
        </div>

        {/* System Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            {t("systemInfo") || "System Information"}
          </h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p>POS System Version: 2.1.0</p>
            <p>Last Updated: August 29, 2025</p>
            <p>Support ID: POS-{Date.now().toString().slice(-6)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosHelpAndSupportPage;
