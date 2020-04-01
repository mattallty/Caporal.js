#!/usr/bin/env ts-node
import { program } from "caporal"

program
  .version("1.0.0")
  .description("Order pizza right from your terminal!")
  // the "order" command
  .command("order", "Order a pizza")
  .alias("give-it-to-me")
  // <kind> will be auto-magicaly autocompleted by providing the user with 3 choices
  .argument(
    "<kind>",
    "Kind of pizza you want to order from the shop. You may want to add new types of pizza by asking the chef, but the validator won't pass!",
    { default: ["margherita", "hawaiian", "fredo"] },
  )
  .argument("<from-store>", "Which store to order from", {
    validator: ["New-York", "Portland", "Paris"],
  })

  .argument("<account>", "Which account id to use", {
    validator: program.NUMBER,
    default: 1875896,
  })
  .argument("[other-request...]", "Other requests")

  .option("-n, --number <num>", "Number of pizza", {
    validator: program.NUMBER,
    required: true,
  })
  .option("-d, --discount <code>", "Discount code", {
    validator: /^[a-z]{3}[0-9]{5,}$/i,
  })
  .option("-p, --pay-by <mean>", "Pay by option", {
    validator: ["cash", "card"],
    required: true,
  })

  // enable auto-completion for -p | --pay-by argument using a Promise

  // --extra will be auto-magicaly autocompleted by providing the user with 3 choices
  .option("-e <ingredients>", "Add extra ingredients", {
    validator: ["pepperoni", "onion", "cheese"],
  })
  .option("--add-ingredients <ingredients...>", "Add extra ingredients", {
    validator: program.ARRAY,
  })
  .action(function ({ args, options, logger }) {
    logger.info("Command 'order' called with:")
    logger.info("arguments: %j", args)
    logger.info("options: %j", options)
  })

  .command("cancel", "Cancel an order")
  .argument("<order-id>", "Order id", { validator: program.NUMBER })
  .action(({ args, logger }) => {
    logger.info("Order id #%s canceled", args.orderId)
  })

program.run()
