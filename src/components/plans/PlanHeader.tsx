import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  validity: string;
  highlight?: boolean;
  badge?: string;
  priceId: string;
}

interface PlanHeaderProps {
  plan: Plan;
}

const PlanHeader = ({ plan }: PlanHeaderProps) => {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    navigate(`/checkout/${plan.priceId}`);
  };
  return <div className="p-8 text-center h-full flex flex-col justify-between min-h-[400px] py-[56px] px-[13px]">
      {/* Plan content */}
      <div className="flex-1 flex flex-col justify-center space-y-6">
        {/* Plan name */}
        <h3 className="text-white font-bold text-2xl tracking-wide">{plan.name}</h3>
        
        {/* Price section */}
        <div className="space-y-2">
          <div className="text-white font-extrabold text-4xl flex justify-center items-baseline">
            <span className="text-lg mr-2 text-gray-300 font-normal">R$</span>
            <span className="text-3xl">{plan.price.toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="text-[#a259ff] text-base font-semibold">{plan.period}</div>
        </div>
        
        {/* Validity */}
        <div className="text-gray-300 text-sm leading-relaxed">
          <span className="text-white font-semibold">{plan.validity}</span>
        </div>
      </div>
      
      {/* CTA Button - Consistently styled */}
      <div className="mt-8">
        <Button 
          onClick={handleSubscribe}
          className="w-full bg-gradient-to-r from-[#a259ff] to-[#8b5cf6] hover:from-[#b366ff] hover:to-[#9c6cfa] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-[#8b5cf6]/40 hover:shadow-xl hover:shadow-[#8b5cf6]/50 transform hover:scale-105 text-base"
        >
          Assinar Agora
        </Button>
      </div>
    </div>;
};
export default PlanHeader;