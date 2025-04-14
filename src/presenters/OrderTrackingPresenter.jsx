import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import OrderTrackingView from "../components/requester/OrderTrackingView";
import { myQuicaModel } from "../model/QuicaModel";

const OrderTrackingPresenter = observer(() => {
  const navigate = useNavigate();
  
  // Get the relevant state from the model
  const { 
    currentlyTrackedOrder,
    orderCancellationInProgress,
    orderCancellationError
  } = myQuicaModel;

  // Handler for cancelling the order
  const handleCancelOrder = async () => {
    await myQuicaModel.cancelOrder();
    
    // If no error occurred during cancellation, navigate to home
    if (!myQuicaModel.orderCancellationError) {
      navigate('/');
    }
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
