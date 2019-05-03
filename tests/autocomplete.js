"use strict";

/* global Program, logger, should, sinon */



describe('Autocomplete', () => {


  beforeEach(function () {

    this.program = new Program();

    this.program
      .logger(logger)
      .version('1.0.0')
      // the "order" command
      .command('order', 'Order a pizza')
      .alias('give-it-to-me')
      // <kind> will be auto-magicaly autocompleted by providing the user with 3 choices
      .argument('<kind>', 'Kind of pizza', ["margherita", "hawaiian", "fredo"])
      .argument('<from-store>', 'Which store to order from')
      // enable auto-completion for <from-store> argument using a sync function returning an array
      .complete(function () {
        return ['store-1', 'store-2', 'store-3', 'store-4', 'store-5'];
      })

      .argument('<account>', 'Which account id to use')
      // enable auto-completion for <account> argument using a Promise
      .complete(function () {
        return Promise.resolve(['account-1', 'account-2']);
      })

      .option('-n, --number <num>', 'Number of pizza', this.program.INT, 1)
      .option('-d, --discount <amount>', 'Discount offer', this.program.FLOAT)
      .option('-p, --pay-by <mean>', 'Pay by option')
      // enable auto-completion for -p | --pay-by argument using a Promise
      .complete(function () {
        return Promise.resolve(['cash', 'credit-card']);
      })

      // --extra will be auto-magicaly autocompleted by providing the user with 3 choices
      .option('-e <ingredients>', 'Add extra ingredients', ['pepperoni', 'onion', 'cheese'])
      .action(function (args, options, logger) {

      })

      // the "return" command
      .command('return', 'Return an order')
      // <kind> will be auto-magicaly autocompleted by providing the user with 3 choices
      .argument('<order-id>', 'Order id')
      // enable auto-completion for <from-store> argument using the `done` callback
      .complete(function () {
        return Promise.resolve(['#82792', '#71727', '#526Z52']);
      })
      .argument('<to-store>', 'Store id')
      .option('--ask-change <other-kind-pizza>', 'Ask for other kind of pizza')
      .complete(function () {
        return Promise.resolve(["margherita", "hawaiian", "fredo"]);
      })
      .option('--say-something <something>', 'Say something to the manager')
      .action(function (args, options, logger) {

      });

    this._complete = sinon.spy(this.program._autocomplete, "_complete");

  });

  afterEach(function () {
    this._complete.restore();
  });

  it(`should complete commands when none provided`, function (done) {

    process.env.COMP_LINE = "_mocha";
    process.env.COMP_POINT = process.env.COMP_LINE.length.toString();
    process.env.COMP_CWORD = process.env.COMP_LINE.trim().split(' ').length.toString();

    this.program.parse(['node', '_mocha', 'completion', '--'].concat(process.env.COMP_LINE.split(' ')));

    setImmediate(() => {
      should(this._complete.called).be.true();
      const response = this._complete.returnValues[0];
      should(response).be.Promise();
      should(response).be.fulfilledWith([
        'order:Order a pizza',
        'return:Return an order'
      ]).then(_ => done()).catch(err => done(err));
      //done();
    });
  });

  it(`should complete commands when substring provided`, function (done) {

    process.env.COMP_LINE = "_mocha or";
    process.env.COMP_POINT = process.env.COMP_LINE.length.toString();
    process.env.COMP_CWORD = process.env.COMP_LINE.trim().split(' ').length.toString();

    this.program.parse(['node', '_mocha', 'completion', '--'].concat(process.env.COMP_LINE.split(' ')));

    setImmediate(() => {
      should(this._complete.called).be.true();
      const response = this._complete.returnValues[0];
      should(response).be.Promise();
      should(response).be.fulfilledWith([
        'order:Order a pizza',
      ]);
      done();
    });


  });


  it(`should complete commands when substring (alias) provided`, function (done) {

    process.env.COMP_LINE = "_mocha gi";
    process.env.COMP_POINT = process.env.COMP_LINE.length.toString();
    process.env.COMP_CWORD = process.env.COMP_LINE.trim().split(' ').length.toString();

    this.program.parse(['node', '_mocha', 'completion', '--'].concat(process.env.COMP_LINE.split(' ')));

    setImmediate(() => {
      should(this._complete.called).be.true();
      const response = this._complete.returnValues[0];
      should(response).be.Promise();
      should(response).be.fulfilledWith([
        'order:Order a pizza',
      ]).then(_ => done()).catch(err => done(err));

    });
  });

  it.only(`should complete argument when substring provided`, function (done) {

    process.env.COMP_LINE = "_mocha order mar";
    process.env.COMP_POINT = process.env.COMP_LINE.length.toString();
    process.env.COMP_CWORD = process.env.COMP_LINE.trim().split(' ').length.toString();

    this.program.parse(['node', '_mocha', 'completion', '--'].concat(process.env.COMP_LINE.split(' ')));

    setImmediate(() => {
      should(this._complete.called).be.true();
      const response = this._complete.returnValues[0];
      should(response).be.Promise();
      should(response)
        .be.fulfilledWith([
          'margherita:Value for argument <kind>',
          '--number:Number of pizza',
          '--discount:Discount offer',
          '--pay-by:Pay by option',
          '-e:Add extra ingredients'
        ])
        .then(_ => done()).catch(err => done(err));

    });
  });

  it(`should not complete commands if none available after string`, function (done) {

    process.env.COMP_LINE = "_mocha order";
    process.env.COMP_POINT = process.env.COMP_LINE.length.toString();
    process.env.COMP_CWORD = process.env.COMP_LINE.trim().split(' ').length.toString();

    this.program.parse(['node', '_mocha', 'completion', '--'].concat(process.env.COMP_LINE.split(' ')));

    setImmediate(() => {
      should(this._complete.called).be.true();
      const response = this._complete.returnValues[0];
      should(response)
        .be.fulfilledWith([
          'margherita:Value for argument <kind>',
          'hawaiian:Value for argument <kind>',
          'fredo:Value for argument <kind>',
          '--number:Number of pizza',
          '--discount:Discount offer',
          '--pay-by:Pay by option',
          '-e:Add extra ingredients'
        ])
        .then(_ => done())
        .catch(err => done(err));
    });

  });

  it(`should not suggest argument(s) already provided`, function (done) {

    process.env.COMP_LINE = "_mocha order margherita";
    process.env.COMP_POINT = process.env.COMP_LINE.length.toString();
    process.env.COMP_CWORD = process.env.COMP_LINE.trim().split(' ').length.toString();

    this.program.parse(['node', '_mocha', 'completion', '--'].concat(process.env.COMP_LINE.split(' ')));

    setImmediate(() => {
      should(this._complete.called).be.true();
      const response = this._complete.returnValues[0];
      response.then(results => {
        should(results).be.eql([
          'store-1:Value for argument <from-store>',
          'store-2:Value for argument <from-store>',
          'store-3:Value for argument <from-store>',
          'store-4:Value for argument <from-store>',
          'store-5:Value for argument <from-store>',
          '--number:Number of pizza',
          '--discount:Discount offer',
          '--pay-by:Pay by option',
          '-e:Add extra ingredients'
        ]);
        done();
      }).catch(e => {
        done(e);
      });
    });
  });

  it(`should not complete current command`, function (done) {

    process.env.COMP_LINE = "_mocha order";
    process.env.COMP_POINT = process.env.COMP_LINE.length.toString();
    process.env.COMP_CWORD = process.env.COMP_LINE.trim().split(' ').length.toString();

    this.program.parse(['node', '_mocha', 'completion', '--'].concat(process.env.COMP_LINE.split(' ')));

    setImmediate(() => {
      should(this._complete.called).be.true();
      const response = this._complete.returnValues[0];
      response.then(results => {
        should(results).be.eql([
          "margherita:Value for argument <kind>",
          "hawaiian:Value for argument <kind>",
          "fredo:Value for argument <kind>",
          '--number:Number of pizza',
          '--discount:Discount offer',
          '--pay-by:Pay by option',
          '-e:Add extra ingredients'
        ]);
        done();
      }).catch(e => {
        done(e);
      });
    });

  });

  it(`should handle command alias`, function (done) {

    process.env.COMP_LINE = "_mocha give-it-to-me";
    process.env.COMP_POINT = process.env.COMP_LINE.length.toString();
    process.env.COMP_CWORD = process.env.COMP_LINE.trim().split(' ').length.toString();

    this.program.parse(['node', '_mocha', 'completion', '--'].concat(process.env.COMP_LINE.split(' ')));

    setImmediate(() => {
      should(this._complete.called).be.true();
      const response = this._complete.returnValues[0];
      response.then(results => {
        should(results).be.eql([
          "margherita:Value for argument <kind>",
          "hawaiian:Value for argument <kind>",
          "fredo:Value for argument <kind>",
          '--number:Number of pizza',
          '--discount:Discount offer',
          '--pay-by:Pay by option',
          '-e:Add extra ingredients'
        ]);
        done();
      }).catch(e => {
        done(e);
      });
    });
  });

  it(`should suggest long option names`, function (done) {

    process.env.COMP_LINE = "_mocha order --n";
    process.env.COMP_POINT = process.env.COMP_LINE.length.toString();
    process.env.COMP_CWORD = process.env.COMP_LINE.trim().split(' ').length.toString();

    this.program.parse(['node', '_mocha', 'completion', '--'].concat(process.env.COMP_LINE.split(' ')));

    setImmediate(() => {
      should(this._complete.called).be.true();
      const response = this._complete.returnValues[0];
      response.then(results => {
        should(results).be.eql([
          "--number:Number of pizza"
        ]);
        done();
      }).catch(e => {
        done(e);
      });
    });

  });

  it(`should suggest long option value`, function (done) {

    process.env.COMP_LINE = "_mocha order -e";
    process.env.COMP_POINT = process.env.COMP_LINE.length.toString();
    process.env.COMP_CWORD = process.env.COMP_LINE.trim().split(' ').length.toString();

    this.program.parse(['node', '_mocha', 'completion', '--'].concat(process.env.COMP_LINE.split(' ')));

    setImmediate(() => {
      should(this._complete.called).be.true();
      const response = this._complete.returnValues[0];
      response.then(results => {
        should(results).be.eql(['pepperoni', 'onion', 'cheese']);
        done();
      }).catch(e => {
        done(e);
      });
    });
  });

  it(`should work with _default command`, function (done) {

    this.program = new Program();

    this.program
      .logger(logger)
      .version('1.0.0')
      // the "deafult" command
      // <kind> will be auto-magicaly autocompleted by providing the user with 3 choices
      .argument('<kind>', 'Kind of pizza', ["margherita", "hawaiian", "fredo"])
      .argument('<from-store>', 'Which store to order from')
      // enable auto-completion for <from-store> argument using the `done` callback
      .complete(function () {
        return ['store-1', 'store-2', 'store-3', 'store-4', 'store-5'];
      })

      .argument('<account>', 'Which account id to use')
      // enable auto-completion for <account> argument using a Promise
      .complete(function () {
        return Promise.resolve(['account-1', 'account-2']);
      })

      .option('-n, --number <num>', 'Number of pizza', this.program.INT, 1)
      .option('-d, --discount <amount>', 'Discount offer', this.program.FLOAT)
      .option('-p, --pay-by <mean>', 'Pay by option')
      // enable auto-completion for -p | --pay-by argument using a Promise
      .complete(function () {
        return Promise.resolve(['cash', 'credit-card']);
      })

      // --extra will be auto-magicaly autocompleted by providing the user with 3 choices
      .option('-e <ingredients>', 'Add extra ingredients', ['pepperoni', 'onion', 'cheese'])
      .action(function (args, options, logger) {

      });

    this._complete = sinon.spy(this.program._autocomplete, "_complete");

    process.env.COMP_LINE = "_mocha -e";
    process.env.COMP_POINT = process.env.COMP_LINE.length.toString();
    process.env.COMP_CWORD = process.env.COMP_LINE.trim().split(' ').length.toString();

    this.program.parse(['node', '_mocha', 'completion', '--'].concat(process.env.COMP_LINE.split(' ')));

    setImmediate(() => {
      should(this._complete.called).be.true();
      const response = this._complete.returnValues[0];
      response.then(results => {
        should(results).be.eql(['pepperoni', 'onion', 'cheese']);
        done();
      }).catch(e => {
        done(e);
      });
    });
  });

  it(`should not suggest option names if last partial does not match`, function (done) {

    process.env.COMP_LINE = "_mocha order --foo";
    process.env.COMP_POINT = process.env.COMP_LINE.length.toString();
    process.env.COMP_CWORD = process.env.COMP_LINE.trim().split(' ').length.toString();

    this.program.parse(['node', '_mocha', 'completion', '--'].concat(process.env.COMP_LINE.split(' ')));

    setImmediate(() => {
      should(this._complete.called).be.true();
      const response = this._complete.returnValues[0];
      response.then(results => {
        should(results).be.eql([]);
        done();
      }).catch(e => {
        done(e);
      });
    });
  });

  it(`should work with simple completers returning an array`, function (done) {

    process.env.COMP_LINE = "_mocha return";
    process.env.COMP_POINT = process.env.COMP_LINE.length.toString();
    process.env.COMP_CWORD = process.env.COMP_LINE.trim().split(' ').length.toString();

    this.program.parse(['node', '_mocha', 'completion', '--'].concat(process.env.COMP_LINE.split(' ')));

    setImmediate(() => {
      should(this._complete.called).be.true();
      const response = this._complete.returnValues[0];
      response.then(results => {
        should(results).eql([
          '#82792:Value for argument <order-id>',
          '#71727:Value for argument <order-id>',
          '#526Z52:Value for argument <order-id>',
          '--ask-change:Ask for other kind of pizza',
          '--say-something:Say something to the manager'
        ]);
        done();
      }).catch(e => {
        done(e);
      });
    });
  });

  it(`should handle arguments without completers`, function (done) {

    process.env.COMP_LINE = "_mocha return #82792";
    process.env.COMP_POINT = process.env.COMP_LINE.length.toString();
    process.env.COMP_CWORD = process.env.COMP_LINE.trim().split(' ').length.toString();

    this.program.parse(['node', '_mocha', 'completion', '--'].concat(process.env.COMP_LINE.split(' ')));

    setImmediate(() => {
      should(this._complete.called).be.true();
      const response = this._complete.returnValues[0];
      response.then(results => {
        should(results).eql([
          '--ask-change:Ask for other kind of pizza',
          '--say-something:Say something to the manager'
        ]);
        done();
      }).catch(e => {
        done(e);
      });
    });
  });


  it(`should handle options completers`, function (done) {

    process.env.COMP_LINE = "_mocha return --ask-change";
    process.env.COMP_POINT = process.env.COMP_LINE.length.toString();
    process.env.COMP_CWORD = process.env.COMP_LINE.trim().split(' ').length.toString();

    this.program.parse(['node', '_mocha', 'completion', '--'].concat(process.env.COMP_LINE.split(' ')));

    setImmediate(() => {
      should(this._complete.called).be.true();
      const response = this._complete.returnValues[0];
      response.then(results => {
        should(results).eql([
          "margherita:Value for option --ask-change <other-kind-pizza>",
          "hawaiian:Value for option --ask-change <other-kind-pizza>",
          "fredo:Value for option --ask-change <other-kind-pizza>"
        ]);
        done();
      }).catch(e => {
        done(e);
      });
    });
  });

  it(`should handle options without completers`, function (done) {

    process.env.COMP_LINE = "_mocha return --say-something";
    process.env.COMP_POINT = process.env.COMP_LINE.length.toString();
    process.env.COMP_CWORD = process.env.COMP_LINE.trim().split(' ').length.toString();

    this.program.parse(['node', '_mocha', 'completion', '--'].concat(process.env.COMP_LINE.split(' ')));

    setImmediate(() => {
      should(this._complete.called).be.true();
      const response = this._complete.returnValues[0];
      response.then(results => {
        should(results).eql([]);
        done();
      }).catch(e => {
        done(e);
      });
    });
  });

  it(`should handle a failling completion promise`, function (done) {

    this.program = new Program();

    this.program
      .logger(logger)
      .version('1.0.0')
      .argument('<from-store>', 'Which store to order from')
      .complete(function () {
        return Promise.reject(new Error("foo"));
      })
      .action(function (args, options, logger) {

      });

    this._complete = sinon.spy(this.program._autocomplete, "_complete");

    process.env.COMP_LINE = "_mocha";
    process.env.COMP_POINT = process.env.COMP_LINE.length.toString();
    process.env.COMP_CWORD = process.env.COMP_LINE.trim().split(' ').length.toString();

    this.program.parse(['node', '_mocha', 'completion', '--'].concat(process.env.COMP_LINE.split(' ')));

    setImmediate(() => {
      should(this._complete.called).be.true();
      const response = this._complete.returnValues[0];
      response.then(results => {
        should(results).be.eql([]);
        done();
      }).catch(e => {
        done(e);
      });
    });
  });


});


