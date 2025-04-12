import { observer } from "mobx-react-lite";
import OrderTrackingView from "../components/requester/OrderTrackingView";
import { myQuicaModel } from "../model/QuicaModel";

const OrderTrackingPresenter = observer(() => {
  // Get the relevant state from the model
  const { 
    currentlyTrackedOrder,
    orderCancellationInProgress,
    orderCancellationError
  } = myQuicaModel;

  // Handler for cancelling the order
  const handleCancelOrder = () => {
    myQuicaModel.cancelOrder();
  };

  return (
    <OrderTrackingView 
      orderData={currentlyTrackedOrder}
      isCancelling={orderCancellationInProgress}
      cancelError={orderCancellationError}
      onCancelOrder={handleCancelOrder}
    />
  );
});

export default OrderTrackingPresenter;
