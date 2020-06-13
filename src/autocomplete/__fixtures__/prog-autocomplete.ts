import { program } from "../.."

program
  .bin("pizza")

  // First possible command: "order"
  .command("order", "Order a pizza")
  .argument("<type>", "Type of pizza", {
    validator: ["margherita", "caprese", "quattro fromaggi"],
  })
  .option("-e, --extra-ingredients <ingredients>", "Extra ingredients")

  // Another command: "cancel"
  .command("cancel", "Cancel an order")
  .argument("<order-id>", "Order id")
  .complete(function () {
    return ["1234", "5678"]
  })
  .option("-c, --cash-out <type>", "Cash out type")
  .complete(() => {
    return Promise.resolve(["cash", "paypal", "credit-card"])
  })

export { program }
