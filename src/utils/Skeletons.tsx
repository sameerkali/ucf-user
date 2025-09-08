import { Loader2 } from "lucide-react";

export const CarouselSkeleton = () => (
  <div className="bg-green-100 rounded-2xl shadow-sm mb-6">
    <div className="h-48 sm:h-64 md:h-72 lg:h-80 bg-gradient-to-r from-green-200 to-green-300 animate-pulse flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin w-12 h-12 text-green-600 mx-auto mb-3" />
        <p className="text-green-700 font-medium">Loading Carousel...</p>
      </div>
    </div>
  </div>
);

export const PostsSkeleton = () => (
  <div className="space-y-6">
    <div className="h-8 bg-green-100 rounded-lg w-48 animate-pulse"></div>
    
    {/* Mobile skeleton */}
    <div className="lg:hidden">
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex-shrink-0 w-72 bg-white border border-green-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-green-200 to-green-300 animate-pulse flex items-center justify-center">
                <Loader2 className="animate-spin w-8 h-8 text-green-600" />
              </div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-green-100 rounded animate-pulse"></div>
                <div className="h-3 bg-green-50 rounded animate-pulse w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-green-50 rounded animate-pulse w-1/2"></div>
                  <div className="h-3 bg-green-50 rounded animate-pulse w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Desktop skeleton */}
    <div className="hidden lg:grid lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="bg-white border border-green-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="h-40 bg-gradient-to-br from-green-200 to-green-300 animate-pulse flex items-center justify-center">
            <Loader2 className="animate-spin w-6 h-6 text-green-600" />
          </div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-green-100 rounded animate-pulse"></div>
            <div className="h-3 bg-green-50 rounded animate-pulse w-3/4"></div>
            <div className="space-y-2">
              <div className="h-8 bg-green-50 rounded animate-pulse"></div>
              <div className="h-8 bg-green-50 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="text-center mt-8">
      <p className="text-green-600 font-medium flex items-center justify-center gap-2">
        <Loader2 className="animate-spin w-4 h-4" />
        Loading Posts...
      </p>
    </div>
  </div>
);

export const CategoriesSkeleton = () => (
  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-lg border border-green-100">
    <div className="text-center mb-8">
      <div className="h-8 bg-green-100 rounded-lg w-64 mx-auto mb-2 animate-pulse"></div>
      <div className="h-4 bg-green-50 rounded w-96 mx-auto animate-pulse"></div>
    </div>
    
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-6 max-w-5xl mx-auto">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
        <div key={item} className="flex flex-col items-center">
          <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-green-200 to-green-400 rounded-2xl mb-4 animate-pulse flex items-center justify-center">
            <Loader2 className="animate-spin w-6 h-6 text-green-600" />
          </div>
          <div className="h-4 bg-green-100 rounded w-20 animate-pulse"></div>
        </div>
      ))}
    </div>
    
    <div className="text-center mt-8">
      <p className="text-green-600 font-medium flex items-center justify-center gap-2">
        <Loader2 className="animate-spin w-4 h-4" />
        Loading Categories...
      </p>
    </div>
  </div>
);



export const LoadingSkeleton: React.FC<{ limit: number }> = ({ limit }) => (
  <div className="min-h-screen p-4 bg-gray-50 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    {[...Array(limit)].map((_, idx) => (
      <div
        key={idx}
        className="animate-pulse border border-gray-200 rounded-lg p-6 bg-white"
        role="status"
        aria-label="Loading post skeleton"
      >
        <div className="h-6 bg-gray-300 rounded w-2/3 mb-3"></div>
        <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6 mb-5"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-4/5"></div>
          <div className="h-4 bg-gray-300 rounded w-3/5"></div>
        </div>
        <div className="mt-6 flex space-x-4">
          <div className="h-8 w-20 bg-gray-300 rounded"></div>
          <div className="h-8 w-20 bg-gray-300 rounded"></div>
        </div>
      </div>
    ))}
  </div>
)
export const PosFarmerDetailsModalSkeleton: React.FC = () => (
    <div className="space-y-6 animate-pulse">
        <div className="p-4 bg-slate-100 rounded-lg">
            <div className="h-7 w-2/3 bg-slate-200 rounded"></div>
            <div className="h-5 w-1/3 bg-slate-200 rounded mt-2"></div>
        </div>
        {[1, 2, 3].map(i => (
             <div key={i}>
                <div className="h-6 w-1/3 bg-slate-200 rounded mb-4"></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-5 w-full bg-slate-200 rounded"></div>
                    <div className="h-5 w-full bg-slate-200 rounded"></div>
                    <div className="h-5 w-full bg-slate-200 rounded"></div>
                    <div className="h-5 w-full bg-slate-200 rounded"></div>
                </div>
            </div>
        ))}
    </div>
);

export const FarmerCardSkeleton: React.FC = () => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 animate-pulse">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full sm:w-auto">
                <div className="h-6 w-3/4 sm:w-1/2 bg-slate-200 rounded"></div>
                <div className="h-4 w-1/2 sm:w-1/3 bg-slate-200 rounded mt-2"></div>
            </div>
            <div className="w-full sm:w-auto mt-3 sm:mt-0">
                <div className="h-5 w-full sm:w-32 bg-slate-200 rounded"></div>
                <div className="h-5 w-full sm:w-48 bg-slate-200 rounded mt-2"></div>
            </div>
            <div className="w-28 h-10 bg-slate-200 rounded-lg self-start sm:self-center mt-3 sm:mt-0"></div>
        </div>
    </div>
);