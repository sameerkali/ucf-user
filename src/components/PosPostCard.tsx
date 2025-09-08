interface CreatedBy {
  id: string
  role: string
}

interface Crop {
  name: string
  type: string
  quantity: number
  pricePerQuintal: number
}

interface Location {
  state: string
  district: string
  tehsil: string
  block: string
  village: string
  pincode: string
}

interface Post {
  _id: string
  createdBy: CreatedBy
  type: string
  crops: Crop[]
  title: string
  description: string
  readyByDate: string
  photos: string[]
  videos: string[]
  location: Location
  status: string
  createdAt: string
  updatedAt: string
}

interface ApiResponseData {
  totalCount: number
  totalPages: number
  currentPage: number
  limit: number
  data: Post[]
}


const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const formatDateToReadable = (dateStr: string) => {
    if (!dateStr) return "Invalid Date"
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return "Invalid Date"
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    } catch {
      return "Invalid Date"
    }
  }

  return (
    <li className="relative border border-gray-300 rounded-xl p-6 hover:shadow-lg transition-shadow bg-white flex flex-col">
      <h2 className="text-xl font-semibold mb-3">{post.title}</h2>
      <p className="text-gray-700 mb-4">{post.description}</p>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Crops:</h3>
        <ul className="list-disc list-inside space-y-1 max-w-full break-words">
          {post.crops.length === 0 ? (
            <li className="text-gray-500 italic text-sm">No crops listed</li>
          ) : (
            post.crops.map((crop, i) => (
              <li key={i}>
                {crop.name} ({crop.type}) - Qty: {crop.quantity} Quintals @ ₹
                {crop.pricePerQuintal} per Quintal
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-1">Location:</h3>
        <p className="text-gray-600 break-words text-sm">
          {post.location.village}, {post.location.block}, {post.location.tehsil},{" "}
          {post.location.district}, {post.location.state} - {post.location.pincode}
        </p>
      </div>

      <div className="flex flex-wrap gap-4 text-gray-600 text-xs break-words">
        <div>
          Status:{" "}
          <span
            className={`font-semibold ${
              post.status === "active" ? "text-green-600" : "text-red-600"
            }`}
          >
            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
          </span>
        </div>
        <div>Ready By: {formatDateToReadable(post.readyByDate)}</div>
        <div>Created: {formatDateToReadable(post.createdAt)}</div>
        <div>Updated: {formatDateToReadable(post.updatedAt)}</div>
      </div>
    </li>
  )
}
export default PostCard;