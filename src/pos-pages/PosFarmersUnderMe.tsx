import React, { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import toast from "react-hot-toast"
import api from "../api/axios"
import { ChevronsLeft, ChevronsRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import FarmerDetailsModal from "../components/FarmerDetailsModal"
import FarmerCard from "../components/FarmerCard"
import { FarmerCardSkeleton } from "../utils/Skeletons"

export interface Farmer {
  _id: string
  name: string
  fatherName: string
  mobile: string
  adharNo: string
  address: {
    state: string
    district: string
    tehsil: string
    block: string
    village: string
    pincode: string
  }
  authMethod: string
  role: string
  isVerified: boolean
  mobileVerified: boolean
  bankVerified: boolean
  otherDetailsVerified: boolean
  profileStatus: string
  createdAt: string
  updatedAt: string
  isVerifiedBy?: { userId: string; role: string }
}

export interface ApiResponseList {
  success: boolean
  page: number
  totalPages: number
  totalUsers: number
  users: Farmer[]
  message?: string
}

interface ProfileType {
  _id: string
  role: string
}

const Pagination: React.FC<{
  page: number
  totalPages: number
  setPage: React.Dispatch<React.SetStateAction<number>>
}> = ({ page, totalPages, setPage }) => (
  <div className="flex justify-center items-center mt-8 space-x-4">
    <button
      onClick={() => setPage(1)}
      disabled={page === 1}
      className="p-2 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500"
      aria-label="First page"
      type="button"
    >
      <ChevronsLeft className="w-5 h-5" />
    </button>
    <span className="font-semibold text-slate-700" aria-live="polite" aria-atomic="true">
      Page {page} of {totalPages}
    </span>
    <button
      onClick={() => setPage(totalPages)}
      disabled={page === totalPages}
      className="p-2 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500"
      aria-label="Last page"
      type="button"
    >
      <ChevronsRight className="w-5 h-5" />
    </button>
  </div>
)

const PosFarmersUnderMe: React.FC = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [page, setPage] = useState<number>(1)
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user")
      if (userData) {
        const parsedProfile = JSON.parse(userData) as ProfileType
        setProfile(parsedProfile)
      } else {
        toast.error("No profile data found, please login.")
        navigate("/login")
      }
    } catch {
      toast.error("Error loading profile data, please login.")
      navigate("/login")
    }
  }, [navigate])

  const posId = profile?._id
  const token = localStorage.getItem("token")

  const { data, isLoading } = useQuery<ApiResponseList, Error>({
    queryKey: ["pos-farmers", posId, page],
    queryFn: async () => {
      if (!posId) return { success: true, page, totalPages: 1, totalUsers: 0, users: [] }
      const { data } = await api.post<ApiResponseList>(
        "/api/pos/get-farmers",
        { data: { filters: { _id: posId }, page } },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      )
      if (!data.success) throw new Error(data.message || "Failed to load farmers")
      return data
    },
    enabled: !!posId,
    placeholderData: { success: true, page, totalPages: 1, totalUsers: 0, users: [] },
    refetchOnWindowFocus: false,
  })

  const farmers: Farmer[] = data?.users ?? []

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Farmers In Your Area</h1>
          <p className="text-slate-500 mt-1">View and manage details of all farmers registered under you.</p>
        </header>

        <div className="space-y-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <FarmerCardSkeleton key={i} />)
            : farmers.map((farmer) => (
                <FarmerCard key={farmer._id} farmer={farmer} onSelect={setSelectedFarmerId} />
              ))}
        </div>

        {data && data.totalPages > 1 && (
          <Pagination page={page} totalPages={data.totalPages} setPage={setPage} />
        )}

        <FarmerDetailsModal
          isOpen={!!selectedFarmerId}
          onClose={() => setSelectedFarmerId(null)}
          farmerId={selectedFarmerId}
        />
      </div>
    </div>
  )
}

export default PosFarmersUnderMe
