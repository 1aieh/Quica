import { observer } from "mobx-react-lite";
import { myQuicaModel } from "../model/QuicaModel";
import AdminPanelView from "../components/admin/AdminPanelView";
import AdminOrderCard from "../components/admin/AdminOrderCard";

const AdminPanelPresenter = observer(() => {
  const handleDelete = async (orderId) => {
    // Show a confirmation dialog
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return;
    }

    const result = await myQuicaModel.deleteOrder(orderId);
    if (!result.success) {
      window.alert(result.error || "Failed to delete order");
    }
  };

  return (
    <AdminPanelView
      orders={myQuicaModel.adminActiveOrders}
      onDeleteOrder={handleDelete}
    />
  );
});

export default AdminPanelPresenter;
