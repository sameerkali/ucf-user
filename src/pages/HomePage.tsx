import React, { useState } from "react";
import CropCard from "../components/CropCard";
import PostModal from "../components/PostModal";

interface CropRequest {
  title: string;
  description: string;
  cropType?: string;
  date?: string;
  image?: string;
  id: number;
}

const cropRequests: CropRequest[] = [
  {
    title: "I need 20 quintals wheat",
    description:
      "Requesting supply or purchase of 20 quintals wheat. Provide price, delivery, and quality details.",
    cropType: "Wheat",
    date: "2025-08-12",
    image: "",
    id: 1,
  },
  {
    title: "I need 15 quintals rice",
    description:
      "Seeking 15 quintals of rice for sowing season. Interested in bulk rates and certified seeds.",
    cropType: "Rice",
    date: "2025-08-10",
    image: "",
    id: 2,
  },
  // ... Add more if needed
];

const HomePage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeCrop, setActiveCrop] = useState<CropRequest | null>(null);

  const handleCardClick = (item: CropRequest) => {
    setActiveCrop(item);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen  py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            gap-6
          "
        >
          {cropRequests.map((item) => (
            <CropCard
              key={item.id}
              title={item.title}
              description={item.description}
              cropType={item.cropType}
              date={item.date}
              image={item.image}
              onClick={() => handleCardClick(item)}
            />
          ))}
        </div>
      </div>
      <PostModal open={showModal} onClose={() => setShowModal(false)} crop={activeCrop || undefined} />
    </div>
  );
};

export default HomePage;
