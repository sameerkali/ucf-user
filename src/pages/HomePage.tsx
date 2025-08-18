import { useState } from "react";
import CropCard from "../components/CropCard";
import PostModal from "../components/PostModal";

// Dummy data example
const cropRequests = [
  {
    title: "I need 20 quintals wheat",
    description: "Requesting supply or purchase of 20 quintals of wheat. Provide price, delivery, and quality details.",
    status: "Pending",
    image: "", // For fallback demo; url could also start with http://localhost:5000
    id: 1,
  },
  {
    title: "I need 15 quintals rice",
    description: "Seeking 15 quintals of rice for sowing season. Interested in bulk rates and certified seeds.",
    status: "Pending",
    image: "https://dummyimages.com/rice.jpg",
    id: 2,
  }
  // ... add more as needed
];

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);
  const [activePost, setActivePost] = useState(null);

  const handleTrack = (item) => {
    // Your track logic here
    alert(`Track: ${item.title}`);
  };

  const handleCancel = (item) => {
    // Your cancel logic here
    alert(`Cancel: ${item.title}`);
  };

  const handlePost = (item) => {
    setActivePost(item);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-950 px-2 py-8 flex flex-col items-center">
      <div className="w-full max-w-xl mx-auto space-y-4">
        {cropRequests.map((item) => (
          <CropCard
            key={item.id}
            title={item.title}
            description={item.description}
            status={item.status}
            image={item.image}
            onTrack={() => handleTrack(item)}
            onCancel={() => handleCancel(item)}
            onPost={() => handlePost(item)}
          />
        ))}
      </div>
      <PostModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
