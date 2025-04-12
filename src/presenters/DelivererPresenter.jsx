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

  // Log the available orders received from the model
  console.log("DEBUG: DelivererPresenter - availableOrders:", myQuicaModel.availableOrders);

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
    />
  );
});

export default DelivererPresenter;
