import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, ChevronRight, TrendingUp, Package, DollarSign, Calendar, PieChart, BarChart3 } from 'lucide-react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Type definitions
interface Crop {
  name: string;
  quantity: number;
}

interface StatusCount {
  count: number;
  value: number;
  crops: Crop[];
}

interface StatusCounts {
  [status: string]: StatusCount;
}

interface MonthlyStatEntry {
  [status: string]: number;
}

interface MonthlyStats {
  [month: string]: MonthlyStatEntry;
}

interface DashboardData {
  role: string;
  totalFulfillments: number;
  statusCounts: StatusCounts;
  monthlyStats: MonthlyStats;
}

interface ProcessedCrop {
  name: string;
  quantity: number;
}

interface KeyMetric {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  iconColor: string;
  textColor: string;
}

// Chart data types
type BarChartData = ChartData<'bar', number[], string>;
type DoughnutChartData = ChartData<'doughnut', number[], string>;
type LineChartData = ChartData<'line', number[], string>;

type BarChartOptions = ChartOptions<'bar'>;
type DoughnutChartOptions = ChartOptions<'doughnut'>;
type LineChartOptions = ChartOptions<'line'>;

// Component state types


const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data with proper error handling
  const fetchDashboardData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get<DashboardData>('/api/fulfillments/statistics');
      
      // With axios, the data is in response.data
      setDashboardData(response.data);
      setError(null);
    } catch (err: any) {
      // Axios error handling
      let errorMessage = 'Unknown error occurred';
      
      if (err.response) {
        // Server responded with error status
        errorMessage = `Failed to fetch dashboard data: ${err.response.status} ${err.response.statusText}`;
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
      } else if (err.message) {
        // Something else happened
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Calculate total value across all statuses
  const getTotalValue = useCallback((): number => {
    if (!dashboardData?.statusCounts) return 0;
    return Object.values(dashboardData.statusCounts).reduce(
      (sum: number, status: StatusCount) => sum + (status.value || 0), 
      0
    );
  }, [dashboardData]);

  // Get all unique crops with their total quantities
  const getAllCrops = useCallback((): ProcessedCrop[] => {
    if (!dashboardData?.statusCounts) return [];
    const cropMap = new Map<string, number>();
    
    Object.values(dashboardData.statusCounts).forEach((status: StatusCount) => {
      status.crops?.forEach((crop: Crop) => {
        if (cropMap.has(crop.name)) {
          cropMap.set(crop.name, cropMap.get(crop.name)! + crop.quantity);
        } else {
          cropMap.set(crop.name, crop.quantity);
        }
      });
    });
    
    return Array.from(cropMap.entries()).map(([name, quantity]: [string, number]) => ({ 
      name, 
      quantity 
    }));
  }, [dashboardData]);

  // Status distribution chart data
  const getStatusChartData = useCallback((): BarChartData => {
    if (!dashboardData?.statusCounts) {
      return { labels: [], datasets: [] };
    }
    
    const statuses: string[] = Object.keys(dashboardData.statusCounts);
    const counts: number[] = Object.values(dashboardData.statusCounts).map(
      (status: StatusCount) => status.count
    );
    const values: number[] = Object.values(dashboardData.statusCounts).map(
      (status: StatusCount) => status.value || 0
    );
    
    return {
      labels: statuses.map((status: string) => 
        status.charAt(0).toUpperCase() + status.slice(1)
      ),
      datasets: [
        {
          label: 'Count',
          data: counts,
          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
          borderRadius: 8,
          maxBarThickness: 40,
        },
        {
          label: 'Value (₹)',
          data: values,
          backgroundColor: ['#93C5FD', '#6EE7B7', '#FCD34D', '#FCA5A5'],
          borderRadius: 8,
          maxBarThickness: 40,
        }
      ]
    };
  }, [dashboardData]);

  // Crop distribution pie chart
  const getCropPieData = useCallback((): DoughnutChartData => {
    const crops: ProcessedCrop[] = getAllCrops();
    if (crops.length === 0) {
      return { labels: [], datasets: [] };
    }
    
    return {
      labels: crops.map((crop: ProcessedCrop) => crop.name),
      datasets: [
        {
          data: crops.map((crop: ProcessedCrop) => crop.quantity),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
          ],
          borderWidth: 2,
          borderColor: '#fff',
        }
      ]
    };
  }, [getAllCrops]);

  // Monthly trend data
  const getMonthlyTrendData = useCallback((): LineChartData => {
    if (!dashboardData?.monthlyStats) {
      return { labels: [], datasets: [] };
    }
    
    const months: string[] = Object.keys(dashboardData.monthlyStats);
    const pendingData: number[] = months.map((month: string) => 
      dashboardData.monthlyStats[month].pending || 0
    );
    const verificationData: number[] = months.map((month: string) => 
      dashboardData.monthlyStats[month]['pending for verification'] || 0
    );
    
    return {
      labels: months,
      datasets: [
        {
          label: 'Pending',
          data: pendingData,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
        },
        {
          label: 'Pending for Verification',
          data: verificationData,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          fill: true,
        }
      ]
    };
  }, [dashboardData]);

  // Chart options with proper typing
  const barChartOptions: BarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'bar'>): string {
            const label = context.dataset.label || '';
            if (label.includes('Value')) {
              return `${label}: ₹${context.parsed.y.toLocaleString()}`;
            }
            return `${label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: string | number): string | number {
            return typeof value === 'number' ? value.toLocaleString() : value;
          }
        }
      }
    }
  };

  const doughnutChartOptions: DoughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'doughnut'>): string {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value} units`;
          }
        }
      }
    }
  };

  const lineChartOptions: LineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'line'>): string {
            const label = context.dataset.label || '';
            return `${label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: string | number): string | number {
            return typeof value === 'number' ? value.toLocaleString() : value;
          }
        }
      }
    }
  };

  // Key metrics calculation
  const getKeyMetrics = useCallback((): KeyMetric[] => {
    const allCrops = getAllCrops();
    const totalValue = getTotalValue();
    
    return [
      {
        label: 'Total Fulfillments',
        value: dashboardData?.totalFulfillments || 0,
        icon: <Package className="w-8 h-8 text-blue-200" />,
        gradient: 'from-blue-500 to-blue-600',
        iconColor: 'text-blue-200',
        textColor: 'text-blue-100'
      },
      {
        label: 'Total Value',
        value: `₹${totalValue.toLocaleString()}`,
        icon: <DollarSign className="w-8 h-8 text-green-200" />,
        gradient: 'from-green-500 to-green-600',
        iconColor: 'text-green-200',
        textColor: 'text-green-100'
      },
      {
        label: 'Unique Crops',
        value: allCrops.length,
        icon: <PieChart className="w-8 h-8 text-purple-200" />,
        gradient: 'from-purple-500 to-purple-600',
        iconColor: 'text-purple-200',
        textColor: 'text-purple-100'
      },
      {
        label: 'Total Quantity',
        value: allCrops.reduce((sum: number, crop: ProcessedCrop) => sum + crop.quantity, 0).toLocaleString(),
        icon: <TrendingUp className="w-8 h-8 text-orange-200" />,
        gradient: 'from-orange-500 to-orange-600',
        iconColor: 'text-orange-200',
        textColor: 'text-orange-100'
      }
    ];
  }, [dashboardData, getAllCrops, getTotalValue]);

  // Event handlers
  const handleBackNavigation = useCallback((): void => {
    navigate(-1);
  }, [navigate]);

  const handleRefresh = useCallback((): void => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg p-8 shadow-lg max-w-md mx-4">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Data validation
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No dashboard data available</p>
        </div>
      </div>
    );
  }

  const allCrops: ProcessedCrop[] = getAllCrops();
  const statusEntries: [string, StatusCount][] = Object.entries(dashboardData.statusCounts);
  const keyMetrics: KeyMetric[] = getKeyMetrics();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="flex items-center px-4 py-4 max-w-7xl mx-auto">
          <ArrowLeft 
            onClick={handleBackNavigation} 
            className="w-6 h-6 text-gray-700 mr-3 cursor-pointer hover:text-gray-900 transition-colors" 
          />
          <h1 className="text-xl font-semibold text-gray-900">
            Dashboard - {dashboardData.role}
          </h1>
          <div className="ml-auto">
            <button
              onClick={handleRefresh}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-7xl mx-auto space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {keyMetrics.map((metric: KeyMetric, index: number) => (
            <div key={index} className={`bg-gradient-to-r ${metric.gradient} rounded-2xl p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${metric.textColor} text-sm font-medium`}>{metric.label}</p>
                  <p className="text-3xl font-bold">{metric.value}</p>
                </div>
                {metric.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Fulfillment Status Overview</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-80">
              <Bar data={getStatusChartData()} options={barChartOptions} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Crop Distribution</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-80">
              <Doughnut data={getCropPieData()} options={doughnutChartOptions} />
            </div>
          </div>
        </div>

        {/* Status Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {statusEntries.map(([status, data]: [string, StatusCount]) => (
            <div key={status} className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  {status.replace(/([A-Z])/g, ' $1')}
                </h3>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Count: {data.count}</p>
                  <p className="text-lg font-bold text-gray-900">₹{data.value.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 mb-2">Associated Crops:</h4>
                {data.crops?.map((crop: Crop, index: number) => (
                  <div key={`${crop.name}-${index}`} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-semibold text-sm">
                          {crop.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{crop.name}</span>
                    </div>
                    <span className="font-semibold text-gray-700">{crop.quantity} units</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Trends */}
        {dashboardData.monthlyStats && Object.keys(dashboardData.monthlyStats).length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-80">
              <Line data={getMonthlyTrendData()} options={lineChartOptions} />
            </div>
          </div>
        )}

        {/* Detailed Crop List */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">All Crops Overview</h3>
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
              <Plus className="w-4 h-4" />
              View Details
            </button>
          </div>
          
          {allCrops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allCrops.map((crop: ProcessedCrop, index: number) => (
                <div key={`${crop.name}-overview-${index}`} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {crop.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{crop.name}</p>
                      <p className="text-sm text-gray-500">{crop.quantity} units</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No crops data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
