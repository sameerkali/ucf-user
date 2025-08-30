import { useNavigate } from 'react-router-dom'
import { UserPlus, ClipboardCheck, ArrowRight, Magnet } from 'lucide-react'

const PosHomePage = () => {
  const navigate = useNavigate()

const handleCreateFarmerAccount = () => {
  navigate('/pos/create-farmer-account')
}

const handleReviewRequests = () => {
  navigate('/pos/review-requests')
}
const handlePost = () => {
  navigate('/pos/create-post')
}


  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            POS Dashboard
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 font-medium">
            Farmer Management System
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
          
          {/* Create Farmer Account Card */}
          <div 
            onClick={handleCreateFarmerAccount}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-300 hover:-translate-y-1 p-6 sm:p-8"
          >
            <div className="text-center">
              {/* Icon */}
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                <UserPlus className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
              </div>
              
              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors duration-300">
                Create Farmer Account
              </h3>
              
              {/* Description */}
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                Register new farmers in the system and set up their profiles
              </p>
              
              {/* Action Indicator */}
              <div className="mt-4 sm:mt-6">
                <div className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                  <span className="text-sm sm:text-base">Get Started</span>
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Review Requests Card */}
          <div 
            onClick={handleReviewRequests}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-green-300 hover:-translate-y-1 p-6 sm:p-8"
          >
            <div className="text-center">
              {/* Icon */}
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-green-200 transition-colors duration-300">
                <ClipboardCheck className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
              </div>
              
              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-green-600 transition-colors duration-300">
                Review Requests
              </h3>
              
              {/* Description */}
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                Approve or reject pending farmer applications and requests
              </p>
              
              {/* Action Indicator */}
              <div className="mt-4 sm:mt-6">
                <div className="inline-flex items-center text-green-600 font-medium group-hover:text-green-700">
                  <span className="text-sm sm:text-base">Review Now</span>
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </div>
           {/* Create a post */}
          <div 
            onClick={handlePost}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-green-300 hover:-translate-y-1 p-6 sm:p-8"
          >
            <div className="text-center">
              {/* Icon */}
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-green-200 transition-colors duration-300">
                <Magnet className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
              </div>
              
              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-green-600 transition-colors duration-300">
                Create a Post
              </h3>
              
              {/* Description */}
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                create post for buy and sell crops 
              </p>
              
              {/* Action Indicator */}
              <div className="mt-4 sm:mt-6">
                <div className="inline-flex items-center text-green-600 font-medium group-hover:text-green-700">
                  <span className="text-sm sm:text-base">Post now </span>
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Optional Footer Section */}
        <div className="text-center mt-12 sm:mt-16">
          <p className="text-gray-500 text-sm sm:text-base">
            Need help? Contact support or check the user guide
          </p>
        </div>
      </div>
    </div>
  )
}

export default PosHomePage
