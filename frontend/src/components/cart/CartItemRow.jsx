import { Trash2 } from "lucide-react";
import Button from "../common/Button";
import { formatCurrency, placeholderImage } from "../../utils/helpers";

function CartItemRow({ item, onUpdate, onRemove }) {
  const price = item.product?.discountPrice || item.product?.price || 0;

  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center">
      <img
        src={item.product?.images?.[0]?.url || placeholderImage}
        alt={item.product?.name}
        className="h-28 w-full rounded-2xl object-cover sm:w-28"
      />
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{item.product?.name}</h3>
        <p className="mt-1 text-sm text-smoke">{item.product?.category?.name || item.product?.metalType}</p>
        <p className="mt-3 text-base font-semibold text-gold">{formatCurrency(price)}</p>
      </div>
      <div className="flex items-center gap-3">
        <select
          value={item.quantity}
          onChange={(event) => onUpdate(item.productId, Number(event.target.value))}
          className="rounded-full border border-white/10 bg-base px-4 py-2 text-sm"
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>
              Qty {value}
            </option>
          ))}
        </select>
        <Button variant="ghost" className="px-3" onClick={() => onRemove(item.productId)}>
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
}

export default CartItemRow;
