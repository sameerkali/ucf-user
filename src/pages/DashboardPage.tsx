import { ArrowLeft, Plus, ChevronRight, Info, MoreVertical } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useNavigate } from 'react-router-dom';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
    const navigate = useNavigate();
  const chartData = {
    labels: ['🍑', '🫘', '🌿', '🌶️'],
    datasets: [
      {
        data: [5000, 10000, 3003, 6000],
        backgroundColor: [
          '#F4D03F',
          '#D4A574',
          '#fdfa72',
          '#ffcccb'
        ],
        borderRadius: 4,
        maxBarThickness: 40,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `₹${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 12500,
        ticks: {
          stepSize: 2500,
          callback: function(value: any) {
            return `₹${value.toLocaleString()}`;
          }
        },
        grid: {
          color: '#E5E5E5',
          drawBorder: false,
        }
      },
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        }
      }
    },
    layout: {
      padding: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
      }
    }
  };

  const crops = [
    { name: 'Apricot', emoji: '🍑', profit: 5000 },
    { name: 'Bean', emoji: '🫘', profit: 10000 },
    { name: 'Black & Green...', emoji: '🌿', profit: 0 },
    { name: 'Capsicum & ...', emoji: '🌶️', profit: 0 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="flex items-center px-4 py-4 max-w-6xl mx-auto">
          <ArrowLeft onClick={() => navigate(-1)} className="w-6 h-6 text-gray-700 mr-3" />
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        </div>
      </div>

      <div className="px-4 py-6 max-w-6xl mx-auto space-y-6">
        {/* Estimated Total Profit Card */}
        <div className="bg-blue-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-medium text-gray-800">Estimated total profit</h2>
            <Info className="w-5 h-5 text-gray-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 ">₹15,000</div>
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-6 lg:space-y-0">
          {/* Calculate Profit Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Calculate profit</h3>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-medium text-gray-700">Your Crops</h4>
              <button className="flex items-center gap-1 text-blue-600 font-medium">
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            <div className="space-y-1">
              {crops.map((crop, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{crop.emoji}</span>
                    <span className="font-medium text-gray-900">{crop.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">₹{crop.profit.toLocaleString()}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Profit Breakdown Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Profit breakdown</h3>
              <div className="text-xl font-bold text-gray-900">Total profit: ₹15,000</div>
            </div>
            
            <div className="h-64 lg:h-80">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
