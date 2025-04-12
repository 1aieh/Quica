import { observer } from 'mobx-react-lite';
import { myQuicaModel } from '../model/QuicaModel';
import DelivererView from '../components/deliverer/DelivererView';

const DelivererPresenter = observer(() => {
  const handleToggleStatus = () => {
    myQuicaModel.toggleDelivererStatus();
  };

  const handleAcceptOrder = (orderId) => {
    myQuicaModel.acceptOrder(orderId);
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    myQuicaModel.updateDelivererOrderStatus(orderId, newStatus);
  };

  // Log the available orders received from the model
  console.log("DEBUG: DelivererPresenter - availableOrders:", myQuicaModel.availableOrders);
  console.log("DEBUG: DelivererPresenter - delivererOrders:", myQuicaModel.delivererOrders); // Log assigned orders

  return (
    <DelivererView
      delivererStatus={myQuicaModel.userProfile?.delivererStatus || null}
      availableOrders={myQuicaModel.availableOrders}
      delivererOrders={myQuicaModel.delivererOrders} // Pass deliverer orders
      onToggleStatus={handleToggleStatus}
      onAcceptOrder={handleAcceptOrder}
      acceptingOrderId={myQuicaModel.acceptingOrderId}
      acceptOrderError={myQuicaModel.acceptOrderError}
      onUpdateStatus={handleUpdateStatus} // Pass handler
      updatingOrderStatusId={myQuicaModel.updatingOrderStatusId} // Pass state
      updateOrderStatusError={myQuicaModel.updateOrderStatusError} // Pass state
    />
  );
});

export default DelivererPresenter;
