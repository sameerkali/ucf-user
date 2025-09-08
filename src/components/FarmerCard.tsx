import { ArrowRight, MapPin, Phone } from "lucide-react";
import type { Farmer } from "../pos-pages/PosFarmersUnderMe";

const FarmerCard: React.FC<{ farmer: Farmer; onSelect: (id: string) => void }> = ({ farmer, onSelect }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 transition-all duration-300 hover:shadow-lg hover:border-emerald-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
                <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${farmer.isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    <p className="font-bold text-lg text-slate-800">{farmer.name}</p>
                </div>
                <p className="text-slate-500 text-sm ml-5">{farmer.fatherName}</p>
            </div>
            <div className="flex flex-col sm:text-right text-sm text-slate-600 w-full sm:w-auto">
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400"/> {farmer.mobile}</div>
                <div className="flex items-center gap-2 mt-1"><MapPin className="w-4 h-4 text-slate-400"/> {farmer.address.village}, {farmer.address.district}</div>
            </div>
            <button
                onClick={() => onSelect(farmer._id)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold transition-colors hover:bg-emerald-700 w-full sm:w-auto"
            >
                <span>Details</span>
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    </div>
);
export default FarmerCard;