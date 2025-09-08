import { useNavigate } from 'react-router-dom'
import { UserPlus, ClipboardCheck, PlusCircle, BarChart2, PieChart, Leaf } from 'lucide-react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend)

const PosHomePage = () => {
  const navigate = useNavigate()

  const handleCreateFarmerAccount = () => navigate('/pos/create-farmer-account')
  const handleReviewRequests = () => navigate('/pos/review-requests')
  const handlePost = () => navigate('/pos/create-post')
  const handleFulfillment = () => navigate('/pos/fulfillment-requests')
  const handleMyPosts = () => navigate('/pos/posts')
  const handleFarmersPosts = () => navigate('/pos/farmers-posts')

  const cards = [
    { title: 'New Farmer', icon: <UserPlus />, onClick: handleCreateFarmerAccount },
    { title: 'Review Requests', icon: <ClipboardCheck />, onClick: handleReviewRequests },
    { title: 'Create Post', icon: <PlusCircle />, onClick: handlePost },
    { title: 'Fulfillment', icon: <BarChart2 />, onClick: handleFulfillment },
    { title: 'My Posts', icon: <PieChart />, onClick: handleMyPosts },
    { title: 'Farmers Posts', icon: <Leaf />, onClick: handleFarmersPosts },
  ]

  // Chart Data
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [{
      label: 'Farmers Registered',
      data: [20, 25, 30, 35, 40, 38, 45, 50],
      borderColor: '#10B981', // Emerald-500
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#10B981',
      pointBorderColor: '#fff',
      pointHoverRadius: 7,
      pointHoverBackgroundColor: '#10B981',
      pointHoverBorderColor: '#fff',
    }],
  }

  const doughnutChartData = {
    labels: ['Wheat', 'Corn', 'Soybean', 'Vegetables', 'Fruits'],
    datasets: [{
      label: 'Crop Posts by Category',
      data: [300, 250, 180, 400, 150],
      backgroundColor: ['#34D399', '#6EE7B7', '#A7F3D0', '#059669', '#047857'],
      borderColor: '#F9FAFB',
      borderWidth: 2,
      hoverOffset: 8,
    }],
  }
  
  const chartOptions = { responsive: true, plugins: { legend: { position: 'top' } } }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 sm:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center space-x-3 mb-1">
            <Leaf className="w-10 h-10 text-emerald-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Agriculture Dashboard</h1>
          </div>
        </header>

        {/* Action Cards */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-16">
          {cards.map(({ title, icon, onClick }) => (
            <button
              key={title}
              onClick={onClick}
              className="group flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="text-emerald-600 group-hover:text-emerald-500 transition-colors mb-2">
                {icon}
              </div>
              <span className="text-gray-700 font-medium text-sm text-center group-hover:text-emerald-800">{title}</span>
            </button>
          ))}
        </section>

        {/* Main Data Section */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Growth Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Farmer Registration Growth</h2>
            <Line data={lineChartData} options={chartOptions} />
          </div>

          {/* Stats & Crop Distribution */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Crop Distribution</h3>
              <Doughnut data={doughnutChartData} options={{ responsive: true, plugins: { legend: { position: 'right' } } }} />
            </div>
            <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-lg">
              <h3 className="font-semibold opacity-90 mb-1">Total Farmers</h3>
              <p className="text-4xl font-bold">1,450</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default PosHomePage;









// import { useNavigate } from 'react-router-dom'
// import { UserPlus, ClipboardCheck, PlusCircle, BarChart2, PieChart, Leaf, ArrowRight } from 'lucide-react'
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js'
// import { Line, Bar } from 'react-chartjs-2'

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

// const PosHomePage = () => {
//   const navigate = useNavigate()

//   const actions = [
//     { title: 'Create Farmer Account', icon: <UserPlus size={20} />, onClick: () => navigate('/pos/create-farmer-account') },
//     { title: 'Review Requests', icon: <ClipboardCheck size={20} />, onClick: () => navigate('/pos/review-requests') },
//     { title: 'Create Post', icon: <PlusCircle size={20} />, onClick: () => navigate('/pos/create-post') },
//     { title: 'Fulfillment Requests', icon: <BarChart2 size={20} />, onClick: () => navigate('/pos/fulfillment-requests') },
//     { title: 'My Posts', icon: <PieChart size={20} />, onClick: () => navigate('/pos/posts') },
//     { title: 'Area Farmers Posts', icon: <Leaf size={20} />, onClick: () => navigate('/pos/farmers-posts') },
//   ]

//   // Chart Data
//   const lineChartData = {
//     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
//     datasets: [{
//       label: 'Farmers Registered',
//       data: [20, 25, 30, 35, 40, 38, 45],
//       borderColor: '#047857', // Emerald-700
//       backgroundColor: 'rgba(4, 120, 87, 0.1)',
//       fill: true,
//       tension: 0.4,
//     }],
//   }
  
//   const barChartData = {
//     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
//     datasets: [{
//       label: 'Sales (in $1000s)',
//       data: [12, 19, 15, 25, 22, 30, 28],
//       backgroundColor: '#34D399', // Emerald-400
//       borderColor: '#059669', // Emerald-600
//       borderWidth: 1,
//       borderRadius: 4,
//     }],
//   }
  
//   const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }

//   return (
//     <div className="min-h-screen bg-gray-100 font-sans">
//       <div className="flex flex-col lg:flex-row">
//         {/* Sidebar */}
//         <aside className="w-full lg:w-64 bg-white lg:min-h-screen p-6 border-r border-gray-200">
//           <div className="flex items-center space-x-2 mb-10">
//             <Leaf className="w-8 h-8 text-emerald-700" />
//             <h1 className="text-2xl font-bold text-gray-800">Agri-POS</h1>
//           </div>
//           <nav className="flex flex-col space-y-2">
//             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</p>
//             {actions.map(({ title, icon, onClick }) => (
//               <button
//                 key={title}
//                 onClick={onClick}
//                 className="flex items-center justify-between p-3 rounded-lg text-gray-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors duration-200"
//               >
//                 <div className="flex items-center space-x-3">
//                   {icon}
//                   <span className="font-medium text-sm">{title}</span>
//                 </div>
//                 <ArrowRight size={16} className="opacity-0 group-hover:opacity-100" />
//               </button>
//             ))}
//           </nav>
//         </aside>

//         {/* Main Content */}
//         <main className="flex-1 p-8 md:p-12">
//           <header className="mb-10">
//             <h2 className="text-4xl font-bold text-gray-800">Dashboard Overview</h2>
//             <p className="text-gray-500 mt-1">Welcome back, here's your agricultural market summary.</p>
//           </header>

//           {/* Stats Cards */}
//           <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
//             <div className="bg-white p-6 rounded-xl border border-gray-200">
//               <h3 className="text-sm font-medium text-gray-500">Total Farmers</h3>
//               <p className="text-3xl font-bold text-emerald-700 mt-1">1,450</p>
//             </div>
//             <div className="bg-white p-6 rounded-xl border border-gray-200">
//               <h3 className="text-sm font-medium text-gray-500">Crops Sold (YTD)</h3>
//               <p className="text-3xl font-bold text-emerald-700 mt-1">7,380</p>
//             </div>
//             <div className="bg-white p-6 rounded-xl border border-gray-200">
//               <h3 className="text-sm font-medium text-gray-500">New Posts Today</h3>
//               <p className="text-3xl font-bold text-emerald-700 mt-1">12</p>
//             </div>
//           </section>

//           {/* Charts */}
//           <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
//             <div className="bg-white p-6 rounded-xl border border-gray-200 h-96">
//               <h3 className="text-lg font-semibold text-gray-800 mb-4">Farmer Registration Growth</h3>
//               <Line data={lineChartData} options={chartOptions} />
//             </div>
//             <div className="bg-white p-6 rounded-xl border border-gray-200 h-96">
//               <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Sales</h3>
//               <Bar data={barChartData} options={chartOptions} />
//             </div>
//           </section>
//         </main>
//       </div>
//     </div>
//   )
// }

// export default PosHomePage







// import { useNavigate } from 'react-router-dom'
// import { ClipboardCheck, PlusCircle, Leaf, ArrowUpRight, Sprout, Tractor, Wheat } from 'lucide-react'
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
// import { Line, Pie } from 'react-chartjs-2'

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend)

// const PosHomePage = () => {
//   const navigate = useNavigate()

//   const cards = [
//     { title: 'Onboard New Farmer', icon: <Sprout className="w-7 h-7 text-emerald-600" />, onClick: () => navigate('/pos/create-farmer-account') },
//     { title: 'Review Requests', icon: <ClipboardCheck className="w-7 h-7 text-emerald-600" />, onClick: () => navigate('/pos/review-requests') },
//     { title: 'Create New Post', icon: <PlusCircle className="w-7 h-7 text-emerald-600" />, onClick: () => navigate('/pos/create-post') },
//     { title: 'Manage Fulfillments', icon: <Tractor className="w-7 h-7 text-emerald-600" />, onClick: () => navigate('/pos/fulfillment-requests') },
//     { title: 'View My Posts', icon: <Wheat className="w-7 h-7 text-emerald-600" />, onClick: () => navigate('/pos/posts') },
//     { title: 'Browse Local Posts', icon: <Leaf className="w-7 h-7 text-emerald-600" />, onClick: () => navigate('/pos/farmers-posts') },
//   ]
  
//   // Chart Data
//   const lineChartData = {
//     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
//     datasets: [{
//       label: 'Farmers Registered',
//       data: [20, 25, 30, 35, 40, 38, 45, 50],
//       borderColor: '#059669', // Emerald-600
//       backgroundColor: 'rgba(16, 185, 129, 0.2)',
//       fill: true,
//       tension: 0.3,
//     }],
//   }

//   const pieChartData = {
//     labels: ['Wheat', 'Corn', 'Soybean', 'Other'],
//     datasets: [{
//       data: [45, 25, 15, 15],
//       backgroundColor: ['#065f46', '#047857', '#059669', '#10b981'],
//       hoverBackgroundColor: ['#064e3b', '#065f46', '#047857', '#059669'],
//       borderColor: '#f0fdf4',
//       borderWidth: 4,
//     }],
//   }

//   const chartOptions = { responsive: true, plugins: { legend: { display: true, position: 'bottom' } } }

//   return (
//     <div className="min-h-screen bg-emerald-50/30 p-5 sm:p-8 font-sans">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <header className="mb-8">
//           <h1 className="text-4xl font-bold text-gray-900">Market Overview</h1>
//           <p className="text-gray-600">Real-time data for the agricultural ecosystem.</p>
//         </header>

//         {/* Key Stats */}
//         <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-2xl text-white shadow-lg">
//             <h3 className="text-lg font-medium opacity-80">Total Farmers</h3>
//             <p className="text-5xl font-bold mt-2">1,450</p>
//             <p className="flex items-center mt-2 text-sm opacity-90"><ArrowUpRight size={16} className="mr-1"/> 50 this month</p>
//           </div>
//           <div className="bg-white p-6 rounded-2xl shadow-md border">
//             <h3 className="text-lg font-medium text-gray-500">Crops Sold (YTD)</h3>
//             <p className="text-5xl font-bold mt-2 text-emerald-700">7,380</p>
//             <p className="mt-2 text-sm text-gray-500">Represents 12,000+ tons</p>
//           </div>
//           <div className="bg-white p-6 rounded-2xl shadow-md border">
//             <h3 className="text-lg font-medium text-gray-500">New Area Posts</h3>
//             <p className="text-5xl font-bold mt-2 text-emerald-700">340</p>
//             <p className="mt-2 text-sm text-gray-500">In the last 30 days</p>
//           </div>
//         </section>

//         {/* Main Grid */}
//         <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Main Chart */}
//           <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md border">
//             <h2 className="text-2xl font-semibold text-gray-800 mb-4">Farmer Registration Trend</h2>
//             <div className="h-96"><Line data={lineChartData} options={{...chartOptions, maintainAspectRatio: false}} /></div>
//           </div>

//           {/* Side Panel */}
//           <div className="space-y-8">
          
//             <div className="bg-white p-6 rounded-2xl shadow-md border">
//               <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
//               <div className="grid grid-cols-2 gap-4">
//                 {cards.map(({ title, icon, onClick }) => (
//                   <button key={title} onClick={onClick} className="flex flex-col items-center p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
//                     {icon}
//                     <span className="text-xs font-semibold text-emerald-800 text-center mt-2">{title.split(' ').slice(0, 2).join(' ')}</span>
//                   </button>
//                 ))}
//               </div>
//             </div>

//               <div className="bg-white p-6 rounded-2xl shadow-md border">
//               <h2 className="text-2xl font-semibold text-gray-800 mb-4">Posts by Crop Type</h2>
//               <Pie data={pieChartData} options={chartOptions} />
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   )
// }

// export default PosHomePage